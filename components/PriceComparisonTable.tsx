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
} from "lucide-react";
import { Offer } from "@/lib/types";
import { formatINR, calculateDiscount, getRelativeTime } from "@/lib/formatters";
import { DemoBadge } from "./DemoBadge";
import { StalePriceWarning } from "./StalePriceWarning";

interface PriceComparisonTableProps {
  offers: Offer[];
}

export const PriceComparisonTable: React.FC<PriceComparisonTableProps> = ({ offers }) => {
  if (!offers || offers.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        No active retailer offers found for this product.
      </div>
    );
  }

  // Sort: lowest price first
  const sortedOffers = [...offers].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedOffers[0].price;

  return (
    <div className="space-y-4">
      {/* Transparency Disclaimer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 gap-2">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Comparing offers across <strong>{offers.length} tracked Indian stores</strong>.
            Advertised prices may exclude bank discounts at final checkout.
          </span>
        </span>
        <span className="text-[11px] text-slate-400">
          Updated automatically
        </span>
      </div>

      {/* Offer Cards (Mobile & Desktop) */}
      <div className="space-y-3">
        {sortedOffers.map((offer, idx) => {
          const isLowest = offer.price === lowestPrice;
          const discount = calculateDiscount(offer.originalPrice, offer.price);
          const totalEstimatedCheckout = offer.price + offer.shippingCost;

          return (
            <div
              key={offer.id}
              className={`rounded-2xl border transition-all p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                isLowest
                  ? "bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Left Column: Store identity & badges */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-xs flex-shrink-0 bg-slate-800">
                  <span className="text-xs uppercase">{offer.retailerName.slice(0, 3)}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base text-slate-900">
                      {offer.retailerName}
                    </span>
                    {isLowest && (
                      <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Lowest among tracked stores
                      </span>
                    )}
                    {offer.isDemo && <DemoBadge size="sm" />}
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

                  {/* Stale Price Warning */}
                  {offer.isStale && (
                    <div className="pt-1">
                      <StalePriceWarning lastCheckedTime={getRelativeTime(offer.lastCheckedAt)} />
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
                  href={`/api/redirect?offerId=${offer.id}`}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl font-bold text-xs shadow-sm transition-all text-white ${
                    isLowest
                      ? "bg-orange-600 hover:bg-orange-700 shadow-orange-200"
                      : "bg-slate-900 hover:bg-slate-800"
                  }`}
                >
                  <span>Buy on {offer.retailerName}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
