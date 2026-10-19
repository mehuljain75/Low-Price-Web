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
  searchQuery?: string;
  retailerSlug?: RetailerSlug | string;
  sortBy?: "price_asc" | "price_desc" | "discount" | "newest";
  inStockOnly?: boolean;
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
    let offers = [...demoOffers];

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

    // Calculate comparisons for candidate products
    let comparisons = products.map((prod) => {
      const cat = categories.find((c) => c.id === prod.categoryId);
      return computeProductComparison(prod, offers, cat);
    });

    // If a search query, specific brand, or category browsing is active and local matches are scarce (< 12),
    // query live Amazon India search engine to hydrate rich, real-time products
    let searchIntent = (filters.searchQuery || filters.brand || "").trim();
    if (!searchIntent && filters.categorySlug && filters.categorySlug !== "all") {
      const cat = categories.find((c) => c.slug === filters.categorySlug);
      if (cat) {
        searchIntent = cat.name;
      }
    }
    if (!searchIntent && comparisons.length < 12) {
      searchIntent = "best deals electronics appliances fashion";
    }

    if (searchIntent.length > 0 && comparisons.length < 12) {
      try {
        const { searchLiveAmazonIndia } = await import("../services/amazon-search");
        const liveResults = await searchLiveAmazonIndia(searchIntent);
        const liveComparisons = liveResults.map((r) => r.comparison);

        // Append live comparisons, avoiding duplicates
        const existingIds = new Set(comparisons.map((c) => c.product.id));
        for (const liveComp of liveComparisons) {
          if (existingIds.has(liveComp.product.id)) continue;

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
          existingIds.add(liveComp.product.id);
        }
      } catch (err) {
        console.warn("[Repository] Error fetching live Amazon products:", err);
      }
    }

    // Retailer filter
    if (filters.retailerSlug && filters.retailerSlug !== "all") {
      comparisons = comparisons.filter((comp) =>
        comp.offers.some((o) => o.retailerSlug === filters.retailerSlug)
      );
    }

    // In-stock only filter
    if (filters.inStockOnly) {
      comparisons = comparisons.filter(
        (comp) => comp.lowestOffer && comp.lowestOffer.inStock
      );
    }

    // Price range filter (on lowest tracked price)
    if (filters.minPrice !== undefined) {
      comparisons = comparisons.filter(
        (comp) => comp.lowestOffer && comp.lowestOffer.price >= filters.minPrice!
      );
    }
    if (filters.maxPrice !== undefined) {
      comparisons = comparisons.filter(
        (comp) => comp.lowestOffer && comp.lowestOffer.price <= filters.maxPrice!
      );
    }

    // Sorting
    const sort = filters.sortBy || "discount";
    comparisons.sort((a, b) => {
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
      if (sort === "newest") {
        return (
          new Date(b.product.createdAt).getTime() -
          new Date(a.product.createdAt).getTime()
        );
      }
      return 0;
    });

    return comparisons;
  }

  /**
   * Retrieves single product by ID or Slug with complete price comparison matrix
   */
  async getProductByIdOrSlug(idOrSlug: string): Promise<PriceComparison | null> {
    const product = demoProducts.find(
      (p) => p.id === idOrSlug || p.slug === idOrSlug
    );
    if (product) {
      const cat = categories.find((c) => c.id === product.categoryId);
      return computeProductComparison(product, demoOffers, cat);
    }

    // Check live Amazon products
    if (idOrSlug.startsWith("prod_amz_") || idOrSlug.startsWith("amazon-")) {
      try {
        const { getLiveProductById, getLiveOfferById } = await import("../services/amazon-search");
        const liveProd = getLiveProductById(idOrSlug);
        if (liveProd) {
          const asin = liveProd.id.replace("prod_amz_", "");
          const liveOffer = getLiveOfferById(`off_amz_${asin}`);
          const cat = categories.find((c) => c.id === liveProd.categoryId);
          return computeProductComparison(liveProd, liveOffer ? [liveOffer] : [], cat);
        }

        // Reconstruct from ASIN if accessed directly
        const asin = idOrSlug.replace("prod_amz_", "").replace("amazon-", "");
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
            dataSource: "api",
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
