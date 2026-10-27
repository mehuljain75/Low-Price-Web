import { describe, it, expect } from "vitest";
import { getSuggestions, TRENDING_SEARCHES } from "../lib/data/search-suggestions";

describe("Search Autocomplete & Typing Suggestions", () => {
  it("returns trending searches when query is empty", () => {
    const res = getSuggestions("");
    expect(res.querySuggestions).toEqual([]);
    expect(res.trending.length).toBeGreaterThan(0);
    expect(res.trending).toEqual(TRENDING_SEARCHES);
  });

  it("suggests iphone terms with prefix matching when typing 'iph'", () => {
    const res = getSuggestions("iph");
    expect(res.querySuggestions.length).toBeGreaterThan(0);
    expect(res.querySuggestions.some((s) => s.text.toLowerCase().includes("iphone"))).toBe(true);

    // Should include products
    expect(res.products.length).toBeGreaterThan(0);
    expect(res.products[0].title.toLowerCase()).toContain("iphone");
  });

  it("suggests category-scoped suggestions like Amazon", () => {
    const res = getSuggestions("iphone");
    const scoped = res.querySuggestions.find((s) => s.isScoped);
    expect(scoped).toBeDefined();
    expect(scoped?.categorySlug).toBe("mobiles");
  });

  it("respects category filter when provided", () => {
    const res = getSuggestions("air", "appliances");
    // All returned query suggestions should belong to appliances
    for (const s of res.querySuggestions) {
      if (s.categorySlug) {
        expect(s.categorySlug).toBe("appliances");
      }
    }
    // All products should be in appliances
    for (const p of res.products) {
      expect(p.categorySlug).toBe("appliances");
    }
  });

  it("suggests products and terms for audio query 'boat'", () => {
    const res = getSuggestions("boat");
    expect(res.querySuggestions.length).toBeGreaterThan(0);
    expect(res.querySuggestions[0].text.toLowerCase()).toContain("boat");
    expect(res.products.length).toBeGreaterThan(0);
  });

  it("provides word boundary matching for 'macbook'", () => {
    const res = getSuggestions("mac");
    expect(res.querySuggestions.some((s) => s.text.toLowerCase().includes("macbook"))).toBe(true);
  });
});
