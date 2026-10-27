"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, X, RotateCcw, Check, Search, SlidersHorizontal, Star } from "lucide-react";
import { Category, Retailer } from "@/lib/types";

interface MobileFilterDrawerProps {
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
  totalProductsCount: number | string;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  categories,
  brands = [],
  currentCategory,
  currentBrand,
  currentMinPrice,
  currentMaxPrice,
  currentMinRating,
  currentInStock,
  totalProductsCount,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Local state inside drawer until user clicks "Apply"
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(currentCategory);
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(currentBrand);
  const [minPrice, setMinPrice] = useState(currentMinPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice?.toString() || "");
  const [selectedMinRating, setSelectedMinRating] = useState<number | undefined>(currentMinRating);
  const [inStockOnly, setInStockOnly] = useState(Boolean(currentInStock));
  const [brandSearch, setBrandSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"category" | "brand" | "rating" | "price">("category");

  // Sync state when props change
  useEffect(() => {
    setSelectedCategory(currentCategory);
    setSelectedBrand(currentBrand);
    setMinPrice(currentMinPrice?.toString() || "");
    setMaxPrice(currentMaxPrice?.toString() || "");
    setSelectedMinRating(currentMinRating);
    setInStockOnly(Boolean(currentInStock));
  }, [currentCategory, currentBrand, currentMinPrice, currentMaxPrice, currentMinRating, currentInStock]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Calculate active filter count
  let activeFilterCount = 0;
  if (currentCategory && currentCategory !== "all") activeFilterCount++;
  if (currentBrand) activeFilterCount++;
  if (currentMinPrice || currentMaxPrice) activeFilterCount++;
  if (currentMinRating) activeFilterCount++;
  if (currentInStock) activeFilterCount++;

  const getBasePath = (catSlug?: string) => {
    if (catSlug && catSlug !== "all") {
      return `/category/${catSlug}`;
    }
    if (pathname.startsWith("/category/") || pathname.startsWith("/search")) {
      return pathname;
    }
    return "/products";
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // Reset pagination

    if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
    else params.delete("category");

    if (selectedBrand) params.set("brand", selectedBrand);
    else params.delete("brand");

    const minNum = minPrice.trim() ? Number(minPrice) : undefined;
    const maxNum = maxPrice.trim() ? Number(maxPrice) : undefined;

    if (minNum !== undefined && !isNaN(minNum)) params.set("minPrice", String(minNum));
    else params.delete("minPrice");

    if (maxNum !== undefined && !isNaN(maxNum)) params.set("maxPrice", String(maxNum));
    else params.delete("maxPrice");

    if (selectedMinRating) params.set("minRating", String(selectedMinRating));
    else params.delete("minRating");

    if (inStockOnly) params.set("inStock", "true");
    else params.delete("inStock");

    router.push(`${getBasePath(selectedCategory)}?${params.toString()}`);
    setIsOpen(false);
  };

  const resetAll = () => {
    setSelectedCategory(undefined);
    setSelectedBrand(undefined);
    setMinPrice("");
    setMaxPrice("");
    setSelectedMinRating(undefined);
    setInStockOnly(false);
    setBrandSearch("");
    router.push("/products");
    setIsOpen(false);
  };

  const filteredBrands = brands.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase().trim())
  );

  return (
    <>
      {/* Floating Mobile Filter Trigger Bar (Sticky at bottom for mobile) */}
      <div className="lg:hidden fixed bottom-4 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none">
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          className="pointer-events-auto bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 font-bold text-xs tracking-wide active:scale-95 transition-all border border-slate-700 backdrop-blur-sm cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-orange-400" />
          <span>Filters &amp; Categories</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-black">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Drawer Overlay & Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filter-title"
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs transition-opacity"
        >
          {/* Modal Container */}
          <div className="bg-white rounded-t-3xl max-h-[85vh] h-[85vh] flex flex-col w-full overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-250">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-600" />
                <h2 id="mobile-filter-title" className="font-bold text-sm text-slate-900">
                  Filters &amp; Categories
                </h2>
                {activeFilterCount > 0 && (
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFilterCount} Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={resetAll}
                  type="button"
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  type="button"
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split View Content: Vertical Tabs on Left, Options on Right */}
            <div className="flex-1 flex overflow-hidden">
              {/* Nav Tabs */}
              <div className="w-1/3 bg-slate-50 border-r border-slate-200 overflow-y-auto py-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("category")}
                  className={`w-full text-left px-3.5 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeTab === "category"
                      ? "bg-white text-orange-600 border-l-3 border-orange-500 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>Category</span>
                  {selectedCategory && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("brand")}
                  className={`w-full text-left px-3.5 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeTab === "brand"
                      ? "bg-white text-orange-600 border-l-3 border-orange-500 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>Brand</span>
                  {selectedBrand && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("price")}
                  className={`w-full text-left px-3.5 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeTab === "price"
                      ? "bg-white text-orange-600 border-l-3 border-orange-500 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>Price &amp; Stock</span>
                  {(minPrice || maxPrice || inStockOnly) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("rating")}
                  className={`w-full text-left px-3.5 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeTab === "rating"
                      ? "bg-white text-orange-600 border-l-3 border-orange-500 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>Rating</span>
                  {selectedMinRating && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  )}
                </button>
              </div>

              {/* Tab Options on Right */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                {/* 1. Category Tab */}
                {activeTab === "category" && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(undefined);
                        setSelectedBrand(undefined);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between border ${
                        !selectedCategory
                          ? "bg-orange-50 text-orange-800 border-orange-300 font-bold"
                          : "bg-white border-slate-200 text-slate-700"
                      }`}
                    >
                      <span>All Categories</span>
                      {!selectedCategory && <Check className="w-4 h-4 text-orange-600" />}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.slug);
                          setSelectedBrand(undefined);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between border ${
                          selectedCategory === cat.slug
                            ? "bg-orange-50 text-orange-800 border-orange-300 font-bold"
                            : "bg-white border-slate-200 text-slate-700"
                        }`}
                      >
                        <span>{cat.name}</span>
                        {selectedCategory === cat.slug && (
                          <Check className="w-4 h-4 text-orange-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* 2. Brand Tab */}
                {activeTab === "brand" && (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search brands..."
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        className="w-full text-xs pl-7 pr-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    </div>

                    <div className="space-y-1.5 max-h-[55vh] overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedBrand(undefined)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between border ${
                          !selectedBrand
                            ? "bg-orange-50 text-orange-800 border-orange-300 font-bold"
                            : "bg-white border-slate-200 text-slate-700"
                        }`}
                      >
                        <span>All Brands</span>
                        {!selectedBrand && <Check className="w-4 h-4 text-orange-600" />}
                      </button>
                      {filteredBrands.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBrand(b)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between border ${
                            selectedBrand?.toLowerCase() === b.toLowerCase()
                              ? "bg-orange-50 text-orange-800 border-orange-300 font-bold"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          <span>{b}</span>
                          {selectedBrand?.toLowerCase() === b.toLowerCase() && (
                            <Check className="w-4 h-4 text-orange-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Price & Stock Tab */}
                {activeTab === "price" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">
                        Custom Price Range (₹)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="number"
                            placeholder="Min ₹"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Max ₹"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800 select-none">
                        <input
                          type="checkbox"
                          checked={inStockOnly}
                          onChange={(e) => setInStockOnly(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span>In Stock Only</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* 4. Rating Tab */}
                {activeTab === "rating" && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMinRating(undefined)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between border ${
                        !selectedMinRating
                          ? "bg-orange-50 text-orange-800 border-orange-300 font-bold"
                          : "bg-white border-slate-200 text-slate-700"
                      }`}
                    >
                      <span>All Ratings</span>
                      {!selectedMinRating && <Check className="w-4 h-4 text-orange-600" />}
                    </button>
                    {[4, 3].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedMinRating(star)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between border ${
                          selectedMinRating === star
                            ? "bg-orange-50 text-orange-800 border-orange-300 font-bold"
                            : "bg-white border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="flex text-amber-500">
                            {Array.from({ length: star }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span>&amp; above</span>
                        </div>
                        {selectedMinRating === star && (
                          <Check className="w-4 h-4 text-orange-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
              <button
                type="button"
                onClick={resetAll}
                className="w-1/3 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 transition-colors"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="w-2/3 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>Apply Filters</span>
                {totalProductsCount && (
                  <span className="text-[10px] font-normal opacity-90">
                    ({totalProductsCount} items)
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
