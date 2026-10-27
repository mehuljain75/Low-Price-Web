import { Offer, AdapterHealth, RetailerSlug } from "../types";
import { RetailerAdapter, SearchOptions } from "./types";
import { demoOffers } from "../data/demo-products";

export class AjioAdapter implements RetailerAdapter {
  readonly slug: RetailerSlug = "ajio";
  readonly name = "AJIO";

  private publisherId: string | undefined;

  constructor() {
    this.publisherId = process.env.AJIO_AFFILIATE_ID || process.env.CUELINKS_PUBLISHER_ID;
  }

  isLiveMode(): boolean {
    return Boolean(this.publisherId);
  }

  async search(query: string, _options?: SearchOptions): Promise<Offer[]> {
    const lowerQuery = query.toLowerCase();
    return demoOffers.filter(
      (o) =>
        o.retailerSlug === "ajio" &&
        o.title.toLowerCase().includes(lowerQuery)
    );
  }

  async getOfferById(retailerProductId: string): Promise<Offer | null> {
    const matching = demoOffers.find(
      (o) => o.retailerSlug === "ajio" && o.retailerProductId === retailerProductId
    );
    return matching || null;
  }

  async getHealth(): Promise<AdapterHealth> {
    const isLive = Boolean(process.env.AJIO_DIRECT_API_KEY);
    const cuelinksId = process.env.CUELINKS_PUBLISHER_ID;

    return {
      retailerId: "ret_ajio",
      retailerSlug: "ajio",
      retailerName: "AJIO India",
      mode: isLive ? "live" : "demo",
      status: isLive ? "healthy" : "degraded",
      lastSyncAt: new Date().toISOString(),
      offersCount: isLive ? 25 : 0,
      syncIntervalMinutes: 120,
      requiresCredentials: ["CUELINKS_PUBLISHER_ID", "AJIO_AFFILIATE_ID"],
      missingCredentials: isLive
        ? []
        : ["Cuelinks Network Approval Pending"],
      notes: isLive
        ? "Connected via AJIO Partner Network."
        : cuelinksId
        ? `Cuelinks Publisher ID (${cuelinksId}) configured; network approval pending. Inactive on customer product listings.`
        : "Inactive on customer product listings pending approved affiliate network.",
    };
  }

  buildAffiliateUrl(originalUrl: string, subId?: string): string {
    if (this.publisherId) {
      const encUrl = encodeURIComponent(originalUrl);
      const sub = subId ? `&subid=${encodeURIComponent(subId)}` : "";
      return `https://linksredirect.com/?cid=${this.publisherId}${sub}&url=${encUrl}`;
    }
    return originalUrl;
  }
}
