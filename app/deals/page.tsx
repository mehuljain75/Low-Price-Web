import React from "react";
import Link from "next/link";
import { Flame, Sparkles, Clock } from "lucide-react";
import { repository } from "@/lib/data/repository";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

interface DealsPageProps {
  searchParams: Promise<{
    minDiscount?: string;
  }>;
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const resolvedParams = await searchParams;
  const minDiscount = resolvedParams.minDiscount ? Number(resolvedParams.minDiscount) : 20;

  const allDeals = await repository.getTodaysDeals(minDiscount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 rounded-3xl p-6 sm:p-10 text-white shadow-lg space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-white">
          <Flame className="w-4 h-4 text-amber-300" />
          <span>Amazon India Verified Deals</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          Today&apos;s Best Deals & Price Drops on Amazon India
        </h1>

        <p className="text-sm sm:text-base text-orange-100 max-w-2xl leading-relaxed">
          These products have verified price drops of <strong>{minDiscount}% or more</strong> off their official Maximum Retail Price (MRP).
          Prices and deals are tracked directly against Amazon India catalog.
        </p>

        <div className="flex items-center gap-4 text-xs text-orange-100 pt-2 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Last Synced: Today, Real-time
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Prime & Bank Offers Included
          </span>
          <span>•</span>
          <span className="bg-black/25 px-2 py-0.5 rounded text-[11px] font-medium">
            Affiliate Tag: dealfinderin-21
          </span>
        </div>
      </div>

      {/* Filter Tabs (Discount Level) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        {/* Discount Threshold Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
            Min Discount:
          </span>
          {[
            { label: "All Drops (≥15%)", val: 15 },
            { label: "Steep Drops (≥20%)", val: 20 },
            { label: "Mega Drops (≥30%)", val: 30 },
            { label: "Half Price+ (≥50%)", val: 50 },
          ].map((d) => (
            <Link
              key={d.val}
              href={`/deals?minDiscount=${d.val}`}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
                minDiscount === d.val
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {d.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Verified Amazon India deals</span>
        </div>
      </div>

      {/* Deals Product Grid */}
      {allDeals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 mx-auto flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            No deals found for {minDiscount}% discount currently
          </h3>
          <p className="text-xs text-slate-500">
            Try lowering the discount threshold to see more price drops.
          </p>
          <div className="pt-2">
            <Link
              href="/deals?minDiscount=15"
              className="text-xs font-semibold px-4 py-2 bg-slate-900 text-white rounded-lg inline-block"
            >
              Show All Drops (≥15%)
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allDeals.map((comp) => (
            <ProductCard key={comp.product.id} comparison={comp} />
          ))}
        </div>
      )}
    </div>
  );
}
