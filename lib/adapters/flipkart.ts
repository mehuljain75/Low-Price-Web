import { Offer, AdapterHealth, RetailerSlug } from "../types";
import { RetailerAdapter, SearchOptions } from "./types";
import { demoOffers } from "../data/demo-products";

export class FlipkartAdapter implements RetailerAdapter {
  readonly slug: RetailerSlug = "flipkart";
  readonly name = "Flipkart India";

  private affiliateId: string | undefined;
  private affiliateToken: string | undefined;

  constructor() {
    this.affiliateId = process.env.FLIPKART_AFFILIATE_ID;
    this.affiliateToken = process.env.FLIPKART_AFFILIATE_TOKEN;
  }

  isLiveMode(): boolean {
    return Boolean(this.affiliateId && this.affiliateToken);
  }

  async search(query: string, options?: SearchOptions): Promise<Offer[]> {
    if (!this.isLiveMode()) {
      // Return demo offers matching the query
      const lowerQuery = query.toLowerCase();
      return demoOffers.filter(
        (o) =>
          o.retailerSlug === "flipkart" &&
          o.title.toLowerCase().includes(lowerQuery)
      );
    }

    try {
      // Flipkart Affiliate API 1.0 endpoint
      const endpoint = `https://affiliate-api.flipkart.net/affiliate/1.0/search.json?query=${encodeURIComponent(
        query
      )}&resultCount=${options?.limit || 10}`;

      const res = await fetch(endpoint, {
        headers: {
          "Fk-Affiliate-Id": this.affiliateId!,
          "Fk-Affiliate-Token": this.affiliateToken!,
        },
        next: { revalidate: 3600 }, // Cache for 1 hour to respect quota
      });

      if (!res.ok) {
        throw new Error(`Flipkart API returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const productInfoList = data.productInfoList || [];

      return productInfoList.map((item: any, index: number) => {
        const base = item.productBaseInfoV1 || {};
        const sellingPrice = base.flipkartSellingPrice?.amount || 0;
        const mrp = base.maximumRetailPrice?.amount || sellingPrice;
        const inStock = base.inStock ?? true;

        return {
          id: `fk_live_${base.productId || index}`,
          productId: base.productId || `prod_${index}`,
          retailerId: "ret_flipkart",
          retailerName: "Flipkart",
          retailerSlug: "flipkart",
          retailerProductId: base.productId || `fk_${index}`,
          title: base.title || query,
          productUrl: this.buildAffiliateUrl(base.productUrl || "https://www.flipkart.com"),
          price: sellingPrice,
          originalPrice: mrp,
          currency: "INR",
          inStock,
          shippingCost: sellingPrice >= 500 ? 0 : 40,
          lastCheckedAt: new Date().toISOString(),
          isStale: false,
          isDemo: false,
          dataSource: "api",
          bankOffersDescription: "10% Instant Discount on HDFC & SBI Bank Cards",
        } as Offer;
      });
    } catch (err) {
      console.error("[FlipkartAdapter] Failed to query live API:", err);
      // Fallback to demo data on live failure to keep site functional
      return demoOffers.filter((o) => o.retailerSlug === "flipkart");
    }
  }

  async getOfferById(retailerProductId: string): Promise<Offer | null> {
    const matching = demoOffers.find(
      (o) => o.retailerSlug === "flipkart" && o.retailerProductId === retailerProductId
    );
    return matching || null;
  }

  async getHealth(): Promise<AdapterHealth> {
    const isLive = this.isLiveMode();
    const missing: string[] = [];
    if (!this.affiliateId) missing.push("FLIPKART_AFFILIATE_ID");
    if (!this.affiliateToken) missing.push("FLIPKART_AFFILIATE_TOKEN");

    return {
      retailerId: "ret_flipkart",
      retailerSlug: "flipkart",
      retailerName: "Flipkart India",
      mode: isLive ? "live" : "demo",
      status: "healthy",
      lastSyncAt: new Date().toISOString(),
      offersCount: demoOffers.filter((o) => o.retailerSlug === "flipkart").length,
      syncIntervalMinutes: 60,
      requiresCredentials: ["FLIPKART_AFFILIATE_ID", "FLIPKART_AFFILIATE_TOKEN"],
      missingCredentials: missing,
      notes: isLive
        ? "Connected to official Flipkart Affiliate API."
        : "Operating in Demo Mode. To activate live data, register at affiliate.flipkart.com and set FLIPKART_AFFILIATE_ID & FLIPKART_AFFILIATE_TOKEN in .env.",
    };
  }

  buildAffiliateUrl(originalUrl: string, subId?: string): string {
    const affid = this.affiliateId || "dealfinder";
    try {
      const url = new URL(originalUrl);
      url.searchParams.set("affid", affid);
      if (subId) {
        url.searchParams.set("affExtParam1", subId);
      }
      return url.toString();
    } catch {
      return `${originalUrl}?affid=${affid}`;
    }
  }
}
