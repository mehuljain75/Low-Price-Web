import { describe, it, expect } from "vitest";
import { repository } from "../lib/data/repository";
import { computeProductComparison } from "../lib/matching";
import { isAllowedTargetUrl } from "../lib/redirect-security";
import { Product, Offer } from "../lib/types";

describe("Senior QA Audit Sprint — Regression & Data Integrity Suite", () => {
  describe("P0: Inactive Retailer Isolation", () => {
    it("strictly isolates repository.getProducts() to Amazon India offers only", async () => {
      const comparisons = await repository.getProducts({ limit: 50 });
      expect(comparisons.length).toBeGreaterThan(0);

      for (const comp of comparisons) {
        expect(comp.offers.length).toBeGreaterThan(0);
        for (const offer of comp.offers) {
          expect(offer.retailerSlug).toBe("amazon");
          expect(["Flipkart", "Myntra", "AJIO", "Meesho"]).not.toContain(offer.retailerName);
        }
        if (comp.lowestOffer) {
          expect(comp.lowestOffer.retailerSlug).toBe("amazon");
        }
      }
    });

    it("verifies boAt Airdopes 141 (prod_boat_airdopes_141) has zero inactive retailer contamination", async () => {
      const comparison = await repository.getProductByIdOrSlug("prod_boat_airdopes_141");
      expect(comparison).toBeDefined();
      expect(comparison!.product.id).toBe("prod_boat_airdopes_141");

      // Verify every single offer is strictly Amazon India
      expect(comparison!.offers.length).toBeGreaterThan(0);
      for (const offer of comparison!.offers) {
        expect(offer.retailerSlug).toBe("amazon");
        expect(offer.id).not.toBe("off_boat_fk");
      }
      expect(comparison!.lowestOffer?.retailerSlug).toBe("amazon");
    });

    it("createCompanionOffers returns empty array when ENABLE_MOCK_COMPANION_OFFERS is false", async () => {
      const { createCompanionOffers } = await import("../lib/services/amazon-search");
      const companions = createCompanionOffers("B097RV97D8", "Philips Air Fryer", 6999);
      expect(companions).toEqual([]);
    });
  });

  describe("P0: Amazon Data Provenance & Timestamp Integrity", () => {
    it("ensures all returned offers declare valid data source and provenance classification", async () => {
      const comparisons = await repository.getProducts({ limit: 30 });
      for (const comp of comparisons) {
        for (const offer of comp.offers) {
          expect(["live", "catalog"]).toContain(offer.dataSource);
          if (offer.provenance) {
            expect(["amazon_paapi_live", "amazon_catalog_verified", "dev_fixture"]).toContain(
              offer.provenance
            );
          }
          // Timestamp must be a valid ISO string, not a dynamic negative delta formula
          expect(new Date(offer.lastCheckedAt).getTime()).not.toBeNaN();
        }
      }
    });
  });

  describe("P1: Product Identity & Deduplication", () => {
    it("deduplicates Philips Air Fryer (HD9252) between legacy demo fixture and Amazon catalog", async () => {
      const results = await repository.getProducts({ query: "Philips Air Fryer", limit: 20 });
      // Count how many products represent Philips HD9252
      const hd9252Matches = results.filter(
        (c) =>
          c.product.title.toLowerCase().includes("hd9252") ||
          c.product.modelNumber?.toLowerCase().includes("hd9252") ||
          c.product.attributes?.asin === "B097RV97D8"
      );

      expect(hd9252Matches.length).toBe(1);
    });

    it("deduplicates iPhone 15 while preserving distinct variant capacities (e.g. 128GB vs 256GB)", async () => {
      const results = await repository.getProducts({ query: "iPhone 15", limit: 30 });

      // Check for exact base model (128GB) duplicates
      const base128Matches = results.filter(
        (c) =>
          c.product.title.toLowerCase().includes("iphone 15") &&
          (c.product.title.includes("128") || c.product.attributes?.storage === "128GB") &&
          !c.product.title.toLowerCase().includes("plus") &&
          !c.product.title.toLowerCase().includes("pro")
      );

      expect(base128Matches.length).toBe(1);
    });
  });

  describe("P1: Security Hardening on /api/redirect", () => {
    it("rejects malicious open-redirect target domains", () => {
      const maliciousUrls = [
        "https://evil.com/phish",
        "https://amazon.in.attacker.org/steal-creds",
        "https://attacker-controlled-site.com",
        "http://phishing-flipkart.com",
        "javascript:alert(document.cookie)",
        "data:text/html,<script>alert(1)</script>",
        "https://notamazon.in",
      ];

      for (const url of maliciousUrls) {
        expect(isAllowedTargetUrl(url)).toBe(false);
      }
    });

    it("allows trusted Indian e-commerce retailer domains and affiliate redirectors", () => {
      const trustedUrls = [
        "https://www.amazon.in/dp/B097RV97D8?tag=dealfinder-21",
        "https://amazon.in/gp/product/B0CHX1W1XY",
        "https://amzn.to/3xyz",
        "https://www.flipkart.com/item/p/itm123",
        "https://dl.flipkart.com/s/xyz",
        "https://www.myntra.com/shoes/nike",
        "https://www.ajio.com/s/product",
        "https://www.meesho.com/s/p/abc",
        "https://linksredirect.com/?cid=123&url=https%3A%2F%2Famazon.in",
      ];

      for (const url of trustedUrls) {
        expect(isAllowedTargetUrl(url)).toBe(true);
      }
    });
  });
});
