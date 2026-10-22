"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, RotateCcw, Check, Search, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Category, Retailer } from "@/lib/types";

interface MobileFilterDrawerProps {
  categories: Category[];
  retailers: Retailer[];
  brands?: string[];
  currentCategory?: string;
  currentRetailer?: string;
  currentBrand?: string;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  currentInStock?: boolean;
  totalProductsCount: number;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  categories,
  retailers,
  brands = [],
  currentCategory,
  currentRetailer,
  currentBrand,
  currentMinPrice,
  currentMaxPrice,
  currentInStock,
  totalProductsCount,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Local state inside drawer until user clicks "Apply"
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(currentCategory);
  const [selectedRetailer, setSelectedRetailer] = useState<string | undefined>(currentRetailer);
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(currentBrand);
  const [minPrice, setMinPrice] = useState(currentMinPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice?.toString() || "");
  const [inStockOnly, setInStockOnly] = useState(Boolean(currentInStock));
  const [brandSearch, setBrandSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"category" | "brand" | "retailer" | "price">("category");

  // Sync state when props change
  useEffect(() => {
    setSelectedCategory(currentCategory);
    setSelectedRetailer(currentRetailer);
    setSelectedBrand(currentBrand);
    setMinPrice(currentMinPrice?.toString() || "");
    setMaxPrice(currentMaxPrice?.toString() || "");
    setInStockOnly(Boolean(currentInStock));
  }, [currentCategory, currentRetailer, currentBrand, currentMinPrice, currentMaxPrice, currentInStock]);

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
  if (currentRetailer && currentRetailer !== "all") activeFilterCount++;
  if (currentBrand) activeFilterCount++;
  if (currentMinPrice || currentMaxPrice) activeFilterCount++;
  if (currentInStock) activeFilterCount++;

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
    else params.delete("category");

    if (selectedRetailer && selectedRetailer !== "all") params.set("retailer", selectedRetailer);
    else params.delete("retailer");

    if (selectedBrand) params.set("brand", selectedBrand);
    else params.delete("brand");

    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    if (inStockOnly) params.set("inStock", "true");
    else params.delete("inStock");

    router.push(`/products?${params.toString()}`);
    setIsOpen(false);
  };

  const resetAll = () => {
    setSelectedCategory(undefined);
    setSelectedRetailer(undefined);
    setSelectedBrand(undefined);
    setMinPrice("");
    setMaxPrice("");
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
          className="pointer-events-auto bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 font-bold text-xs tracking-wide active:scale-95 transition-all border border-slate-700 backdrop-blur-sm"
        >
          <SlidersHorizontal className="w-4 h-4 text-orange-400" />
          <span>Filters & Categories</span>
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
                  Filters & Categories
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
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  type="button"
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split View Content: Vertical Tabs on Left, Options on Right */}
            <div className="flex-1 flex overflow-hidden">
              {/* Category Nav Tabs */}
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
                  onClick={() => setActiveTab("retailer")}
                  className={`w-full text-left px-3.5 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeTab === "retailer"
                      ? "bg-white text-orange-600 border-l-3 border-orange-500 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>Store</span>
                  {selectedRetailer && (
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
                  <span>Price & Stock</span>
                  {(minPrice || maxPrice || inStockOnly) && (
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

                {/* 2. Retailer Tab */}
                {activeTab === "retailer" && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRetailer(undefined)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between border ${
                        !selectedRetailer
                          ? "bg-orange-50 text-orange-800 border-orange-300 font-bold"
                          : "bg-white border-slate-200 text-slate-700"
                      }`}
                    >
                      <span>All Tracked Stores</span>
                      {!selectedRetailer && <Check className="w-4 h-4 text-orange-600" />}
                    </button>
                    {retailers.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRetailer(r.slug)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between border ${
                          selectedRetailer === r.slug
                            ? "bg-orange-50 text-orange-800 border-orange-300 font-bold"
                            : "bg-white border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: r.color }}
                          />
                          <span>{r.name}</span>
                        </div>
                        {selectedRetailer === r.slug && (
                          <Check className="w-4 h-4 text-orange-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* 3. Brand Tab */}
                {activeTab === "brand" && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search brands..."
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

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

                    <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                      {filteredBrands.map((brand) => (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => setSelectedBrand(brand)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between border ${
                            selectedBrand?.toLowerCase() === brand.toLowerCase()
                              ? "bg-orange-50 text-orange-800 border-orange-300 font-bold"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          <span>{brand}</span>
                          {selectedBrand?.toLowerCase() === brand.toLowerCase() && (
                            <Check className="w-4 h-4 text-orange-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Price & Stock Tab */}
                {activeTab === "price" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">Price Range (₹)</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Min (₹)"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                        <input
                          type="number"
                          placeholder="Max (₹)"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">Popular Quick Filters:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: "Under ₹1k", min: "", max: "1000" },
                          { label: "Under ₹5k", min: "", max: "5000" },
                          { label: "Under ₹20k", min: "", max: "20000" },
                          { label: "Under ₹50k", min: "", max: "50000" },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              setMinPrice(preset.min);
                              setMaxPrice(preset.max);
                            }}
                            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-orange-100 text-[11px] font-medium text-slate-700 transition-colors"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                        <input
                          type="checkbox"
                          checked={inStockOnly}
                          onChange={(e) => setInStockOnly(e.target.checked)}
                          className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                        />
                        <span>In-Stock Only</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={resetAll}
                className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 font-bold text-xs text-slate-700 transition-colors"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="w-2/3 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold text-xs text-white shadow-md transition-colors"
              >
                Apply Filters ({totalProductsCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
