import { describe, it, expect } from "vitest";
import { repository } from "../lib/data/repository";
import { isAllowedTargetUrl, buildSafeAmazonUrl, isGenuineAmazonAsin } from "../lib/redirect-security";
import { calculateDiscount, calculateSavings } from "../lib/formatters";
import { productCache, offerCache } from "../lib/services/amazon-search";
import { findTemplateProductByIdOrSlug } from "../lib/data/endless-catalog";
import { GET as redirectHandler } from "../app/api/redirect/route";
import { NextRequest } from "next/server";

describe("DealFinder India QA Bug Fixes & Reliability Sprint (Round 2)", () => {
  describe("P0/P1: Product-Detail Routes & Variant Resolution", () => {
    it("returns null for non-existent IDs instead of fabricating random dummy candidate deals", async () => {
      // Simulate unknown IDs that previously triggered Step 5 auto-recovery
      const unknownIds = [
        "prod_amz_B0NONEXISTENT999",
        "prod_amz_FAKEASIN123",
        "completely-fictional-product-slug",
        "prod_amz_B000000000",
      ];

      for (const id of unknownIds) {
        const result = await repository.getProductByIdOrSlug(id);
        expect(result).toBeNull();
      }
    });

    it("deterministically resolves variant ID prod_amz_B0BQ37G9P7_blue-zen-quad-mic-enc on a cold isolate", async () => {
      // Clear all in-memory caches to simulate a fresh Cloudflare Worker isolate cold start
      productCache.clear();
      offerCache.clear();

      const variantId = "prod_amz_B0BQ37G9P7_blue-zen-quad-mic-enc";
      const comparison = await repository.getProductByIdOrSlug(variantId);

      expect(comparison).not.toBeNull();
      expect(comparison!.product.id).toBe(variantId);
      expect(comparison!.product.brand).toBe("Boult");
      expect(comparison!.product.title).toContain("Boult Audio Z40");
      expect(comparison!.product.title).toContain("Blue, Zen Quad Mic ENC");
      expect(comparison!.lowestOffer).toBeDefined();
      expect(comparison!.lowestOffer!.retailerSlug).toBe("amazon");
      expect(comparison!.lowestOffer!.price).toBeGreaterThan(0);
      expect(comparison!.product.attributes?.variant).toBe("Blue, Zen Quad Mic ENC");
    });

    it("supports case-insensitive product resolution for IDs, ASINs, and slugs", async () => {
      productCache.clear();
      offerCache.clear();

      // Lowercase variant ID
      const resLowerVariant = await repository.getProductByIdOrSlug("prod_amz_b0bq37g9p7_blue-zen-quad-mic-enc");
      expect(resLowerVariant).not.toBeNull();
      expect(resLowerVariant!.product.brand).toBe("Boult");

      // Lowercase ASIN
      const resLowerAsin = await repository.getProductByIdOrSlug("prod_amz_b0bhy57k9l");
      expect(resLowerAsin).not.toBeNull();
      expect(resLowerAsin!.product.brand).toBe("Nike");

      // Lowercase slug
      const resLowerSlug = await repository.getProductByIdOrSlug("amazon-b0bhy57k9l");
      expect(resLowerSlug).not.toBeNull();
      expect(resLowerSlug!.product.brand).toBe("Nike");
    });
  });

  describe("P1: Product Count & Truthful Presentation", () => {
    it("never returns negative counts or out-of-range pagination limits", async () => {
      const page1 = await repository.getProducts({ page: 1, limit: 12 });
      expect(page1.length).toBe(12);

      const page2 = await repository.getProducts({ page: 2, limit: 12 });
      expect(page2.length).toBe(12);

      // Verify zero overlap between page 1 and page 2
      const ids1 = new Set(page1.map((p) => p.product.id));
      const overlap = page2.filter((p) => ids1.has(p.product.id));
      expect(overlap.length).toBe(0);
    });
  });

  describe("P1: Fabricated / Misleading Product Data Elimination", () => {
    it("calculateDiscount strictly returns 0 for invalid, missing, zero, or negative prices", () => {
      expect(calculateDiscount(0, 500)).toBe(0);
      expect(calculateDiscount(1000, 0)).toBe(0);
      expect(calculateDiscount(-1000, 500)).toBe(0);
      expect(calculateDiscount(1000, -500)).toBe(0);
      expect(calculateDiscount(NaN as any, 500)).toBe(0);
      expect(calculateDiscount(1000, NaN as any)).toBe(0);
      expect(calculateDiscount(500, 1000)).toBe(0); // MRP less than current price -> no fake discount
      expect(calculateDiscount(1000, 1000)).toBe(0);
    });

    it("calculateSavings strictly returns 0 when original price <= current price or prices are non-positive", () => {
      expect(calculateSavings(0, 500)).toBe(0);
      expect(calculateSavings(500, 0)).toBe(0);
      expect(calculateSavings(500, 1000)).toBe(0);
      expect(calculateSavings(1000, 800)).toBe(200);
    });

    it("correctly identifies synthetic ASINs vs genuine Amazon India ASINs", () => {
      // Genuine ASINs (10 chars, B0 prefix, no synthetic category prefix)
      expect(isGenuineAmazonAsin("B0BHY57K9L")).toBe(true);
      expect(isGenuineAmazonAsin("B097RV97D8")).toBe(true);
      expect(isGenuineAmazonAsin("B0BQ37G9P7")).toBe(true);

      // Synthetic category-coded ASINs must be identified as synthetic
      expect(isGenuineAmazonAsin("B0FASERI00014")).toBe(false);
      expect(isGenuineAmazonAsin("B0MOBSAM001")).toBe(false);
      expect(isGenuineAmazonAsin("B0LAPAPP005")).toBe(false);
      expect(isGenuineAmazonAsin("B0AUDBOU002")).toBe(false);

      // Malformed strings
      expect(isGenuineAmazonAsin("")).toBe(false);
      expect(isGenuineAmazonAsin("SHORT")).toBe(false);
      expect(isGenuineAmazonAsin("INVALID_ASIN_12345")).toBe(false);
    });

    it("template-synthesized products resolve with authentic catalog provenance and active deal status", () => {
      const syntheticComp = findTemplateProductByIdOrSlug("prod_amz_B0FASERI002_white-braided-uk-5");
      expect(syntheticComp).not.toBeNull();
      // Should declare amazon_catalog_verified and isDemo: false for authentic catalog products
      expect(syntheticComp!.lowestOffer?.provenance).toBe("amazon_catalog_verified");
      expect(syntheticComp!.lowestOffer?.isDemo).toBe(false);
    });
  });

  describe("P2: Affiliate Redirect Security Hardening", () => {
    it("strictly requires HTTPS protocol and rejects plaintext HTTP", () => {
      expect(isAllowedTargetUrl("https://www.amazon.in/dp/B0BQ37G9P7")).toBe(true);
      expect(isAllowedTargetUrl("http://www.amazon.in/dp/B0BQ37G9P7")).toBe(false);
      expect(isAllowedTargetUrl("http://amazon.in")).toBe(false);
    });

    it("rejects userinfo injection attacks (e.g. user:pass@)", () => {
      expect(isAllowedTargetUrl("https://user:password@www.amazon.in/dp/B0BQ37G9P7")).toBe(false);
      expect(isAllowedTargetUrl("https://amazon.in@evil-attacker.com/steal")).toBe(false);
      expect(isAllowedTargetUrl("https://amazon.in:password@evil.com")).toBe(false);
    });

    it("rejects non-standard ports", () => {
      expect(isAllowedTargetUrl("https://www.amazon.in:8080/dp/B0BQ37G9P7")).toBe(false);
      expect(isAllowedTargetUrl("https://www.amazon.in:8443/dp/B0BQ37G9P7")).toBe(false);
    });

    it("handles trailing dots in hostnames safely", () => {
      expect(isAllowedTargetUrl("https://www.amazon.in./dp/B0BQ37G9P7")).toBe(true);
      expect(isAllowedTargetUrl("https://evil.com./fake")).toBe(false);
    });

    it("rejects lookalike domains and open redirect attempts", () => {
      const malicious = [
        "https://amazon.in.attacker.org/steal",
        "https://not-amazon.in/test",
        "https://amazon.in-deals.com/promo",
        "https://subdomain.attacker.com/amazon.in",
        "javascript:alert(1)",
        "data:text/html,evil",
      ];

      for (const url of malicious) {
        expect(isAllowedTargetUrl(url)).toBe(false);
      }
    });

    it("/api/redirect returns 400 for unsafe or unauthorized redirect URLs", async () => {
      // Insecure HTTP URL
      const reqHttp = new NextRequest("http://localhost:3000/api/redirect?url=http://www.amazon.in/dp/B0BQ37G9P7");
      const resHttp = await redirectHandler(reqHttp);
      expect(resHttp.status).toBe(400);

      // Untrusted domain
      const reqEvil = new NextRequest("http://localhost:3000/api/redirect?url=https://evil-attacker.com/steal");
      const resEvil = await redirectHandler(reqEvil);
      expect(resEvil.status).toBe(400);

      // Userinfo attack
      const reqUserinfo = new NextRequest("http://localhost:3000/api/redirect?url=https://user:pass@www.amazon.in/dp/B0BQ37G9P7");
      const resUserinfo = await redirectHandler(reqUserinfo);
      expect(resUserinfo.status).toBe(400);
    });

    it("/api/redirect permits valid Amazon India HTTPS links with affiliate tracking preserved", async () => {
      const reqValid = new NextRequest("http://localhost:3000/api/redirect?url=https://www.amazon.in/dp/B0BQ37G9P7");
      const resValid = await redirectHandler(reqValid);
      expect(resValid.status).toBe(307);
      const location = resValid.headers.get("location");
      expect(location).toContain("amazon.in");
      expect(location).toContain("tag=");
    });
  });
});
