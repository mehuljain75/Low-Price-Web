import { NextRequest, NextResponse } from "next/server";
import { demoOffers } from "@/lib/data/demo-products";
import { adapterRegistry } from "@/lib/adapters/registry";
import { RetailerSlug } from "@/lib/types";
import { findCuratedItemByAsin } from "@/lib/services/amazon-search";

export const dynamic = "force-dynamic";

function inferRetailerSlug(offerId: string, urlStr?: string): RetailerSlug {
  if (offerId.startsWith("off_fk_") || offerId.includes("_fk")) return "flipkart";
  if (offerId.startsWith("off_myntra_") || offerId.includes("_myntra")) return "myntra";
  if (offerId.startsWith("off_ajio_") || offerId.includes("_ajio")) return "ajio";
  if (offerId.startsWith("off_meesho_") || offerId.includes("_meesho")) return "meesho";
  if (offerId.startsWith("off_amz_") || offerId.includes("_amz")) return "amazon";

  if (urlStr) {
    try {
      const hostname = new URL(urlStr).hostname.toLowerCase();
      if (hostname.includes("flipkart")) return "flipkart";
      if (hostname.includes("myntra")) return "myntra";
      if (hostname.includes("ajio")) return "ajio";
      if (hostname.includes("meesho")) return "meesho";
      if (hostname.includes("amazon")) return "amazon";
    } catch {
      // ignore
    }
  }
  return "amazon";
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const offerId = searchParams.get("offerId");
  const subId = searchParams.get("subId") || "df_web";
  const passedTitle = searchParams.get("title")?.trim() || "";
  const passedUrl = searchParams.get("url")?.trim() || "";

  if (!offerId && !passedUrl) {
    return new NextResponse("Missing offerId or url parameter", { status: 400 });
  }

  // 1. If explicit valid retailer URL is provided, build outbound affiliate URL and redirect
  if (passedUrl && (passedUrl.startsWith("http://") || passedUrl.startsWith("https://"))) {
    const slug = inferRetailerSlug(offerId || "", passedUrl);
    const finalAffiliateUrl = adapterRegistry.buildOutboundUrl(slug, passedUrl, subId);
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
      const finalAffiliateUrl = adapterRegistry.buildOutboundUrl(
        liveOffer.retailerSlug,
        liveOffer.productUrl,
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
      const finalAffiliateUrl = adapterRegistry.buildOutboundUrl(
        offer.retailerSlug,
        offer.productUrl,
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
    const asin = offerId.replace("off_amz_", "");
    const targetUrl = asin.length === 10
      ? `https://www.amazon.in/dp/${asin}`
      : `https://www.amazon.in/s?k=${encodeURIComponent(passedTitle || "deals")}`;
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
