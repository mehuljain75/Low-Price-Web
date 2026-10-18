import { describe, it, expect } from "vitest";
import {
  normalizeString,
  areVariantsCompatible,
  matchesCanonicalProduct,
} from "@/lib/matching";
import { Product } from "@/lib/types";

describe("Normalized String Matching", () => {
  it("normalizes special characters, whitespace, and case", () => {
    expect(normalizeString(" Apple  iPhone 15 (128GB) - Black ")).toBe(
      "apple iphone 15 128gb black"
    );
  });
});

describe("Variant Guard (Preventing False Model/Storage Merging)", () => {
  it("rejects mismatched storage variants", () => {
    const attr128 = { storage: "128 GB" };
    const attr256 = { storage: "256 GB" };

    expect(areVariantsCompatible(attr128, attr256)).toBe(false);
  });

  it("rejects mismatched RAM variants", () => {
    const ram8 = { ram: "8 GB" };
    const ram16 = { ram: "16 GB" };

    expect(areVariantsCompatible(ram8, ram16)).toBe(false);
  });

  it("rejects mismatched clothing sizes", () => {
    const sizeM = { size: "M" };
    const sizeXL = { size: "XL" };

    expect(areVariantsCompatible(sizeM, sizeXL)).toBe(false);
  });

  it("accepts identical or compatible variant attributes", () => {
    const attrA = { storage: "128 GB", color: "Black" };
    const attrB = { storage: "128GB", color: "black" };

    expect(areVariantsCompatible(attrA, attrB)).toBe(true);
  });
});

describe("Canonical Product Matching", () => {
  const canonicalIphone128: Product = {
    id: "prod_iphone_15_128",
    title: "Apple iPhone 15 (128 GB) - Black",
    slug: "apple-iphone-15-128gb-black",
    brand: "Apple",
    categoryId: "cat_mobiles",
    modelNumber: "MTP03HN/A",
    gtin: "195949038234",
    description: "iPhone 15 description",
    imageUrl: "https://example.com/iphone.jpg",
    attributes: {
      storage: "128 GB",
      color: "Black",
    },
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-18T00:00:00Z",
  };

  it("matches an offer with exact GTIN/EAN", () => {
    const candidate = {
      brand: "Apple",
      gtin: "195949038234",
    };

    expect(matchesCanonicalProduct(canonicalIphone128, candidate)).toBe(true);
  });

  it("matches an offer with matching Brand, Model Number, and Storage", () => {
    const candidate = {
      brand: "Apple",
      modelNumber: "MTP03HN/A",
      attributes: {
        storage: "128 GB",
      },
    };

    expect(matchesCanonicalProduct(canonicalIphone128, candidate)).toBe(true);
  });

  it("strictly REJECTS an offer with different storage (e.g. 256GB)", () => {
    const candidate256 = {
      brand: "Apple",
      modelNumber: "MTP63HN/A",
      attributes: {
        storage: "256 GB", // Incompatible with 128 GB
      },
    };

    expect(matchesCanonicalProduct(canonicalIphone128, candidate256)).toBe(false);
  });

  it("strictly REJECTS an offer from a different brand", () => {
    const candidateSamsung = {
      brand: "Samsung",
      modelNumber: "SM-S921BZKDINS",
      attributes: {
        storage: "128 GB",
      },
    };

    expect(matchesCanonicalProduct(canonicalIphone128, candidateSamsung)).toBe(false);
  });
});
