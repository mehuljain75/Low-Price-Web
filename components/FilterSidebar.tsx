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
  searchQuery?: string;
  currentShoeType?: string;
  currentGender?: string;
  currentSize?: string;
}

const FilterSidebarInternal: React.FC<FilterSidebarProps> = ({
  categories,
  brands = [],
  currentCategory,
  currentBrand,
  currentMinPrice,
  currentMaxPrice,
  currentMinRating,
  currentInStock,
  searchQuery = "",
  currentShoeType,
  currentGender,
  currentSize,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [minPrice, setMinPrice] = useState(currentMinPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice?.toString() || "");
  const [brandSearch, setBrandSearch] = useState("");

  const qLower = (searchQuery || searchParams.get("q") || searchParams.get("search") || "").toLowerCase().trim();
  const isFootwear =
    currentCategory === "fashion" ||
    qLower.includes("shoe") ||
    qLower.includes("sneaker") ||
    qLower.includes("running") ||
    qLower.includes("boot") ||
    qLower.includes("footwear") ||
    qLower.includes("clog") ||
    Boolean(currentShoeType || currentGender || currentSize);

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

  const applyPriceRange = (customMin?: number, customMax?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    const effectiveMin = customMin !== undefined ? customMin : (minPrice.trim() ? Number(minPrice) : undefined);
    const effectiveMax = customMax !== undefined ? customMax : (maxPrice.trim() ? Number(maxPrice) : undefined);

    if (effectiveMin !== undefined && !isNaN(effectiveMin)) {
      params.set("minPrice", String(effectiveMin));
      setMinPrice(String(effectiveMin));
    } else {
      params.delete("minPrice");
      setMinPrice("");
    }

    if (effectiveMax !== undefined && !isNaN(effectiveMax)) {
      params.set("maxPrice", String(effectiveMax));
      setMaxPrice(String(effectiveMax));
    } else {
      params.delete("maxPrice");
      setMaxPrice("");
    }

    router.push(`${getBasePath()}?${params.toString()}`);
  };

  const resetAll = () => {
    setMinPrice("");
    setMaxPrice("");
    setBrandSearch("");
    const params = new URLSearchParams();
    const q = searchParams.get("q") || searchParams.get("search");
    if (q) {
      params.set("q", q);
    }
    const queryStr = params.toString();
    router.push(`${getBasePath()}${queryStr ? `?${queryStr}` : ""}`);
  };

  const filteredBrands = brands.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase().trim())
  );

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 font-bold text-[#111827] text-sm">
          <Filter className="w-4 h-4 text-[#111827]" />
          <span>Filters</span>
        </div>
        <button
          type="button"
          onClick={resetAll}
          className="text-xs text-[#6B7280] hover:text-[#111827] flex items-center gap-1 font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
          Category
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => updateParam("category", null)}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between cursor-pointer ${
              !currentCategory || currentCategory === "all"
                ? "bg-amber-50 text-[#111827] font-bold border-l-2 border-[#F59E0B]"
                : "text-gray-600 hover:bg-gray-50 hover:text-[#111827]"
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((c) => (
            <button
              type="button"
              key={c.slug}
              onClick={() => updateParam("category", c.slug)}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between cursor-pointer ${
                currentCategory === c.slug
                  ? "bg-amber-50 text-[#111827] font-bold border-l-2 border-[#F59E0B]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#111827]"
              }`}
            >
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="space-y-2.5 pt-3 border-t border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
            Brand
          </label>
          {currentBrand && (
            <button
              type="button"
              onClick={() => updateParam("brand", null)}
              className="text-[10px] text-amber-700 hover:text-amber-800 font-semibold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Brand Search Input */}
        <div>
          <label htmlFor="brand-filter-input" className="block text-[11px] font-semibold text-gray-500 mb-1">
            Filter Brand List
          </label>
          <div className="relative">
            <input
              id="brand-filter-input"
              aria-label="Filter brand options"
              type="text"
              placeholder={
                currentCategory && currentCategory !== "all"
                  ? `Filter ${categories.find((c) => c.slug === currentCategory)?.name || ""} brands...`
                  : "Filter brand options (e.g. Apple, Nike)..."
              }
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              className="w-full text-xs pl-7 pr-2.5 py-1.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-[#111827] placeholder:text-gray-400"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Brand List */}
        <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => updateParam("brand", null)}
            className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors flex items-center justify-between cursor-pointer ${
              !currentBrand
                ? "bg-amber-50 text-[#111827] font-bold border-l-2 border-[#F59E0B]"
                : "text-gray-600 hover:bg-gray-50 hover:text-[#111827]"
            }`}
          >
            <span>All Brands</span>
          </button>
          {filteredBrands.map((b) => (
            <button
              type="button"
              key={b}
              onClick={() => updateParam("brand", b)}
              className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors flex items-center justify-between cursor-pointer ${
                currentBrand?.toLowerCase() === b.toLowerCase()
                  ? "bg-amber-50 text-[#111827] font-bold border-l-2 border-[#F59E0B]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#111827]"
              }`}
            >
              <span>{b}</span>
            </button>
          ))}
          {filteredBrands.length === 0 && (
            <p className="text-[11px] text-gray-400 italic px-2 py-1">
              No matching brands found
            </p>
          )}
        </div>
      </div>

      {/* Context-Aware: Shoe Type Filter */}
      {isFootwear && (
        <div className="space-y-2.5 pt-3 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
              Shoe Type
            </label>
            {currentShoeType && (
              <button
                type="button"
                onClick={() => updateParam("shoeType", null)}
                className="text-[10px] text-amber-700 hover:text-amber-800 font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => updateParam("shoeType", null)}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                !currentShoeType
                  ? "bg-amber-50 text-[#111827] font-bold border-l-2 border-[#F59E0B]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#111827]"
              }`}
            >
              All Types
            </button>
            {["Running Shoes", "Sneakers", "Casual Shoes", "Formal Shoes", "Walking Shoes", "Boots"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updateParam("shoeType", currentShoeType?.toLowerCase() === type.toLowerCase() ? null : type)}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                  currentShoeType?.toLowerCase() === type.toLowerCase()
                    ? "bg-amber-50 text-[#111827] font-bold border-l-2 border-[#F59E0B]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#111827]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Context-Aware: Gender / User */}
      {isFootwear && (
        <div className="space-y-2.5 pt-3 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
              Gender
            </label>
            {currentGender && (
              <button
                type="button"
                onClick={() => updateParam("gender", null)}
                className="text-[10px] text-amber-700 hover:text-amber-800 font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Men", "Women", "Unisex"].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => updateParam("gender", currentGender?.toLowerCase() === g.toLowerCase() ? null : g)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                  currentGender?.toLowerCase() === g.toLowerCase()
                    ? "bg-[#111827] text-white border-[#111827] font-bold"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Context-Aware: Available Sizes */}
      {isFootwear && (
        <div className="space-y-2.5 pt-3 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
              Available Sizes
            </label>
            {currentSize && (
              <button
                type="button"
                onClick={() => updateParam("size", null)}
                className="text-[10px] text-amber-700 hover:text-amber-800 font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => updateParam("size", currentSize?.toLowerCase() === sz.toLowerCase() ? null : sz)}
                className={`text-xs py-1.5 px-2 rounded-lg border text-center transition-colors cursor-pointer font-medium ${
                  currentSize?.toLowerCase() === sz.toLowerCase()
                    ? "bg-[#F59E0B] text-[#111827] border-[#F59E0B] font-bold shadow-2xs"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="space-y-2.5 pt-3 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
          Price Range (₹)
        </label>
        {/* Quick price presets */}
        <div className="flex flex-wrap gap-1.5 pb-1">
          {[
            { label: "Under ₹1,000", min: 0, max: 1000 },
            { label: "₹1,000–₹2,500", min: 1000, max: 2500 },
            { label: "₹2,500–₹5,000", min: 2500, max: 5000 },
            { label: "Above ₹5,000", min: 5000, max: 100000 },
          ].map((preset) => {
            const isSelected = currentMinPrice === preset.min && currentMaxPrice === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPriceRange(preset.min, preset.max)}
                className={`text-[10px] px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full text-xs p-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-[#111827]"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full text-xs p-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-[#111827]"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => applyPriceRange()}
          className="w-full py-2 text-xs font-bold text-[#111827] bg-[#F59E0B] hover:bg-[#D97706] rounded-lg transition-colors cursor-pointer shadow-2xs"
        >
          Apply Custom Price
        </button>
      </div>

      {/* Customer Rating Filter */}
      <div className="space-y-2.5 pt-3 border-t border-[#E5E7EB]">
        <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
          Customer Rating
        </label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => updateParam("minRating", null)}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between cursor-pointer ${
              !currentMinRating
                ? "bg-amber-50 text-[#111827] font-bold border-l-2 border-[#F59E0B]"
                : "text-gray-600 hover:bg-gray-50 hover:text-[#111827]"
            }`}
          >
            <span>All Ratings</span>
          </button>
          {[4, 3].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => updateParam("minRating", String(star))}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentMinRating === star
                  ? "bg-amber-50 text-[#111827] font-bold border-l-2 border-[#F59E0B]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#111827]"
              }`}
            >
              <div className="flex items-center text-amber-500">
                {Array.from({ length: star }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="text-gray-700 font-medium">&amp; above</span>
            </button>
          ))}
        </div>
      </div>

      {/* In Stock Only */}
      <div className="pt-3 border-t border-[#E5E7EB]">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-[#111827] font-medium select-none">
          <input
            type="checkbox"
            checked={Boolean(currentInStock)}
            onChange={(e) =>
              updateParam("inStock", e.target.checked ? "true" : null)
            }
            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </div>
  );
};

export const FilterSidebar: React.FC<FilterSidebarProps> = (props) => (
  <React.Suspense fallback={<div className="w-64 bg-gray-50 rounded-xl h-96 animate-pulse" />}>
    <FilterSidebarInternal {...props} />
  </React.Suspense>
);
