export const ALLOWED_REDIRECT_DOMAINS = [
  "amazon.in",
  "amazon.com",
  "amzn.to",
  "amzn.in",
  "flipkart.com",
  "myntra.com",
  "ajio.com",
  "meesho.com",
  "linksredirect.com",
];

export function isAllowedTargetUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_REDIRECT_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Validates whether an ASIN is an authentic 10-character Amazon India registered product code.
 * Synthetic ASINs synthesized from category templates (e.g. B0FASERI00014, B0MOBSAM001) are strictly rejected.
 */
export function isGenuineAmazonAsin(asin: string): boolean {
  if (!asin || typeof asin !== "string") return false;
  const clean = asin.trim();
  // Authentic Amazon India ASINs are strictly 10 characters long, start with B0, and contain only [A-Z0-9]
  if (clean.length !== 10) return false;
  if (!/^B0[A-Z0-9]{8}$/.test(clean)) return false;
  // Exclude our template-synthesized category codes: B0FAS..., B0MOB..., B0LAP..., B0AUD..., B0APP..., B0BEA...
  if (/^B0(FAS|MOB|LAP|AUD|APP|BEA)/i.test(clean)) return false;
  return true;
}

/**
 * Builds a safe Amazon India destination URL.
 * Authentic ASINs route to /dp/${asin}.
 * Synthetic or non-standard ASINs route to Amazon India search (/s?k=...) with product title to guarantee ZERO 404s.
 */
export function buildSafeAmazonUrl(asinOrUrl: string, title?: string): string {
  if (!asinOrUrl) {
    const query = title?.trim() || "deals";
    return `https://www.amazon.in/s?k=${encodeURIComponent(query)}&tag=dealfinderin-21`;
  }

  // 1. If an Amazon product DP link was passed
  if (asinOrUrl.includes("amazon.in/dp/")) {
    const match = asinOrUrl.match(/amazon\.in\/dp\/([A-Za-z0-9_]+)/);
    const rawCode = match ? match[1] : "";
    if (isGenuineAmazonAsin(rawCode)) {
      return `https://www.amazon.in/dp/${rawCode}`;
    }
    const query = title?.trim() || (rawCode ? rawCode.replace(/^B0(FAS|MOB|LAP|AUD|APP|BEA)/i, "") : "") || "deals";
    return `https://www.amazon.in/s?k=${encodeURIComponent(query)}&tag=dealfinderin-21`;
  }

  // 2. If it's already an Amazon search URL
  if (asinOrUrl.includes("amazon.in/s?") || asinOrUrl.includes("amazon.in/s/")) {
    return asinOrUrl;
  }

  // 3. If raw ASIN / identifier was passed
  const cleanAsin = asinOrUrl.trim().replace(/^prod_amz_/, "").replace(/^off_amz_/, "");
  const baseAsin = cleanAsin.split("_")[0];
  if (isGenuineAmazonAsin(baseAsin)) {
    return `https://www.amazon.in/dp/${baseAsin}`;
  }

  const query = title?.trim() || (cleanAsin ? cleanAsin.replace(/^B0(FAS|MOB|LAP|AUD|APP|BEA)/i, "") : "") || "deals";
  return `https://www.amazon.in/s?k=${encodeURIComponent(query)}&tag=dealfinderin-21`;
}

