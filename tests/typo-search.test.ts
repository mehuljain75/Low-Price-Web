import { describe, it, expect } from "vitest";
import {
  damerauLevenshteinDistance,
  correctQuerySpelling,
  parseSearchIntent,
} from "@/lib/search/spelling-corrector";
import {
  executeSearchPipeline,
  buildExternalAmazonSearchUrl,
} from "@/lib/search/search-orchestrator";
import { getSuggestions } from "@/lib/data/search-suggestions";

describe("Typo-Tolerant Search & Zero-Results Recovery Pipeline", () => {
  describe("Unit Tests: Damerau-Levenshtein Algorithm", () => {
    it("computes exact distance for identical strings", () => {
      expect(damerauLevenshteinDistance("chocolate", "chocolate")).toBe(0);
      expect(damerauLevenshteinDistance("iphone", "iphone")).toBe(0);
    });

    it("computes single insertion, deletion, and substitution", () => {
      expect(damerauLevenshteinDistance("choclate", "chocolate")).toBe(1); // missing 'o'
      expect(damerauLevenshteinDistance("iphne", "iphone")).toBe(1); // missing 'o'
      expect(damerauLevenshteinDistance("samsng", "samsung")).toBe(1); // missing 'u'
      expect(damerauLevenshteinDistance("hedphones", "headphones")).toBe(1); // missing 'a'
    });

    it("handles transpositions correctly with cost 1", () => {
      expect(damerauLevenshteinDistance("chcoolate", "chocolate")).toBe(1); // 'co' vs 'oc'
      expect(damerauLevenshteinDistance("protien", "protein")).toBe(1); // 'ie' vs 'ei'
    });
  });

  describe("Unit Tests: correctQuerySpelling", () => {
    it("corrects 'choclate' to 'chocolate' with high confidence", () => {
      const res = correctQuerySpelling("choclate");
      expect(res.hasCorrection).toBe(true);
      expect(res.correctedQuery).toBe("chocolate");
      expect(res.confidence).toBe("high");
    });

    it("corrects 'iphne' to 'iphone'", () => {
      const res = correctQuerySpelling("iphne");
      expect(res.hasCorrection).toBe(true);
      expect(res.correctedQuery).toBe("iphone");
    });

    it("corrects multi-word query 'nik shoes' to 'nike shoes'", () => {
      const res = correctQuerySpelling("nik shoes");
      expect(res.hasCorrection).toBe(true);
      expect(res.correctedQuery).toBe("nike shoes");
    });

    it("corrects 'bluetooh hedphones' to 'bluetooth headphones'", () => {
      const res = correctQuerySpelling("bluetooh hedphones");
      expect(res.hasCorrection).toBe(true);
      expect(res.correctedQuery).toBe("bluetooth headphones");
    });

    it("corrects 'samsng tv' to 'samsung tv'", () => {
      const res = correctQuerySpelling("samsng tv");
      expect(res.hasCorrection).toBe(true);
      expect(res.correctedQuery).toBe("samsung tv");
    });

    it("corrects 'protien powder' to 'protein powder'", () => {
      const res = correctQuerySpelling("protien powder");
      expect(res.hasCorrection).toBe(true);
      expect(res.correctedQuery).toBe("protein powder");
    });

    it("preserves already correctly spelled terms", () => {
      const res = correctQuerySpelling("chocolate");
      expect(res.hasCorrection).toBe(false);
      expect(res.correctedQuery).toBe("chocolate");
    });
  });

  describe("Unit Tests: parseSearchIntent (Natural Language Price & Intent)", () => {
    it("parses 'laptop under 50000' correctly", () => {
      const parsed = parseSearchIntent("laptop under 50000");
      expect(parsed.cleanKeywords).toBe("laptop");
      expect(parsed.maxPrice).toBe(50000);
      expect(parsed.minPrice).toBeUndefined();
    });

    it("parses 'shoes below 3000' and 'running shoes under 2,000'", () => {
      const p1 = parseSearchIntent("shoes below 3000");
      expect(p1.cleanKeywords).toBe("shoes");
      expect(p1.maxPrice).toBe(3000);

      const p2 = parseSearchIntent("running shoes under 2,000");
      expect(p2.cleanKeywords).toBe("running shoes");
      expect(p2.maxPrice).toBe(2000);
    });

    it("parses 'phone between 15000 and 25000'", () => {
      const parsed = parseSearchIntent("phone between 15000 and 25000");
      expect(parsed.cleanKeywords).toBe("phone");
      expect(parsed.minPrice).toBe(15000);
      expect(parsed.maxPrice).toBe(25000);
    });

    it("parses 'above 2000' or 'more than 5000'", () => {
      const parsed = parseSearchIntent("headphones above 2000");
      expect(parsed.cleanKeywords).toBe("headphones");
      expect(parsed.minPrice).toBe(2000);
      expect(parsed.maxPrice).toBeUndefined();
    });
  });

  describe("Integration Tests: executeSearchPipeline", () => {
    it("resolves misspelled 'choclate' to genuine chocolate products via auto-correction", async () => {
      const result = await executeSearchPipeline({
        query: "choclate",
        limit: 10,
      });

      expect(result.originalQuery).toBe("choclate");
      expect(result.correctedQuery).toBe("chocolate");
      expect(result.searchStatus).toBe("corrected");
      expect(result.fallbackUsed).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);

      // Verify returned products contain chocolate
      const titles = result.results.map((r) => r.product.title.toLowerCase());
      expect(titles.some((t) => t.includes("chocolate") || t.includes("cadbury"))).toBe(true);

      // Verify all products have authentic Amazon URLs and images
      for (const item of result.results) {
        expect(item.product.imageUrl).toMatch(/^https:\/\/m\.media-amazon\.com\/images\/I\//);
        expect(item.lowestOffer?.retailerSlug).toBe("amazon");
      }
    });

    it("respects forceExact: true when searching 'choclate' without auto-correction", async () => {
      const result = await executeSearchPipeline({
        query: "choclate",
        forceExact: true,
      });

      // Because 'choclate' is not literally in product titles, exact search finds 0 local products
      // and returns zero_results with valid external Amazon search fallback CTA
      expect(result.searchStatus).toBe("zero_results");
      expect(result.results.length).toBe(0);
      expect(result.externalSearchUrl).toContain("choclate");
      expect(result.externalSearchUrl).toContain("tag=dealfinderin-21");
    });

    it("resolves exact query 'chocolate' with searchStatus: 'exact'", async () => {
      const result = await executeSearchPipeline({
        query: "chocolate",
        limit: 10,
      });

      expect(result.searchStatus).toBe("exact");
      expect(result.fallbackUsed).toBe(false);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("handles broader query fallback for multi-token query 'choclate cake'", async () => {
      const result = await executeSearchPipeline({
        query: "choclate cake",
        limit: 10,
      });

      expect(result.results.length).toBeGreaterThan(0);
      const titles = result.results.map((r) => r.product.title.toLowerCase());
      expect(titles.some((t) => t.includes("cake") || t.includes("chocolate"))).toBe(true);
    });

    it("ranks exact matches before broad/fallback results", async () => {
      const exactResult = await executeSearchPipeline({ query: "nike running shoes", limit: 5 });
      const broadResult = await executeSearchPipeline({ query: "nik runing shoes", limit: 5 });

      expect(exactResult.searchStatus).toBe("exact");
      expect(broadResult.searchStatus).toBe("corrected");
      expect(exactResult.results.length).toBeGreaterThan(0);
      expect(broadResult.results.length).toBeGreaterThan(0);
    });

    it("handles zero-results gracefully with authentic Amazon India external search CTA", async () => {
      const result = await executeSearchPipeline({
        query: "nonexistentproductxyz999",
      });

      expect(result.searchStatus).toBe("zero_results");
      expect(result.results.length).toBe(0);
      expect(result.externalSearchUrl).toBe(
        "https://www.amazon.in/s?k=nonexistentproductxyz999&tag=dealfinderin-21"
      );
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it("safely handles special characters and URL encoding", () => {
      const url1 = buildExternalAmazonSearchUrl("100% cotton shirt");
      expect(url1).toBe("https://www.amazon.in/s?k=100%25%20cotton%20shirt&tag=dealfinderin-21");

      const url2 = buildExternalAmazonSearchUrl("women's heels & flats");
      expect(url2).toBe("https://www.amazon.in/s?k=women's%20heels%20%26%20flats&tag=dealfinderin-21");

      const url3 = buildExternalAmazonSearchUrl("c++ programming book");
      expect(url3).toBe("https://www.amazon.in/s?k=c%2B%2B%20programming%20book&tag=dealfinderin-21");
    });
  });

  describe("Integration Tests: Autocomplete Typo Awareness", () => {
    it("suggests corrected term when user types misspelled 'choclate' in autocomplete", () => {
      const suggestions = getSuggestions("choclate", undefined, 5);
      expect(suggestions.querySuggestions.length).toBeGreaterThan(0);
      const didYouMean = suggestions.querySuggestions.find((s) => s.categoryName === "Did you mean");
      expect(didYouMean).toBeDefined();
      expect(didYouMean?.text).toBe("chocolate");
    });
  });
});
