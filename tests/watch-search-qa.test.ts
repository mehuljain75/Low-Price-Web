import { describe, it, expect } from "vitest";
import { correctQuerySpelling } from "@/lib/search/spelling-corrector";
import { executeSearchPipeline } from "@/lib/search/search-orchestrator";
import { getSearchTermGroups, matchesSearchTerms } from "@/lib/data/repository";
import { composeProductTitle } from "@/lib/data/endless-catalog";
import { getCuratedProductByIdOrSlug } from "@/lib/services/amazon-search";
import { resolveCategoryNavigationPath } from "@/lib/filter-navigation";

const titles = (r: Awaited<ReturnType<typeof executeSearchPipeline>>) =>
  r.results.map((c) => c.product.title);

describe("Customer QA: watch search on /search?q=watch", () => {
  it("does not 'correct' a valid word like watch into water", async () => {
    expect(correctQuerySpelling("watch").hasCorrection).toBe(false);
    const result = await executeSearchPipeline({ query: "watch" });
    expect(result.didYouMean).toBeUndefined();
    expect(result.searchStatus).toBe("exact");
    expect(titles(result).length).toBe(4);
  });

  it("corrects the typo 'wach' to watch, not wash", async () => {
    const result = await executeSearchPipeline({ query: "wach" });
    expect(result.searchStatus).toBe("corrected");
    expect(result.correctedQuery).toBe("watch");
    expect(titles(result).every((t) => /watch/i.test(t))).toBe(true);
  });

  it("finds every watch for plural and compound spellings", async () => {
    for (const query of ["watches", "smartwatch", "smartwatches"]) {
      const result = await executeSearchPipeline({ query });
      expect(titles(result).length, query).toBe(4);
      expect(titles(result).some((t) => t.startsWith("Apple Watch")), query).toBe(true);
    }
  });

  it("keeps multi-word searches on products that match every word", async () => {
    const result = await executeSearchPipeline({ query: "smart watch" });
    expect(titles(result).length).toBeGreaterThan(0);
    expect(titles(result).every((t) => /watch/i.test(t))).toBe(true);
  });

  it("files watches under Mobiles & Tablets instead of Home Appliances", () => {
    const watch = getCuratedProductByIdOrSlug("prod_amz_B0CHWZ8W3D");
    expect(watch?.category?.slug).toBe("mobiles");
  });

  it("does not offer generic bank discounts that Amazon never confirmed", () => {
    const watch = getCuratedProductByIdOrSlug("prod_amz_B0CY2L4H7G");
    expect(watch?.lowestOffer?.bankOffersDescription).toBeUndefined();
  });
});

describe("Search term matching helpers", () => {
  it("matches joined and split spellings in either direction", () => {
    expect(matchesSearchTerms("Noise ColorFit Smart Watch", getSearchTermGroups("smartwatch"), "any")).toBe(true);
    expect(matchesSearchTerms("Fire-Boltt Phoenix Pro", getSearchTermGroups("fireboltt"), "any")).toBe(true);
  });

  it("ignores single stray characters that would match everything", () => {
    expect(getSearchTermGroups("b hi b")).toEqual([["hi"]]);
  });
});

describe("Catalog title formatting", () => {
  it("does not repeat a brand already present in the model name", () => {
    expect(composeProductTitle("OnePlus", "OnePlus 12 5G", "Black")).toBe("OnePlus 12 5G (Black)");
    expect(composeProductTitle("Noise", "Buds VS104", "Mint")).toBe("Noise Buds VS104 (Mint)");
  });
});

describe("Filter category navigation", () => {
  it("keeps the shopper on /search so the query is not dropped", () => {
    expect(resolveCategoryNavigationPath("/search", "audio", true)).toBe("/search");
  });

  it("opens the category page when browsing without a query", () => {
    expect(resolveCategoryNavigationPath("/products", "audio", false)).toBe("/category/audio");
  });

  it("leaves a category page when 'All Categories' is chosen", () => {
    expect(resolveCategoryNavigationPath("/category/audio", null, false)).toBe("/products");
  });
});
