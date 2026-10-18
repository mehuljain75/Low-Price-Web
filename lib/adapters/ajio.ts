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
    const isLive = this.isLiveMode();
    const missing: string[] = [];
    if (!this.publisherId) missing.push("AJIO_AFFILIATE_ID / CUELINKS_PUBLISHER_ID");

    return {
      retailerId: "ret_ajio",
      retailerSlug: "ajio",
      retailerName: "AJIO India",
      mode: isLive ? "live" : "demo",
      status: "healthy",
      lastSyncAt: new Date().toISOString(),
      offersCount: demoOffers.filter((o) => o.retailerSlug === "ajio").length,
      syncIntervalMinutes: 120,
      requiresCredentials: ["AJIO_AFFILIATE_ID or CUELINKS_PUBLISHER_ID"],
      missingCredentials: missing,
      notes: isLive
        ? "Connected via AJIO Partner Network."
        : "Operating in Demo Mode. AJIO integrations require an active affiliate aggregator account (Cuelinks, InvolveAsia, or Admitad).",
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
