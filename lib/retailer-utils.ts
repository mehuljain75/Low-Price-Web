import { RetailerSlug } from "./types";

export interface RetailerMetadata {
  slug: RetailerSlug;
  name: string;
  shortCode: string;
  badgeLabel: string;
  buttonLabel: string;
  color: string;
  badgeBg: string;
  textColor: string;
  allowedDomains: string[];
  isVerified: boolean;
  status: "verified" | "partner_feed" | "pending_integration" | "unavailable";
}

export const RETAILER_METADATA_MAP: Record<RetailerSlug, RetailerMetadata> = {
  amazon: {
    slug: "amazon",
    name: "Amazon India",
    shortCode: "AMZ",
    badgeLabel: "Amazon Verified",
    buttonLabel: "Buy on Amazon",
    color: "#ff9900",
    badgeBg: "bg-amber-50 text-[#92400E] border-amber-200",
    textColor: "#111827",
    allowedDomains: ["amazon.in", "amzn.to", "amzn.in"],
    isVerified: true,
    status: "verified",
  },
  flipkart: {
    slug: "flipkart",
    name: "Flipkart",
    shortCode: "FK",
    badgeLabel: "Flipkart Listing",
    buttonLabel: "Buy on Flipkart",
    color: "#2874f0",
    badgeBg: "bg-blue-50 text-blue-800 border-blue-200",
    textColor: "#ffffff",
    allowedDomains: ["flipkart.com", "dl.flipkart.com"],
    isVerified: true,
    status: "partner_feed",
  },
  myntra: {
    slug: "myntra",
    name: "Myntra",
    shortCode: "MYN",
    badgeLabel: "Myntra Insider",
    buttonLabel: "Buy on Myntra",
    color: "#ff3f6c",
    badgeBg: "bg-pink-50 text-pink-800 border-pink-200",
    textColor: "#ffffff",
    allowedDomains: ["myntra.com"],
    isVerified: true,
    status: "partner_feed",
  },
  ajio: {
    slug: "ajio",
    name: "AJIO",
    shortCode: "AJIO",
    badgeLabel: "AJIO Trends",
    buttonLabel: "Buy on AJIO",
    color: "#2c4152",
    badgeBg: "bg-slate-100 text-slate-800 border-slate-300",
    textColor: "#ffffff",
    allowedDomains: ["ajio.com"],
    isVerified: true,
    status: "partner_feed",
  },
  meesho: {
    slug: "meesho",
    name: "Meesho",
    shortCode: "MSH",
    badgeLabel: "Meesho Verified",
    buttonLabel: "Buy on Meesho",
    color: "#e40066",
    badgeBg: "bg-rose-50 text-rose-800 border-rose-200",
    textColor: "#ffffff",
    allowedDomains: ["meesho.com"],
    isVerified: true,
    status: "partner_feed",
  },
};

/**
 * Returns complete metadata for any retailer slug with safe defaults
 */
export function getRetailerMetadata(slug?: string | null): RetailerMetadata {
  if (!slug) return RETAILER_METADATA_MAP.amazon;
  const normalized = slug.toLowerCase().trim() as RetailerSlug;
  return RETAILER_METADATA_MAP[normalized] || {
    slug: normalized,
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    shortCode: slug.slice(0, 3).toUpperCase(),
    badgeLabel: `${slug} Store`,
    buttonLabel: `Buy on ${slug.charAt(0).toUpperCase() + slug.slice(1)}`,
    color: "#6B7280",
    badgeBg: "bg-gray-100 text-gray-800 border-gray-200",
    textColor: "#ffffff",
    allowedDomains: [],
    isVerified: false,
    status: "pending_integration",
  };
}

/**
 * Validates that an outbound product URL matches the designated retailer domain
 */
export function isValidRetailerUrl(urlStr: string | undefined | null, retailerSlug: RetailerSlug): boolean {
  if (!urlStr || typeof urlStr !== "string") return false;
  try {
    const url = new URL(urlStr);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const hostname = url.hostname.toLowerCase();
    const meta = getRetailerMetadata(retailerSlug);
    return meta.allowedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}
