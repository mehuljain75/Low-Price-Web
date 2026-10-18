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
    const isLive = this.isLiveMode();
    const missing: string[] = [];
    if (!this.referralCode) missing.push("MEESHO_REFERRAL_CODE");

    return {
      retailerId: "ret_meesho",
      retailerSlug: "meesho",
      retailerName: "Meesho",
      mode: isLive ? "live" : "demo",
      status: "healthy",
      lastSyncAt: new Date().toISOString(),
      offersCount: demoOffers.filter((o) => o.retailerSlug === "meesho").length,
      syncIntervalMinutes: 240,
      requiresCredentials: ["MEESHO_REFERRAL_CODE or EarnKaro link routing"],
      missingCredentials: missing,
      notes: isLive
        ? "Connected via Meesho referral link routing."
        : "Operating in Demo Mode. Meesho does not offer an official public developer API. Commercial links use Meesho Reseller/Referral IDs or EarnKaro.",
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
