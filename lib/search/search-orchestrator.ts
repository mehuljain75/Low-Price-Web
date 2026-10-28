/**
 * Amazon-Backed Search Orchestrator & Intelligent Discovery Pipeline
 * Implements Both:
 * - Option A: Authorized Amazon Product Advertising API 5.0 (PA-API 5.0) integration
 * - Option B: Authentic Amazon India external search fallback
 *
 * Sequence:
 * 1. Exact local catalog search with parsed budget/category intent
 * 2. Token-based normalized partial match
 * 3. Typo-tolerant correction & fuzzy fallback
 * 4. Authorized Amazon PA-API 5.0 client query (when configured)
 * 5. Deduplication and merging against existing catalog
 * 6. Relevance ranking, sorting, and pagination
 * 7. Option B: Amazon India external-search fallback
 */

import { PriceComparison } from "../types";
import { repository } from "../data/repository";
import {
  parseSearchIntent,
  correctQuerySpelling,
  ParsedSearchIntent,
  SpellingCorrectionResult,
} from "./spelling-corrector";
import {
  searchAmazonProductsApi,
  getAmazonApiStatus,
  AmazonApiStatus,
} from "../services/amazon-product-api";

export interface SearchOrchestratorOptions {
  query: string;
  categorySlug?: string;
  brand?: string;
  shoeType?: string;
  gender?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: "price_asc" | "price_desc" | "discount" | "newest" | "rating";
  inStockOnly?: boolean;
  page?: number;
  limit?: number;
  forceExact?: boolean;
}

export interface SearchOrchestratorResult {
  originalQuery: string;
  normalizedQuery: string;
  correctedQuery?: string;
  didYouMean?: string;
  intent: ParsedSearchIntent;
  spelling: SpellingCorrectionResult;
  results: PriceComparison[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
  searchStatus: "exact" | "corrected" | "broader_match" | "zero_results" | "upstream_error";
  fallbackUsed: boolean;
  fallbackType?: "spelling_correction" | "broader_query" | "category_recommendation" | "external_amazon_link";
  externalSearchUrl: string;
  fallbackLinkTitle: string;
  fallbackSectionTitle: string;
  amazonApiStatus: AmazonApiStatus;
  amazonApiErrorMessage?: string;
  isAmazonApiLive: boolean;
  localCatalogCount: number;
  amazonApiCount: number;
  suggestions: string[];
  appliedFilters: {
    minPrice?: number;
    maxPrice?: number;
    categorySlug?: string;
    brand?: string;
  };
}

/**
 * Builds authentic HTTPS Amazon India search link with validated partner tag.
 * Preserves the original query including exact spelling and spaces.
 * Strictly uses trusted amazon.in domain and never accepts arbitrary user URLs.
 */
export function buildExternalAmazonSearchUrl(query: string): string {
  const tag =
    process.env.AMAZON_ASSOCIATES_TAG ||
    process.env.NEXT_PUBLIC_AMAZON_TAG ||
    "dealfinderin-21";
  const clean = (query || "").trim();
  return `https://www.amazon.in/s?k=${encodeURIComponent(clean)}&tag=${encodeURIComponent(tag)}`;
}

// In-memory cache for fast repeated queries within the session
const sessionSearchCache = new Map<string, { timestamp: number; result: SearchOrchestratorResult }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

/**
 * Deduplicates Amazon API results against local catalog results.
 * Prevents duplicate cards for products with the same ASIN or title.
 */
function deduplicateProducts(
  localItems: PriceComparison[],
  amazonItems: PriceComparison[]
): PriceComparison[] {
  const seenAsins = new Set<string>();
  const seenTitles = new Set<string>();

  for (const item of localItems) {
    const asin = item.lowestOffer?.retailerProductId;
    if (asin) seenAsins.add(asin.toLowerCase().trim());
    seenTitles.add(item.product.title.toLowerCase().trim());
  }

  const uniqueAmazon: PriceComparison[] = [];
  for (const item of amazonItems) {
    const asin = item.lowestOffer?.retailerProductId;
    if (asin && seenAsins.has(asin.toLowerCase().trim())) {
      continue;
    }
    const titleLower = item.product.title.toLowerCase().trim();
    if (seenTitles.has(titleLower)) {
      continue;
    }
    seenTitles.add(titleLower);
    if (asin) seenAsins.add(asin.toLowerCase().trim());
    uniqueAmazon.push(item);
  }

  return [...localItems, ...uniqueAmazon];
}

/**
 * Computes a relevance score based on exact phrase, conjunctive tokens, and brand matches
 */
function calculateRelevanceScore(comp: PriceComparison, query: string): number {
  const clean = query.toLowerCase().trim();
  const tokens = clean.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 0;

  const title = comp.product.title.toLowerCase();
  const brand = comp.product.brand.toLowerCase();
  const desc = comp.product.description.toLowerCase();

  let score = 0;

  // Exact phrase match in title: highest relevance boost
  if (title.includes(clean)) {
    score += 150;
  }

  // All tokens present in title
  const allTokensInTitle = tokens.every((t) => title.includes(t));
  if (allTokensInTitle) {
    score += 80;
  }

  // Brand match
  if (tokens.some((t) => brand === t || brand.includes(t))) {
    score += 40;
  }

  // Individual token matches in title and description
  for (const token of tokens) {
    if (title.includes(token)) {
      score += 15;
    } else if (desc.includes(token)) {
      score += 2;
    }
  }

  return score;
}

/**
 * Ranks search results by relevance unless an explicit user sort is specified
 */
function rankProductsByRelevance(
  items: PriceComparison[],
  query: string,
  sortBy?: string
): PriceComparison[] {
  if (sortBy && sortBy !== "discount") {
    return items;
  }

  return [...items].sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, query);
    const scoreB = calculateRelevanceScore(b, query);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    return b.savingsPercentage - a.savingsPercentage;
  });
}

/**
 * Executes the full Amazon-backed product discovery & recovery pipeline
 */
export async function executeSearchPipeline(
  options: SearchOrchestratorOptions
): Promise<SearchOrchestratorResult> {
  const rawQuery = (options.query || "").trim();
  const page = options.page || 1;
  const limit = options.limit || 24;

  const intent = parseSearchIntent(rawQuery);
  const effectiveMinPrice = options.minPrice !== undefined ? options.minPrice : intent.minPrice;
  const effectiveMaxPrice = options.maxPrice !== undefined ? options.maxPrice : intent.maxPrice;

  const externalSearchUrl = buildExternalAmazonSearchUrl(rawQuery);
  const fallbackLinkTitle = `Search Amazon India for ${rawQuery}`;
  const fallbackSectionTitle = "Couldn't find the exact product? Search Amazon India.";

  const apiStatusInfo = getAmazonApiStatus();

  // If query is blank, return empty results without running expensive search loops
  if (!rawQuery) {
    return {
      originalQuery: "",
      normalizedQuery: "",
      intent,
      spelling: {
        originalQuery: "",
        correctedQuery: "",
        hasCorrection: false,
        confidence: "none",
        correctedTokens: [],
      },
      results: [],
      totalCount: 0,
      page,
      limit,
      hasMore: false,
      searchStatus: "zero_results",
      fallbackUsed: false,
      externalSearchUrl,
      fallbackLinkTitle,
      fallbackSectionTitle,
      amazonApiStatus: apiStatusInfo.isConfigured ? "ready" : "unconfigured",
      isAmazonApiLive: apiStatusInfo.isConfigured,
      localCatalogCount: 0,
      amazonApiCount: 0,
      suggestions: ["iPhone 15", "Nike Shoes", "Laptops", "Air Fryer", "Headphones"],
      appliedFilters: {
        minPrice: effectiveMinPrice,
        maxPrice: effectiveMaxPrice,
        categorySlug: options.categorySlug,
        brand: options.brand,
      },
    };
  }

  // Cache key
  const cacheKey = [
    rawQuery,
    options.categorySlug || "",
    options.brand || "",
    effectiveMinPrice ?? "",
    effectiveMaxPrice ?? "",
    options.sortBy || "",
    page,
    limit,
    Boolean(options.forceExact),
  ].join(":");

  const cached = sessionSearchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }

  // Check spelling
  const spelling = correctQuerySpelling(intent.cleanKeywords);

  // STEP 1 & 2: Search existing local catalog with user keywords
  let searchTarget = options.forceExact ? rawQuery : intent.cleanKeywords;
  let localProducts = await repository.getProducts({
    searchQuery: searchTarget,
    categorySlug: options.categorySlug,
    brand: options.brand,
    shoeType: options.shoeType,
    gender: options.gender,
    size: options.size,
    minPrice: effectiveMinPrice,
    maxPrice: effectiveMaxPrice,
    minRating: options.minRating,
    sortBy: options.sortBy,
    inStockOnly: options.inStockOnly,
    page,
    limit,
  });

  // Helper to verify if candidate products satisfy conjunctive keywords in Step 1
  const hasConjunctiveMatch = (items: PriceComparison[], query: string): boolean => {
    if (items.length === 0) return false;
    const tokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    if (tokens.length <= 1) return true;
    return items.some((item) => {
      const text = `${item.product.title} ${item.product.brand} ${item.product.description}`.toLowerCase();
      return tokens.every((token) => text.includes(token));
    });
  };

  let isExactQualified =
    localProducts.length > 0 &&
    (options.forceExact || !spelling.hasCorrection || hasConjunctiveMatch(localProducts, searchTarget));

  let finalSearchStatus: "exact" | "corrected" | "broader_match" | "zero_results" = isExactQualified
    ? "exact"
    : "zero_results";
  let fallbackUsed = false;
  let fallbackType: "spelling_correction" | "broader_query" | "category_recommendation" | "external_amazon_link" | undefined;

  // STEP 3: Typo-tolerant correction (if not exact and spelling correction is available)
  if (!isExactQualified && !options.forceExact && spelling.hasCorrection && spelling.correctedQuery !== intent.cleanKeywords) {
    const correctedProducts = await repository.getProducts({
      searchQuery: spelling.correctedQuery,
      categorySlug: options.categorySlug,
      brand: options.brand,
      shoeType: options.shoeType,
      gender: options.gender,
      size: options.size,
      minPrice: effectiveMinPrice,
      maxPrice: effectiveMaxPrice,
      minRating: options.minRating,
      sortBy: options.sortBy,
      inStockOnly: options.inStockOnly,
      page,
      limit,
    });

    if (correctedProducts.length > 0) {
      localProducts = correctedProducts;
      finalSearchStatus = "corrected";
      fallbackUsed = true;
      fallbackType = "spelling_correction";
    }
  }

  // STEP 4: Query authorized Amazon Product Advertising API 5.0 (Option A)
  const apiQuery = finalSearchStatus === "corrected" && spelling.correctedQuery
    ? spelling.correctedQuery
    : searchTarget;

  const amazonApiResponse = await searchAmazonProductsApi(apiQuery, {
    page,
    limit,
    categorySlug: options.categorySlug,
    minPrice: effectiveMinPrice,
    maxPrice: effectiveMaxPrice,
  });

  const amazonProducts = amazonApiResponse.products || [];

  // STEP 5: Merge, Deduplicate and Rank valid results by relevance
  const rawMerged = deduplicateProducts(localProducts, amazonProducts);
  const mergedProducts = rankProductsByRelevance(rawMerged, searchTarget, options.sortBy);

  if (mergedProducts.length > 0) {
    if (finalSearchStatus === "zero_results") {
      finalSearchStatus = "exact";
    }

    const finalResult: SearchOrchestratorResult = {
      originalQuery: rawQuery,
      normalizedQuery: intent.normalizedQuery,
      correctedQuery: spelling.hasCorrection && !options.forceExact ? spelling.correctedQuery : undefined,
      didYouMean: spelling.hasCorrection ? spelling.correctedQuery : undefined,
      intent,
      spelling,
      results: mergedProducts,
      totalCount: mergedProducts.length,
      page,
      limit,
      hasMore: mergedProducts.length >= limit,
      searchStatus: finalSearchStatus,
      fallbackUsed,
      fallbackType,
      externalSearchUrl,
      fallbackLinkTitle,
      fallbackSectionTitle,
      amazonApiStatus: amazonApiResponse.status,
      amazonApiErrorMessage: amazonApiResponse.errorMessage,
      isAmazonApiLive: amazonApiResponse.isLiveApi,
      localCatalogCount: localProducts.length,
      amazonApiCount: amazonProducts.length,
      suggestions: [],
      appliedFilters: {
        minPrice: effectiveMinPrice,
        maxPrice: effectiveMaxPrice,
        categorySlug: options.categorySlug,
        brand: options.brand,
      },
    };
    sessionSearchCache.set(cacheKey, { timestamp: Date.now(), result: finalResult });
    return finalResult;
  }

  // STEP 6: Query Broadening / Multi-token fallback (e.g. "chocolate cake" -> try "chocolate")
  const tokens = (spelling.hasCorrection && !options.forceExact ? spelling.correctedQuery : intent.cleanKeywords)
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length > 1) {
    for (const token of tokens) {
      if (token.length < 3) continue;
      const broaderProducts = await repository.getProducts({
        searchQuery: token,
        categorySlug: options.categorySlug,
        minPrice: effectiveMinPrice,
        maxPrice: effectiveMaxPrice,
        minRating: options.minRating,
        sortBy: options.sortBy,
        inStockOnly: options.inStockOnly,
        page: 1,
        limit,
      });

      if (broaderProducts.length > 0) {
        const finalResult: SearchOrchestratorResult = {
          originalQuery: rawQuery,
          normalizedQuery: intent.normalizedQuery,
          correctedQuery: spelling.hasCorrection ? spelling.correctedQuery : undefined,
          didYouMean: spelling.hasCorrection ? spelling.correctedQuery : undefined,
          intent,
          spelling,
          results: broaderProducts,
          totalCount: broaderProducts.length,
          page: 1,
          limit,
          hasMore: false,
          searchStatus: "broader_match",
          fallbackUsed: true,
          fallbackType: "broader_query",
          externalSearchUrl,
          fallbackLinkTitle,
          fallbackSectionTitle,
          amazonApiStatus: amazonApiResponse.status,
          amazonApiErrorMessage: amazonApiResponse.errorMessage,
          isAmazonApiLive: amazonApiResponse.isLiveApi,
          localCatalogCount: broaderProducts.length,
          amazonApiCount: 0,
          suggestions: [token, ...tokens],
          appliedFilters: {
            minPrice: effectiveMinPrice,
            maxPrice: effectiveMaxPrice,
            categorySlug: options.categorySlug,
            brand: options.brand,
          },
        };
        sessionSearchCache.set(cacheKey, { timestamp: Date.now(), result: finalResult });
        return finalResult;
      }
    }
  }

  // STEP 7 & 8: Zero Results Recovery (Option B)
  const zeroResultsResponse: SearchOrchestratorResult = {
    originalQuery: rawQuery,
    normalizedQuery: intent.normalizedQuery,
    correctedQuery: spelling.hasCorrection ? spelling.correctedQuery : undefined,
    didYouMean: spelling.hasCorrection ? spelling.correctedQuery : undefined,
    intent,
    spelling,
    results: [],
    totalCount: 0,
    page: 1,
    limit,
    hasMore: false,
    searchStatus: "zero_results",
    fallbackUsed: true,
    fallbackType: "external_amazon_link",
    externalSearchUrl,
    fallbackLinkTitle,
    fallbackSectionTitle,
    amazonApiStatus: amazonApiResponse.status,
    amazonApiErrorMessage: amazonApiResponse.errorMessage,
    isAmazonApiLive: amazonApiResponse.isLiveApi,
    localCatalogCount: 0,
    amazonApiCount: 0,
    suggestions: [
      "Running Shoes",
      "Nike Shoes",
      "iPhone 15",
      "Laptops Under 50000",
      "Bluetooth Headphones",
      "Air Fryer",
    ],
    appliedFilters: {
      minPrice: effectiveMinPrice,
      maxPrice: effectiveMaxPrice,
      categorySlug: options.categorySlug,
      brand: options.brand,
    },
  };

  sessionSearchCache.set(cacheKey, { timestamp: Date.now(), result: zeroResultsResponse });
  return zeroResultsResponse;
}
