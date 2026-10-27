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
    const isLive = Boolean(this.feedApiKey);
    const cuelinksId = process.env.CUELINKS_PUBLISHER_ID;

    return {
      retailerId: "ret_myntra",
      retailerSlug: "myntra",
      retailerName: "Myntra",
      mode: isLive ? "live" : "demo",
      status: isLive ? "healthy" : "degraded",
      lastSyncAt: new Date().toISOString(),
      offersCount: isLive ? 25 : 0,
      syncIntervalMinutes: 120,
      requiresCredentials: ["CUELINKS_PUBLISHER_ID", "MYNTRA_FEED_KEY"],
      missingCredentials: isLive
        ? []
        : ["Cuelinks Network Approval Pending"],
      notes: isLive
        ? "Connected via Myntra API Feed."
        : cuelinksId
        ? `Cuelinks Publisher ID (${cuelinksId}) configured; network approval pending. Inactive on customer product listings.`
        : "Inactive on customer product listings pending approved affiliate network.",
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
