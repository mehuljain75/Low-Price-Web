import { describe, it, expect } from "vitest";
import { repository } from "@/lib/data/repository";
import { searchAmazonProducts } from "@/lib/services/amazon-search";
import { GET as redirectHandler } from "@/app/api/redirect/route";
import { GET as productsApiHandler } from "@/app/api/products/route";
import { NextRequest } from "next/server";

describe("DealFinder India - Search Page QA and UX Verification", () => {
  describe("Priority 1: Data Integrity & Real Amazon Media CDN", () => {
    it("traces 'shoes' query to authentic Amazon India footwear with m.media-amazon.com images", async () => {
      const results = await repository.getProducts({
        searchQuery: "shoes",
        page: 1,
        limit: 24,
      });

      expect(results.length).toBeGreaterThan(0);

      // Verify every footwear item has a genuine Amazon media CDN URL
      for (const item of results) {
        expect(item.product.imageUrl).toMatch(/^https:\/\/m\.media-amazon\.com\/images\/I\//);
        expect(item.product.imageUrl).not.toContain("unsplash.com");
        expect(item.product.imageUrl).not.toContain("placehold.co");

        // Verify lowest offer is authentic Amazon India offer
        expect(item.lowestOffer).not.toBeNull();
        expect(item.lowestOffer?.retailerSlug).toBe("amazon");
        expect(item.lowestOffer?.isDemo).toBe(false);

        // Verify discount calculation is mathematically sound
        if (item.lowestOffer && item.lowestOffer.originalPrice > item.lowestOffer.price) {
          expect(item.lowestOffer.originalPrice).toBeGreaterThan(0);
          expect(item.lowestOffer.price).toBeGreaterThan(0);
          expect(item.savingsAmount).toBe(item.lowestOffer.originalPrice - item.lowestOffer.price);
          expect(item.savingsPercentage).toBe(
            Math.round(((item.lowestOffer.originalPrice - item.lowestOffer.price) / item.lowestOffer.originalPrice) * 100)
          );
        }
      }
    });

    it("ensures all footwear ASINs are authentic 10-character Amazon codes, avoiding 404s", async () => {
      const results = await repository.getProducts({
        searchQuery: "shoes",
        limit: 24,
      });

      for (const item of results) {
        const asin = item.lowestOffer?.retailerProductId || "";
        expect(asin).toMatch(/^B0[A-Z0-9]{8}$/);
        expect(asin.length).toBe(10);
        expect(asin).not.toMatch(/^B0FAS/); // No synthetic 13-character ASINs
      }
    });

    it("verifies outbound Amazon redirect route safeguards against dead links", async () => {
      // 1. Valid ASIN URL
      const validReq = new NextRequest(
        "http://localhost:3000/api/redirect?offerId=off_amz_B09W9F5G1N&url=" +
          encodeURIComponent("https://www.amazon.in/dp/B09W9F5G1N?tag=dealfinderin-21")
      );
      const validRes = await redirectHandler(validReq);
      expect(validRes.status).toBe(307);
      const validLocation = validRes.headers.get("location") || "";
      expect(validLocation).toContain("amazon.in/dp/B09W9F5G1N");
      expect(validLocation).toContain("tag=dealfinderin-21");

      // 2. Synthetic or unknown ASIN safely falls back to Amazon India search with product title
      const fallbackReq = new NextRequest(
        "http://localhost:3000/api/redirect?offerId=off_amz_B0FAS12345678&title=" +
          encodeURIComponent("Puma Running Shoes") +
          "&url=" +
          encodeURIComponent("https://www.amazon.in/dp/B0FAS12345678")
      );
      const fallbackRes = await redirectHandler(fallbackReq);
      expect(fallbackRes.status).toBe(307);
      const fallbackLocation = fallbackRes.headers.get("location") || "";
      expect(fallbackLocation).toContain("amazon.in/s?k=Puma+Running+Shoes");
      expect(fallbackLocation).toContain("tag=dealfinderin-21");
      expect(fallbackLocation).not.toContain("dp/B0FAS");
    });

    it("ensures zero inactive retailer demo offers leak into search results", async () => {
      const results = await repository.getProducts({
        searchQuery: "running shoes",
        limit: 24,
      });

      for (const item of results) {
        const retailers = item.offers.map((o) => o.retailerSlug);
        expect(retailers).toEqual(["amazon"]);
        expect(item.offers.some((o) => o.isDemo)).toBe(false);
      }
    });

    it("returns zero results for nonexistent gibberish query without leaking unrelated products", async () => {
      const results = await repository.getProducts({
        searchQuery: "xyznonexistentquery999",
        limit: 24,
      });

      expect(results).toHaveLength(0);
    });
  });

  describe("Priority 2: Context-Aware Footwear Filters", () => {
    it("hydrates footwear attributes (shoeType, gender, availableSizes) on 'shoes' results", async () => {
      const results = await repository.getProducts({
        searchQuery: "shoes",
        limit: 24,
      });

      const itemsWithFootwearAttrs = results.filter(
        (r) => r.product.attributes.shoeType || r.product.attributes.gender || r.product.attributes.availableSizes
      );
      expect(itemsWithFootwearAttrs.length).toBeGreaterThan(0);

      for (const item of itemsWithFootwearAttrs) {
        if (item.product.attributes.shoeType) {
          expect([
            "Sneakers",
            "Running Shoes",
            "Casual Shoes",
            "Formal Shoes",
            "Walking Shoes",
            "Boots",
          ]).toContain(item.product.attributes.shoeType);
        }
        if (item.product.attributes.gender) {
          expect(["Men", "Women", "Unisex"]).toContain(item.product.attributes.gender);
        }
        if (item.product.attributes.availableSizes) {
          expect(typeof item.product.attributes.availableSizes).toBe("string");
          expect(item.product.attributes.availableSizes).toMatch(/UK\s\d+/);
        }
      }
    });

    it("filters accurately by shoeType (e.g. 'Running Shoes')", async () => {
      const results = await repository.getProducts({
        searchQuery: "shoes",
        shoeType: "Running Shoes",
        limit: 24,
      });

      expect(results.length).toBeGreaterThan(0);
      for (const item of results) {
        const combined = `${item.product.title} ${item.product.attributes.shoeType || ""}`.toLowerCase();
        expect(combined).toMatch(/running/);
      }
    });

    it("filters accurately by gender (e.g. 'Men')", async () => {
      const results = await repository.getProducts({
        searchQuery: "shoes",
        gender: "Men",
        limit: 24,
      });

      expect(results.length).toBeGreaterThan(0);
      for (const item of results) {
        const g = item.product.attributes.gender?.toLowerCase();
        const t = item.product.title.toLowerCase();
        expect(g === "men" || g === "unisex" || t.includes("men")).toBe(true);
      }
    });

    it("filters accurately by size (e.g. 'UK 8')", async () => {
      const results = await repository.getProducts({
        searchQuery: "shoes",
        size: "UK 8",
        limit: 24,
      });

      expect(results.length).toBeGreaterThan(0);
      for (const item of results) {
        const sz = (item.product.attributes.availableSizes || "").toLowerCase();
        expect(sz).toContain("uk 8");
      }
    });

    it("filters accurately by brand (e.g. 'Nike')", async () => {
      const results = await repository.getProducts({
        searchQuery: "shoes",
        brand: "Nike",
        limit: 24,
      });

      expect(results.length).toBeGreaterThan(0);
      for (const item of results) {
        expect(item.product.brand.toLowerCase()).toBe("nike");
      }
    });

    it("filters accurately by price range brackets", async () => {
      const minPrice = 1000;
      const maxPrice = 3000;

      const results = await repository.getProducts({
        searchQuery: "shoes",
        minPrice,
        maxPrice,
        limit: 24,
      });

      expect(results.length).toBeGreaterThan(0);
      for (const item of results) {
        expect(item.lowestOffer?.price).toBeGreaterThanOrEqual(minPrice);
        expect(item.lowestOffer?.price).toBeLessThanOrEqual(maxPrice);
      }
    });

    it("sorts correctly by price_asc and price_desc", async () => {
      const ascResults = await repository.getProducts({
        searchQuery: "shoes",
        sortBy: "price_asc",
        limit: 24,
      });

      for (let i = 1; i < ascResults.length; i++) {
        const prev = ascResults[i - 1].lowestOffer?.price || 0;
        const curr = ascResults[i].lowestOffer?.price || 0;
        expect(curr).toBeGreaterThanOrEqual(prev);
      }

      const descResults = await repository.getProducts({
        searchQuery: "shoes",
        sortBy: "price_desc",
        limit: 24,
      });

      for (let i = 1; i < descResults.length; i++) {
        const prev = descResults[i - 1].lowestOffer?.price || 0;
        const curr = descResults[i].lowestOffer?.price || 0;
        expect(curr).toBeLessThanOrEqual(prev);
      }
    });

    it("dynamically adapts when switching query from 'shoes' to 'iPhone' or 'laptop'", async () => {
      const techResults = await repository.getProducts({
        searchQuery: "iPhone",
        limit: 24,
      });

      expect(techResults.length).toBeGreaterThan(0);
      for (const item of techResults) {
        expect(item.product.brand.toLowerCase()).toBe("apple");
        expect(item.product.title.toLowerCase()).toContain("iphone");
        expect(item.product.attributes.shoeType).toBeUndefined();
      }

      const laptopResults = await repository.getProducts({
        searchQuery: "laptop",
        limit: 24,
      });

      expect(laptopResults.length).toBeGreaterThan(0);
      for (const item of laptopResults) {
        expect(item.product.categoryId).toBe("cat_laptops");
        expect(item.product.attributes.shoeType).toBeUndefined();
      }
    });
  });

  describe("Priority 3: API Route & Pagination Contract", () => {
    it("handles both 'q' and 'search' URL parameters in /api/products", async () => {
      // 1. Using ?q=shoes
      const reqQ = new NextRequest("http://localhost:3000/api/products?q=shoes&limit=10");
      const resQ = await productsApiHandler(reqQ);
      const dataQ = await resQ.json();

      expect(resQ.status).toBe(200);
      expect(dataQ.products.length).toBeGreaterThan(0);
      expect(dataQ.totalCount).toBeLessThan(10000); // No hardcoded 10,000

      // 2. Using ?search=shoes
      const reqSearch = new NextRequest("http://localhost:3000/api/products?search=shoes&limit=10");
      const resSearch = await productsApiHandler(reqSearch);
      const dataSearch = await resSearch.json();

      expect(resSearch.status).toBe(200);
      expect(dataSearch.products.length).toBe(dataQ.products.length);
    });

    it("passes shoeType, gender, size to /api/products accurately", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/products?q=shoes&shoeType=Sneakers&gender=Men&limit=10"
      );
      const res = await productsApiHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.products.length).toBeGreaterThan(0);
      for (const item of data.products) {
        const st = (item.product.attributes?.shoeType || "").toLowerCase();
        const g = (item.product.attributes?.gender || "").toLowerCase();
        expect(st === "sneakers" || item.product.title.toLowerCase().includes("sneaker")).toBe(true);
        expect(g === "men" || g === "unisex" || item.product.title.toLowerCase().includes("men")).toBe(true);
      }
    });
  });

  describe("Priority 4: Product Result Quality & No Duplicates", () => {
    it("ensures product IDs are unique across search results", async () => {
      const results = await repository.getProducts({
        searchQuery: "shoes",
        limit: 24,
      });

      const ids = results.map((r) => r.product.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("Priority 5: Category Dropdown Refinement & State Reset Contract", () => {
    it("refines /search?q=shoes when selecting category 'fashion'", async () => {
      const results = await repository.getProducts({
        searchQuery: "shoes",
        categorySlug: "fashion",
        limit: 24,
      });

      expect(results.length).toBeGreaterThan(0);
      for (const item of results) {
        expect(item.category?.slug).toBe("fashion");
        expect(item.product.imageUrl).toMatch(/^https:\/\/m\.media-amazon\.com\/images\/I\//);
      }
    });

    it("refines /search?q=shoes when selecting shoeType 'Running Shoes'", async () => {
      const results = await repository.getProducts({
        searchQuery: "shoes",
        categorySlug: "fashion",
        shoeType: "Running Shoes",
        limit: 24,
      });

      expect(results.length).toBeGreaterThan(0);
      for (const item of results) {
        const combined = `${item.product.title} ${item.product.attributes.shoeType || ""}`.toLowerCase();
        expect(combined).toMatch(/running/);
      }
    });

    it("switches search context when moving from /search?q=shoes to category 'laptops'", async () => {
      // Switching department from shoes to laptops fetches laptop products with zero footwear attributes
      const results = await repository.getProducts({
        searchQuery: "laptop",
        categorySlug: "laptops",
        limit: 24,
      });

      expect(results.length).toBeGreaterThan(0);
      for (const item of results) {
        expect(item.category?.slug).toBe("laptops");
        expect(item.product.attributes.shoeType).toBeUndefined();
      }
    });

    it("refines /search?q=iphone when selecting category 'mobiles'", async () => {
      const results = await repository.getProducts({
        searchQuery: "iphone",
        categorySlug: "mobiles",
        limit: 24,
      });

      expect(results.length).toBeGreaterThan(0);
      for (const item of results) {
        expect(item.category?.slug).toBe("mobiles");
        expect(item.product.brand.toLowerCase()).toBe("apple");
      }
    });

    it("refines /search?q=laptop when selecting category 'laptops'", async () => {
      const results = await repository.getProducts({
        searchQuery: "laptop",
        categorySlug: "laptops",
        limit: 24,
      });

      expect(results.length).toBeGreaterThan(0);
      for (const item of results) {
        expect(item.category?.slug).toBe("laptops");
      }
    });

    it("resets pagination and does not append stale items when switching category in /api/products", async () => {
      // 1. Initial request for shoes (page 1)
      const resShoes = await productsApiHandler(
        new NextRequest("http://localhost:3000/api/products?q=shoes&category=fashion&page=1&limit=6")
      );
      const dataShoes = await resShoes.json();
      expect(dataShoes.products.length).toBe(6);
      expect(dataShoes.page).toBe(1);

      // 2. User selects new category 'laptops': resets to page 1
      const resLaptops = await productsApiHandler(
        new NextRequest("http://localhost:3000/api/products?q=laptop&category=laptops&page=1&limit=6")
      );
      const dataLaptops = await resLaptops.json();
      expect(dataLaptops.products.length).toBe(6);
      expect(dataLaptops.page).toBe(1);

      // Verify no cross-contamination between previous query results and new query results
      const shoeIds = new Set(dataShoes.products.map((p: any) => p.product.id));
      for (const laptop of dataLaptops.products) {
        expect(shoeIds.has(laptop.product.id)).toBe(false);
      }
    });
  });
});
