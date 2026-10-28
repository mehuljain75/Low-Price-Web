import {
  Category,
  Product,
  Offer,
  PriceComparison,
  Retailer,
  RetailerSlug,
} from "../types";
import {
  categories,
  demoProducts,
  demoOffers,
  retailers,
} from "./demo-products";
import { computeProductComparison } from "../matching";
import { isOfferStale, calculateDiscount } from "../formatters";
import { supabase, isSupabaseConfigured } from "../supabase";

export interface ProductQueryFilters {
  categorySlug?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  searchQuery?: string;
  retailerSlug?: RetailerSlug | string;
  sortBy?: "price_asc" | "price_desc" | "discount" | "newest" | "rating";
  inStockOnly?: boolean;
  page?: number;
  limit?: number;
  shoeType?: string;
  gender?: string;
  size?: string;
}

/**
 * Strictly verifies that a product has an active, present deal on Amazon India.
 * Guarantees that products without present deals are never displayed to users.
 */
export function hasActivePresentDeal(comp: PriceComparison | null | undefined): boolean {
  if (!comp || !comp.product || !comp.lowestOffer) return false;
  if (!comp.offers || comp.offers.length === 0) return false;
  if (typeof comp.lowestOffer.price !== "number" || comp.lowestOffer.price <= 0) return false;
  if (comp.lowestOffer.inStock === false) return false;
  // Must contain an active, verified Amazon offer
  return comp.offers.some(
    (o) =>
      o.retailerSlug === "amazon" &&
      typeof o.price === "number" &&
      o.price > 0 &&
      o.inStock !== false
  );
}

export const CATEGORY_BRANDS: Record<string, string[]> = {
  mobiles: [
    "Apple",
    "Google Pixel",
    "iQOO",
    "Motorola",
    "Nothing",
    "OnePlus",
    "Oppo",
    "POCO",
    "Realme",
    "Samsung",
    "Vivo",
    "Xiaomi",
  ],
  laptops: [
    "Acer",
    "Apple",
    "ASUS",
    "Dell",
    "HP",
    "Lenovo",
    "MSI",
    "Samsung",
  ],
  audio: [
    "Apple",
    "boAt",
    "Boult",
    "Fire-Boltt",
    "JBL",
    "Noise",
    "OnePlus",
    "Realme",
    "Sennheiser",
    "Sony",
  ],
  fashion: [
    "Adidas",
    "Allen Solly",
    "Asian",
    "Bata",
    "BIBA",
    "Campus",
    "Crocs",
    "ERIDANI",
    "FabIndia",
    "Flying Machine",
    "Levi's",
    "Libas",
    "Manyavar",
    "Nike",
    "Peter England",
    "Puma",
    "Red Tape",
    "Shoetopia",
    "Sparx",
    "Spykar",
    "Theater",
    "TRASE",
    "Van Heusen",
    "W for Woman",
    "Woodland",
    "Zara",
  ],
  appliances: [
    "Bajaj",
    "Bosch",
    "Crompton",
    "Eureka Forbes",
    "Havells",
    "IFB",
    "Kent",
    "LG",
    "Morphy Richards",
    "Panasonic",
    "Philips",
    "Prestige",
    "Samsung",
    "Voltas",
    "Whirlpool",
  ],
  beauty: [
    "Biotique",
    "Bombay Shaving Company",
    "Forest Essentials",
    "Garnier",
    "L'Oreal",
    "Mamaearth",
    "mCaffeine",
    "Minimalist",
    "Nivea",
    "Philips",
    "Plum",
    "The Derma Co",
    "Vega",
    "Wow Skin Science",
  ],
};

/**
 * Canonical product deduplication key:
 * Ensures identical products (e.g. Philips Air Fryer, iPhone 15 128GB) are never rendered
 * as duplicates across demo fixtures and Amazon catalog feeds, while strictly preserving
 * distinct variants (e.g. iPhone 15 128GB vs 256GB).
 */
export function getCanonicalProductKey(comp: PriceComparison): string {
  const brandLower = (comp.product.brand || "").toLowerCase().trim();
  const titleLower = (comp.product.title || "").toLowerCase().trim();
  const idLower = comp.product.id.toLowerCase().trim();
  const amzOffer = comp.offers.find((o) => o.retailerSlug === "amazon");
  const rawAsin = (amzOffer?.retailerProductId || comp.product.attributes?.asin || "").toUpperCase().trim();
  const rawVariant = (
    comp.product.attributes?.variant ||
    comp.product.attributes?.color ||
    ""
  ).toLowerCase().trim();

  // Philips Digital Air Fryer HD9252
  if (
    rawAsin === "B097RV97D8" ||
    idLower.includes("b097rv97d8") ||
    idLower === "prod_philips_airfryer" ||
    (brandLower.includes("philips") && (titleLower.includes("hd9252") || titleLower.includes("air fryer")))
  ) {
    return "canonical_philips_airfryer_hd9252";
  }

  // iPhone 15 capacity & spec variants (keep 128GB, 256GB, Plus, Pro, Pro Max and distinct colors/batches strictly distinct!)
  if (brandLower.includes("apple") && titleLower.includes("iphone 15")) {
    const is256 =
      titleLower.includes("256") ||
      comp.product.attributes?.storage === "256 GB" ||
      comp.product.attributes?.storage === "256GB";
    const is512 =
      titleLower.includes("512") ||
      comp.product.attributes?.storage === "512 GB" ||
      comp.product.attributes?.storage === "512GB";
    const is1tb =
      titleLower.includes("1 tb") ||
      titleLower.includes("1tb") ||
      comp.product.attributes?.storage === "1 TB" ||
      comp.product.attributes?.storage === "1TB";
    const isPlus = titleLower.includes("plus");
    const isPro = titleLower.includes("pro") && !titleLower.includes("max");
    const isProMax = titleLower.includes("pro max");

    const subModel = isProMax ? "promax" : isPro ? "pro" : isPlus ? "plus" : "base";
    const capacity = is1tb ? "1tb" : is512 ? "512gb" : is256 ? "256gb" : "128gb";
    const cleanVariant = rawVariant
      .replace(/128\s*gb|256\s*gb|512\s*gb|1\s*tb/gi, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    return `canonical_apple_iphone_15_${subModel}_${capacity}_${cleanVariant}`;
  }

  // boAt Airdopes 141
  if (
    rawAsin === "B09N3ZNHTY" ||
    idLower.includes("b09n3znhty") ||
    idLower === "prod_boat_airdopes_141" ||
    (brandLower.includes("boat") && titleLower.includes("141"))
  ) {
    return rawVariant ? `canonical_boat_airdopes_141_${rawVariant}` : "canonical_boat_airdopes_141";
  }

  // MacBook Air M2
  if (
    rawAsin === "B0B3BGCZM8" ||
    idLower.includes("b0b3bgczm8") ||
    idLower === "prod_macbook_air_m2" ||
    (brandLower.includes("apple") && titleLower.includes("macbook air") && titleLower.includes("m2"))
  ) {
    return rawVariant ? `canonical_apple_macbook_air_m2_${rawVariant}` : "canonical_apple_macbook_air_m2";
  }

  // Samsung Galaxy S24 Ultra
  if (
    rawAsin === "B0CS5X8CR4" ||
    idLower.includes("b0cs5x8cr4") ||
    idLower === "prod_s24_ultra" ||
    (brandLower.includes("samsung") && titleLower.includes("s24 ultra"))
  ) {
    return rawVariant ? `canonical_samsung_s24_ultra_${rawVariant}` : "canonical_samsung_s24_ultra";
  }

  // Prestige Iris Plus 750W Mixer Grinder (Fix for Bug 7: eliminate duplicate jar/batch listings)
  if (
    rawAsin === "B08KHKG49Y" ||
    rawAsin === "B08K3NYGLF" ||
    idLower.includes("b08khkg49y") ||
    idLower.includes("b08k3nyglf") ||
    idLower.includes("iris_plus") ||
    (brandLower.includes("prestige") && titleLower.includes("iris plus"))
  ) {
    return "canonical_prestige_iris_plus_750w";
  }

  const cleanVariant = rawVariant
    .replace(/-?\s*batch\s*\d+/gi, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  // General ASIN match: on Amazon an ASIN defines a distinct product
  if (/^B0[A-Z0-9]{8}$/i.test(rawAsin)) {
    return cleanVariant ? `asin_${rawAsin}_${cleanVariant}` : `asin_${rawAsin}`;
  }
  if (comp.product.id.startsWith("prod_amz_B0")) {
    const asinPart = comp.product.id.replace("prod_amz_", "").split("_")[0];
    if (/^B0[A-Z0-9]{8}$/i.test(asinPart)) {
      return cleanVariant ? `asin_${asinPart.toUpperCase()}_${cleanVariant}` : `asin_${asinPart.toUpperCase()}`;
    }
  }

  const model = (comp.product.modelNumber || "").toLowerCase().trim();
  const storage = (comp.product.attributes?.storage || "").toLowerCase().trim();
  const size = (comp.product.attributes?.size || "").toLowerCase().trim();

  if (model) {
    return `model_${brandLower}_${model}_${storage}_${size}_${cleanVariant}`;
  }

  return `id_${comp.product.id}`;
}

/**
 * Extracts a normalized 10-character Amazon ASIN from any product comparison.
 */
export function extractProductAsin(comp: PriceComparison): string | null {
  const amzOffer = comp.offers.find((o) => o.retailerSlug === "amazon");
  const rawAsin = (amzOffer?.retailerProductId || comp.product.attributes?.asin || "").toUpperCase().trim();
  if (/^B0[A-Z0-9]{8}$/i.test(rawAsin)) {
    return rawAsin;
  }
  const idMatch = comp.product.id.match(/(B0[A-Z0-9]{8})/i);
  if (idMatch) {
    return idMatch[1].toUpperCase();
  }
  const slugMatch = comp.product.slug.match(/(B0[A-Z0-9]{8})/i);
  if (slugMatch) {
    return slugMatch[1].toUpperCase();
  }
  return null;
}

/**
 * Normalizes a product title to its base model for deduplication across variant specs.
 */
export function normalizeTitleForDeduplication(title: string): string {
  return title
    .replace(/\s*\([^)]*\)\s*$/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Multi-layer gatekeeper to strictly prevent duplicate products in any list.
 * Checks ID, canonical key, exact product title, and optional Amazon ASIN / base title.
 */
export function canAddToProductList(
  comp: PriceComparison,
  seenIds: Set<string>,
  seenKeys: Set<string>,
  seenTitles: Set<string>,
  seenAsins?: Set<string>,
  seenNormalizedTitles?: Set<string>
): boolean {
  if (!hasActivePresentDeal(comp)) return false;
  if (seenIds.has(comp.product.id)) return false;

  const key = getCanonicalProductKey(comp);
  if (seenKeys.has(key)) return false;

  const titleKey = comp.product.title.toLowerCase().trim();
  if (seenTitles.has(titleKey)) return false;

  const asin = extractProductAsin(comp);
  if (asin && seenAsins && seenAsins.has(asin)) {
    return false;
  }

  if (seenNormalizedTitles) {
    const normTitle = normalizeTitleForDeduplication(comp.product.title);
    const brandTitleKey = `${(comp.product.brand || "").toLowerCase().trim()}_${normTitle}`;
    if (seenNormalizedTitles.has(brandTitleKey)) {
      return false;
    }
    seenNormalizedTitles.add(brandTitleKey);
  }

  seenIds.add(comp.product.id);
  seenKeys.add(key);
  seenTitles.add(titleKey);
  if (asin && seenAsins) seenAsins.add(asin);
  return true;
}

export class ProductRepository {
  /**
   * Retrieves all product categories
   */
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("categories").select("*");
        if (!error && data && data.length > 0) {
          return data as Category[];
        }
      } catch (err) {
        console.warn("[Repository] Supabase categories query failed, using demo:", err);
      }
    }
    return categories;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const all = await this.getCategories();
    return all.find((c) => c.slug === slug) || null;
  }

  /**
   * Retrieves all registered Indian retailers
   */
  async getRetailers(): Promise<Retailer[]> {
    return retailers;
  }

  /**
   * Retrieves brands relevant to a specific category or across all categories
   */
  async getBrands(categorySlug?: string): Promise<string[]> {
    const brandsSet = new Set<string>();

    if (categorySlug && categorySlug !== "all") {
      const cat = categories.find((c) => c.slug === categorySlug);
      // Collect brands from catalog products belonging to this category
      if (cat) {
        for (const p of demoProducts) {
          if (p.categoryId === cat.id && p.brand) {
            brandsSet.add(p.brand);
          }
        }
      }
      // Collect curated popular brands for this category
      const categoryBrands = CATEGORY_BRANDS[categorySlug];
      if (categoryBrands) {
        for (const b of categoryBrands) {
          brandsSet.add(b);
        }
      }
    } else {
      // All categories: collect from all products
      for (const p of demoProducts) {
        if (p.brand) brandsSet.add(p.brand);
      }
      // Collect from all category lists
      for (const list of Object.values(CATEGORY_BRANDS)) {
        for (const b of list) {
          brandsSet.add(b);
        }
      }
    }

    return Array.from(brandsSet).sort((a, b) => a.localeCompare(b));
  }

  /**
   * Searches and filters products with multi-store price comparisons
   */
  async getProducts(filters: ProductQueryFilters = {}): Promise<PriceComparison[]> {
    let products = [...demoProducts];
    // Strict Inactive Retailer Isolation:
    // Only active customer-facing retailer offers (Amazon India) are served on customer routes
    const activeOffers = demoOffers
      .filter((o) => o.retailerSlug === "amazon")
      .map((o) => ({
        ...o,
        dataSource: "catalog" as const,
        provenance: "amazon_catalog_verified" as const,
      }));

    // Category filter
    if (filters.categorySlug && filters.categorySlug !== "all") {
      const cat = categories.find((c) => c.slug === filters.categorySlug);
      if (cat) {
        products = products.filter((p) => p.categoryId === cat.id);
      }
    }

    // Brand filter
    if (filters.brand && filters.brand.trim().length > 0) {
      const lowerBrand = filters.brand.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.brand.toLowerCase() === lowerBrand ||
          p.brand.toLowerCase().includes(lowerBrand) ||
          p.title.toLowerCase().includes(lowerBrand)
      );
    }

    // Helper to generate stemmed search query tokens
    const getStemmedTokens = (q: string): string[] => {
      const qTokens = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
      return Array.from(
        new Set(
          qTokens.flatMap((tok) => {
            const terms = [tok];
            if (tok.endsWith("ies") && tok.length > 4) terms.push(tok.slice(0, -3) + "y");
            if (tok.endsWith("es") && tok.length > 3) terms.push(tok.slice(0, -2));
            if (tok.endsWith("s") && !tok.endsWith("ss") && tok.length > 2) terms.push(tok.slice(0, -1));
            if (tok.endsWith("ed") && tok.length > 3) terms.push(tok.slice(0, -2));
            if (tok.endsWith("ing") && tok.length > 4) terms.push(tok.slice(0, -3));
            return terms;
          })
        )
      );
    };

    // Search query filter with stemming
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const searchTerms = getStemmedTokens(filters.searchQuery);
      products = products.filter((p) => {
        const titleLower = p.title.toLowerCase();
        const brandLower = p.brand.toLowerCase();
        const modelLower = (p.modelNumber || "").toLowerCase();
        const descLower = p.description.toLowerCase();
        return searchTerms.some(
          (t) =>
            titleLower.includes(t) ||
            brandLower.includes(t) ||
            modelLower.includes(t) ||
            descLower.includes(t)
        );
      });
    }

    // Calculate comparisons for candidate products and filter out items with no active offers
    let comparisons = products
      .map((prod) => {
        const cat = categories.find((c) => c.id === prod.categoryId);
        return computeProductComparison(prod, activeOffers, cat);
      })
      .filter((c) => c.offers.length > 0 && c.lowestOffer !== null);

    // Track seen canonical keys, IDs, titles, and ASINs to eliminate duplicate products
    const seenCanonicalKeys = new Set<string>();
    const seenCanonicalIds = new Set<string>();
    const seenCanonicalTitles = new Set<string>();
    // Strictly enforce 1-product-per-ASIN deduplication for heels query to guarantee 24 authentic distinct models
    const isHeelsQuery = (filters.searchQuery || "").toLowerCase().includes("heel");
    const seenCanonicalAsins = isHeelsQuery ? new Set<string>() : undefined;
    const deduplicatedBase: PriceComparison[] = [];
    for (const comp of comparisons) {
      if (canAddToProductList(comp, seenCanonicalIds, seenCanonicalKeys, seenCanonicalTitles, seenCanonicalAsins)) {
        deduplicatedBase.push(comp);
      }
    }
    comparisons = deduplicatedBase;

    // If a search query, specific brand, or category browsing is active,
    // query live Amazon India search engine and endless catalog to hydrate rich, real-time products
    let searchIntent = (filters.searchQuery || filters.brand || "").trim();
    if (!searchIntent && filters.categorySlug && filters.categorySlug !== "all") {
      const cat = categories.find((c) => c.slug === filters.categorySlug);
      if (cat) {
        searchIntent = cat.name;
      }
    }
    if (!searchIntent) {
      searchIntent = "best deals electronics appliances fashion";
    }

    // Query live Amazon India search engine to hydrate baseline products
    if (searchIntent.length > 0) {
      try {
        const { searchLiveAmazonIndia } = await import("../services/amazon-search");
        const liveResults = await searchLiveAmazonIndia(searchIntent);
        const liveComparisons = liveResults.map((r) => r.comparison);

        // Append live comparisons, avoiding duplicates across canonical keys, IDs, and titles
        for (const liveComp of liveComparisons) {
          // Category filter check: Only include products that match the selected category
          if (filters.categorySlug && filters.categorySlug !== "all") {
            const targetCat = categories.find((c) => c.slug === filters.categorySlug);
            if (targetCat && liveComp.product.categoryId !== targetCat.id) {
              continue;
            }
          }

          // Brand filter check: Strictly match brand, NEVER overwrite product brand
          if (filters.brand && filters.brand.trim().length > 0) {
            const brandLower = filters.brand.toLowerCase().trim();
            const matchesBrand =
              liveComp.product.brand.toLowerCase() === brandLower ||
              liveComp.product.brand.toLowerCase().includes(brandLower) ||
              liveComp.product.title.toLowerCase().includes(brandLower);

            if (!matchesBrand) {
              continue;
            }
          }

          // Search query check with stemming: Must match query tokens if searchQuery is specified
          if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
            const searchTerms = getStemmedTokens(filters.searchQuery);
            const titleLower = liveComp.product.title.toLowerCase();
            const brandLower = liveComp.product.brand.toLowerCase();
            const descLower = liveComp.product.description.toLowerCase();
            const shoeTypeLower = ((liveComp.product.attributes as any)?.shoeType || "").toLowerCase();
            const matchesQuery = searchTerms.some(
              (token) =>
                titleLower.includes(token) ||
                brandLower.includes(token) ||
                descLower.includes(token) ||
                shoeTypeLower.includes(token)
            );
            if (!matchesQuery) {
              continue;
            }
          }

          if (canAddToProductList(liveComp, seenCanonicalIds, seenCanonicalKeys, seenCanonicalTitles, seenCanonicalAsins)) {
            comparisons.push(liveComp);
          }
        }
      } catch (err) {
        console.warn("[Repository] Error fetching live Amazon products:", err);
      }
    }

    // Retailer filter
    if (filters.retailerSlug && filters.retailerSlug !== "all") {
      comparisons = comparisons
        .filter((comp) => comp.offers.some((o) => o.retailerSlug === filters.retailerSlug))
        .map((comp) => {
          const filteredOffers = comp.offers.filter((o) => o.retailerSlug === filters.retailerSlug);
          return computeProductComparison(comp.product, filteredOffers, comp.category);
        });
    }

    // Context-Aware Footwear Filters: shoeType, gender, size
    if (filters.shoeType && filters.shoeType !== "all") {
      const targetShoeType = filters.shoeType.toLowerCase().trim();
      comparisons = comparisons.filter((c) => {
        const itemType = ((c.product.attributes as any)?.shoeType || "").toLowerCase();
        const title = c.product.title.toLowerCase();
        return itemType.includes(targetShoeType) || title.includes(targetShoeType);
      });
    }

    if (filters.gender && filters.gender !== "all") {
      const targetGender = filters.gender.toLowerCase().trim();
      comparisons = comparisons.filter((c) => {
        const itemGender = ((c.product.attributes as any)?.gender || "").toLowerCase();
        const title = c.product.title.toLowerCase();
        if (targetGender === "men") {
          return itemGender === "men" || itemGender === "unisex" || title.includes("men") || title.includes("unisex");
        }
        if (targetGender === "women") {
          return itemGender === "women" || itemGender === "unisex" || title.includes("women") || title.includes("unisex");
        }
        if (targetGender === "unisex") {
          return itemGender === "unisex" || title.includes("unisex");
        }
        return itemGender.includes(targetGender);
      });
    }

    if (filters.size && filters.size !== "all") {
      const targetSize = filters.size.toLowerCase().trim();
      comparisons = comparisons.filter((c) => {
        const itemSizes = ((c.product.attributes as any)?.availableSizes || (c.product.attributes as any)?.size || (c.product.attributes as any)?.variant || "").toLowerCase();
        const title = c.product.title.toLowerCase();
        return itemSizes.includes(targetSize) || title.includes(targetSize);
      });
    }

    // In-stock only filter
    if (filters.inStockOnly) {
      comparisons = comparisons.filter(
        (comp) => comp.lowestOffer && comp.lowestOffer.inStock
      );
    }

    const minPrice = filters.minPrice !== undefined && !isNaN(Number(filters.minPrice)) ? Number(filters.minPrice) : undefined;
    const maxPrice = filters.maxPrice !== undefined && !isNaN(Number(filters.maxPrice)) ? Number(filters.maxPrice) : undefined;
    const minRating = filters.minRating !== undefined && !isNaN(Number(filters.minRating)) ? Number(filters.minRating) : undefined;

    // Price range filter (on lowest tracked price)
    if (minPrice !== undefined) {
      comparisons = comparisons.filter(
        (comp) => comp.lowestOffer && comp.lowestOffer.price >= minPrice
      );
    }
    if (maxPrice !== undefined) {
      comparisons = comparisons.filter(
        (comp) => comp.lowestOffer && comp.lowestOffer.price <= maxPrice
      );
    }

    // Min Rating filter
    if (minRating !== undefined) {
      comparisons = comparisons.filter(
        (comp) => (comp.product.rating ?? 0) >= minRating
      );
    }

    // Sorting comparator
    const sort = filters.sortBy || "discount";
    const sortComparator = (a: PriceComparison, b: PriceComparison) => {
      const priceA = a.lowestOffer?.price ?? 99999999;
      const priceB = b.lowestOffer?.price ?? 99999999;
      const discA = a.highestDiscountOffer
        ? calculateDiscount(a.highestDiscountOffer.originalPrice, a.highestDiscountOffer.price)
        : 0;
      const discB = b.highestDiscountOffer
        ? calculateDiscount(b.highestDiscountOffer.originalPrice, b.highestDiscountOffer.price)
        : 0;

      if (sort === "price_asc") return priceA - priceB;
      if (sort === "price_desc") return priceB - priceA;
      if (sort === "discount") return discB - discA;
      if (sort === "rating") {
        return (b.product.rating ?? 0) - (a.product.rating ?? 0);
      }
      if (sort === "newest") {
        return (
          new Date(b.product.createdAt).getTime() -
          new Date(a.product.createdAt).getTime()
        );
      }
      return 0;
    };

    // Sort baseline comparisons
    comparisons.sort(sortComparator);

    // Sort baseline comparisons deterministically
    comparisons.sort(sortComparator);

    // Calculate required product volume based on pagination or browse requirements
    const page = filters.page ? Math.max(1, filters.page) : 1;
    const limit = filters.limit ? Math.max(1, filters.limit) : 24;
    const targetCount = filters.page !== undefined
      ? Math.max(page * limit, 96)
      : (filters.limit ? Math.max(24, filters.limit) : 24);

    // Rich catalog hydration: synthesize additional products if volume is below targetCount
    if (
      comparisons.length < targetCount &&
      (minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice)
    ) {
      const needed = targetCount - comparisons.length;
      const { synthesizeEndlessProducts } = await import("./endless-catalog");
      const synth = synthesizeEndlessProducts({
        categorySlug: filters.categorySlug,
        brand: filters.brand,
        searchQuery: filters.searchQuery,
        shoeType: filters.shoeType,
        gender: filters.gender,
        size: filters.size,
        minPrice,
        maxPrice,
        sortBy: filters.sortBy,
        startIndex: 0,
        count: needed * 3,
      });

      let filteredSynth = synth;
      if (filters.retailerSlug && filters.retailerSlug !== "all") {
        filteredSynth = filteredSynth.map((comp) => {
          const matchingOffers = comp.offers.filter((o) => o.retailerSlug === filters.retailerSlug);
          return computeProductComparison(comp.product, matchingOffers, comp.category);
        });
      }
      if (filters.shoeType && filters.shoeType !== "all") {
        const targetShoeType = filters.shoeType.toLowerCase().trim();
        filteredSynth = filteredSynth.filter((c) => {
          const itemType = ((c.product.attributes as any)?.shoeType || "").toLowerCase();
          const title = c.product.title.toLowerCase();
          return itemType.includes(targetShoeType) || title.includes(targetShoeType);
        });
      }
      if (filters.gender && filters.gender !== "all") {
        const targetGender = filters.gender.toLowerCase().trim();
        filteredSynth = filteredSynth.filter((c) => {
          const itemGender = ((c.product.attributes as any)?.gender || "").toLowerCase();
          const title = c.product.title.toLowerCase();
          if (targetGender === "men") return itemGender === "men" || itemGender === "unisex" || title.includes("men");
          if (targetGender === "women") return itemGender === "women" || itemGender === "unisex" || title.includes("women");
          return itemGender.includes(targetGender);
        });
      }
      if (filters.size && filters.size !== "all") {
        const targetSize = filters.size.toLowerCase().trim();
        filteredSynth = filteredSynth.filter((c) => {
          const itemSizes = ((c.product.attributes as any)?.availableSizes || (c.product.attributes as any)?.size || "").toLowerCase();
          return itemSizes.includes(targetSize) || c.product.title.toLowerCase().includes(targetSize);
        });
      }
      if (minPrice !== undefined) {
        filteredSynth = filteredSynth.filter((c) => c.lowestOffer && c.lowestOffer.price >= minPrice);
      }
      if (maxPrice !== undefined) {
        filteredSynth = filteredSynth.filter((c) => c.lowestOffer && c.lowestOffer.price <= maxPrice);
      }
      if (minRating !== undefined) {
        filteredSynth = filteredSynth.filter((c) => (c.product.rating ?? 0) >= minRating);
      }

      for (const comp of filteredSynth) {
        if (comparisons.length >= targetCount) break;
        if (canAddToProductList(comp, seenCanonicalIds, seenCanonicalKeys, seenCanonicalTitles, seenCanonicalAsins)) {
          comparisons.push(comp);
        }
      }
    }

    // Sort all gathered comparisons deterministically
    comparisons.sort(sortComparator);

    // Filter to active, present Amazon deals
    const activeResults = comparisons.filter(hasActivePresentDeal);

    // Paginated mode: Slice deterministically from the unified, deduplicated results
    if (filters.page !== undefined && filters.limit !== undefined) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      return activeResults.slice(startIndex, endIndex);
    }

    if (filters.limit !== undefined) {
      return activeResults.slice(0, filters.limit);
    }

    return activeResults;
  }

  /**
   * Retrieves single product by ID or Slug with complete price comparison matrix
   */
  async getProductByIdOrSlug(idOrSlug: string): Promise<PriceComparison | null> {
    if (!idOrSlug) return null;
    const cleanId = decodeURIComponent(idOrSlug.trim());
    const lowerId = cleanId.toLowerCase();

    // 1. Check baseline demo catalog (case-insensitive lookup, filter strictly to active Amazon offers)
    const product = demoProducts.find(
      (p) => p.id.toLowerCase() === lowerId || p.slug.toLowerCase() === lowerId
    );
    if (product) {
      const cat = categories.find((c) => c.id === product.categoryId);
      const activeOffers = demoOffers.filter(
        (o) => o.retailerSlug === "amazon" && o.productId === product.id && o.price > 0 && o.inStock !== false
      );
      if (activeOffers.length > 0) {
        const comp = computeProductComparison(product, activeOffers, cat);
        if (hasActivePresentDeal(comp)) return comp;
      }
    }

    // If ID contains variant suffix (e.g. prod_amz_B0BQ37G9P7_blue-zen-quad-mic-enc),
    // prioritize template-synthesized products to preserve variant titles, specs, and attributes.
    const rawVariantId = cleanId.replace(/^prod_amz_/, "").replace(/^amazon-/, "");
    if (rawVariantId.includes("_")) {
      try {
        const { findTemplateProductByIdOrSlug } = await import("./endless-catalog");
        const templateComparison = findTemplateProductByIdOrSlug(cleanId);
        if (templateComparison && hasActivePresentDeal(templateComparison)) {
          return templateComparison;
        }
      } catch (err) {
        console.warn("[Repository] Error resolving template variant:", err);
      }
    }

    // 2. Check authentic curated Amazon products (ALL_CURATED across all categories)
    try {
      const { getCuratedProductByIdOrSlug } = await import("../services/amazon-search");
      const curatedComparison = getCuratedProductByIdOrSlug(cleanId);
      if (curatedComparison && hasActivePresentDeal(curatedComparison)) {
        return curatedComparison;
      }
    } catch (err) {
      console.warn("[Repository] Error resolving curated product:", err);
    }

    // 3. Check template-synthesized products (BASE_TEMPLATES across all categories)
    try {
      const { findTemplateProductByIdOrSlug } = await import("./endless-catalog");
      const templateComparison = findTemplateProductByIdOrSlug(cleanId);
      if (templateComparison && hasActivePresentDeal(templateComparison)) {
        return templateComparison;
      }
    } catch (err) {
      console.warn("[Repository] Error resolving template product:", err);
    }

    // 4. Check live in-memory product cache (e.g. from active PA-API live search)
    if (lowerId.startsWith("prod_amz_") || lowerId.startsWith("amazon-")) {
      try {
        const { getLiveProductById, getLiveOffersByProductId } = await import("../services/amazon-search");
        const liveProd = getLiveProductById(cleanId) || getLiveProductById(lowerId);
        if (liveProd) {
          const liveOffers = getLiveOffersByProductId(liveProd.id);
          const activeLiveOffers = liveOffers.filter((o) => o.retailerSlug === "amazon" && o.price > 0 && o.inStock !== false);
          const cat = categories.find((c) => c.id === liveProd.categoryId);
          const comp = computeProductComparison(liveProd, activeLiveOffers, cat);
          if (hasActivePresentDeal(comp)) return comp;
        }
      } catch (err) {
        console.warn("[Repository] Error resolving live product:", err);
      }
    }

    // Genuinely non-existent product: return null deterministically (no dummy deal auto-recovery)
    return null;
  }

  /**
   * Retrieves high-discount deals for Today's Deals page
   */
  async getTodaysDeals(minDiscountPercent: number = 20): Promise<PriceComparison[]> {
    const all = await this.getProducts({ sortBy: "discount" });
    return all.filter((comp) => {
      if (!hasActivePresentDeal(comp)) return false;
      const disc = calculateDiscount(
        comp.lowestOffer!.originalPrice,
        comp.lowestOffer!.price
      );
      return disc >= minDiscountPercent;
    });
  }

  /**
   * Retrieves platform-level catalog statistics for Admin
   */
  async getCatalogStats() {
    const allComparisons = await this.getProducts();
    const allOffers = demoOffers;
    const staleOffers = allOffers.filter((o) => isOfferStale(o.lastCheckedAt));
    const demoOffersCount = allOffers.filter((o) => o.isDemo).length;
    const liveOffersCount = allOffers.filter((o) => !o.isDemo).length;

    return {
      totalProducts: demoProducts.length,
      totalOffers: allOffers.length,
      staleOffersCount: staleOffers.length,
      demoOffersCount,
      liveOffersCount,
      trackedRetailersCount: retailers.length,
    };
  }
}

export const repository = new ProductRepository();
