import { describe, it, expect } from "vitest";
import { repository } from "../lib/data/repository";
import { BASE_TEMPLATES } from "../lib/data/endless-catalog";

describe("Product Catalog Deduplication (Bug 7 Fix Verification)", () => {
  it("guarantees Prestige Iris Plus mixer grinder template has a single canonical spec", () => {
    const applianceTemplates = BASE_TEMPLATES["appliances"] || [];
    const prestigeIris = applianceTemplates.find(
      (t) => t.brand.toLowerCase() === "prestige" && t.model.toLowerCase().includes("iris plus")
    );

    expect(prestigeIris).toBeDefined();
    // Must be exactly 1 spec so variant cycling does not spawn multiple duplicate cards for the same mixer grinder
    expect(prestigeIris!.specs.length).toBe(1);
    expect(prestigeIris!.specs[0]).toContain("750W");
  });

  it("returns zero duplicate listings for Prestige Iris Plus when querying products", async () => {
    const comparisons = await repository.getProducts({
      searchQuery: "Prestige Iris Plus",
      limit: 24,
    });

    // Count how many products mention Prestige Iris Plus
    const irisListings = comparisons.filter(
      (c) =>
        c.product.brand.toLowerCase() === "prestige" &&
        c.product.title.toLowerCase().includes("iris plus")
    );

    // There should be at most 1 canonical listing, NEVER duplicate batch 4 or multiple jar variants
    expect(irisListings.length).toBeLessThanOrEqual(1);
    if (irisListings.length === 1) {
      expect(irisListings[0].product.title).not.toContain("Batch");
    }
  });

  it("deduplicates identical ASINs in appliances category query", async () => {
    const comparisons = await repository.getProducts({
      categorySlug: "appliances",
      limit: 48,
    });

    const seenAsins = new Set<string>();
    for (const comp of comparisons) {
      const amzOffer = comp.offers.find((o) => o.retailerSlug === "amazon");
      const asin = amzOffer?.retailerProductId || comp.product.attributes?.asin;
      if (asin && /^B0[A-Z0-9]{8}$/i.test(asin)) {
        expect(seenAsins.has(asin.toUpperCase())).toBe(false);
        seenAsins.add(asin.toUpperCase());
      }
    }
  });
});
