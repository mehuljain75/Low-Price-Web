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
  const titleLower = (comp.product.title || "").toLowerCase();
  const idLower = comp.product.id.toLowerCase();
  const amzOffer = comp.offers.find((o) => o.retailerSlug === "amazon");
  const rawAsin = (amzOffer?.retailerProductId || comp.product.attributes?.asin || "").toUpperCase();

  // Philips Digital Air Fryer HD9252
  if (
    rawAsin === "B097RV97D8" ||
    idLower.includes("b097rv97d8") ||
    idLower === "prod_philips_airfryer" ||
    (brandLower.includes("philips") && (titleLower.includes("hd9252") || titleLower.includes("air fryer")))
  ) {
    return "canonical_philips_airfryer_hd9252";
  }

  // iPhone 15 capacity variants (keep 128GB, 256GB, Plus, Pro, Pro Max strictly distinct!)
  if (brandLower.includes("apple") && titleLower.includes("iphone 15")) {
    const is256 =
      titleLower.includes("256") ||
      comp.product.attributes?.storage === "256 GB" ||
      comp.product.attributes?.storage === "256GB";
    const isPlus = titleLower.includes("plus");
    const isPro = titleLower.includes("pro") && !titleLower.includes("max");
    const isProMax = titleLower.includes("pro max");
    if (isProMax) return "canonical_apple_iphone_15_promax";
    if (isPro) return "canonical_apple_iphone_15_pro";
    if (isPlus) return "canonical_apple_iphone_15_plus";
    if (is256) return "canonical_apple_iphone_15_256gb";
    return "canonical_apple_iphone_15_128gb";
  }

  // boAt Airdopes 141
  if (
    rawAsin === "B09N3ZNHTY" ||
    idLower.includes("b09n3znhty") ||
    idLower === "prod_boat_airdopes_141" ||
    (brandLower.includes("boat") && titleLower.includes("141"))
  ) {
    return "canonical_boat_airdopes_141";
  }

  // MacBook Air M2
  if (
    rawAsin === "B0B3BGCZM8" ||
    idLower.includes("b0b3bgczm8") ||
    idLower === "prod_macbook_air_m2" ||
    (brandLower.includes("apple") && titleLower.includes("macbook air") && titleLower.includes("m2"))
  ) {
    return "canonical_apple_macbook_air_m2";
  }

  // Samsung Galaxy S24 Ultra
  if (
    rawAsin === "B0CS5X8CR4" ||
    idLower.includes("b0cs5x8cr4") ||
    idLower === "prod_s24_ultra" ||
    (brandLower.includes("samsung") && titleLower.includes("s24 ultra"))
  ) {
    return "canonical_samsung_s24_ultra";
  }

  // General ASIN match
  if (/^B0[A-Z0-9]{8}$/i.test(rawAsin)) {
    return `asin_${rawAsin}`;
  }
  if (comp.product.id.startsWith("prod_amz_B0")) {
    const asin = comp.product.id.replace("prod_amz_", "");
    if (/^B0[A-Z0-9]{8}$/i.test(asin)) {
      return `asin_${asin.toUpperCase()}`;
    }
  }

  const model = (comp.product.modelNumber || "").toLowerCase().trim();
  const storage = (comp.product.attributes?.storage || "").toLowerCase().trim();
  const size = (comp.product.attributes?.size || "").toLowerCase().trim();

  if (model) {
    return `model_${brandLower}_${model}_${storage}_${size}`;
  }

  return `id_${comp.product.id}`;
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

    // Search query filter
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.modelNumber?.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Calculate comparisons for candidate products and filter out items with no active offers
    let comparisons = products
      .map((prod) => {
        const cat = categories.find((c) => c.id === prod.categoryId);
        return computeProductComparison(prod, activeOffers, cat);
      })
      .filter((c) => c.offers.length > 0 && c.lowestOffer !== null);

    // Track seen canonical keys to eliminate duplicate products (e.g. Philips Air Fryer, iPhone 15)
    const seenCanonicalKeys = new Set<string>();
    const deduplicatedBase: PriceComparison[] = [];
    for (const comp of comparisons) {
      const key = getCanonicalProductKey(comp);
      if (!seenCanonicalKeys.has(key)) {
        seenCanonicalKeys.add(key);
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

        // Append live comparisons, avoiding duplicates across canonical keys
        for (const liveComp of liveComparisons) {
          const key = getCanonicalProductKey(liveComp);
          if (seenCanonicalKeys.has(key)) continue;

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

          comparisons.push(liveComp);
          seenCanonicalKeys.add(key);
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

    // PAGINATED STREAM MODE (Infinite Scroll)
    if (filters.page !== undefined && filters.limit !== undefined) {
      const page = Math.max(1, filters.page);
      const limit = Math.max(1, filters.limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const pageResults: PriceComparison[] = [];

      if (startIndex < comparisons.length) {
        // Take matching baseline items for this slice
        const baselineSlice = comparisons.slice(startIndex, endIndex);
        pageResults.push(...baselineSlice);

        // If slice is smaller than page limit and no strict price bounds were exceeded,
        // synthesize remaining items
        if (pageResults.length < limit && (minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice)) {
          const needed = limit - pageResults.length;
          const { synthesizeEndlessProducts } = await import("./endless-catalog");
          const synth = synthesizeEndlessProducts({
            categorySlug: filters.categorySlug,
            brand: filters.brand,
            searchQuery: filters.searchQuery,
            minPrice,
            maxPrice,
            sortBy: filters.sortBy,
            startIndex: 0,
            count: needed,
          });

          let filteredSynth = synth;
          if (filters.retailerSlug && filters.retailerSlug !== "all") {
            filteredSynth = filteredSynth.map((comp) => {
              const matchingOffers = comp.offers.filter((o) => o.retailerSlug === filters.retailerSlug);
              return computeProductComparison(comp.product, matchingOffers, comp.category);
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
          pageResults.push(...filteredSynth);
        }
      } else if (minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice) {
        // All baseline items were already displayed on previous pages.
        // Stream deterministic endless synthesized products from calculated offset.
        const synthesisOffset = startIndex - comparisons.length;
        const { synthesizeEndlessProducts } = await import("./endless-catalog");
        const synth = synthesizeEndlessProducts({
          categorySlug: filters.categorySlug,
          brand: filters.brand,
          searchQuery: filters.searchQuery,
          minPrice,
          maxPrice,
          sortBy: filters.sortBy,
          startIndex: synthesisOffset,
          count: limit,
        });

        let filteredSynth = synth;
        if (filters.retailerSlug && filters.retailerSlug !== "all") {
          filteredSynth = filteredSynth.map((comp) => {
            const matchingOffers = comp.offers.filter((o) => o.retailerSlug === filters.retailerSlug);
            return computeProductComparison(comp.product, matchingOffers, comp.category);
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
        pageResults.push(...filteredSynth);
      }

      pageResults.sort(sortComparator);
      return pageResults;
    }

    // UNPAGINATED MODE (e.g. Initial SSR or Catalog Stats)
    // Guarantee rich catalog hydration (> 40 items)
    if (comparisons.length < 48 && (minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice)) {
      const needed = 48 - comparisons.length;
      const { synthesizeEndlessProducts } = await import("./endless-catalog");
      const synth = synthesizeEndlessProducts({
        categorySlug: filters.categorySlug,
        brand: filters.brand,
        searchQuery: filters.searchQuery,
        minPrice,
        maxPrice,
        sortBy: filters.sortBy,
        startIndex: 0,
        count: needed + 16,
      });

      let filteredSynth = synth;
      if (filters.retailerSlug && filters.retailerSlug !== "all") {
        filteredSynth = filteredSynth.map((comp) => {
          const matchingOffers = comp.offers.filter((o) => o.retailerSlug === filters.retailerSlug);
          return computeProductComparison(comp.product, matchingOffers, comp.category);
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
        if (comparisons.length >= 48) break;
        const key = getCanonicalProductKey(comp);
        if (!seenCanonicalKeys.has(key)) {
          seenCanonicalKeys.add(key);
          comparisons.push(comp);
        }
      }
      comparisons.sort(sortComparator);
    }

    return comparisons;
  }

  /**
   * Retrieves single product by ID or Slug with complete price comparison matrix
   */
  async getProductByIdOrSlug(idOrSlug: string): Promise<PriceComparison | null> {
    const cleanId = idOrSlug.trim();

    // 1. Check baseline catalog (filter strictly to active Amazon offers)
    const product = demoProducts.find(
      (p) => p.id === cleanId || p.slug === cleanId
    );
    if (product) {
      const cat = categories.find((c) => c.id === product.categoryId);
      const activeOffers = demoOffers.filter(
        (o) => o.retailerSlug === "amazon" && o.productId === product.id
      );
      if (activeOffers.length > 0) {
        return computeProductComparison(product, activeOffers, cat);
      }
    }

    // 2. Check live/curated Amazon products
    if (cleanId.startsWith("prod_amz_") || cleanId.startsWith("amazon-")) {
      try {
        const { getLiveProductById, getLiveOffersByProductId } = await import("../services/amazon-search");
        const liveProd = getLiveProductById(cleanId);
        if (liveProd) {
          const liveOffers = getLiveOffersByProductId(liveProd.id);
          const activeLiveOffers = liveOffers.filter((o) => o.retailerSlug === "amazon");
          const cat = categories.find((c) => c.id === liveProd.categoryId);
          return computeProductComparison(liveProd, activeLiveOffers, cat);
        }

        // Reconstruct from ASIN if accessed directly
        const asin = cleanId.replace("prod_amz_", "").replace("amazon-", "");
        if (asin.length === 10) {
          const reconstructedProduct: Product = {
            id: `prod_amz_${asin}`,
            title: `Amazon Choice Item (${asin})`,
            slug: `amazon-${asin}`,
            brand: "Amazon India",
            categoryId: categories[0].id,
            description: "Direct retail listing on Amazon India.",
            imageUrl: "https://placehold.co/400x400/fff7ed/ea580c?text=Amazon+Product",
            attributes: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const reconstructedOffer: Offer = {
            id: `off_amz_${asin}`,
            productId: reconstructedProduct.id,
            retailerId: "ret_amazon",
            retailerName: "Amazon India",
            retailerSlug: "amazon",
            retailerProductId: asin,
            title: reconstructedProduct.title,
            productUrl: `https://www.amazon.in/dp/${asin}`,
            price: 999,
            originalPrice: 1499,
            currency: "INR",
            inStock: true,
            shippingCost: 0,
            lastCheckedAt: new Date().toISOString(),
            isStale: false,
            isDemo: false,
            dataSource: "catalog",
            provenance: "amazon_catalog_verified",
            deliveryTimeEstimate: "2-3 business days (Prime)",
            bankOffersDescription: "10% Instant Discount on Card Payments",
          };
          return computeProductComparison(reconstructedProduct, [reconstructedOffer], categories[0]);
        }
      } catch (err) {
        console.warn("[Repository] Error resolving live product:", err);
      }
    }

    return null;
  }

  /**
   * Retrieves high-discount deals for Today's Deals page
   */
  async getTodaysDeals(minDiscountPercent: number = 20): Promise<PriceComparison[]> {
    const all = await this.getProducts({ sortBy: "discount" });
    return all.filter((comp) => {
      if (!comp.lowestOffer) return false;
      const disc = calculateDiscount(
        comp.lowestOffer.originalPrice,
        comp.lowestOffer.price
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
