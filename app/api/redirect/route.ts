import { NextRequest, NextResponse } from "next/server";
import { demoOffers } from "@/lib/data/demo-products";
import { adapterRegistry } from "@/lib/adapters/registry";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const offerId = searchParams.get("offerId");
  const subId = searchParams.get("subId") || "df_web";

  if (!offerId) {
    return new NextResponse("Missing offerId parameter", { status: 400 });
  }

  // 1. Check if it is a live Amazon offer from memory cache
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

  // 2. Direct ASIN fallback for Amazon offers (e.g. off_amz_B0DFMGNY45)
  if (offerId.startsWith("off_amz_")) {
    const asin = offerId.replace("off_amz_", "");
    const targetUrl = asin.length === 10
      ? `https://www.amazon.in/dp/${asin}`
      : `https://www.amazon.in/s?k=deals`;
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

  // 3. Direct ASIN / query fallback for Flipkart offers (e.g. off_fk_B0DFMGNY45)
  if (offerId.startsWith("off_fk_")) {
    const asinOrQuery = offerId.replace("off_fk_", "");
    const targetUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(asinOrQuery)}`;
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

  // 4. Direct ASIN / query fallback for Myntra offers (e.g. off_myntra_B0DFMGNY45)
  if (offerId.startsWith("off_myntra_")) {
    const asinOrQuery = offerId.replace("off_myntra_", "");
    const targetUrl = `https://www.myntra.com/${encodeURIComponent(asinOrQuery.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}`;
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

  // 5. Look up offer in demo catalog
  const offer = demoOffers.find((o) => o.id === offerId);

  if (!offer) {
    return new NextResponse("Offer not found or expired", { status: 404 });
  }

  // Generate affiliate-tagged destination URL via registry adapter
  const finalAffiliateUrl = adapterRegistry.buildOutboundUrl(
    offer.retailerSlug,
    offer.productUrl,
    subId
  );

  // Return compliant 307 redirect with anti-caching headers and referral integrity
  return NextResponse.redirect(finalAffiliateUrl, {
    status: 307,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Affiliate-Redirect": "true",
      "X-Retailer": offer.retailerSlug,
    },
  });
}
