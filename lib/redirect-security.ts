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
  if (!urlStr || typeof urlStr !== "string") return false;
  try {
    const trimmed = urlStr.trim();
    // Reject control characters or whitespace
    if (/[\s\u0000-\u001F\u007F-\u009F]/.test(trimmed)) {
      return false;
    }

    const parsed = new URL(trimmed);

    // Require strict HTTPS protocol
    if (parsed.protocol !== "https:") {
      return false;
    }

    // Reject userinfo (e.g. https://user:pass@amazon.in or https://amazon.in@attacker.com)
    if (parsed.username || parsed.password) {
      return false;
    }

    // Reject non-standard ports (anything other than 443 or empty)
    if (parsed.port && parsed.port !== "443") {
      return false;
    }

    // Clean hostname: strip trailing dot if present
    let hostname = parsed.hostname.toLowerCase();
    if (hostname.endsWith(".")) {
      hostname = hostname.slice(0, -1);
    }

    // Hostname must strictly match an allowed domain or an approved subdomain (.domain)
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
 * Catalog ASINs confirmed on 2026-11-04 to open the same product on amazon.in (page exists
 * and its title matches our listing). Most hand-entered catalog ASINs were dead or pointed at
 * unrelated products (e.g. a running-shoe listing opened a gemstone), so only these are sent
 * to a product page. Products from the live Product Advertising API carry their own trusted
 * link and don't need to be listed here. See catalog-link-audit.md for the full check.
 */
export const VERIFIED_PRODUCT_ASINS = new Set<string>([
  "B08THTHDVH", // Bata Women's Block Heel Sandal
  "B09G9BL5CP", // Apple iPhone 13
  "B09N3ZNHTY", // boAt Airdopes 141
  "B09TVVGXWS", // OnePlus Bullets Wireless Z2
  "B09XS7JWHH", // Sony WH-1000XM5
  "B0BDK62PDX", // Apple iPhone 14
  "B0C3WBJPSR", // Marc Loire Pointed Toe Block Heel Sandals
  "B0C4TKV717", // Theater Mary Jane Block Heels
  "B0C7CCSQZL", // Metro Women's Block Heel Sandals
  "B0C8TLJ4ND", // Mochi Women Wedge Heel Sandal
  "B0CHJJZ9G8", // Acer Nitro V Gaming Laptop
  "B0CHX1W1XY", // Apple iPhone 15
  "B0CNKMDY5R", // Inc.5 Wedge Sandals
  "B0DCVXKKJG", // Carlton London Block Heel Pumps
  "B0DFMGNY45", // TRASE Transparent Block Heels
  "B0FK2P93T5", // Shoetopia Ankle Strap Block Heels
  "B0FMS373M7", // Samsung Galaxy Book4
  "B0FR561MLB", // Theater Twiggy Slingback Block Heels
  "B0GYRRLP87", // Samsung 55" Crystal 4K Smart TV
  "B0HK7K5TH4", // LG 55" OLED evo TV
]);

/**
 * Keeps "Buy on Amazon" honest: an amazon.in/dp/ link is kept only when the ASIN is verified
 * (or came from the live Product Advertising API); otherwise the shopper is sent to an Amazon
 * search for the exact product name instead of a "Page Not Found" or the wrong product.
 */
export function ensureReachableAmazonUrl(url: string, productTitle: string, trustLiveAsin = false): string {
  const match = url.match(/amazon\.in\/(?:[^/?]+\/)?dp\/([A-Za-z0-9]{10})/);
  if (!match || trustLiveAsin || VERIFIED_PRODUCT_ASINS.has(match[1].toUpperCase())) {
    return url;
  }
  const query = productTitle.trim() || match[1];
  return `https://www.amazon.in/s?k=${encodeURIComponent(query)}&tag=dealfinderin-21`;
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

