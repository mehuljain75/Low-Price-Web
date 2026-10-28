import { NextRequest, NextResponse } from "next/server";
import { demoOffers } from "@/lib/data/demo-products";
import { adapterRegistry } from "@/lib/adapters/registry";
import { RetailerSlug } from "@/lib/types";
import { findCuratedItemByAsin } from "@/lib/services/amazon-search";

export const dynamic = "force-dynamic";

function inferRetailerSlug(offerId: string, urlStr?: string): RetailerSlug {
  if (urlStr) {
    try {
      const hostname = new URL(urlStr).hostname.toLowerCase();
      if (hostname.includes("flipkart")) return "flipkart";
      if (hostname.includes("myntra")) return "myntra";
      if (hostname.includes("ajio")) return "ajio";
      if (hostname.includes("meesho")) return "meesho";
      if (hostname.includes("amazon") || hostname.includes("amzn")) return "amazon";
    } catch {
      // ignore
    }
  }

  if (offerId.startsWith("off_fk_") || offerId.includes("_fk")) return "flipkart";
  if (offerId.startsWith("off_myntra_") || offerId.includes("_myntra")) return "myntra";
  if (offerId.startsWith("off_ajio_") || offerId.includes("_ajio")) return "ajio";
  if (offerId.startsWith("off_meesho_") || offerId.includes("_meesho")) return "meesho";
  if (offerId.startsWith("off_amz_") || offerId.includes("_amz")) return "amazon";

  return "amazon";
}

import { isAllowedTargetUrl, buildSafeAmazonUrl, isGenuineAmazonAsin } from "@/lib/redirect-security";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const offerId = searchParams.get("offerId");
  const subId = searchParams.get("subId") || "df_web";
  const passedTitle = searchParams.get("title")?.trim() || "";
  const passedUrl = searchParams.get("url")?.trim() || "";

  if (!offerId && !passedUrl) {
    return new NextResponse("Missing offerId or url parameter", { status: 400 });
  }

  // 1. If explicit URL is provided, strictly validate against trusted retailer domain whitelist
  if (passedUrl) {
    if (!isAllowedTargetUrl(passedUrl)) {
      return new NextResponse("Invalid or untrusted redirect target domain", { status: 400 });
    }

    // Safety check for Amazon links:
    // If the URL or offerId can resolve to a genuine Amazon India ASIN, route directly to /dp/${asin}
    // to guarantee 100% exact product landing with active affiliate tracking.
    let safeUrl = passedUrl;
    if (passedUrl.includes("amazon.in")) {
      let titleToUse = passedTitle;
      let matchedAsin = "";

      // Check if passedUrl itself contains a genuine ASIN in /dp/<asin>
      const urlAsinMatch = passedUrl.match(/amazon\.in\/dp\/([A-Za-z0-9_]+)/);
      if (urlAsinMatch && isGenuineAmazonAsin(urlAsinMatch[1])) {
        matchedAsin = urlAsinMatch[1];
      }

      // Check if offerId can resolve a template with genuine ASIN
      if (!matchedAsin && offerId) {
        try {
          const { findTemplateProductByIdOrSlug } = await import("@/lib/data/endless-catalog");
          const templateMatch = findTemplateProductByIdOrSlug(offerId);
          if (templateMatch) {
            titleToUse = titleToUse || templateMatch.product.title;
            const offerAsin = templateMatch.lowestOffer?.retailerProductId;
            if (offerAsin && isGenuineAmazonAsin(offerAsin)) {
              matchedAsin = offerAsin;
            }
          }
        } catch {
          // ignore
        }
      }

      if (matchedAsin) {
        safeUrl = `https://www.amazon.in/dp/${matchedAsin}`;
      } else {
        safeUrl = buildSafeAmazonUrl(passedUrl, titleToUse);
      }
    }

    const slug = inferRetailerSlug(offerId || "", safeUrl);
    const finalAffiliateUrl = adapterRegistry.buildOutboundUrl(slug, safeUrl, subId);
    return NextResponse.redirect(finalAffiliateUrl, {
      status: 307,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Affiliate-Redirect": "true",
        "X-Retailer": slug,
      },
    });
  }

  // 2. Check if it is a live offer from memory cache
  if (offerId) {
    const { getLiveOfferById } = await import("@/lib/services/amazon-search");
    const liveOffer = getLiveOfferById(offerId);
    if (liveOffer) {
      let targetUrl = liveOffer.productUrl;
      if (targetUrl.includes("amazon.in")) {
        targetUrl = buildSafeAmazonUrl(targetUrl, passedTitle || liveOffer.title);
      }

      const finalAffiliateUrl = adapterRegistry.buildOutboundUrl(
        liveOffer.retailerSlug,
        targetUrl,
        subId
      );
      return NextResponse.redirect(finalAffiliateUrl, {
        status: 307,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Affiliate-Redirect": "true",
          "X-Retailer": liveOffer.retailerSlug,
        },
      });
    }
  }

  // 3. Look up offer in demo catalog
  if (offerId) {
    const offer = demoOffers.find((o) => o.id === offerId);
    if (offer) {
      let targetUrl = offer.productUrl;
      if (targetUrl.includes("amazon.in")) {
        targetUrl = buildSafeAmazonUrl(targetUrl, passedTitle || offer.title);
      }
      const finalAffiliateUrl = adapterRegistry.buildOutboundUrl(
        offer.retailerSlug,
        targetUrl,
        subId
      );
      return NextResponse.redirect(finalAffiliateUrl, {
        status: 307,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Affiliate-Redirect": "true",
          "X-Retailer": offer.retailerSlug,
        },
      });
    }
  }

  // 4. Handle ASIN-based companion or fallback offers (e.g. off_amz_..., off_fk_..., off_myntra_...)
  if (offerId?.startsWith("off_amz_")) {
    const raw = offerId.replace("off_amz_", "");
    let titleToUse = passedTitle;
    let matchedAsin = "";
    try {
      const { findTemplateProductByIdOrSlug } = await import("@/lib/data/endless-catalog");
      const templateMatch = findTemplateProductByIdOrSlug(raw);
      if (templateMatch) {
        titleToUse = titleToUse || templateMatch.product.title;
        const offerAsin = templateMatch.lowestOffer?.retailerProductId;
        if (offerAsin && isGenuineAmazonAsin(offerAsin)) {
          matchedAsin = offerAsin;
        }
      }
    } catch {
      // ignore
    }
    const targetUrl = matchedAsin ? `https://www.amazon.in/dp/${matchedAsin}` : buildSafeAmazonUrl(raw, titleToUse);
    const finalAffiliateUrl = adapterRegistry.buildOutboundUrl("amazon", targetUrl, subId);
    return NextResponse.redirect(finalAffiliateUrl, {
      status: 307,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Affiliate-Redirect": "true",
        "X-Retailer": "amazon",
      },
    });
  }

  if (offerId?.startsWith("off_fk_")) {
    const asinOrQuery = offerId.replace("off_fk_", "");
    const curated = findCuratedItemByAsin(asinOrQuery);
    const searchTarget = passedTitle || curated?.title || asinOrQuery;
    const targetUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(searchTarget)}`;
    const finalAffiliateUrl = adapterRegistry.buildOutboundUrl("flipkart", targetUrl, subId);
    return NextResponse.redirect(finalAffiliateUrl, {
      status: 307,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Affiliate-Redirect": "true",
        "X-Retailer": "flipkart",
      },
    });
  }

  if (offerId?.startsWith("off_myntra_")) {
    const asinOrQuery = offerId.replace("off_myntra_", "");
    const curated = findCuratedItemByAsin(asinOrQuery);
    const searchTarget = passedTitle || curated?.title || asinOrQuery;
    const targetUrl = `https://www.myntra.com/search?rawQuery=${encodeURIComponent(searchTarget)}`;
    const finalAffiliateUrl = adapterRegistry.buildOutboundUrl("myntra", targetUrl, subId);
    return NextResponse.redirect(finalAffiliateUrl, {
      status: 307,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Affiliate-Redirect": "true",
        "X-Retailer": "myntra",
      },
    });
  }

  if (offerId?.startsWith("off_ajio_")) {
    const asinOrQuery = offerId.replace("off_ajio_", "");
    const curated = findCuratedItemByAsin(asinOrQuery);
    const searchTarget = passedTitle || curated?.title || asinOrQuery;
    const targetUrl = `https://www.ajio.com/search/?text=${encodeURIComponent(searchTarget)}`;
    const finalAffiliateUrl = adapterRegistry.buildOutboundUrl("ajio", targetUrl, subId);
    return NextResponse.redirect(finalAffiliateUrl, {
      status: 307,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Affiliate-Redirect": "true",
        "X-Retailer": "ajio",
      },
    });
  }

  if (offerId?.startsWith("off_meesho_")) {
    const asinOrQuery = offerId.replace("off_meesho_", "");
    const curated = findCuratedItemByAsin(asinOrQuery);
    const searchTarget = passedTitle || curated?.title || asinOrQuery;
    const targetUrl = `https://www.meesho.com/search?q=${encodeURIComponent(searchTarget)}`;
    const finalAffiliateUrl = adapterRegistry.buildOutboundUrl("meesho", targetUrl, subId);
    return NextResponse.redirect(finalAffiliateUrl, {
      status: 307,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Affiliate-Redirect": "true",
        "X-Retailer": "meesho",
      },
    });
  }

  // 5. If passedTitle is available, route to search for the inferred retailer
  if (passedTitle) {
    const slug = inferRetailerSlug(offerId || "");
    let targetUrl = `https://www.amazon.in/s?k=${encodeURIComponent(passedTitle)}`;
    if (slug === "flipkart") targetUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(passedTitle)}`;
    if (slug === "myntra") targetUrl = `https://www.myntra.com/search?rawQuery=${encodeURIComponent(passedTitle)}`;
    if (slug === "ajio") targetUrl = `https://www.ajio.com/search/?text=${encodeURIComponent(passedTitle)}`;
    if (slug === "meesho") targetUrl = `https://www.meesho.com/search?q=${encodeURIComponent(passedTitle)}`;

    const finalAffiliateUrl = adapterRegistry.buildOutboundUrl(slug, targetUrl, subId);
    return NextResponse.redirect(finalAffiliateUrl, {
      status: 307,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Affiliate-Redirect": "true",
        "X-Retailer": slug,
      },
    });
  }

  return new NextResponse("Offer not found or expired", { status: 404 });
}
