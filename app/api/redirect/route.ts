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

  // Look up offer in catalog
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
