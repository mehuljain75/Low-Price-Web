import { describe, it, expect } from "vitest";
import { getRetailerMetadata, isValidRetailerUrl, RETAILER_METADATA } from "../lib/retailer-utils";

describe("Retailer Metadata and Redirect Security (Bug 1 & 8 Fix Verification)", () => {
  it("provides correct branding, badges, and button labels for each retailer", () => {
    const flipkartMeta = getRetailerMetadata("flipkart");
    expect(flipkartMeta.shortCode).toBe("FK");
    expect(flipkartMeta.buttonLabel).toBe("Buy on Flipkart");
    expect(flipkartMeta.badgeLabel).toBe("Flipkart Listing");

    const amazonMeta = getRetailerMetadata("amazon");
    expect(amazonMeta.shortCode).toBe("AMZ");
    expect(amazonMeta.buttonLabel).toBe("Buy on Amazon");
    expect(amazonMeta.badgeLabel).toBe("Amazon Verified");

    const myntraMeta = getRetailerMetadata("myntra");
    expect(myntraMeta.shortCode).toBe("MYN");
    expect(myntraMeta.buttonLabel).toBe("Buy on Myntra");

    const ajioMeta = getRetailerMetadata("ajio");
    expect(ajioMeta.shortCode).toBe("AJIO");
    expect(ajioMeta.buttonLabel).toBe("Buy on AJIO");

    const meeshoMeta = getRetailerMetadata("meesho");
    expect(meeshoMeta.shortCode).toBe("MSH");
    expect(meeshoMeta.buttonLabel).toBe("Buy on Meesho");
  });

  it("validates retailer destination URLs strictly against authorized domains", () => {
    // Valid Flipkart URLs
    expect(isValidRetailerUrl("https://www.flipkart.com/item/p/123", "flipkart")).toBe(true);
    expect(isValidRetailerUrl("https://dl.flipkart.com/dl/item", "flipkart")).toBe(true);

    // Valid Amazon URLs
    expect(isValidRetailerUrl("https://www.amazon.in/dp/B08KHKG49Y", "amazon")).toBe(true);
    expect(isValidRetailerUrl("https://amzn.to/3xyz", "amazon")).toBe(true);

    // Cross-domain mismatch / phishing attempts
    expect(isValidRetailerUrl("https://www.amazon.in/dp/B08KHKG49Y", "flipkart")).toBe(false);
    expect(isValidRetailerUrl("https://www.flipkart.com/dp/123", "amazon")).toBe(false);
    expect(isValidRetailerUrl("https://malicious-site.com/redirect", "amazon")).toBe(false);
    expect(isValidRetailerUrl("javascript:alert(1)", "amazon")).toBe(false);
  });
});
