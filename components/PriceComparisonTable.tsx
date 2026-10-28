"use client";

import React from "react";
import {
  ExternalLink,
  CheckCircle2,
  XCircle,
  Truck,
  CreditCard,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import { Offer } from "@/lib/types";
import { formatINR, calculateDiscount, getRelativeTime } from "@/lib/formatters";
import { getRetailerMetadata, isValidRetailerUrl } from "@/lib/retailer-utils";

interface PriceComparisonTableProps {
  offers: Offer[];
}

export const PriceComparisonTable: React.FC<PriceComparisonTableProps> = ({ offers }) => {
  const activeOffers = (offers || []).filter((o) => o.price > 0 && o.inStock !== false);

  if (activeOffers.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
        No active offers found for this product.
      </div>
    );
  }

  // Sort lowest price first
  const sortedOffers = [...activeOffers].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedOffers[0].price;

  return (
    <div className="space-y-4">
      {/* Active Offer Transparency Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#6B7280] bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 gap-2">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            Listing from <strong>Amazon India</strong>. Additional store offers will appear as integrations are activated.
          </span>
        </span>
        <span className="text-[11px] text-gray-400">
          Updated regularly
        </span>
      </div>

      {/* Offer Cards */}
      <div className="space-y-3">
        {sortedOffers.map((offer) => {
          const isLowest = offer.price === lowestPrice;
          const discount = calculateDiscount(offer.originalPrice, offer.price);
          const totalEstimatedCheckout = offer.price + offer.shippingCost;
          const retailerMeta = getRetailerMetadata(offer.retailerSlug);
          const hasValidUrl = Boolean(offer.productUrl && isValidRetailerUrl(offer.productUrl, offer.retailerSlug));

          return (
            <div
              key={offer.id}
              className={`rounded-xl border transition-all p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                isLowest
                  ? "bg-amber-50/20 border-amber-300 ring-1 ring-amber-200 shadow-card"
                  : "bg-white border-[#E5E7EB] hover:border-gray-300"
              }`}
            >
              {/* Left Column: Store identity & badges */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-xs flex-shrink-0 bg-[#111827]">
                  <span className="text-xs uppercase font-extrabold text-[#F59E0B]">{retailerMeta.shortCode}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base text-[#111827]">
                      {offer.retailerName}
                    </span>
                    <span className={`${retailerMeta.badgeBg} text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider`}>
                      {retailerMeta.badgeLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                    <span className="flex items-center gap-1">
                      {offer.inStock ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                          <span className="text-[#15803D] font-medium">In Stock</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-[#B91C1C]" />
                          <span className="text-[#B91C1C] font-medium">Out of Stock</span>
                        </>
                      )}
                    </span>

                    <span>•</span>

                    {offer.isStale ? (
                      <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-medium">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Cached ({getRelativeTime(offer.lastCheckedAt)}) • Price may vary</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>Verified {getRelativeTime(offer.lastCheckedAt)}</span>
                      </span>
                    )}
                  </div>

                  {/* Delivery & Shipping Info */}
                  <div className="flex items-center gap-2 text-xs text-[#6B7280] pt-0.5">
                    <Truck className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      {offer.shippingCost === 0 ? (
                        <strong className="text-[#15803D]">Free Delivery</strong>
                      ) : (
                        `Shipping: ${formatINR(offer.shippingCost)}`
                      )}
                      {offer.deliveryTimeEstimate && ` • ${offer.deliveryTimeEstimate}`}
                    </span>
                  </div>

                  {/* Bank Offers snippet if available */}
                  {offer.bankOffersDescription && (
                    <div className="flex items-center gap-1.5 text-xs text-[#111827] bg-amber-50 px-2 py-1 rounded-md mt-1 border border-amber-200">
                      <CreditCard className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span className="line-clamp-1">{offer.bankOffersDescription}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Pricing & Outbound CTA */}
              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                <div className="text-left md:text-right">
                  <div className="flex items-baseline md:justify-end gap-2">
                    <span className="text-2xl font-black text-[#111827] tracking-tight">
                      {formatINR(offer.price)}
                    </span>
                    {discount > 0 && (
                      <span className="text-xs font-bold text-[#B91C1C] bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#6B7280]">
                    MRP: <span className="line-through">{formatINR(offer.originalPrice)}</span>
                  </div>

                  {offer.shippingCost > 0 && (
                    <div className="text-[11px] text-[#6B7280] font-medium">
                      Est. Total: {formatINR(totalEstimatedCheckout)}
                    </div>
                  )}
                </div>

                {hasValidUrl ? (
                  <a
                    href={`/api/redirect?offerId=${offer.id}&title=${encodeURIComponent(offer.title)}&url=${encodeURIComponent(offer.productUrl || "")}`}
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-lg font-bold text-xs transition-colors text-[#111827] bg-[#F59E0B] hover:bg-[#D97706] shadow-xs cursor-pointer"
                  >
                    <span>{retailerMeta.buttonLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-lg font-medium text-xs text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200"
                    title="Product listing is currently not available for purchase on this store"
                  >
                    <span>Unavailable</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Store Verification Integrity Note */}
      <div className="p-4 bg-gray-50 border border-[#E5E7EB] rounded-xl flex items-start gap-3 text-xs text-[#6B7280]">
        <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-[#111827] block">
            Direct Merchant Verification
          </span>
          <p className="leading-relaxed">
            Prices, stock, and delivery estimates are verified against active merchant inventories. Each purchase button redirects directly to the selected store with active deal tracking.
          </p>
        </div>
      </div>
    </div>
  );
};
