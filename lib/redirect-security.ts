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
