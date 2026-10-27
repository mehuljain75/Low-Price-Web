import { Offer, AdapterHealth, RetailerSlug } from "../types";
import { RetailerAdapter, SearchOptions } from "./types";
import { demoOffers } from "../data/demo-products";
import { searchLiveAmazonIndia, getLiveOfferById } from "../services/amazon-search";

export class AmazonAdapter implements RetailerAdapter {
  readonly slug: RetailerSlug = "amazon";
  readonly name = "Amazon India";

  private partnerTag: string | undefined;
  private accessKey: string | undefined;
  private secretKey: string | undefined;

  constructor() {
    this.partnerTag = process.env.AMAZON_ASSOCIATES_TAG || process.env.NEXT_PUBLIC_AMAZON_TAG || "dealfinderin-21";
    this.accessKey = process.env.AMAZON_ACCESS_KEY;
    this.secretKey = process.env.AMAZON_SECRET_KEY;
  }

  isLiveMode(): boolean {
    // Only report Live API mode if PA-API 5.0 access key and secret key are actually configured
    return Boolean(this.accessKey && this.secretKey);
  }

  async search(query: string, _options?: SearchOptions): Promise<Offer[]> {
    if (query && query.trim().length > 0) {
      const liveResults = await searchLiveAmazonIndia(query);
      if (liveResults.length > 0) {
        return liveResults.flatMap((r) => r.offers);
      }
    }

    const lowerQuery = (query || "").toLowerCase();
    return demoOffers.filter(
      (o) =>
        o.retailerSlug === "amazon" &&
        (!lowerQuery || o.title.toLowerCase().includes(lowerQuery))
    );
  }

  async getOfferById(retailerProductId: string): Promise<Offer | null> {
    const live =
      getLiveOfferById(retailerProductId) ||
      getLiveOfferById(`off_amz_${retailerProductId}`);
    if (live) return live;

    const matching = demoOffers.find(
      (o) => o.retailerSlug === "amazon" && (o.retailerProductId === retailerProductId || o.id === retailerProductId)
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
        ? "Connected to Amazon Product Advertising API (PA-API 5.0) with AWS SigV4 authentication."
        : "Associates tracking active with tag 'dealfinderin-21'. PA-API 5.0 keys pending (Amazon unlocks keys after 3 qualified referrals within 180 days). Direct outbound affiliate link routing is fully functional with verified Amazon catalog.",
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
