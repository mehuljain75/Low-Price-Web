export type RetailerSlug = 'amazon' | 'flipkart' | 'myntra' | 'ajio' | 'meesho';

export type AdapterType = 'flipkart_api' | 'amazon_api' | 'feed_affiliate' | 'demo';

export interface Retailer {
  id: string;
  name: string;
  slug: RetailerSlug;
  logoText: string;
  color: string;
  badgeBg: string;
  baseUrl: string;
  affiliateTagParam: string;
  adapterType: AdapterType;
  isActive: boolean;
  statusMessage?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  featured?: boolean;
}

export interface ProductVariantAttributes {
  color?: string;
  storage?: string;
  ram?: string;
  size?: string;
  weight?: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  brand: string;
  categoryId: string;
  modelNumber?: string;
  gtin?: string; // EAN/UPC
  description: string;
  imageUrl: string;
  attributes: ProductVariantAttributes;
  rating?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  productId: string;
  retailerId: string;
  retailerName: string;
  retailerSlug: RetailerSlug;
  retailerProductId: string;
  title: string;
  productUrl: string;
  price: number; // In INR (₹)
  originalPrice: number; // MRP in INR
  currency: 'INR';
  inStock: boolean;
  shippingCost: number; // 0 for free shipping
  lastCheckedAt: string; // ISO 8601
  isStale: boolean; // Flagged if older than threshold (e.g. 24h)
  isDemo: boolean; // Explicit flag for fictional demo data
  dataSource: 'demo' | 'api' | 'feed' | 'manual';
  deliveryTimeEstimate?: string;
  bankOffersDescription?: string;
}

export interface PriceComparison {
  product: Product;
  category?: Category;
  offers: Offer[];
  lowestOffer: Offer | null;
  highestDiscountOffer: Offer | null;
  trackedStoresCount: number;
  savingsAmount: number;
  savingsPercentage: number;
  hasStalePrices: boolean;
  priceRange: {
    min: number;
    max: number;
  };
}

export interface SaleEvent {
  id: string;
  title: string;
  retailerSlug: RetailerSlug;
  retailerName: string;
  startDate: string;
  endDate: string;
  badge: string;
  bannerGradient: string;
  description: string;
  categories: string[];
  discountHighlight: string;
  status: 'live' | 'upcoming' | 'ended';
  tips: string[];
}

export interface AdapterHealth {
  retailerId: string;
  retailerSlug: RetailerSlug;
  retailerName: string;
  mode: 'live' | 'demo' | 'misconfigured';
  status: 'healthy' | 'degraded' | 'offline';
  lastSyncAt: string;
  offersCount: number;
  syncIntervalMinutes: number;
  requiresCredentials: string[];
  missingCredentials: string[];
  notes: string;
}
