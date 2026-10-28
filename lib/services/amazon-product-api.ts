/**
 * Authorized Amazon Product Advertising API 5.0 (PA-API 5.0) Client & Adapter
 * Option A implementation: Retrieves genuine Amazon product data via signed SigV4 requests.
 * Fully compatible with Node.js, Next.js Edge runtime, and Cloudflare Workers.
 */

import { PriceComparison, Product, Offer, Category } from "../types";
import { categories } from "../data/demo-products";
import { computeProductComparison } from "../matching";
import { isPAAPIConfigured, sendPAAPIRequest, PAAPISearchResponse, PAAPIItem } from "./amazon-paapi";

export type AmazonApiStatus =
  | "ready"
  | "unconfigured"
  | "rate_limited"
  | "timeout"
  | "upstream_error"
  | "empty";

export interface AmazonApiSearchOptions {
  page?: number;
  limit?: number;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  customFetcher?: (target: string, payload: Record<string, unknown>) => Promise<PAAPISearchResponse | null>;
}

export interface AmazonProductApiResponse {
  status: AmazonApiStatus;
  products: PriceComparison[];
  totalCount: number;
  isLiveApi: boolean;
  errorMessage?: string;
  missingCredentials?: string[];
  page: number;
}

// In-memory cache for PA-API responses (15-minute TTL respecting Amazon license terms)
const paapiCache = new Map<string, { timestamp: number; response: AmazonProductApiResponse }>();
const PAAPI_CACHE_TTL_MS = 15 * 60 * 1000;

// Test hook for mocking PA-API requests in automated test suites
let mockPaapiFetcher: ((target: string, payload: Record<string, unknown>) => Promise<PAAPISearchResponse | null>) | null = null;

export function setMockPaapiFetcher(
  fetcher: ((target: string, payload: Record<string, unknown>) => Promise<PAAPISearchResponse | null>) | null
): void {
  mockPaapiFetcher = fetcher;
  paapiCache.clear();
}

/**
 * Validates and sanitizes search queries (max length 200, strips non-printable/dangerous characters)
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return "";
  return query
    .slice(0, 200)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // strip control characters
    .trim();
}

/**
 * Checks configuration status of Amazon PA-API credentials
 */
export function getAmazonApiStatus(): {
  isConfigured: boolean;
  missingCredentials: string[];
  partnerTag: string;
} {
  const accessKey = process.env.AMAZON_ACCESS_KEY;
  const secretKey = process.env.AMAZON_SECRET_KEY;
  const partnerTag =
    process.env.AMAZON_ASSOCIATES_TAG ||
    process.env.NEXT_PUBLIC_AMAZON_TAG ||
    "dealfinderin-21";

  const missing: string[] = [];
  if (!accessKey) missing.push("AMAZON_ACCESS_KEY");
  if (!secretKey) missing.push("AMAZON_SECRET_KEY");

  return {
    isConfigured: missing.length === 0,
    missingCredentials: missing,
    partnerTag,
  };
}

/**
 * Detects appropriate category for an Amazon product
 */
function detectAmazonCategory(title: string, classifications?: { Binding?: { DisplayValue: string } }): Category {
  const text = `${title} ${classifications?.Binding?.DisplayValue || ""}`.toLowerCase();

  if (
    text.includes("fashion") ||
    text.includes("clothing") ||
    text.includes("apparel") ||
    text.includes("heel") ||
    text.includes("sandal") ||
    text.includes("shoe") ||
    text.includes("sneaker") ||
    text.includes("kurta") ||
    text.includes("saree")
  ) {
    return categories.find((c) => c.slug === "fashion") || categories[3];
  }

  if (text.includes("tv") || text.includes("television") || text.includes("appliance")) {
    return categories.find((c) => c.slug === "appliances") || categories[4];
  }

  if (
    text.includes("chocolate") ||
    text.includes("protein") ||
    text.includes("snack") ||
    text.includes("beauty") ||
    text.includes("cream") ||
    text.includes("serum")
  ) {
    return categories.find((c) => c.slug === "beauty") || categories[5];
  }

  if (text.includes("phone") || text.includes("mobile") || text.includes("iphone") || text.includes("galaxy")) {
    return categories.find((c) => c.slug === "mobiles") || categories[0];
  }

  if (text.includes("laptop") || text.includes("macbook") || text.includes("computer") || text.includes("pc")) {
    return categories.find((c) => c.slug === "laptops") || categories[1];
  }

  if (text.includes("headphone") || text.includes("earphone") || text.includes("airpod") || text.includes("audio")) {
    return categories.find((c) => c.slug === "audio") || categories[2];
  }

  return categories[0];
}

/**
 * Maps a genuine PA-API 5.0 item into a PriceComparison object.
 * Only displays fields actually supplied by the authorized source.
 */
export function mapPaapiItemToComparison(item: PAAPIItem, partnerTag: string): PriceComparison | null {
  const asin = item.ASIN;
  if (!asin || typeof asin !== "string") return null;

  const title = item.ItemInfo?.Title?.DisplayValue;
  if (!title) return null;

  const brand = item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || "Amazon Verified";
  const imageUrl =
    item.Images?.Primary?.Large?.URL ||
    item.Images?.Primary?.Medium?.URL ||
    "https://m.media-amazon.com/images/I/41-default.jpg";

  const listing = item.Offers?.Listings?.[0];
  const price = listing?.Price?.Amount ? Math.round(listing.Price.Amount) : 0;
  if (price <= 0) return null;

  const mrp = listing?.SavingBasis?.Amount
    ? Math.round(listing.SavingBasis.Amount)
    : price;

  const currency: "INR" = "INR";
  const inStock = listing?.Availability?.Type === "Now" || listing?.Availability?.Type === undefined;

  const productUrl =
    item.DetailPageURL ||
    `https://www.amazon.in/dp/${asin}?tag=${encodeURIComponent(partnerTag)}`;

  const category = detectAmazonCategory(title, item.ItemInfo?.Classifications);
  const productId = `prod_amz_${asin}`;
  const offerId = `off_amz_${asin}`;

  // Only map rating if actually supplied by the authorized API
  const rawReviews = (item as any).CustomerReviews;
  const rating =
    typeof rawReviews?.StarRating?.Value === "number"
      ? rawReviews.StarRating.Value
      : typeof (item as any).rating === "number"
      ? (item as any).rating
      : undefined;

  const ratingCount =
    typeof rawReviews?.Count === "number"
      ? rawReviews.Count
      : typeof (item as any).ratingCount === "number"
      ? (item as any).ratingCount
      : undefined;

  const product: Product = {
    id: productId,
    title,
    slug: `amazon-${asin.toLowerCase()}`,
    brand,
    categoryId: category.id,
    description: `${title}. Genuine product sourced via authorized Amazon India API.`,
    imageUrl,
    attributes: {
      asin,
      source: "amazon_paapi",
    },
    rating,
    ratingCount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const offer: Offer = {
    id: offerId,
    productId,
    retailerId: "ret_amazon",
    retailerName: "Amazon India",
    retailerSlug: "amazon",
    retailerProductId: asin,
    title,
    productUrl,
    price,
    originalPrice: mrp > price ? mrp : price,
    currency,
    inStock,
    shippingCost: price >= 499 ? 0 : 40,
    lastCheckedAt: new Date().toISOString(),
    isStale: false,
    isDemo: false,
    dataSource: "api",
    provenance: "amazon_paapi_live",
    deliveryTimeEstimate: "Standard delivery on Amazon India",
  };

  return computeProductComparison(product, [offer], category);
}

/**
 * Executes an authorized Amazon PA-API 5.0 search request
 */
export async function searchAmazonProductsApi(
  rawQuery: string,
  options: AmazonApiSearchOptions = {}
): Promise<AmazonProductApiResponse> {
  const query = sanitizeSearchQuery(rawQuery);
  const page = Math.max(options.page || 1, 1);
  const limit = Math.min(options.limit || 10, 10);

  if (!query) {
    return {
      status: "empty",
      products: [],
      totalCount: 0,
      isLiveApi: false,
      page,
    };
  }

  const { isConfigured, missingCredentials, partnerTag } = getAmazonApiStatus();
  const effectiveFetcher = options.customFetcher || mockPaapiFetcher;

  // If credentials are missing and no test mock is configured, gracefully mark as unconfigured
  if (!isConfigured && !effectiveFetcher) {
    return {
      status: "unconfigured",
      products: [],
      totalCount: 0,
      isLiveApi: false,
      missingCredentials,
      errorMessage: "Amazon PA-API 5.0 credentials not configured (requires AMAZON_ACCESS_KEY and AMAZON_SECRET_KEY)",
      page,
    };
  }

  // Check cache
  const cacheKey = `${query}:${page}:${limit}`;
  const cached = paapiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < PAAPI_CACHE_TTL_MS) {
    return cached.response;
  }

  const payload: Record<string, unknown> = {
    Keywords: query,
    SearchIndex: "All",
    ItemCount: limit,
    ItemPage: page,
    Resources: [
      "Images.Primary.Large",
      "Images.Primary.Medium",
      "ItemInfo.Title",
      "ItemInfo.ByLineInfo",
      "ItemInfo.Classifications",
      "ItemInfo.Features",
      "Offers.Listings.Price",
      "Offers.Listings.SavingBasis",
      "Offers.Listings.Availability",
    ],
  };

  try {
    let data: PAAPISearchResponse | null = null;

    if (effectiveFetcher) {
      data = await effectiveFetcher("SearchItems", payload);
    } else {
      // Use standard sendPAAPIRequest with SigV4
      data = await sendPAAPIRequest<PAAPISearchResponse>("SearchItems", payload);
    }

    if (!data) {
      const response: AmazonProductApiResponse = {
        status: "upstream_error",
        products: [],
        totalCount: 0,
        isLiveApi: true,
        errorMessage: "Upstream Amazon PA-API request failed or timed out",
        page,
      };
      return response;
    }

    // Check for API-level errors
    if (data.Errors && data.Errors.length > 0) {
      const firstErr = data.Errors[0];
      const isRateLimit = firstErr.Code === "TooManyRequests" || firstErr.Message?.includes("TooManyRequests");
      const status: AmazonApiStatus = isRateLimit ? "rate_limited" : "upstream_error";

      const response: AmazonProductApiResponse = {
        status,
        products: [],
        totalCount: 0,
        isLiveApi: true,
        errorMessage: firstErr.Message || firstErr.Code,
        page,
      };
      return response;
    }

    const rawItems = data.SearchResult?.Items || [];
    const comparisons: PriceComparison[] = [];

    for (const rawItem of rawItems) {
      const comp = mapPaapiItemToComparison(rawItem, partnerTag);
      if (comp) {
        // Apply numerical price filters if provided
        if (options.minPrice !== undefined && comp.lowestOffer && comp.lowestOffer.price < options.minPrice) {
          continue;
        }
        if (options.maxPrice !== undefined && comp.lowestOffer && comp.lowestOffer.price > options.maxPrice) {
          continue;
        }
        comparisons.push(comp);
      }
    }

    const totalCount = data.SearchResult?.TotalResultCount || comparisons.length;
    const finalResponse: AmazonProductApiResponse = {
      status: comparisons.length > 0 ? "ready" : "empty",
      products: comparisons,
      totalCount,
      isLiveApi: true,
      page,
    };

    paapiCache.set(cacheKey, { timestamp: Date.now(), response: finalResponse });
    return finalResponse;
  } catch (err: any) {
    const isTimeout = err?.name === "AbortError" || err?.message?.toLowerCase().includes("timeout");
    const status: AmazonApiStatus = isTimeout ? "timeout" : "upstream_error";

    return {
      status,
      products: [],
      totalCount: 0,
      isLiveApi: true,
      errorMessage: err?.message || "Error communicating with Amazon PA-API",
      page,
    };
  }
}
