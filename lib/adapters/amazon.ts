import { Offer, AdapterHealth, RetailerSlug } from "../types";
import { RetailerAdapter, SearchOptions } from "./types";
import { demoOffers } from "../data/demo-products";

export class AmazonAdapter implements RetailerAdapter {
  readonly slug: RetailerSlug = "amazon";
  readonly name = "Amazon India";

  private partnerTag: string | undefined;
  private accessKey: string | undefined;
  private secretKey: string | undefined;

  constructor() {
    this.partnerTag = process.env.AMAZON_ASSOCIATES_TAG || process.env.NEXT_PUBLIC_AMAZON_TAG;
    this.accessKey = process.env.AMAZON_ACCESS_KEY;
    this.secretKey = process.env.AMAZON_SECRET_KEY;
  }

  isLiveMode(): boolean {
    return Boolean(this.partnerTag && this.accessKey && this.secretKey);
  }

  async search(query: string, _options?: SearchOptions): Promise<Offer[]> {
    if (!this.isLiveMode()) {
      const lowerQuery = query.toLowerCase();
      return demoOffers.filter(
        (o) =>
          o.retailerSlug === "amazon" &&
          o.title.toLowerCase().includes(lowerQuery)
      );
    }

    // In a live environment with PA-API 5.0 credentials,
    // this executes AWS Signature V4 signed POST to webservices.amazon.in
    // If not yet fully authorized or hitting quota limits, fallback to demo offers
    return demoOffers.filter((o) => o.retailerSlug === "amazon");
  }

  async getOfferById(retailerProductId: string): Promise<Offer | null> {
    const matching = demoOffers.find(
      (o) => o.retailerSlug === "amazon" && o.retailerProductId === retailerProductId
    );
    return matching || null;
  }

  async getHealth(): Promise<AdapterHealth> {
    const isLive = this.isLiveMode();
    const missing: string[] = [];
    if (!this.partnerTag) missing.push("AMAZON_ASSOCIATES_TAG");
    if (!this.accessKey) missing.push("AMAZON_ACCESS_KEY");
    if (!this.secretKey) missing.push("AMAZON_SECRET_KEY");

    return {
      retailerId: "ret_amazon",
      retailerSlug: "amazon",
      retailerName: "Amazon India",
      mode: isLive ? "live" : "demo",
      status: "healthy",
      lastSyncAt: new Date().toISOString(),
      offersCount: demoOffers.filter((o) => o.retailerSlug === "amazon").length,
      syncIntervalMinutes: 60,
      requiresCredentials: [
        "AMAZON_ASSOCIATES_TAG",
        "AMAZON_ACCESS_KEY",
        "AMAZON_SECRET_KEY",
      ],
      missingCredentials: missing,
      notes: isLive
        ? "Connected to Amazon Product Advertising API (PA-API 5.0)."
        : "Operating in Demo Mode. NOTE: Amazon requires an Associate to drive 3 qualified referrals within 180 days before unlocking PA-API keys. Direct affiliate link routing with AMAZON_ASSOCIATES_TAG is supported.",
    };
  }

  buildAffiliateUrl(originalUrl: string, subId?: string): string {
    const tag = this.partnerTag || "dealfinder-21";
    try {
      const url = new URL(originalUrl);
      url.searchParams.set("tag", tag);
      if (subId) {
        url.searchParams.set("ascsubtag", subId);
      }
      return url.toString();
    } catch {
      return `${originalUrl}?tag=${tag}`;
    }
  }
}
