"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, RotateCcw, Search, Star } from "lucide-react";
import { Category, Retailer } from "@/lib/types";

interface FilterSidebarProps {
  categories: Category[];
  retailers?: Retailer[];
  brands?: string[];
  currentCategory?: string;
  currentRetailer?: string;
  currentBrand?: string;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  currentMinRating?: number;
  currentInStock?: boolean;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  brands = [],
  currentCategory,
  currentBrand,
  currentMinPrice,
  currentMaxPrice,
  currentMinRating,
  currentInStock,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [minPrice, setMinPrice] = useState(currentMinPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice?.toString() || "");
  const [brandSearch, setBrandSearch] = useState("");

  const getBasePath = () => {
    if (pathname.startsWith("/category/") || pathname.startsWith("/search")) {
      return pathname;
    }
    return "/products";
  };

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // Reset pagination to page 1 on any filter change

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // When changing category, clear the active brand to keep brands relevant
    if (key === "category") {
      params.delete("brand");
      setBrandSearch("");
    }

    const basePath = key === "category" && value && value !== "all" 
      ? `/category/${value}`
      : getBasePath();

    router.push(`${basePath}?${params.toString()}`);
  };

  const applyPriceRange = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    const minNum = minPrice.trim() ? Number(minPrice) : undefined;
    const maxNum = maxPrice.trim() ? Number(maxPrice) : undefined;

    if (minNum !== undefined && !isNaN(minNum)) {
      params.set("minPrice", String(minNum));
    } else {
      params.delete("minPrice");
    }

    if (maxNum !== undefined && !isNaN(maxNum)) {
      params.set("maxPrice", String(maxNum));
    } else {
      params.delete("maxPrice");
    }

    router.push(`${getBasePath()}?${params.toString()}`);
  };

  const resetAll = () => {
    setMinPrice("");
    setMaxPrice("");
    setBrandSearch("");
    router.push(getBasePath());
  };

  const filteredBrands = brands.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase().trim())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Filter className="w-4 h-4 text-orange-600" />
          <span>Filters</span>
        </div>
        <button
          type="button"
          onClick={resetAll}
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-medium cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Category
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => updateParam("category", null)}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
              !currentCategory || currentCategory === "all"
                ? "bg-orange-50 text-orange-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((c) => (
            <button
              type="button"
              key={c.slug}
              onClick={() => updateParam("category", c.slug)}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                currentCategory === c.slug
                  ? "bg-orange-50 text-orange-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="space-y-2.5 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Brand
          </label>
          {currentBrand && (
            <button
              type="button"
              onClick={() => updateParam("brand", null)}
              className="text-[10px] text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Brand Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder={
              currentCategory && currentCategory !== "all"
                ? `Search ${categories.find((c) => c.slug === currentCategory)?.name || ""} brands...`
                : "Search brands (e.g. Apple, Nike, Sony)..."
            }
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="w-full text-xs pl-7 pr-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder:text-slate-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
        </div>

        {/* Brand List */}
        <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => updateParam("brand", null)}
            className={`w-full text-left text-xs px-2 py-1 rounded-md transition-colors flex items-center justify-between cursor-pointer ${
              !currentBrand
                ? "bg-orange-50 text-orange-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>All Brands</span>
          </button>
          {filteredBrands.map((b) => (
            <button
              type="button"
              key={b}
              onClick={() => updateParam("brand", b)}
              className={`w-full text-left text-xs px-2 py-1 rounded-md transition-colors flex items-center justify-between cursor-pointer ${
                currentBrand?.toLowerCase() === b.toLowerCase()
                  ? "bg-orange-50 text-orange-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{b}</span>
            </button>
          ))}
          {filteredBrands.length === 0 && (
            <p className="text-[11px] text-slate-400 italic px-2 py-1">
              No matching brands found
            </p>
          )}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-2.5 pt-3 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Price Range (₹)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={applyPriceRange}
          className="w-full py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          Apply Price
        </button>
      </div>

      {/* Customer Rating Filter */}
      <div className="space-y-2.5 pt-3 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Customer Rating
        </label>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => updateParam("minRating", null)}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
              !currentMinRating
                ? "bg-orange-50 text-orange-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>All Ratings</span>
          </button>
          {[4, 3].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => updateParam("minRating", String(star))}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentMinRating === star
                  ? "bg-orange-50 text-orange-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center text-amber-500">
                {Array.from({ length: star }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span>&amp; above</span>
            </button>
          ))}
        </div>
      </div>

      {/* In Stock Only */}
      <div className="pt-3 border-t border-slate-100">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
          <input
            type="checkbox"
            checked={Boolean(currentInStock)}
            onChange={(e) =>
              updateParam("inStock", e.target.checked ? "true" : null)
            }
            className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </div>
  );
};
