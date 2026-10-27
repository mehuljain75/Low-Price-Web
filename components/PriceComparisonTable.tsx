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

interface PriceComparisonTableProps {
  offers: Offer[];
}

export const PriceComparisonTable: React.FC<PriceComparisonTableProps> = ({ offers }) => {
  // Strictly display verified Amazon India offers only (pending Cuelinks affiliate approval)
  const verifiedOffers = (offers || []).filter((o) => o.retailerSlug === "amazon");

  if (verifiedOffers.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        No active verified offers found for this product.
      </div>
    );
  }

  // Sort lowest price first
  const sortedOffers = [...verifiedOffers].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedOffers[0].price;

  return (
    <div className="space-y-4">
      {/* Active Offer Transparency Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 gap-2">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-orange-600 flex-shrink-0" />
          <span>
            Verified live offer from <strong>Amazon India</strong>. Additional store offers will appear as integrations are activated.
          </span>
        </span>
        <span className="text-[11px] text-slate-400">
          Updated regularly
        </span>
      </div>

      {/* Offer Cards */}
      <div className="space-y-3">
        {sortedOffers.map((offer) => {
          const isLowest = offer.price === lowestPrice;
          const discount = calculateDiscount(offer.originalPrice, offer.price);
          const totalEstimatedCheckout = offer.price + offer.shippingCost;

          return (
            <div
              key={offer.id}
              className={`rounded-2xl border transition-all p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                isLowest
                  ? "bg-orange-50/30 border-orange-300 ring-1 ring-orange-200 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Left Column: Store identity & badges */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-xs flex-shrink-0 bg-slate-900">
                  <span className="text-xs uppercase font-extrabold text-orange-400">AMZ</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base text-slate-900">
                      {offer.retailerName}
                    </span>
                    <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Verified Listing
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      {offer.inStock ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-medium">In Stock</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span className="text-rose-600 font-medium">Out of Stock</span>
                        </>
                      )}
                    </span>

                    <span>•</span>

                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{getRelativeTime(offer.lastCheckedAt)}</span>
                    </span>
                  </div>

                  {/* Delivery & Shipping Info */}
                  <div className="flex items-center gap-2 text-xs text-slate-600 pt-0.5">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {offer.shippingCost === 0 ? (
                        <strong className="text-emerald-700">Free Delivery</strong>
                      ) : (
                        `Shipping: ${formatINR(offer.shippingCost)}`
                      )}
                      {offer.deliveryTimeEstimate && ` • ${offer.deliveryTimeEstimate}`}
                    </span>
                  </div>

                  {/* Bank Offers snippet if available */}
                  {offer.bankOffersDescription && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-md mt-1 border border-blue-100">
                      <CreditCard className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="line-clamp-1">{offer.bankOffersDescription}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Pricing & Outbound CTA */}
              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <div className="flex items-baseline md:justify-end gap-2">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {formatINR(offer.price)}
                    </span>
                    {discount > 0 && (
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400">
                    MRP: <span className="line-through">{formatINR(offer.originalPrice)}</span>
                  </div>

                  {offer.shippingCost > 0 && (
                    <div className="text-[11px] text-slate-500 font-medium">
                      Est. Total: {formatINR(totalEstimatedCheckout)}
                    </div>
                  )}
                </div>

                <a
                  href={`/api/redirect?offerId=${offer.id}&title=${encodeURIComponent(offer.title)}&url=${encodeURIComponent(offer.productUrl || "")}`}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl font-bold text-xs shadow-sm transition-all text-white bg-orange-600 hover:bg-orange-700 shadow-orange-200"
                >
                  <span>Buy on Amazon</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Cuelinks Integrations Note */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3 text-xs text-slate-500">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-700 block">
            Additional Stores Coming Soon
          </span>
          <p className="leading-relaxed">
            Multi-store price comparisons with Flipkart, Myntra, AJIO, and Meesho are currently in progress pending affiliate network approvals. Only genuine, verified Amazon India listings are shown above.
          </p>
        </div>
      </div>
    </div>
  );
};
