import { describe, it, expect } from "vitest";
import {
  formatINR,
  calculateDiscount,
  calculateSavings,
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

  it("calculates accurate Rupee savings between MRP and discount price", () => {
    expect(calculateSavings(69900, 54999)).toBe(14901);
    expect(calculateSavings(5000, 5000)).toBe(0);
    expect(calculateSavings(5000, 6000)).toBe(0);
    expect(calculateSavings(0, 100)).toBe(0);
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

    expect(getRelativeTime(minAgo)).toBe("Recently");
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

    expect(brands.length).toBeGreaterThan(15);
    expect(brands).toContain("Apple");
    expect(brands).toContain("Samsung");
    expect(brands).toContain("Nike");
  });

  it("filters brands by selected category accurately", async () => {
    const { repository } = await import("@/lib/data/repository");
    
    // Fashion category brands
    const fashionBrands = await repository.getBrands("fashion");
    expect(fashionBrands).toContain("Nike");
    expect(fashionBrands).toContain("Puma");
    expect(fashionBrands).toContain("Levi's");
    expect(fashionBrands).toContain("BIBA");
    expect(fashionBrands).toContain("TRASE");
    // Tech brands MUST NOT be in fashion brands
    expect(fashionBrands).not.toContain("Apple");
    expect(fashionBrands).not.toContain("boAt");
    expect(fashionBrands).not.toContain("Sony");

    // Mobiles category brands
    const mobileBrands = await repository.getBrands("mobiles");
    expect(mobileBrands).toContain("Apple");
    expect(mobileBrands).toContain("Samsung");
    expect(mobileBrands).toContain("OnePlus");
    // Fashion brands MUST NOT be in mobile brands
    expect(mobileBrands).not.toContain("BIBA");
    expect(mobileBrands).not.toContain("TRASE");
    expect(mobileBrands).not.toContain("Shoetopia");

    // Audio category brands
    const audioBrands = await repository.getBrands("audio");
    expect(audioBrands).toContain("boAt");
    expect(audioBrands).toContain("Sony");
    expect(audioBrands).toContain("JBL");
    expect(audioBrands).not.toContain("Levi's");
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

  it("never assigns Apple brand to fashion/heel products and isolates categories", async () => {
    const { repository } = await import("@/lib/data/repository");
    // Querying fashion category should never return products branded as Apple
    const fashionProducts = await repository.getProducts({ categorySlug: "fashion" });
    for (const comp of fashionProducts) {
      expect(comp.product.brand.toLowerCase()).not.toBe("apple");
      expect(comp.product.categoryId).toBe("cat_fashion");
    }

    // Querying heels should return authentic footwear brands (Shoetopia, TRASE, Theater, Metro, Bata, Catwalk)
    const heelProducts = await repository.getProducts({ searchQuery: "heels", page: 1, limit: 30 });
    expect(heelProducts.length).toBeGreaterThan(0);
    for (const comp of heelProducts) {
      expect(comp.product.brand.toLowerCase()).not.toBe("apple");
    }
  });

  it("hydrates appliances with multiple live deals and zero lone demo cards", async () => {
    const { repository } = await import("@/lib/data/repository");
    const applianceDeals = await repository.getProducts({
      categorySlug: "appliances",
      retailerSlug: "amazon",
    });

    expect(applianceDeals.length).toBeGreaterThanOrEqual(8);
    for (const comp of applianceDeals) {
      expect(comp.product.categoryId).toBe("cat_appliances");
      expect(comp.lowestOffer?.isDemo).toBe(false);
      expect(comp.lowestOffer?.retailerSlug).toBe("amazon");
    }
  });

  it("hydrates beauty category with multiple live deals", async () => {
    const { repository } = await import("@/lib/data/repository");
    const beautyDeals = await repository.getProducts({
      categorySlug: "beauty",
    });

    expect(beautyDeals.length).toBeGreaterThanOrEqual(8);
    for (const comp of beautyDeals) {
      expect(comp.product.categoryId).toBe("cat_beauty");
      expect(comp.lowestOffer?.isDemo).toBe(false);
    }
  });

  it("strictly isolates live products to verified Amazon India offers while Cuelinks is pending", async () => {
    const { repository } = await import("@/lib/data/repository");
    const comparison = await repository.getProductByIdOrSlug("prod_amz_B0CHX1W1XY");

    expect(comparison).not.toBeNull();
    if (comparison) {
      // Must contain verified Amazon offer and zero inactive retailer companion offers
      expect(comparison.offers.length).toBeGreaterThanOrEqual(1);
      const retailers = comparison.offers.map((o) => o.retailerSlug);
      expect(retailers).toContain("amazon");
      expect(retailers).not.toContain("flipkart");
      expect(comparison.lowestOffer).not.toBeNull();
      expect(comparison.lowestOffer?.retailerSlug).toBe("amazon");
    }
  });

  it("constructs valid Flipkart affiliate search URLs", async () => {
    const { adapterRegistry } = await import("@/lib/adapters/registry");
    const outboundUrl = adapterRegistry.buildOutboundUrl(
      "flipkart",
      "https://www.flipkart.com/search?q=iPhone+15",
      "df_web"
    );

    expect(outboundUrl).toContain("flipkart.com/search");
    expect(outboundUrl).toContain("affid=");
    expect(outboundUrl).toContain("affExtParam1=df_web");
  });

  it("constructs valid Cuelinks redirect URLs when CUELINKS_PUBLISHER_ID is set", async () => {
    const { FlipkartAdapter } = await import("@/lib/adapters/flipkart");
    const { MyntraAdapter } = await import("@/lib/adapters/myntra");

    const prevId = process.env.CUELINKS_PUBLISHER_ID;
    process.env.CUELINKS_PUBLISHER_ID = "281629";

    const fkAdapter = new FlipkartAdapter();
    const fkUrl = fkAdapter.buildAffiliateUrl("https://www.flipkart.com/search?q=iPhone+15", "sub_test");
    expect(fkUrl).toContain("https://linksredirect.com/?cid=281629");
    expect(fkUrl).toContain("&subid=sub_test");
    expect(fkUrl).toContain("flipkart.com");

    const myntraAdapter = new MyntraAdapter();
    const myntraUrl = myntraAdapter.buildAffiliateUrl("https://www.myntra.com/shoes", "sub_test");
    expect(myntraUrl).toContain("https://linksredirect.com/?cid=281629");
    expect(myntraUrl).toContain("&subid=sub_test");
    expect(myntraUrl).toContain("myntra.com");

    if (prevId !== undefined) {
      process.env.CUELINKS_PUBLISHER_ID = prevId;
    } else {
      delete process.env.CUELINKS_PUBLISHER_ID;
    }
  });

  describe("Retailer Redirect Route & Search URL Integrity", () => {
    it("redirects Flipkart demo offer to live Flipkart search", async () => {
      const { GET } = await import("@/app/api/redirect/route");
      const { NextRequest } = await import("next/server");
      const req = new NextRequest("http://localhost:3000/api/redirect?offerId=off_iphone_15_128_fk");
      const res = await GET(req);

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("flipkart.com/search");
      expect(location).toContain("Apple+iPhone+15");
      expect(location).toContain("affid=");
    });

    it("redirects Myntra demo offer to live Myntra search", async () => {
      const { GET } = await import("@/app/api/redirect/route");
      const { NextRequest } = await import("next/server");
      const req = new NextRequest("http://localhost:3000/api/redirect?offerId=off_levis_myntra");
      const res = await GET(req);

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("myntra.com/search?rawQuery=");
      expect(location).toContain("Levis");
    });

    it("redirects AJIO demo offer to live AJIO search", async () => {
      const { GET } = await import("@/app/api/redirect/route");
      const { NextRequest } = await import("next/server");
      const req = new NextRequest("http://localhost:3000/api/redirect?offerId=off_libas_ajio");
      const res = await GET(req);

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("ajio.com/search/?text=");
      expect(location).toContain("Libas");
    });

    it("redirects Meesho demo offer to live Meesho search", async () => {
      const { GET } = await import("@/app/api/redirect/route");
      const { NextRequest } = await import("next/server");
      const req = new NextRequest("http://localhost:3000/api/redirect?offerId=off_libas_meesho");
      const res = await GET(req);

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("meesho.com/search?q=");
      expect(location).toContain("Libas");
    });

    it("resolves cold worker companion Flipkart offer using title rather than raw ASIN", async () => {
      const { GET } = await import("@/app/api/redirect/route");
      const { NextRequest } = await import("next/server");
      const req = new NextRequest(
        "http://localhost:3000/api/redirect?offerId=off_fk_B09XYZ9999&title=Theater%20Kitten%20Heels"
      );
      const res = await GET(req);

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("flipkart.com/search?q=");
      expect(location).toMatch(/Theater(\+|\%20)Kitten(\+|\%20)Heels/);
      expect(location).not.toContain("search?q=B09XYZ9999");
    });

    it("resolves cold worker companion Myntra offer to search query with title", async () => {
      const { GET } = await import("@/app/api/redirect/route");
      const { NextRequest } = await import("next/server");
      const req = new NextRequest(
        "http://localhost:3000/api/redirect?offerId=off_myntra_B09XYZ9999&title=Theater%20Kitten%20Heels"
      );
      const res = await GET(req);

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("myntra.com/search?rawQuery=Theater%20Kitten%20Heels");
    });

    it("attaches affiliate params when explicit retailer URL is passed", async () => {
      const { GET } = await import("@/app/api/redirect/route");
      const { NextRequest } = await import("next/server");
      const target = "https://www.flipkart.com/search?q=Sony+Headphones";
      const req = new NextRequest(
        `http://localhost:3000/api/redirect?offerId=off_fk_custom&url=${encodeURIComponent(target)}`
      );
      const res = await GET(req);

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("flipkart.com/search?q=Sony+Headphones");
      expect(location).toContain("affid=dealfinder");
    });
  });
});


