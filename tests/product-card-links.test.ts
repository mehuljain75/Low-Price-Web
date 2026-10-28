import { describe, it, expect, beforeEach } from "vitest";
import { repository, hasActivePresentDeal } from "../lib/data/repository";
import { productCache, offerCache } from "../lib/services/amazon-search";
import { findTemplateProductByIdOrSlug, synthesizeEndlessProducts, BASE_TEMPLATES } from "../lib/data/endless-catalog";
import { isGenuineAmazonAsin, buildSafeAmazonUrl } from "../lib/redirect-security";
import { GET as redirectHandler } from "../app/api/redirect/route";
import { NextRequest } from "next/server";

describe("Critical Fix: Product Card Links, Identity & Resolution Integrity", () => {
  it("resolves at least 5 distinct authentic shoe products on /search?q=shoes", async () => {
    const comparisons = await repository.getProducts({ searchQuery: "shoes", limit: 24 });
    expect(comparisons.length).toBeGreaterThanOrEqual(5);

    const distinctIds = new Set<string>();
    const shoeKeywords = ["shoe", "sneaker", "running", "casual", "clog", "boot", "footwear"];

    for (const comp of comparisons.slice(0, 5)) {
      const { product, lowestOffer } = comp;

      // Stable product ID format
      expect(product.id).toMatch(/^prod_amz_/);
      expect(distinctIds.has(product.id)).toBe(false);
      distinctIds.add(product.id);

      // No array indices in product ID
      expect(product.id).not.toMatch(/_\d+$/);

      // Authentic title - NEVER a dummy placeholder
      expect(product.title).not.toContain("Amazon Choice Item");
      expect(product.title.length).toBeGreaterThan(10);
      const titleLower = product.title.toLowerCase();
      const hasShoeRelevance = shoeKeywords.some((kw) => titleLower.includes(kw));
      expect(hasShoeRelevance).toBe(true);

      // Authentic non-placeholder image
      expect(product.imageUrl).not.toContain("placehold.co");
      expect(product.imageUrl).toMatch(/^https?:\/\//);

      // Authentic pricing
      expect(lowestOffer).toBeDefined();
      expect(lowestOffer!.price).toBeGreaterThan(0);
      expect(lowestOffer!.price).not.toBe(999); // Must not be the 999 dummy fallback price
      expect(lowestOffer!.originalPrice).toBeGreaterThanOrEqual(lowestOffer!.price);

      // Amazon outbound link
      expect(lowestOffer!.retailerSlug).toBe("amazon");
      expect(lowestOffer!.productUrl).toContain("amazon.in");
    }
  });

  it("reliably resolves 5+ distinct shoe products on cold isolate without pre-warmed cache", async () => {
    // 5 distinct shoe ASINs curated in the platform
    const targetShoes = [
      { id: "prod_amz_B09W9F5G1N", asin: "B09W9F5G1N", expectedBrand: "Puma", keyword: "Smash V2" },
      { id: "prod_amz_B0BHY57K9L", asin: "B0BHY57K9L", expectedBrand: "Nike", keyword: "Revolution 7" },
      { id: "prod_amz_B09G3F3Q8Z", asin: "B09G3F3Q8Z", expectedBrand: "Red Tape", keyword: "Sneaker" },
      { id: "prod_amz_B08Z44ZDFH", asin: "B08Z44ZDFH", expectedBrand: "Asian", keyword: "Tarzan" },
      { id: "prod_amz_B0BFF7329Y", asin: "B0BFF7329Y", expectedBrand: "Adidas", keyword: "Adizero" },
    ];

    for (const target of targetShoes) {
      // Simulate completely cold isolate / new browser tab / new worker request
      productCache.clear();
      offerCache.clear();

      // Lookup by product ID directly
      const resultById = await repository.getProductByIdOrSlug(target.id);
      expect(resultById).not.toBeNull();
      expect(resultById!.product.id).toBe(target.id);
      expect(resultById!.product.brand).toBe(target.expectedBrand);
      expect(resultById!.product.title).toContain(target.keyword);
      expect(resultById!.product.title).not.toContain("Amazon Choice Item");
      expect(resultById!.product.imageUrl).not.toContain("placehold.co");
      expect(resultById!.lowestOffer).toBeDefined();
      expect(resultById!.lowestOffer!.price).toBeGreaterThan(0);
      expect(resultById!.lowestOffer!.productUrl).toContain(target.asin);

      // Lookup by canonical slug (e.g. amazon-B0BHY57K9L)
      const resultBySlug = await repository.getProductByIdOrSlug(`amazon-${target.asin}`);
      expect(resultBySlug).not.toBeNull();
      expect(resultBySlug!.product.title).toContain(target.keyword);

      // Lookup by raw ASIN
      const resultByAsin = await repository.getProductByIdOrSlug(target.asin);
      expect(resultByAsin).not.toBeNull();
      expect(resultByAsin!.product.title).toContain(target.keyword);
    }
  });

  it("guarantees Nike Revolution 7 (B0BHY57K9L) never opens dummy placeholder", async () => {
    // Specifically test the exact product reported by user
    productCache.clear();
    offerCache.clear();

    const result = await repository.getProductByIdOrSlug("prod_amz_B0BHY57K9L");
    expect(result).not.toBeNull();
    expect(result!.product.title).toContain("Revolution 7");
    expect(result!.product.brand).toBe("Nike");
    expect(result!.lowestOffer!.price).toBe(3195);
    expect(result!.lowestOffer!.originalPrice).toBe(3695);
    expect(result!.product.imageUrl).toContain("media-amazon.com");
    expect(result!.product.attributes?.shoeType).toBe("Running Shoes");
    expect(result!.product.attributes?.gender).toBe("Men");
  });

  it("guarantees ERIDANI block heels (prod_amz_B0FASERI002_white-braided-uk-5) resolves without 404", async () => {
    productCache.clear();
    offerCache.clear();

    const result = await repository.getProductByIdOrSlug("prod_amz_B0FASERI002_white-braided-uk-5");
    expect(result).not.toBeNull();
    expect(result!.product.title).toContain("ERIDANI");
    expect(result!.product.title).toContain("Braided Strap Chunky Block Heels");
    expect(result!.product.brand).toBe("ERIDANI");
    expect(result!.product.imageUrl).toMatch(/^https:\/\/m\.media-amazon\.com\/images\/I\//);
    expect(result!.product.imageUrl).not.toContain("unsplash.com");
    expect(result!.lowestOffer).toBeDefined();
    expect(result!.lowestOffer!.retailerSlug).toBe("amazon");
  });

  it("resolves template-synthesized products on a cold isolate without 404", async () => {
    // Generate a batch of synthesized products
    const synth = synthesizeEndlessProducts({ categorySlug: "audio", page: 1, count: 5 });
    expect(synth.length).toBe(5);

    for (const item of synth) {
      const generatedId = item.product.id;

      // Simulate a direct link / page refresh on a different worker isolate
      productCache.clear();
      offerCache.clear();

      const resolved = await repository.getProductByIdOrSlug(generatedId);
      expect(resolved).not.toBeNull();
      expect(resolved!.product.id).toBe(generatedId);
      expect(resolved!.product.title).toBe(item.product.title);
      expect(resolved!.lowestOffer!.retailerSlug).toBe("amazon");
      expect(resolved!.product.imageUrl).not.toContain("placehold.co");
    }
  });

  it("preserves variants and generates unique non-colliding IDs without array indices", () => {
    const page1 = synthesizeEndlessProducts({ categorySlug: "fashion", page: 1, count: 12 });
    const page2 = synthesizeEndlessProducts({ categorySlug: "fashion", page: 2, count: 12 });

    const seenIds = new Set<string>();

    for (const comp of [...page1, ...page2]) {
      // Must not contain trailing array index e.g. _0, _1, _21
      expect(comp.product.id).not.toMatch(/_\d+$/);

      // All IDs across consecutive pages must be distinct
      expect(seenIds.has(comp.product.id)).toBe(false);
      seenIds.add(comp.product.id);
    }

    expect(seenIds.size).toBe(24);
  });

  it("returns null for nonexistent/invalid product IDs without dummy fabrication", async () => {
    productCache.clear();
    offerCache.clear();

    // Invalid non-existent IDs
    const result1 = await repository.getProductByIdOrSlug("prod_amz_NONEXISTENT9999");
    expect(result1).toBeNull();

    const result2 = await repository.getProductByIdOrSlug("completely_invalid_id");
    expect(result2).toBeNull();

    const result3 = await repository.getProductByIdOrSlug("prod_amz_B000000000");
    expect(result3).toBeNull();
  });

  it("strictly validates genuine Amazon ASINs and rejects synthetic identifiers", () => {
    // Genuine Amazon India ASINs (10 alphanumeric chars starting with B0)
    expect(isGenuineAmazonAsin("B09W9F5G1N")).toBe(true);
    expect(isGenuineAmazonAsin("B0BHY57K9L")).toBe(true);
    expect(isGenuineAmazonAsin("B089278M6Q")).toBe(true);
    expect(isGenuineAmazonAsin("B08Z44ZDFH")).toBe(true);
    expect(isGenuineAmazonAsin("B0BFF7329Y")).toBe(true);

    // Synthetic ASINs from catalog templates MUST be rejected
    expect(isGenuineAmazonAsin("B0FASERI00014")).toBe(false);
    expect(isGenuineAmazonAsin("B0FASERI001")).toBe(false);
    expect(isGenuineAmazonAsin("B0MOBSAM001")).toBe(false);
    expect(isGenuineAmazonAsin("B0LAPDEL001")).toBe(false);
    expect(isGenuineAmazonAsin("B0AUDSON001")).toBe(false);
    expect(isGenuineAmazonAsin("B0APPPHI001")).toBe(false);
    expect(isGenuineAmazonAsin("B0BEALOR001")).toBe(false);

    // Bad formats
    expect(isGenuineAmazonAsin("")).toBe(false);
    expect(isGenuineAmazonAsin("B012345")).toBe(false); // < 10 chars
    expect(isGenuineAmazonAsin("B01234567890")).toBe(false); // > 10 chars
  });

  it("builds safe Amazon URLs: /dp/ for real ASINs, search for synthetic templates", () => {
    // Real ASIN -> /dp/ link
    expect(buildSafeAmazonUrl("B09W9F5G1N", "Puma Smash V2")).toBe("https://www.amazon.in/dp/B09W9F5G1N");
    expect(buildSafeAmazonUrl("https://www.amazon.in/dp/B09W9F5G1N", "Puma Smash V2")).toBe("https://www.amazon.in/dp/B09W9F5G1N");

    // Synthetic ASIN -> Amazon India search with product title (NEVER /dp/)
    const safeUrl1 = buildSafeAmazonUrl("B0FASERI00014", "ERIDANI Women's Braided Strap Chunky Block Heels");
    expect(safeUrl1).toContain("amazon.in/s?k=ERIDANI");
    expect(safeUrl1).toContain("tag=dealfinderin-21");
    expect(safeUrl1).not.toContain("/dp/");

    // Synthetic ASIN in URL -> converted to safe search
    const safeUrl2 = buildSafeAmazonUrl("https://www.amazon.in/dp/B0FASERI00014", "ERIDANI Heels");
    expect(decodeURIComponent(safeUrl2)).toContain("amazon.in/s?k=ERIDANI Heels");
    expect(safeUrl2).toContain("tag=dealfinderin-21");
    expect(safeUrl2).not.toContain("/dp/");

    // Synthetic ASIN with NO title passed -> fallback query avoids dead 404
    const safeUrl3 = buildSafeAmazonUrl("https://www.amazon.in/dp/B0FASERI00014");
    expect(safeUrl3).toContain("amazon.in/s?k=");
    expect(safeUrl3).toContain("tag=dealfinderin-21");
    expect(safeUrl3).not.toContain("/dp/");
  });

  it("verifies template products (Shoetopia, ERIDANI, etc.) have authentic, live /dp/ URLs with genuine ASINs", async () => {
    const comparisons = await repository.getProducts({ categorySlug: "fashion", limit: 30 });
    const shoetopiaItem = comparisons.find((c) => c.product.brand.toLowerCase() === "shoetopia");
    expect(shoetopiaItem).toBeDefined();

    const shoetopiaOffer = shoetopiaItem!.lowestOffer!;
    expect(shoetopiaOffer).toBeDefined();
    // Must be a direct product /dp/ URL with authentic ASIN B0FK2P93T5
    expect(shoetopiaOffer.productUrl).toBe("https://www.amazon.in/dp/B0FK2P93T5");
    expect(shoetopiaOffer.retailerProductId).toBe("B0FK2P93T5");

    const eridaniItem = comparisons.find((c) => c.product.brand.toLowerCase() === "eridani");
    expect(eridaniItem).toBeDefined();
    const eridaniOffer = eridaniItem!.lowestOffer!;
    expect(eridaniOffer).toBeDefined();
    expect(eridaniOffer.productUrl).toBe("https://www.amazon.in/dp/B0GWQJDVJJ");
    expect(eridaniOffer.retailerProductId).toBe("B0GWQJDVJJ");
  });

  it("redirect route (/api/redirect) routes directly to exact Amazon product /dp/<ASIN> with affiliate tag", async () => {
    // 1. Shoetopia product redirect routes directly to /dp/B0FK2P93T5 with affiliate tag
    const req1 = new NextRequest(
      "http://localhost:3000/api/redirect?offerId=off_amz_B0FK2P93T5&title=" +
        encodeURIComponent("Shoetopia Elegant Heeled Sandals for Women") +
        "&url=" +
        encodeURIComponent("https://www.amazon.in/dp/B0FK2P93T5")
    );
    const res1 = await redirectHandler(req1);
    expect(res1.status).toBe(307);
    const loc1 = res1.headers.get("location") || "";
    expect(loc1).toContain("amazon.in/dp/B0FK2P93T5");
    expect(loc1).toContain("tag=dealfinderin-21");

    // 2. ERIDANI product redirect routes directly to /dp/B0GWQJDVJJ with affiliate tag
    const req2 = new NextRequest(
      "http://localhost:3000/api/redirect?offerId=off_amz_B0GWQJDVJJ&url=" +
        encodeURIComponent("https://www.amazon.in/dp/B0GWQJDVJJ")
    );
    const res2 = await redirectHandler(req2);
    expect(res2.status).toBe(307);
    const loc2 = res2.headers.get("location") || "";
    expect(loc2).toContain("amazon.in/dp/B0GWQJDVJJ");
    expect(loc2).toContain("tag=dealfinderin-21");

    // 3. Genuine ASIN continues to route directly to /dp/
    const req3 = new NextRequest(
      "http://localhost:3000/api/redirect?offerId=off_amz_B09W9F5G1N&url=" +
        encodeURIComponent("https://www.amazon.in/dp/B09W9F5G1N")
    );
    const res3 = await redirectHandler(req3);
    expect(res3.status).toBe(307);
    const loc3 = res3.headers.get("location") || "";
    expect(loc3).toContain("amazon.in/dp/B09W9F5G1N");
    expect(loc3).toContain("tag=dealfinderin-21");
  });

  it("guarantees 100% of BASE_TEMPLATES across all categories have authentic Amazon India ASINs", () => {
    let totalTemplates = 0;
    for (const [categoryKey, templates] of Object.entries(BASE_TEMPLATES)) {
      expect(templates.length).toBeGreaterThan(0);
      for (const t of templates) {
        totalTemplates++;
        expect(t.asin).toBeDefined();
        expect(typeof t.asin).toBe("string");
        expect(isGenuineAmazonAsin(t.asin!)).toBe(true);
      }
    }
    expect(totalTemplates).toBeGreaterThanOrEqual(133);
  });

  it("guarantees 100% of BASE_TEMPLATES across all categories use authentic Amazon CDN images (0 Unsplash)", () => {
    let totalTemplates = 0;
    for (const [categoryKey, templates] of Object.entries(BASE_TEMPLATES)) {
      expect(templates.length).toBeGreaterThan(0);
      for (const t of templates) {
        totalTemplates++;
        // Must NEVER use Unsplash stock images
        expect(t.image).not.toContain("unsplash.com");
        // Must use authentic Amazon India Media CDN
        expect(t.image).toMatch(/^https:\/\/m\.media-amazon\.com\/images\/I\//);
      }
    }
    // Verify that we validated dozens of templates across all categories
    expect(totalTemplates).toBeGreaterThanOrEqual(70);
  });

  it("verifies related products deduplication produces distinct models with no duplicates", async () => {
    const comparisons = await repository.getProducts({ categorySlug: "fashion", limit: 30 });
    expect(comparisons.length).toBeGreaterThan(3);

    // Pick a product with multiple variants (like ERIDANI heels)
    const eridaniProduct = comparisons.find((c) => c.product.brand.toLowerCase() === "eridani");
    expect(eridaniProduct).toBeDefined();

    const product = eridaniProduct!.product;
    const allInCategory = comparisons;

    const getBaseTitle = (t: string) =>
      t
        .replace(/\s*\([^)]*\)\s*$/, "")
        .replace(/\s*-\s*[^-]+$/, "")
        .trim()
        .toLowerCase();

    const currentBaseTitle = getBaseTitle(product.title);
    const seenTitles = new Set<string>([currentBaseTitle]);
    if (product.modelNumber) {
      seenTitles.add(`${product.brand} ${product.modelNumber}`.trim().toLowerCase());
    }

    const primaryRelated: typeof comparisons = [];
    const secondaryRelated: typeof comparisons = [];
    const seenBrands = new Set<string>([product.brand.toLowerCase()]);

    for (const comp of allInCategory) {
      if (comp.product.id === product.id) continue;
      const base = getBaseTitle(comp.product.title);
      if (seenTitles.has(base)) continue;
      seenTitles.add(base);

      const b = (comp.product.brand || "").toLowerCase();
      if (!seenBrands.has(b) && primaryRelated.length < 3) {
        seenBrands.add(b);
        primaryRelated.push(comp);
      } else {
        secondaryRelated.push(comp);
      }
    }

    const related = [...primaryRelated, ...secondaryRelated].slice(0, 3);
    expect(related.length).toBe(3);

    // Verify all 3 related items are distinct from each other and distinct from the current item
    const relatedTitles = new Set(related.map((r) => getBaseTitle(r.product.title)));
    expect(relatedTitles.size).toBe(3);
    expect(relatedTitles.has(currentBaseTitle)).toBe(false);

    // Verify all related items have authentic Amazon CDN images
    for (const r of related) {
      expect(r.product.imageUrl).toContain("media-amazon.com");
      expect(r.product.imageUrl).not.toContain("unsplash.com");
    }
  });

  describe("Deal Presence & Availability Logic", () => {
    it("hasActivePresentDeal validates only active Amazon offers with positive price and in-stock status", () => {
      // Missing lowest offer
      expect(hasActivePresentDeal(null)).toBe(false);
      expect(hasActivePresentDeal(undefined)).toBe(false);
      expect(hasActivePresentDeal({ product: {} } as any)).toBe(false);

      // Offer with price <= 0
      expect(
        hasActivePresentDeal({
          product: { id: "p1" },
          lowestOffer: { price: 0, inStock: true, retailerSlug: "amazon" },
          offers: [{ price: 0, inStock: true, retailerSlug: "amazon" }],
        } as any)
      ).toBe(false);

      // Out of stock offer
      expect(
        hasActivePresentDeal({
          product: { id: "p1" },
          lowestOffer: { price: 999, inStock: false, retailerSlug: "amazon" },
          offers: [{ price: 999, inStock: false, retailerSlug: "amazon" }],
        } as any)
      ).toBe(false);

      // Non-Amazon retailer
      expect(
        hasActivePresentDeal({
          product: { id: "p1" },
          lowestOffer: { price: 999, inStock: true, retailerSlug: "flipkart" },
          offers: [{ price: 999, inStock: true, retailerSlug: "flipkart" }],
        } as any)
      ).toBe(false);

      // Valid active Amazon deal
      expect(
        hasActivePresentDeal({
          product: { id: "p1" },
          lowestOffer: { price: 1999, inStock: true, retailerSlug: "amazon" },
          offers: [{ price: 1999, inStock: true, retailerSlug: "amazon" }],
        } as any)
      ).toBe(true);
    });

    it("repository.getProducts guarantees that 100% of returned items have active present deals", async () => {
      const products = await repository.getProducts({ limit: 30 });
      expect(products.length).toBeGreaterThan(0);

      for (const comp of products) {
        expect(hasActivePresentDeal(comp)).toBe(true);
        expect(comp.lowestOffer).toBeDefined();
        expect(comp.lowestOffer!.price).toBeGreaterThan(0);
        expect(comp.lowestOffer!.inStock).not.toBe(false);
        const hasAmazon = comp.offers.some(
          (o) => o.retailerSlug === "amazon" && o.price > 0 && o.inStock !== false
        );
        expect(hasAmazon).toBe(true);
      }
    });

    it("repository.getProductByIdOrSlug returns null for completely invalid IDs or deals not present", async () => {
      const nonExistent = await repository.getProductByIdOrSlug("completely-invalid-deal-12345");
      expect(nonExistent).toBeNull();
    });
  });
});

