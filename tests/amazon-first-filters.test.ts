import { describe, it, expect } from "vitest";
import { repository } from "../lib/data/repository";
import { providerRegistry } from "../lib/providers/retailer-provider";
import { synthesizeEndlessProducts } from "../lib/data/endless-catalog";

describe("Amazon-First Filtering & Query Engine", () => {
  describe("Price Range Numerical Comparison", () => {
    it("strictly filters products above minPrice", async () => {
      const minPrice = 15000;
      const results = await repository.getProducts({ minPrice, limit: 16 });
      expect(results.length).toBeGreaterThan(0);

      for (const comp of results) {
        expect(comp.lowestOffer).toBeDefined();
        expect(comp.lowestOffer!.price).toBeGreaterThanOrEqual(minPrice);
      }
    });

    it("strictly filters products below maxPrice", async () => {
      const maxPrice = 5000;
      const results = await repository.getProducts({ maxPrice, limit: 16 });
      expect(results.length).toBeGreaterThan(0);

      for (const comp of results) {
        expect(comp.lowestOffer).toBeDefined();
        expect(comp.lowestOffer!.price).toBeLessThanOrEqual(maxPrice);
      }
    });

    it("strictly confines products within [minPrice, maxPrice] range", async () => {
      const minPrice = 2000;
      const maxPrice = 8000;
      const results = await repository.getProducts({ minPrice, maxPrice, limit: 20 });
      expect(results.length).toBeGreaterThan(0);

      for (const comp of results) {
        expect(comp.lowestOffer).toBeDefined();
        expect(comp.lowestOffer!.price).toBeGreaterThanOrEqual(minPrice);
        expect(comp.lowestOffer!.price).toBeLessThanOrEqual(maxPrice);
      }
    });

    it("synthesizeEndlessProducts honors minPrice and maxPrice bounds across batches", () => {
      const minPrice = 30000;
      const maxPrice = 70000;
      const batch1 = synthesizeEndlessProducts({ categorySlug: "laptops", page: 1, count: 10, minPrice, maxPrice });
      const batch2 = synthesizeEndlessProducts({ categorySlug: "laptops", page: 2, count: 10, minPrice, maxPrice });

      expect(batch1.length).toBe(10);
      expect(batch2.length).toBe(10);

      for (const comp of [...batch1, ...batch2]) {
        expect(comp.lowestOffer!.price).toBeGreaterThanOrEqual(minPrice);
        expect(comp.lowestOffer!.price).toBeLessThanOrEqual(maxPrice);
      }
    });
  });

  describe("Brand Selection & Category Isolation", () => {
    it("filters products strictly by selected brand", async () => {
      const results = await repository.getProducts({ brand: "Apple", limit: 12 });
      expect(results.length).toBeGreaterThan(0);

      for (const comp of results) {
        expect(comp.product.brand.toLowerCase()).toContain("apple");
      }
    });

    it("isolates brands to their valid categories without cross-category leakage", async () => {
      const fashionBrands = await repository.getBrands("fashion");
      expect(fashionBrands).toContain("Puma");
      expect(fashionBrands).toContain("Nike");
      expect(fashionBrands).not.toContain("Apple");
      expect(fashionBrands).not.toContain("Samsung");

      const mobileBrands = await repository.getBrands("mobiles");
      expect(mobileBrands).toContain("Apple");
      expect(mobileBrands).toContain("Samsung");
      expect(mobileBrands).not.toContain("Zara");
    });
  });

  describe("Customer Rating Filter", () => {
    it("filters products with rating >= minRating", async () => {
      const minRating = 4.3;
      const results = await repository.getProducts({ minRating, limit: 16 });
      expect(results.length).toBeGreaterThan(0);

      for (const comp of results) {
        expect(comp.product.rating).toBeDefined();
        expect(comp.product.rating!).toBeGreaterThanOrEqual(minRating);
      }
    });
  });

  describe("Sorting Order Correctness", () => {
    it("orders by price ascending (cheapest first)", async () => {
      const results = await repository.getProducts({ sortBy: "price_asc", limit: 20 });
      expect(results.length).toBeGreaterThan(1);

      for (let i = 0; i < results.length - 1; i++) {
        const current = results[i].lowestOffer?.price ?? 0;
        const next = results[i + 1].lowestOffer?.price ?? 0;
        expect(current).toBeLessThanOrEqual(next);
      }
    });

    it("orders by price descending (highest first)", async () => {
      const results = await repository.getProducts({ sortBy: "price_desc", limit: 20 });
      expect(results.length).toBeGreaterThan(1);

      for (let i = 0; i < results.length - 1; i++) {
        const current = results[i].lowestOffer?.price ?? 0;
        const next = results[i + 1].lowestOffer?.price ?? 0;
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it("orders by customer rating descending", async () => {
      const results = await repository.getProducts({ sortBy: "rating", limit: 20 });
      expect(results.length).toBeGreaterThan(1);

      for (let i = 0; i < results.length - 1; i++) {
        const current = results[i].product.rating ?? 0;
        const next = results[i + 1].product.rating ?? 0;
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });
  });

  describe("Pagination with Filters Applied", () => {
    it("preserves price filters across multiple pages with zero ID overlap", async () => {
      const minPrice = 10000;
      const maxPrice = 50000;
      const page1 = await repository.getProducts({ minPrice, maxPrice, page: 1, limit: 12 });
      const page2 = await repository.getProducts({ minPrice, maxPrice, page: 2, limit: 12 });

      expect(page1.length).toBe(12);
      expect(page2.length).toBe(12);

      const p1Ids = new Set(page1.map((p) => p.product.id));
      const duplicates = page2.filter((p) => p1Ids.has(p.product.id));
      expect(duplicates.length).toBe(0);

      for (const comp of [...page1, ...page2]) {
        expect(comp.lowestOffer!.price).toBeGreaterThanOrEqual(minPrice);
        expect(comp.lowestOffer!.price).toBeLessThanOrEqual(maxPrice);
      }
    });
  });

  describe("Retailer Provider Architecture & Amazon-First Isolation", () => {
    it("marks Amazon as the only active customer-facing provider", () => {
      const activeProviders = providerRegistry.getActiveProviders();
      expect(activeProviders.length).toBe(1);
      expect(activeProviders[0].slug).toBe("amazon");
      expect(activeProviders[0].isCustomerFacingActive).toBe(true);
    });

    it("marks non-Amazon providers as inactive pending Cuelinks approval", () => {
      const allProviders = providerRegistry.getAllProviders();
      const inactive = allProviders.filter((p) => !p.isCustomerFacingActive);

      expect(inactive.map((p) => p.slug)).toEqual(
        expect.arrayContaining(["flipkart", "myntra", "ajio", "meesho"])
      );

      for (const provider of inactive) {
        expect(provider.status).toBe("pending_approval");
      }
    });

    it("builds valid Amazon affiliate tracking URL with tag dealfinderin-21", () => {
      const amazonProvider = providerRegistry.getProvider("amazon");
      expect(amazonProvider).toBeDefined();

      const url = amazonProvider!.buildAffiliateUrl("https://www.amazon.in/dp/B0DFMGNY45", "df_test");
      expect(url).toContain("tag=dealfinderin-21");
      expect(url).toContain("ascsubtag=df_test");
    });

    it("builds outbound Cuelinks redirect URL for inactive providers", () => {
      const flipkart = providerRegistry.getProvider("flipkart");
      expect(flipkart).toBeDefined();

      const url = flipkart!.buildAffiliateUrl("https://www.flipkart.com/search?q=shoes", "sub_123");
      expect(url).toContain("linksredirect.com");
      expect(url).toContain("cid=281629");
      expect(url).toContain(encodeURIComponent("sub_123"));
    });
  });
});
