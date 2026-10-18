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
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
          <Calendar className="w-3.5 h-3.5" />
          <span>India Festive Sales Calendar 2026</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          Upcoming Indian E-Commerce Mega Sales
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          Plan your purchases ahead of time. Track dates, expected bank discounts, early access perks, and category specials across Amazon, Flipkart, Myntra, AJIO, and Meesho.
        </p>
      </div>

      {/* Pro-Tips Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <TrendingUp className="w-4 h-4 text-amber-700" />
          <span>Pro Indian Shopper Checklist for Mega Sales</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-amber-800">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Bank Cards Ready:</strong> Keep SBI, HDFC, ICICI, and Axis cards unlocked with international/online limits enabled.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Early Access VIP:</strong> Prime & Flipkart Plus members get 12–24h early access. Top smartphone units sell out in that window.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Check Real Historical Prices:</strong> Use DealFinder India during the sale to verify if the &apos;discount&apos; is genuine or an inflated MRP trick.
            </span>
          </div>
        </div>
      </div>

      {/* Sales Events Cards List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Upcoming Sales Schedule
        </h2>

        <div className="space-y-6">
          {upcomingSales.map((sale) => {
            return (
              <div
                key={sale.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
              >
                {/* Left: Event Details */}
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-orange-200">
                      {sale.badge}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Store: <strong className="text-slate-900">{sale.retailerName}</strong>
                    </span>
                    <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full">
                      Dates: {sale.startDate} to {sale.endDate}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {sale.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {sale.description}
                  </p>

                  {/* Discount Highlight */}
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                    <Sparkles className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span>Offer: {sale.discountHighlight}</span>
                  </div>

                  {/* Categories */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-xs font-semibold text-slate-500">Top Categories:</span>
                    {sale.categories.map((cat) => (
                      <span
                        key={cat}
                        className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Shopping Tips */}
                  {sale.tips && sale.tips.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Insider Tips:
                      </span>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
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
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-center text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Browse {sale.retailerName} Deals</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/deals"
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-center text-xs font-semibold transition-colors"
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
