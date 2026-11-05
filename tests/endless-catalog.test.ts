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

  // Collects every page until the catalog runs out (an empty page), like infinite scroll does
  const collectAllPages = async (filters: Record<string, unknown>, limit: number) => {
    const pages: number[] = [];
    const ids: string[] = [];
    for (let page = 1; page <= 20; page++) {
      const items = await repository.getProducts({ ...filters, page, limit });
      if (items.length === 0) break;
      pages.push(items.length);
      ids.push(...items.map((c) => c.product.id));
    }
    return { pages, ids };
  };

  it("lists a healthy first page for every category", async () => {
    for (const slug of ["mobiles", "laptops", "audio", "fashion", "appliances", "beauty"]) {
      const prods = await repository.getProducts({ categorySlug: slug, page: 1, limit: 24 });
      expect(prods.length, slug).toBeGreaterThanOrEqual(12);
    }
  });

  it("paginates a category to the end without repeating products", async () => {
    const { pages, ids } = await collectAllPages({ categorySlug: "fashion" }, 24);
    expect(pages.length).toBeGreaterThan(1);
    // Every page except the last is full, so infinite scroll keeps loading until the real end
    for (const size of pages.slice(0, -1)) expect(size).toBe(24);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("paginates brand listings without repeating products", async () => {
    for (const brand of ["Samsung", "Apple", "Sony", "Nike", "Dell"]) {
      const { ids } = await collectAllPages({ brand }, 12);
      expect(ids.length, brand).toBeGreaterThan(0);
      expect(new Set(ids).size, brand).toBe(ids.length);
    }
  });

  it("paginates search queries without repeating products", async () => {
    for (const searchQuery of ["iphone", "shoes", "laptop", "air fryer"]) {
      const { pages, ids } = await collectAllPages({ searchQuery }, 12);
      expect(pages[0], searchQuery).toBeGreaterThan(0);
      expect(new Set(ids).size, searchQuery).toBe(ids.length);
    }
  });

  it("never lists invented variants with made-up ASINs", async () => {
    const { ids } = await collectAllPages({ categorySlug: "laptops" }, 24);
    for (const id of ids) {
      expect(id).not.toMatch(/_c\d+$/);
      expect(id).not.toMatch(/^prod_amz_B0(FAS|MOB|LAP|AUD|APP|BEA)/);
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
