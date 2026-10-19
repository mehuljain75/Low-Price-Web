import { describe, it, expect } from "vitest";
import {
  formatINR,
  calculateDiscount,
  isOfferStale,
  getRelativeTime,
} from "@/lib/formatters";
import { computeProductComparison } from "@/lib/matching";
import { Product, Offer } from "@/lib/types";

describe("Price Formatting & Indian Rupee (INR)", () => {
  it("formats amounts in Indian numbering format with Rupee symbol", () => {
    expect(formatINR(54999)).toBe("₹54,999");
    expect(formatINR(149999)).toBe("₹1,49,999");
    expect(formatINR(999)).toBe("₹999");
    expect(formatINR(0)).toBe("₹0");
  });

  it("calculates correct percentage discount from MRP", () => {
    // 69,900 down to 54,999 = 21% off
    expect(calculateDiscount(69900, 54999)).toBe(21);
    // 4,490 down to 999 = 78% off
    expect(calculateDiscount(4490, 999)).toBe(78);
    // No discount if current price >= MRP
    expect(calculateDiscount(5000, 5000)).toBe(0);
    expect(calculateDiscount(5000, 6000)).toBe(0);
  });

  it("detects stale offers older than 24 hours", () => {
    const recentIso = new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(); // 2 hours ago
    const staleIso = new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(); // 26 hours ago

    expect(isOfferStale(recentIso, 24)).toBe(false);
    expect(isOfferStale(staleIso, 24)).toBe(true);
  });

  it("formats relative timestamps cleanly", () => {
    const minAgo = new Date(Date.now() - 1000 * 60 * 2).toISOString();
    const hoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString();

    expect(getRelativeTime(minAgo)).toBe("Just now");
    expect(getRelativeTime(hoursAgo)).toBe("3h ago");
  });
});

describe("Cross-Store Price Comparison Engine", () => {
  const sampleProduct: Product = {
    id: "prod_test",
    title: "Test Smartphone 5G",
    slug: "test-smartphone-5g",
    brand: "BrandX",
    categoryId: "cat_mobiles",
    modelNumber: "X500",
    description: "Sample test phone",
    imageUrl: "https://example.com/img.jpg",
    attributes: { storage: "128 GB" },
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-18T00:00:00Z",
  };

  const sampleOffers: Offer[] = [
    {
      id: "off_fk",
      productId: "prod_test",
      retailerId: "ret_flipkart",
      retailerName: "Flipkart",
      retailerSlug: "flipkart",
      retailerProductId: "FK_123",
      title: "Test Smartphone (Flipkart)",
      productUrl: "https://flipkart.com/item",
      price: 24999,
      originalPrice: 29999,
      currency: "INR",
      inStock: true,
      shippingCost: 0,
      lastCheckedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isStale: false,
      isDemo: true,
      dataSource: "demo",
    },
    {
      id: "off_amz",
      productId: "prod_test",
      retailerId: "ret_amazon",
      retailerName: "Amazon India",
      retailerSlug: "amazon",
      retailerProductId: "AMZ_123",
      title: "Test Smartphone (Amazon)",
      productUrl: "https://amazon.in/item",
      price: 23999, // Lowest price
      originalPrice: 29999,
      currency: "INR",
      inStock: true,
      shippingCost: 0,
      lastCheckedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // Stale!
      isStale: true,
      isDemo: true,
      dataSource: "demo",
    },
  ];

  it("identifies the lowest price among tracked stores", () => {
    const comparison = computeProductComparison(sampleProduct, sampleOffers);

    expect(comparison.lowestOffer).not.toBeNull();
    expect(comparison.lowestOffer?.retailerSlug).toBe("amazon");
    expect(comparison.lowestOffer?.price).toBe(23999);
    expect(comparison.trackedStoresCount).toBe(2);
  });

  it("flags stale offers when any offer exceeds the 24h threshold", () => {
    const comparison = computeProductComparison(sampleProduct, sampleOffers);

    expect(comparison.hasStalePrices).toBe(true);
    const staleOffer = comparison.offers.find((o) => o.retailerSlug === "amazon");
    expect(staleOffer?.isStale).toBe(true);
  });

  it("computes savings correctly between highest and lowest tracked price", () => {
    const comparison = computeProductComparison(sampleProduct, sampleOffers);

    // Highest price is 24,999 (Flipkart) and Lowest is 23,999 (Amazon)
    expect(comparison.savingsAmount).toBe(1000);
  });
});

describe("Repository Brand Search & Filtering", () => {
  it("provides available brands list across categories", async () => {
    const { repository } = await import("@/lib/data/repository");
    const brands = await repository.getBrands();

    expect(brands.length).toBeGreaterThan(5);
    expect(brands).toContain("Apple");
    expect(brands).toContain("Samsung");
    expect(brands).toContain("Nike");
  });

  it("filters products by brand across all categories", async () => {
    const { repository } = await import("@/lib/data/repository");
    const appleProducts = await repository.getProducts({ brand: "Apple" });

    expect(appleProducts.length).toBeGreaterThan(0);
    for (const comp of appleProducts) {
      const match =
        comp.product.brand.toLowerCase().includes("apple") ||
        comp.product.title.toLowerCase().includes("apple");
      expect(match).toBe(true);
    }

    const nikeProducts = await repository.getProducts({ brand: "Nike" });
    expect(nikeProducts.length).toBeGreaterThan(0);
    for (const comp of nikeProducts) {
      const match =
        comp.product.brand.toLowerCase().includes("nike") ||
        comp.product.title.toLowerCase().includes("nike");
      expect(match).toBe(true);
    }

    const traseProducts = await repository.getProducts({ brand: "TRASE" });
    expect(traseProducts.length).toBeGreaterThan(0);
    for (const comp of traseProducts) {
      const match =
        comp.product.brand.toLowerCase().includes("trase") ||
        comp.product.title.toLowerCase().includes("trase");
      expect(match).toBe(true);
    }
  });
});

