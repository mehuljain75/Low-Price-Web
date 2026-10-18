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
    if (filters.brand) {
      const lowerBrand = filters.brand.toLowerCase();
      products = products.filter((p) => p.brand.toLowerCase() === lowerBrand);
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
    if (!product) return null;

    const cat = categories.find((c) => c.id === product.categoryId);
    return computeProductComparison(product, demoOffers, cat);
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
