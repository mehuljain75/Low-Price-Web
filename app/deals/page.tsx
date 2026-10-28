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
      <div className="bg-[#111827] rounded-xl border border-gray-800 p-6 sm:p-10 text-white shadow-card space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-[#F59E0B] border border-white/10">
          <Flame className="w-4 h-4 text-[#F59E0B]" />
          <span>Amazon India Deals</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Today&apos;s Best Deals &amp; Price Drops on Amazon India
        </h1>

        <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
          These products have price drops of <strong>{minDiscount}% or more</strong> off their official Maximum Retail Price (MRP).
          Prices and deals are tracked directly against Amazon India catalog.
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            Last Synced: Catalog Feed Updated Daily
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            Prime &amp; Bank Offers Included
          </span>
          <span>•</span>
          <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] font-mono text-gray-300">
            Tag: dealfinderin-21
          </span>
        </div>
      </div>

      {/* Filter Tabs (Discount Level) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        {/* Discount Threshold Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 sm:pb-0">
          <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex-shrink-0">
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
              className={`text-xs px-3.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                minDiscount === d.val
                  ? "bg-[#F59E0B] text-[#111827] shadow-xs"
                  : "bg-white hover:bg-gray-50 text-gray-700 border border-[#E5E7EB]"
              }`}
            >
              {d.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <span className="inline-block w-2 h-2 rounded-full bg-[#15803D]"></span>
          <span>Amazon India deals</span>
        </div>
      </div>

      {/* Deals Product Grid */}
      {allDeals.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center space-y-3 shadow-card">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F59E0B] mx-auto flex items-center justify-center border border-amber-200">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-[#111827] text-base">
            No deals found for {minDiscount}% discount currently
          </h3>
          <p className="text-xs text-[#6B7280]">
            Try lowering the discount threshold to see more price drops.
          </p>
          <div className="pt-2">
            <Link
              href="/deals?minDiscount=15"
              className="text-xs font-bold px-4 py-2.5 bg-[#111827] hover:bg-slate-800 text-white rounded-lg inline-block transition-colors"
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
