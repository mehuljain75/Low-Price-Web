import { RetailerSlug, AdapterHealth, Offer } from "../types";
import { RetailerAdapter, SearchOptions } from "./types";
import { FlipkartAdapter } from "./flipkart";
import { AmazonAdapter } from "./amazon";
import { MyntraAdapter } from "./myntra";
import { AjioAdapter } from "./ajio";
import { MeeshoAdapter } from "./meesho";

class AdapterRegistry {
  private adapters: Map<RetailerSlug, RetailerAdapter> = new Map();

  constructor() {
    this.register(new FlipkartAdapter());
    this.register(new AmazonAdapter());
    this.register(new MyntraAdapter());
    this.register(new AjioAdapter());
    this.register(new MeeshoAdapter());
  }

  register(adapter: RetailerAdapter) {
    this.adapters.set(adapter.slug, adapter);
  }

  get(slug: RetailerSlug): RetailerAdapter | undefined {
    return this.adapters.get(slug);
  }

  getAll(): RetailerAdapter[] {
    return Array.from(this.adapters.values());
  }

  async getAllHealth(): Promise<AdapterHealth[]> {
    const healthPromises = this.getAll().map((a) => a.getHealth());
    return Promise.all(healthPromises);
  }

  async searchAll(query: string, options?: SearchOptions): Promise<Offer[]> {
    const searchPromises = this.getAll().map((a) =>
      a.search(query, options).catch((err) => {
        console.error(`Error searching adapter ${a.slug}:`, err);
        return [] as Offer[];
      })
    );

    const results = await Promise.all(searchPromises);
    return results.flat();
  }

  buildOutboundUrl(retailerSlug: RetailerSlug, targetUrl: string, subId?: string): string {
    const adapter = this.get(retailerSlug);
    if (!adapter) return targetUrl;
    return adapter.buildAffiliateUrl(targetUrl, subId);
  }
}

// Global singleton instance
export const adapterRegistry = new AdapterRegistry();
