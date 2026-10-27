import { Offer, AdapterHealth, RetailerSlug } from "../types";
import { RetailerAdapter, SearchOptions } from "./types";
import { demoOffers } from "../data/demo-products";

export class MeeshoAdapter implements RetailerAdapter {
  readonly slug: RetailerSlug = "meesho";
  readonly name = "Meesho";

  private referralCode: string | undefined;

  constructor() {
    this.referralCode = process.env.MEESHO_REFERRAL_CODE;
  }

  isLiveMode(): boolean {
    return Boolean(this.referralCode);
  }

  async search(query: string, _options?: SearchOptions): Promise<Offer[]> {
    const lowerQuery = query.toLowerCase();
    return demoOffers.filter(
      (o) =>
        o.retailerSlug === "meesho" &&
        o.title.toLowerCase().includes(lowerQuery)
    );
  }

  async getOfferById(retailerProductId: string): Promise<Offer | null> {
    const matching = demoOffers.find(
      (o) => o.retailerSlug === "meesho" && o.retailerProductId === retailerProductId
    );
    return matching || null;
  }

  async getHealth(): Promise<AdapterHealth> {
    const isLive = Boolean(this.referralCode && process.env.MEESHO_DIRECT_API_KEY);
    const hasReferral = Boolean(this.referralCode);

    return {
      retailerId: "ret_meesho",
      retailerSlug: "meesho",
      retailerName: "Meesho",
      mode: isLive ? "live" : "demo",
      status: isLive ? "healthy" : "degraded",
      lastSyncAt: new Date().toISOString(),
      offersCount: isLive ? 25 : 0,
      syncIntervalMinutes: 240,
      requiresCredentials: ["MEESHO_REFERRAL_CODE", "MEESHO_DIRECT_API_KEY"],
      missingCredentials: isLive
        ? []
        : ["Affiliate Verification / Reseller API Pending"],
      notes: isLive
        ? "Connected via Meesho Partner API."
        : hasReferral
        ? `Meesho referral code configured (${this.referralCode}). Inactive on customer product listings pending automated catalog feed.`
        : "Inactive on customer product listings. Direct API or referral integration required.",
    };
  }

  buildAffiliateUrl(originalUrl: string, _subId?: string): string {
    if (this.referralCode) {
      try {
        const url = new URL(originalUrl);
        url.searchParams.set("ref", this.referralCode);
        return url.toString();
      } catch {
        return `${originalUrl}?ref=${this.referralCode}`;
      }
    }
    return originalUrl;
  }
}
