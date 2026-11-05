import { describe, it, expect } from "vitest";
import { correctQuerySpelling, typoDistance } from "@/lib/search/spelling-corrector";
import { executeSearchPipeline } from "@/lib/search/search-orchestrator";
import { getSearchTermGroups, matchesSearchTerms } from "@/lib/data/repository";
import { ensureReachableAmazonUrl } from "@/lib/redirect-security";

describe("Customer QA: search relevance", () => {
  it("does not rewrite real words into different products", () => {
    for (const word of ["toys", "chair", "books", "power bank", "mouse", "backpack"]) {
      expect(correctQuerySpelling(word).hasCorrection, word).toBe(false);
    }
  });

  it("still fixes genuine typing slips", () => {
    expect(correctQuerySpelling("laptpo").correctedQuery).toBe("laptop");
    expect(correctQuerySpelling("samsunf").correctedQuery).toBe("samsung");
    expect(correctQuerySpelling("sneakres").correctedQuery).toBe("sneakers");
  });

  it("treats non-neighbouring key swaps as different words", () => {
    expect(typoDistance("toys", "tops")).toBe(2); // y and p are far apart
    expect(typoDistance("samsunf", "samsung")).toBe(1); // f and g are neighbours
  });

  it("matches whole words, not fragments inside other words", () => {
    expect(matchesSearchTerms("Apple MacBook Air", getSearchTermGroups("books"), "any")).toBe(false);
    expect(matchesSearchTerms("Sony WH-1000XM5 Headphones", getSearchTermGroups("phone"), "any")).toBe(false);
    expect(matchesSearchTerms("Apple iPhone 15", getSearchTermGroups("phone"), "any")).toBe(true);
    expect(matchesSearchTerms("Fire-Boltt Phoenix Smartwatch", getSearchTermGroups("watch"), "any")).toBe(true);
  });

  it("returns nothing irrelevant for products the catalog doesn't carry", async () => {
    for (const query of ["toys", "chair", "sofa"]) {
      const result = await executeSearchPipeline({ query });
      expect(result.results.length, query).toBe(0);
    }
  });

  it("keeps 'phone case' results to phones, not headphones", async () => {
    const result = await executeSearchPipeline({ query: "phone case" });
    for (const c of result.results) {
      expect(c.product.title.toLowerCase()).not.toContain("headphone");
    }
  });

  it("finds laptops whose titles never say 'laptop'", async () => {
    const result = await executeSearchPipeline({ query: "laptop" });
    expect(result.results.length).toBeGreaterThanOrEqual(20);
  });
});

describe("Customer QA: Buy on Amazon destinations", () => {
  it("keeps verified product pages", () => {
    expect(ensureReachableAmazonUrl("https://www.amazon.in/dp/B09XS7JWHH", "Sony WH-1000XM5")).toBe(
      "https://www.amazon.in/dp/B09XS7JWHH"
    );
  });

  it("sends unverified product IDs to a search for the product name", () => {
    expect(ensureReachableAmazonUrl("https://www.amazon.in/dp/B0BG1XNW3R", "Fire-Boltt Phoenix Pro")).toBe(
      "https://www.amazon.in/s?k=Fire-Boltt%20Phoenix%20Pro&tag=dealfinder025-21"
    );
  });

  it("trusts product links that came from the live Amazon API", () => {
    expect(ensureReachableAmazonUrl("https://www.amazon.in/dp/B0NEWLIVE1", "x", true)).toBe(
      "https://www.amazon.in/dp/B0NEWLIVE1"
    );
  });
});

describe("Affiliate store ID", () => {
  it("tags every outbound Amazon link with the account's store ID", async () => {
    const { getAmazonAssociatesTag } = await import("@/lib/affiliate-tag");
    const { buildExternalAmazonSearchUrl } = await import("@/lib/search/search-orchestrator");
    expect(getAmazonAssociatesTag()).toBe("dealfinder025-21");
    expect(buildExternalAmazonSearchUrl("watch")).toContain("tag=dealfinder025-21");
  });
});
