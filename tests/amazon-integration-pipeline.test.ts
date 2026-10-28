import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  searchAmazonProductsApi,
  getAmazonApiStatus,
  mapPaapiItemToComparison,
  setMockPaapiFetcher,
  sanitizeSearchQuery,
} from "@/lib/services/amazon-product-api";
import {
  executeSearchPipeline,
  buildExternalAmazonSearchUrl,
} from "@/lib/search/search-orchestrator";
import { PAAPIItem } from "@/lib/services/amazon-paapi";

describe("Production-Ready Amazon Product Integration (Option A) & External Fallback (Option B)", () => {
  beforeEach(() => {
    setMockPaapiFetcher(null);
  });

  afterEach(() => {
    setMockPaapiFetcher(null);
  });

  describe("Option A: Authorized Amazon Product Advertising API Adapter", () => {
    it("reports unconfigured status when credentials are not in environment", () => {
      const originalAccess = process.env.AMAZON_ACCESS_KEY;
      delete process.env.AMAZON_ACCESS_KEY;

      const status = getAmazonApiStatus();
      expect(status.isConfigured).toBe(false);
      expect(status.missingCredentials).toContain("AMAZON_ACCESS_KEY");
      expect(status.partnerTag).toBe("dealfinderin-21");

      if (originalAccess) process.env.AMAZON_ACCESS_KEY = originalAccess;
    });

    it("does not fabricate fake Amazon product cards when API is unconfigured", async () => {
      // Ensure mock fetcher is null and no credentials exist
      const originalAccess = process.env.AMAZON_ACCESS_KEY;
      delete process.env.AMAZON_ACCESS_KEY;

      const response = await searchAmazonProductsApi("some random gadget");
      expect(response.status).toBe("unconfigured");
      expect(response.products).toEqual([]);
      expect(response.isLiveApi).toBe(false);
      expect(response.errorMessage).toContain("credentials not configured");

      if (originalAccess) process.env.AMAZON_ACCESS_KEY = originalAccess;
    });

    it("sanitizes queries and limits length to 200 characters", () => {
      expect(sanitizeSearchQuery("  clean query  ")).toBe("clean query");
      const longQuery = "a".repeat(300);
      expect(sanitizeSearchQuery(longQuery).length).toBe(200);
      expect(sanitizeSearchQuery("bad\u0000query\u0007")).toBe("badquery");
    });

    it("correctly maps genuine PA-API 5.0 item fields to PriceComparison", () => {
      const sampleItem: PAAPIItem = {
        ASIN: "B09W9F5G1N",
        DetailPageURL: "https://www.amazon.in/dp/B09W9F5G1N?tag=dealfinderin-21",
        ItemInfo: {
          Title: { DisplayValue: "Apple iPhone 15 Pro (128 GB) - Natural Titanium" },
          ByLineInfo: { Brand: { DisplayValue: "Apple" } },
        },
        Images: {
          Primary: {
            Large: {
              URL: "https://m.media-amazon.com/images/I/81+GIkwqLIL._AC_SL1500_.jpg",
              Height: 1500,
              Width: 1500,
            },
          },
        },
        Offers: {
          Listings: [
            {
              Id: "listing_1",
              Price: { Amount: 127990, Currency: "INR", DisplayAmount: "₹1,27,990" },
              SavingBasis: { Amount: 134900, DisplayAmount: "₹1,34,900" },
              Availability: { Type: "Now" },
            },
          ],
        },
      };

      const comparison = mapPaapiItemToComparison(sampleItem, "dealfinderin-21");
      expect(comparison).not.toBeNull();
      expect(comparison!.product.id).toBe("prod_amz_B09W9F5G1N");
      expect(comparison!.product.title).toBe("Apple iPhone 15 Pro (128 GB) - Natural Titanium");
      expect(comparison!.product.brand).toBe("Apple");
      expect(comparison!.product.imageUrl).toBe("https://m.media-amazon.com/images/I/81+GIkwqLIL._AC_SL1500_.jpg");
      expect(comparison!.lowestOffer?.price).toBe(127990);
      expect(comparison!.lowestOffer?.originalPrice).toBe(134900);
      expect(comparison!.lowestOffer?.retailerSlug).toBe("amazon");
      expect(comparison!.lowestOffer?.provenance).toBe("amazon_paapi_live");
      expect(comparison!.lowestOffer?.dataSource).toBe("api");
      expect(comparison!.lowestOffer?.isDemo).toBe(false);
      expect(comparison!.lowestOffer?.productUrl).toContain("https://www.amazon.in/dp/B09W9F5G1N");
    });

    it("handles successful mocked PA-API 5.0 search responses", async () => {
      setMockPaapiFetcher(async (_target, _payload) => ({
        SearchResult: {
          TotalResultCount: 1,
          Items: [
            {
              ASIN: "B0CX5CGFBG",
              DetailPageURL: "https://www.amazon.in/dp/B0CX5CGFBG?tag=dealfinderin-21",
              ItemInfo: {
                Title: { DisplayValue: "Samsung 43 Inch 4K Crystal UHD TV" },
                ByLineInfo: { Brand: { DisplayValue: "Samsung" } },
              },
              Images: {
                Primary: {
                  Large: { URL: "https://m.media-amazon.com/images/I/71u9sX8H2HL.jpg" },
                },
              },
              Offers: {
                Listings: [
                  {
                    Id: "l_1",
                    Price: { Amount: 28990, Currency: "INR", DisplayAmount: "₹28,990" },
                    SavingBasis: { Amount: 44900, DisplayAmount: "₹44,900" },
                  },
                ],
              },
            },
          ],
        },
      }));

      const res = await searchAmazonProductsApi("samsung tv");
      expect(res.status).toBe("ready");
      expect(res.products.length).toBe(1);
      expect(res.products[0].product.title).toBe("Samsung 43 Inch 4K Crystal UHD TV");
      expect(res.products[0].lowestOffer?.price).toBe(28990);
    });

    it("handles rate limiting (TooManyRequests / HTTP 429) gracefully", async () => {
      setMockPaapiFetcher(async () => ({
        Errors: [
          {
            Code: "TooManyRequests",
            Message: "The request was denied due to request throttling.",
          },
        ],
      }));

      const res = await searchAmazonProductsApi("laptops");
      expect(res.status).toBe("rate_limited");
      expect(res.products).toEqual([]);
      expect(res.errorMessage).toContain("request throttling");
    });

    it("handles PA-API timeout gracefully", async () => {
      setMockPaapiFetcher(async () => {
        const err = new Error("The operation was aborted due to timeout");
        err.name = "AbortError";
        throw err;
      });

      const res = await searchAmazonProductsApi("macbook");
      expect(res.status).toBe("timeout");
      expect(res.products).toEqual([]);
    });

    it("handles malformed API response gracefully", async () => {
      setMockPaapiFetcher(async () => ({} as any));

      const res = await searchAmazonProductsApi("sony headphones");
      expect(res.status).toBe("empty");
      expect(res.products).toEqual([]);
    });
  });

  describe("Option B: Authentic Amazon India Search Fallback", () => {
    it("constructs valid HTTPS Amazon India URL with partner tag", () => {
      const url = buildExternalAmazonSearchUrl("chocolate");
      expect(url).toBe("https://www.amazon.in/s?k=chocolate&tag=dealfinderin-21");
    });

    it("safely URL-encodes original queries including spaces and symbols", () => {
      expect(buildExternalAmazonSearchUrl("chocolate cake")).toBe(
        "https://www.amazon.in/s?k=chocolate%20cake&tag=dealfinderin-21"
      );
      expect(buildExternalAmazonSearchUrl("100% cotton shirt")).toBe(
        "https://www.amazon.in/s?k=100%25%20cotton%20shirt&tag=dealfinderin-21"
      );
      expect(buildExternalAmazonSearchUrl("c++ programming")).toBe(
        "https://www.amazon.in/s?k=c%2B%2B%20programming&tag=dealfinderin-21"
      );
      expect(buildExternalAmazonSearchUrl("women's heels")).toBe(
        "https://www.amazon.in/s?k=women's%20heels&tag=dealfinderin-21"
      );
    });

    it("preserves original search query spelling in fallback link", async () => {
      const result = await executeSearchPipeline({
        query: "choclate",
        forceExact: true,
      });

      expect(result.fallbackLinkTitle).toBe("Search Amazon India for choclate");
      expect(result.fallbackSectionTitle).toBe("Couldn't find the exact product? Search Amazon India.");
      expect(result.externalSearchUrl).toContain("k=choclate");
    });
  });

  describe("Intelligent Search Pipeline Order & Merging", () => {
    it("Step 1: Returns local catalog matches for exact query 'iphone 15'", async () => {
      const result = await executeSearchPipeline({ query: "iphone 15", limit: 5 });
      expect(result.searchStatus).toBe("exact");
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].product.title.toLowerCase()).toContain("iphone");
    });

    it("Step 3: Corrects spelling 'bluetooh hedphones' -> 'bluetooth headphones'", async () => {
      const result = await executeSearchPipeline({ query: "bluetooh hedphones", limit: 5 });
      expect(result.searchStatus).toBe("corrected");
      expect(result.correctedQuery).toBe("bluetooth headphones");
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("Step 4 & 5: Merges and deduplicates local catalog with Amazon live API results", async () => {
      // Mock Amazon API returning an item already in catalog AND a new item
      setMockPaapiFetcher(async () => ({
        SearchResult: {
          TotalResultCount: 2,
          Items: [
            // Duplicate: Already exists in local catalog (prod_iphone_15_128)
            {
              ASIN: "B0CHX1W1XY",
              DetailPageURL: "https://www.amazon.in/dp/B0CHX1W1XY?tag=dealfinderin-21",
              ItemInfo: {
                Title: { DisplayValue: "Apple iPhone 15 (128 GB) - Black" },
                ByLineInfo: { Brand: { DisplayValue: "Apple" } },
              },
              Offers: {
                Listings: [
                  {
                    Id: "l_amz_dup",
                    Price: { Amount: 69999, Currency: "INR" },
                  },
                ],
              },
            },
            // Unique new Amazon item
            {
              ASIN: "B0NEWITEM123",
              DetailPageURL: "https://www.amazon.in/dp/B0NEWITEM123?tag=dealfinderin-21",
              ItemInfo: {
                Title: { DisplayValue: "Apple iPhone 15 Silicone Case with MagSafe" },
                ByLineInfo: { Brand: { DisplayValue: "Apple" } },
              },
              Offers: {
                Listings: [
                  {
                    Id: "l_amz_unique",
                    Price: { Amount: 4900, Currency: "INR" },
                  },
                ],
              },
            },
          ],
        },
      }));

      const result = await executeSearchPipeline({ query: "iphone 15", limit: 10 });
      expect(result.results.length).toBeGreaterThan(0);

      // Verify no duplicate cards for "Apple iPhone 15 (128 GB) - Black"
      const blackIphoneCards = result.results.filter(
        (r) => r.product.title.toLowerCase().trim() === "apple iphone 15 (128 gb) - black"
      );
      expect(blackIphoneCards.length).toBe(1);

      // Verify new item from Amazon API is included
      const caseItem = result.results.find((r) => r.product.id === "prod_amz_B0NEWITEM123");
      expect(caseItem).toBeDefined();
      expect(caseItem?.lowestOffer?.provenance).toBe("amazon_paapi_live");
    });

    it("preserves local results when Amazon API is unavailable or fails", async () => {
      setMockPaapiFetcher(async () => {
        throw new Error("Amazon network down");
      });

      const result = await executeSearchPipeline({ query: "macbook", limit: 5 });
      // Local catalog results are preserved
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].product.title.toLowerCase()).toContain("macbook");
      expect(result.amazonApiStatus).toBe("upstream_error");
    });

    it("Step 7 & 8: Returns zero_results and Option B fallback for completely unknown query", async () => {
      setMockPaapiFetcher(async () => ({
        SearchResult: { TotalResultCount: 0, Items: [] },
      }));

      const result = await executeSearchPipeline({ query: "unknownproductxyz999" });
      expect(result.searchStatus).toBe("zero_results");
      expect(result.results).toEqual([]);
      expect(result.fallbackLinkTitle).toBe("Search Amazon India for unknownproductxyz999");
      expect(result.fallbackSectionTitle).toBe("Couldn't find the exact product? Search Amazon India.");
      expect(result.externalSearchUrl).toContain("unknownproductxyz999");
    });

    it("supports pagination and repeat searches via in-memory caching", async () => {
      const page1 = await executeSearchPipeline({ query: "running shoes", page: 1, limit: 10 });
      const page2 = await executeSearchPipeline({ query: "running shoes", page: 2, limit: 10 });

      expect(page1.page).toBe(1);
      expect(page2.page).toBe(2);

      // Repeat request hits cache
      const page1Cached = await executeSearchPipeline({ query: "running shoes", page: 1, limit: 10 });
      expect(page1Cached.results.length).toBe(page1.results.length);
    });
  });
});
