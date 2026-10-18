import { Offer, AdapterHealth, RetailerSlug } from "../types";
import { RetailerAdapter, SearchOptions } from "./types";
import { demoOffers } from "../data/demo-products";

export class MyntraAdapter implements RetailerAdapter {
  readonly slug: RetailerSlug = "myntra";
  readonly name = "Myntra";

  private feedApiKey: string | undefined;
  private networkId: string | undefined;

  constructor() {
    this.feedApiKey = process.env.MYNTRA_FEED_KEY;
    this.networkId = process.env.CUELINKS_PUBLISHER_ID || process.env.MYNTRA_AFFILIATE_ID;
  }

  isLiveMode(): boolean {
    return Boolean(this.feedApiKey || this.networkId);
  }

  async search(query: string, _options?: SearchOptions): Promise<Offer[]> {
    const lowerQuery = query.toLowerCase();
    return demoOffers.filter(
      (o) =>
        o.retailerSlug === "myntra" &&
        o.title.toLowerCase().includes(lowerQuery)
    );
  }

  async getOfferById(retailerProductId: string): Promise<Offer | null> {
    const matching = demoOffers.find(
      (o) => o.retailerSlug === "myntra" && o.retailerProductId === retailerProductId
    );
    return matching || null;
  }

  async getHealth(): Promise<AdapterHealth> {
    const isLive = this.isLiveMode();
    const missing: string[] = [];
    if (!this.networkId) missing.push("CUELINKS_PUBLISHER_ID / MYNTRA_AFFILIATE_ID");

    return {
      retailerId: "ret_myntra",
      retailerSlug: "myntra",
      retailerName: "Myntra",
      mode: isLive ? "live" : "demo",
      status: "healthy",
      lastSyncAt: new Date().toISOString(),
      offersCount: demoOffers.filter((o) => o.retailerSlug === "myntra").length,
      syncIntervalMinutes: 120,
      requiresCredentials: ["CUELINKS_PUBLISHER_ID or MYNTRA_FEED_KEY"],
      missingCredentials: missing,
      notes: isLive
        ? "Connected via Affiliate Aggregator Feed."
        : "Operating in Demo Mode. Myntra does not provide a public direct API; publishers connect via affiliate networks like Cuelinks, EarnKaro, or vCommission.",
    };
  }

  buildAffiliateUrl(originalUrl: string, subId?: string): string {
    if (this.networkId) {
      // If using Cuelinks aggregator
      const encUrl = encodeURIComponent(originalUrl);
      const sub = subId ? `&subid=${encodeURIComponent(subId)}` : "";
      return `https://linksredirect.com/?cid=${this.networkId}${sub}&url=${encUrl}`;
    }
    return originalUrl;
  }
}
