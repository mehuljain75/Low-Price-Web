import { describe, it, expect } from "vitest";
import { synthesizeEndlessProducts } from "../lib/data/endless-catalog";
import { repository } from "../lib/data/repository";

describe("Endless Catalog & Infinite Pagination Engine", () => {
  it("synthesizes valid multi-store comparisons for a category", () => {
    const products = synthesizeEndlessProducts("mobiles", 1, 10);
    expect(products.length).toBe(10);

    for (const comp of products) {
      expect(comp.product.id).toMatch(/^prod_amz_/);
      expect(comp.product.title.length).toBeGreaterThan(5);
      expect(comp.lowestOffer).toBeDefined();
      expect(comp.offers.length).toBeGreaterThanOrEqual(1); // Verified Amazon listing
      expect(comp.lowestOffer?.retailerSlug).toBe("amazon");
    }
  });

  it("advances pagination across subsequent pages with distinct items", () => {
    const page1 = synthesizeEndlessProducts("laptops", 1, 10);
    const page2 = synthesizeEndlessProducts("laptops", 2, 10);

    expect(page1.length).toBe(10);
    expect(page2.length).toBe(10);

    const ids1 = new Set(page1.map((p) => p.product.id));
    const overlap = page2.filter((p) => ids1.has(p.product.id));
    expect(overlap.length).toBe(0); // Page 2 items must have unique IDs
  });

  it("repository.getProducts returns rich high-volume products (> 20) instead of scarce 12", async () => {
    const products = await repository.getProducts();
    expect(products.length).toBeGreaterThanOrEqual(24);
  });

  it("repository.getProducts slices by page and limit cleanly with zero duplicates", async () => {
    const page1 = await repository.getProducts({ page: 1, limit: 12 });
    const page2 = await repository.getProducts({ page: 2, limit: 12 });
    const page3 = await repository.getProducts({ page: 3, limit: 12 });

    expect(page1.length).toBe(12);
    expect(page2.length).toBe(12);
    expect(page3.length).toBe(12);

    const ids1 = new Set(page1.map((p) => p.product.id));
    const ids2 = new Set(page2.map((p) => p.product.id));

    // Zero overlap between any consecutive pages
    const overlap12 = page2.filter((p) => ids1.has(p.product.id));
    const overlap23 = page3.filter((p) => ids2.has(p.product.id));
    const overlap13 = page3.filter((p) => ids1.has(p.product.id));

    expect(overlap12.length).toBe(0);
    expect(overlap23.length).toBe(0);
    expect(overlap13.length).toBe(0);
  });

  it("checks products count for each category in unpaginated mode", async () => {
    for (const slug of ["mobiles", "laptops", "audio", "fashion", "appliances", "beauty"]) {
      const prods = await repository.getProducts({ categorySlug: slug });
      console.log(`CATEGORY ${slug}: count = ${prods.length}`);
      expect(prods.length).toBeGreaterThanOrEqual(24);
    }
  });

  it("supports endless pagination across 4 consecutive pages for ANY category", async () => {
    const category = "audio";
    const pages = await Promise.all([
      repository.getProducts({ categorySlug: category, page: 1, limit: 24 }),
      repository.getProducts({ categorySlug: category, page: 2, limit: 24 }),
      repository.getProducts({ categorySlug: category, page: 3, limit: 24 }),
      repository.getProducts({ categorySlug: category, page: 4, limit: 24 }),
    ]);

    const seenIds = new Set<string>();
    for (let pIdx = 0; pIdx < pages.length; pIdx++) {
      const pageProducts = pages[pIdx];
      expect(pageProducts.length).toBe(24);

      for (const comp of pageProducts) {
        expect(seenIds.has(comp.product.id)).toBe(false);
        seenIds.add(comp.product.id);
        expect(comp.product.categoryId).toBe("cat_audio");
      }
    }
    expect(seenIds.size).toBe(96); // 24 * 4 = 96 unique products!
  });

  it("supports endless pagination across multiple pages for ANY brand", async () => {
    for (const brand of ["Samsung", "Apple", "Sony", "Nike", "Dell"]) {
      const p1 = await repository.getProducts({ brand, page: 1, limit: 12 });
      const p2 = await repository.getProducts({ brand, page: 2, limit: 12 });

      expect(p1.length).toBe(12);
      expect(p2.length).toBe(12);

      const ids1 = new Set(p1.map((p) => p.product.id));
      const overlap = p2.filter((p) => ids1.has(p.product.id));
      expect(overlap.length).toBe(0);
    }
  });

  it("supports endless pagination for search queries", async () => {
    for (const searchQuery of ["iphone", "shoes", "laptop", "air fryer"]) {
      const p1 = await repository.getProducts({ searchQuery, page: 1, limit: 12 });
      const p2 = await repository.getProducts({ searchQuery, page: 2, limit: 12 });

      expect(p1.length).toBe(12);
      expect(p2.length).toBe(12);

      const ids1 = new Set(p1.map((p) => p.product.id));
      const overlap = p2.filter((p) => ids1.has(p.product.id));
      expect(overlap.length).toBe(0);
    }
  });

  it("strictly enforces zero duplicate titles, IDs, or ASINs for 'heels' search", async () => {
    const p1 = await repository.getProducts({ searchQuery: "heels", page: 1, limit: 24 });
    expect(p1.length).toBe(24);

    const titles = new Set<string>();
    const ids = new Set<string>();
    const asins = new Set<string>();

    for (const comp of p1) {
      const titleLower = comp.product.title.toLowerCase().trim();
      expect(titles.has(titleLower)).toBe(false);
      titles.add(titleLower);

      expect(ids.has(comp.product.id)).toBe(false);
      ids.add(comp.product.id);

      const amzOffer = comp.offers.find((o) => o.retailerSlug === "amazon");
      expect(amzOffer).toBeDefined();
      expect(amzOffer!.productUrl).toContain("amazon.in");
      expect(amzOffer!.inStock).toBe(true);

      const asin = amzOffer?.retailerProductId || comp.product.attributes?.asin;
      expect(asin).toBeDefined();
      expect(asins.has(asin!)).toBe(false);
      asins.add(asin!);

      expect(titleLower).not.toContain("batch");
    }
    expect(asins.size).toBe(24);
  });
});
