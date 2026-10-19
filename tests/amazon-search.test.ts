import { describe, it, expect } from "vitest";
import { parseAmazonSearchHtml, searchLiveAmazonIndia } from "../lib/services/amazon-search";
import { AmazonAdapter } from "../lib/adapters/amazon";

describe("Live Amazon Search & Parser", () => {
  const sampleAmazonHtml = `
    <div data-asin="B0DFMGNY45" class="s-result-item">
      <h2><span class="a-text-normal">TRASE Transparent Block Heels for Women Stylish</span></h2>
      <span class="a-price-whole">889</span>
      <span class="a-price a-text-price"><span class="a-offscreen">₹1,299</span></span>
      <img class="s-image" src="https://m.media-amazon.com/images/I/61MvFD5buqL._AC_SR160,130_.jpg" />
      <span class="a-icon-alt">4.3 out of 5 stars</span>
      <span class="a-size-base s-underline-text">245</span>
    </div>
    <div data-asin="B0FDX1Q8Z7" class="s-result-item">
      <h2><span class="a-text-normal">Bata Women High Stiletto Heels</span></h2>
      <span class="a-price-whole">1,499</span>
      <span class="a-price a-text-price"><span class="a-offscreen">₹2,499</span></span>
      <img class="s-image" src="https://m.media-amazon.com/images/I/61N9lZFYd9L._AC_SR160,130_.jpg" />
      <span class="a-icon-alt">4.1 out of 5 stars</span>
      <span class="a-size-base s-underline-text">89</span>
    </div>
  `;

  it("extracts products accurately from Amazon search HTML", () => {
    const results = parseAmazonSearchHtml(sampleAmazonHtml, "heels");
    expect(results.length).toBe(2);

    const first = results[0];
    expect(first.product.id).toBe("prod_amz_B0DFMGNY45");
    expect(first.product.title).toContain("TRASE Transparent Block Heels");
    expect(first.offers[0].price).toBe(889);
    expect(first.offers[0].originalPrice).toBe(1299);
    expect(first.offers[0].retailerSlug).toBe("amazon");
    expect(first.offers[0].retailerName).toBe("Amazon India");
    expect(first.offers[0].productUrl).toBe("https://www.amazon.in/dp/B0DFMGNY45");
    expect(first.offers[0].isDemo).toBe(false);

    const second = results[1];
    expect(second.product.id).toBe("prod_amz_B0FDX1Q8Z7");
    expect(second.offers[0].price).toBe(1499);
    expect(second.offers[0].originalPrice).toBe(2499);
  });

  it("assigns appropriate category for fashion items", () => {
    const results = parseAmazonSearchHtml(sampleAmazonHtml, "heels");
    expect(results[0].product.categoryId).toBe("cat_fashion");
  });

  it("guarantees results for any query via live or resilient fallback", async () => {
    const results = await searchLiveAmazonIndia("heels");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].comparison.lowestOffer).toBeDefined();
    expect(results[0].comparison.lowestOffer?.price).toBeGreaterThan(0);
  });

  it("formats outbound Amazon URLs with the associate partner tag", () => {
    const adapter = new AmazonAdapter();
    const url = adapter.buildAffiliateUrl("https://www.amazon.in/dp/B0DFMGNY45", "df_web");
    expect(url).toContain("tag=dealfinderin-21");
    expect(url).toContain("ascsubtag=df_web");
  });
});
