import { Offer, RetailerSlug, AdapterHealth } from "../types";

export interface SearchOptions {
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface RetailerAdapter {
  readonly slug: RetailerSlug;
  readonly name: string;
  isLiveMode(): boolean;
  search(query: string, options?: SearchOptions): Promise<Offer[]>;
  getOfferById(retailerProductId: string): Promise<Offer | null>;
  getHealth(): Promise<AdapterHealth>;
  buildAffiliateUrl(originalUrl: string, subId?: string): string;
}
