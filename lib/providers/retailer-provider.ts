import { Product, Offer, RetailerSlug, AdapterHealth, DataProvenance } from "../types";

export type { DataProvenance };
export type ProviderStatus = "active" | "inactive" | "pending_approval" | "failed";

export interface ProviderSearchOptions {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  limit?: number;
  page?: number;
}

export interface RetailerProvider {
  readonly slug: RetailerSlug;
  readonly name: string;
  readonly status: ProviderStatus;
  readonly isCustomerFacingActive: boolean;

  search(query: string, options?: ProviderSearchOptions): Promise<Offer[]>;
  getOfferById(retailerProductId: string): Promise<Offer | null>;
  getHealth(): Promise<AdapterHealth>;
  buildAffiliateUrl(originalUrl: string, subId?: string): string;
}

export interface ProviderRegistry {
  getProvider(slug: RetailerSlug): RetailerProvider | undefined;
  getActiveProviders(): RetailerProvider[];
  getAllProviders(): RetailerProvider[];
  buildOutboundUrl(slug: RetailerSlug, targetUrl: string, subId?: string): string;
}

/**
 * Amazon Provider: The primary and currently active provider for DealFinder India.
 * Authenticated via Amazon Associates Tag and PA-API 5.0 (when credentials provided).
 */
export class AmazonProvider implements RetailerProvider {
  readonly slug: RetailerSlug = "amazon";
  readonly name = "Amazon India";
  readonly isCustomerFacingActive = true;

  private partnerTag: string;
  private accessKey?: string;
  private secretKey?: string;

  constructor() {
    this.partnerTag =
      process.env.AMAZON_ASSOCIATES_TAG ||
      process.env.NEXT_PUBLIC_AMAZON_TAG ||
      "dealfinderin-21";
    this.accessKey = process.env.AMAZON_ACCESS_KEY;
    this.secretKey = process.env.AMAZON_SECRET_KEY;
  }

  get status(): ProviderStatus {
    if (this.accessKey && this.secretKey) {
      return "active";
    }
    return "active";
  }

  isLivePAAPI(): boolean {
    return Boolean(this.accessKey && this.secretKey);
  }

  async search(query: string, options?: ProviderSearchOptions): Promise<Offer[]> {
    const { searchAmazonCatalog } = await import("../services/amazon-search");
    const results = await searchAmazonCatalog(query, options);
    return results.flatMap((r) => r.offers);
  }

  async getOfferById(retailerProductId: string): Promise<Offer | null> {
    const { getLiveOfferById } = await import("../services/amazon-search");
    const found = getLiveOfferById(retailerProductId) || getLiveOfferById(`off_amz_${retailerProductId}`);
    return found || null;
  }

  async getHealth(): Promise<AdapterHealth> {
    const hasKeys = this.isLivePAAPI();
    const missing: string[] = [];
    if (!this.accessKey) missing.push("AMAZON_ACCESS_KEY");
    if (!this.secretKey) missing.push("AMAZON_SECRET_KEY");

    return {
      retailerId: "ret_amazon",
      retailerSlug: "amazon",
      retailerName: "Amazon India",
      mode: hasKeys ? "live" : "demo",
      status: "healthy",
      lastSyncAt: new Date().toISOString(),
      offersCount: 80,
      syncIntervalMinutes: 60,
      requiresCredentials: [
        "AMAZON_ASSOCIATES_TAG",
        "AMAZON_ACCESS_KEY",
        "AMAZON_SECRET_KEY",
      ],
      missingCredentials: missing,
      notes: hasKeys
        ? "Connected to Amazon Product Advertising API (PA-API 5.0) with AWS SigV4 authentication."
        : "Associates tracking active with tag 'dealfinderin-21'. PA-API 5.0 keys pending (Amazon unlocks keys after 3 qualified referrals within 180 days). Serving verified authentic Amazon India catalog.",
    };
  }

  buildAffiliateUrl(originalUrl: string, subId?: string): string {
    const tag = this.partnerTag;
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

/**
 * Abstract Cuelinks Retailer Provider base class.
 * Ensures Flipkart, Myntra, AJIO, and Meesho remain inactive on customer-facing
 * pages while Cuelinks approval is pending.
 */
abstract class CuelinksRetailerProvider implements RetailerProvider {
  abstract readonly slug: RetailerSlug;
  abstract readonly name: string;
  abstract readonly baseUrl: string;
  readonly isCustomerFacingActive = false;

  protected publisherId: string | undefined;

  constructor() {
    this.publisherId = process.env.CUELINKS_PUBLISHER_ID || "281629";
  }

  get status(): ProviderStatus {
    return "pending_approval";
  }

  async search(_query: string, _options?: ProviderSearchOptions): Promise<Offer[]> {
    return [];
  }

  async getOfferById(_retailerProductId: string): Promise<Offer | null> {
    return null;
  }

  abstract getHealth(): Promise<AdapterHealth>;

  buildAffiliateUrl(originalUrl: string, subId: string = "df_web"): string {
    if (this.publisherId) {
      return `https://linksredirect.com/?cid=${this.publisherId}&subid=${encodeURIComponent(
        subId
      )}&url=${encodeURIComponent(originalUrl)}`;
    }
    return originalUrl;
  }
}

export class FlipkartProvider extends CuelinksRetailerProvider {
  readonly slug: RetailerSlug = "flipkart";
  readonly name = "Flipkart";
  readonly baseUrl = "https://www.flipkart.com";

  async getHealth(): Promise<AdapterHealth> {
    return {
      retailerId: "ret_flipkart",
      retailerSlug: "flipkart",
      retailerName: "Flipkart",
      mode: "demo",
      status: "degraded",
      lastSyncAt: new Date().toISOString(),
      offersCount: 0,
      syncIntervalMinutes: 120,
      requiresCredentials: ["CUELINKS_PUBLISHER_ID", "FLIPKART_AFFILIATE_ID"],
      missingCredentials: ["Cuelinks Network Approval Pending"],
      notes: "Integration inactive on customer listings pending Cuelinks network approval. Outbound redirection ready.",
    };
  }

  override buildAffiliateUrl(originalUrl: string, subId: string = "df_web"): string {
    const affiliateId = process.env.FLIPKART_AFFILIATE_ID || "dealfinder";
    if (this.publisherId) {
      return super.buildAffiliateUrl(originalUrl, subId);
    }
    try {
      const url = new URL(originalUrl);
      url.searchParams.set("affid", affiliateId);
      url.searchParams.set("affExtParam1", subId);
      return url.toString();
    } catch {
      return `${originalUrl}?affid=${affiliateId}&affExtParam1=${subId}`;
    }
  }
}

export class MyntraProvider extends CuelinksRetailerProvider {
  readonly slug: RetailerSlug = "myntra";
  readonly name = "Myntra";
  readonly baseUrl = "https://www.myntra.com";

  async getHealth(): Promise<AdapterHealth> {
    return {
      retailerId: "ret_myntra",
      retailerSlug: "myntra",
      retailerName: "Myntra",
      mode: "demo",
      status: "degraded",
      lastSyncAt: new Date().toISOString(),
      offersCount: 0,
      syncIntervalMinutes: 120,
      requiresCredentials: ["CUELINKS_PUBLISHER_ID"],
      missingCredentials: ["Cuelinks Network Approval Pending"],
      notes: "Integration inactive on customer listings pending Cuelinks network approval. Outbound redirection ready.",
    };
  }
}

export class AjioProvider extends CuelinksRetailerProvider {
  readonly slug: RetailerSlug = "ajio";
  readonly name = "AJIO";
  readonly baseUrl = "https://www.ajio.com";

  async getHealth(): Promise<AdapterHealth> {
    return {
      retailerId: "ret_ajio",
      retailerSlug: "ajio",
      retailerName: "AJIO",
      mode: "demo",
      status: "degraded",
      lastSyncAt: new Date().toISOString(),
      offersCount: 0,
      syncIntervalMinutes: 120,
      requiresCredentials: ["CUELINKS_PUBLISHER_ID"],
      missingCredentials: ["Cuelinks Network Approval Pending"],
      notes: "Integration inactive on customer listings pending Cuelinks network approval. Outbound redirection ready.",
    };
  }
}

export class MeeshoProvider extends CuelinksRetailerProvider {
  readonly slug: RetailerSlug = "meesho";
  readonly name = "Meesho";
  readonly baseUrl = "https://www.meesho.com";

  async getHealth(): Promise<AdapterHealth> {
    return {
      retailerId: "ret_meesho",
      retailerSlug: "meesho",
      retailerName: "Meesho",
      mode: "demo",
      status: "degraded",
      lastSyncAt: new Date().toISOString(),
      offersCount: 0,
      syncIntervalMinutes: 120,
      requiresCredentials: ["MEESHO_REFERRAL_CODE"],
      missingCredentials: ["Referral Program Verification Pending"],
      notes: "Integration inactive on customer listings pending affiliate verification.",
    };
  }
}

class ProviderRegistryImpl implements ProviderRegistry {
  private providers = new Map<RetailerSlug, RetailerProvider>();

  constructor() {
    this.register(new AmazonProvider());
    this.register(new FlipkartProvider());
    this.register(new MyntraProvider());
    this.register(new AjioProvider());
    this.register(new MeeshoProvider());
  }

  register(provider: RetailerProvider) {
    this.providers.set(provider.slug, provider);
  }

  getProvider(slug: RetailerSlug): RetailerProvider | undefined {
    return this.providers.get(slug);
  }

  getActiveProviders(): RetailerProvider[] {
    return Array.from(this.providers.values()).filter((p) => p.isCustomerFacingActive);
  }

  getAllProviders(): RetailerProvider[] {
    return Array.from(this.providers.values());
  }

  buildOutboundUrl(slug: RetailerSlug, targetUrl: string, subId?: string): string {
    const provider = this.getProvider(slug);
    if (provider) {
      return provider.buildAffiliateUrl(targetUrl, subId);
    }
    return targetUrl;
  }
}

export const providerRegistry = new ProviderRegistryImpl();
