import React from "react";
import Link from "next/link";
import {
  Calendar,
  Sparkles,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { upcomingSales } from "@/lib/data/sales-calendar";

export const dynamic = "force-dynamic";

export default function SalesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 p-6 sm:p-10 text-white shadow-card space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-[#F59E0B] border border-white/10">
          <Calendar className="w-3.5 h-3.5" />
          <span>India Festive Sales Calendar 2026</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Upcoming Indian E-Commerce Mega Sales
        </h1>

        <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
          Plan your purchases ahead of time. Track dates, expected bank discounts, early access perks, and category specials across Amazon, Flipkart, Myntra, AJIO, and Meesho.
        </p>
      </div>

      {/* Pro-Tips Banner */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-3 shadow-card">
        <div className="flex items-center gap-2 text-[#111827] font-bold text-sm">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span>Pro Indian Shopper Checklist for Mega Sales</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#6B7280]">
          <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-[#E5E7EB]">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] mt-0.5 flex-shrink-0" />
            <span>
              <strong className="text-[#111827]">Bank Cards Ready:</strong> Keep SBI, HDFC, ICICI, and Axis cards unlocked with online limits enabled.
            </span>
          </div>
          <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-[#E5E7EB]">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] mt-0.5 flex-shrink-0" />
            <span>
              <strong className="text-[#111827]">Early Access VIP:</strong> Prime members get 12–24h early access. High-demand items often sell out in this window.
            </span>
          </div>
          <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-[#E5E7EB]">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] mt-0.5 flex-shrink-0" />
            <span>
              <strong className="text-[#111827]">Check Real Prices:</strong> Use DealFinder India during the sale to verify if the discount is genuine or an inflated MRP.
            </span>
          </div>
        </div>
      </div>

      {/* Sales Events Cards List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#111827] tracking-tight">
          Upcoming Sales Schedule
        </h2>

        <div className="space-y-6">
          {upcomingSales.map((sale) => {
            return (
              <div
                key={sale.id}
                className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-card hover:border-gray-300 transition-all p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
              >
                {/* Left: Event Details */}
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="bg-amber-50 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                      {sale.badge}
                    </span>
                    <span className="text-xs font-semibold text-[#6B7280]">
                      Store: <strong className="text-[#111827]">{sale.retailerName}</strong>
                    </span>
                    <span className="text-xs text-gray-700 font-semibold bg-gray-100 px-2.5 py-0.5 rounded-md border border-[#E5E7EB]">
                      Dates: {sale.startDate} to {sale.endDate}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
                    {sale.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                    {sale.description}
                  </p>

                  {/* Discount Highlight */}
                  <div className="flex items-center gap-2 text-xs font-bold text-[#B91C1C] bg-red-50 p-2.5 rounded-lg border border-red-200">
                    <Sparkles className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>Offer: {sale.discountHighlight}</span>
                  </div>

                  {/* Categories */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-xs font-semibold text-[#6B7280]">Top Categories:</span>
                    {sale.categories.map((cat) => (
                      <span
                        key={cat}
                        className="text-[11px] bg-gray-50 text-gray-700 px-2 py-0.5 rounded-md font-medium border border-[#E5E7EB]"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Shopping Tips */}
                  {sale.tips && sale.tips.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                        Insider Tips:
                      </span>
                      <ul className="text-xs text-[#6B7280] space-y-1 list-disc list-inside">
                        {sale.tips.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right: CTA to store deals */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0 lg:w-48">
                  <Link
                    href={`/products?retailer=${sale.retailerSlug}`}
                    className="w-full py-2.5 px-4 bg-[#F59E0B] hover:bg-[#D97706] text-[#111827] rounded-lg text-center text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Browse {sale.retailerName} Deals</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/deals"
                    className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-lg text-center text-xs font-semibold transition-colors border border-[#E5E7EB]"
                  >
                    Set Price Alert
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
