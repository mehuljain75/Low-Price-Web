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
  searchQuery?: string;
  currentShoeType?: string;
  currentGender?: string;
  currentSize?: string;
}

const MobileFilterDrawerInternal: React.FC<MobileFilterDrawerProps> = ({
  categories,
  brands = [],
  currentCategory,
  currentBrand,
  currentMinPrice,
  currentMaxPrice,
  currentMinRating,
  currentInStock,
  totalProductsCount,
  searchQuery = "",
  currentShoeType,
  currentGender,
  currentSize,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Local state inside drawer until user clicks "Apply"
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(currentCategory);
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(currentBrand);
  const [selectedShoeType, setSelectedShoeType] = useState<string | undefined>(currentShoeType);
  const [selectedGender, setSelectedGender] = useState<string | undefined>(currentGender);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(currentSize);
  const [minPrice, setMinPrice] = useState(currentMinPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice?.toString() || "");
  const [selectedMinRating, setSelectedMinRating] = useState<number | undefined>(currentMinRating);
  const [inStockOnly, setInStockOnly] = useState(Boolean(currentInStock));
  const [brandSearch, setBrandSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"category" | "brand" | "rating" | "price" | "shoeType" | "gender" | "size">("category");

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

  // Sync state when props change
  useEffect(() => {
    setSelectedCategory(currentCategory);
    setSelectedBrand(currentBrand);
    setSelectedShoeType(currentShoeType);
    setSelectedGender(currentGender);
    setSelectedSize(currentSize);
    setMinPrice(currentMinPrice?.toString() || "");
    setMaxPrice(currentMaxPrice?.toString() || "");
    setSelectedMinRating(currentMinRating);
    setInStockOnly(Boolean(currentInStock));
  }, [currentCategory, currentBrand, currentShoeType, currentGender, currentSize, currentMinPrice, currentMaxPrice, currentMinRating, currentInStock]);

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
  if (currentShoeType) activeFilterCount++;
  if (currentGender) activeFilterCount++;
  if (currentSize) activeFilterCount++;
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

    if (selectedShoeType) params.set("shoeType", selectedShoeType);
    else params.delete("shoeType");

    if (selectedGender) params.set("gender", selectedGender);
    else params.delete("gender");

    if (selectedSize) params.set("size", selectedSize);
    else params.delete("size");

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
    setSelectedShoeType(undefined);
    setSelectedGender(undefined);
    setSelectedSize(undefined);
    setMinPrice("");
    setMaxPrice("");
    setSelectedMinRating(undefined);
    setInStockOnly(false);
    setBrandSearch("");
    const params = new URLSearchParams();
    const q = searchParams.get("q") || searchParams.get("search");
    if (q) {
      params.set("q", q);
    }
    const queryStr = params.toString();
    router.push(`${getBasePath(undefined)}${queryStr ? `?${queryStr}` : ""}`);
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
          className="pointer-events-auto bg-[#111827] hover:bg-slate-800 text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-2.5 font-bold text-xs tracking-wide active:scale-95 transition-all border border-gray-700 cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#F59E0B]" />
          <span>Filters &amp; Categories</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#F59E0B] text-[#111827] text-[10px] flex items-center justify-center font-black">
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
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs transition-opacity"
        >
          {/* Modal Container */}
          <div className="bg-white rounded-t-2xl max-h-[85vh] h-[85vh] flex flex-col w-full overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#111827]" />
                <h2 id="mobile-filter-title" className="font-bold text-sm text-[#111827]">
                  Filters &amp; Categories
                </h2>
                {activeFilterCount > 0 && (
                  <span className="bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFilterCount} Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={resetAll}
                  type="button"
                  className="text-xs text-[#6B7280] hover:text-[#111827] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  type="button"
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:text-[#111827] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split View Content: Vertical Tabs on Left, Options on Right */}
            <div className="flex-1 flex overflow-hidden">
              {/* Nav Tabs */}
              <div className="w-1/3 bg-[#F9FAFB] border-r border-[#E5E7EB] overflow-y-auto py-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("category")}
                  className={`w-full text-left px-3.5 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeTab === "category"
                      ? "bg-white text-[#111827] font-bold border-l-2 border-[#F59E0B]"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>Category</span>
                  {selectedCategory && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("brand")}
                  className={`w-full text-left px-3.5 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeTab === "brand"
                      ? "bg-white text-[#111827] font-bold border-l-2 border-[#F59E0B]"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>Brand</span>
                  {selectedBrand && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  )}
                </button>

                {isFootwear && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveTab("shoeType")}
                      className={`w-full text-left px-3.5 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                        activeTab === "shoeType"
                          ? "bg-white text-[#111827] font-bold border-l-2 border-[#F59E0B]"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span>Shoe Type</span>
                      {selectedShoeType && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("gender")}
                      className={`w-full text-left px-3.5 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                        activeTab === "gender"
                          ? "bg-white text-[#111827] font-bold border-l-2 border-[#F59E0B]"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span>Gender</span>
                      {selectedGender && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("size")}
                      className={`w-full text-left px-3.5 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                        activeTab === "size"
                          ? "bg-white text-[#111827] font-bold border-l-2 border-[#F59E0B]"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span>Size</span>
                      {selectedSize && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                      )}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab("price")}
                  className={`w-full text-left px-3.5 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeTab === "price"
                      ? "bg-white text-[#111827] font-bold border-l-2 border-[#F59E0B]"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>Price &amp; Stock</span>
                  {(minPrice || maxPrice || inStockOnly) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("rating")}
                  className={`w-full text-left px-3.5 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeTab === "rating"
                      ? "bg-white text-[#111827] font-bold border-l-2 border-[#F59E0B]"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>Rating</span>
                  {selectedMinRating && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
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
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between border ${
                        !selectedCategory
                          ? "bg-amber-50 text-[#111827] border-amber-300 font-bold"
                          : "bg-white border-[#E5E7EB] text-gray-700"
                      }`}
                    >
                      <span>All Categories</span>
                      {!selectedCategory && <Check className="w-4 h-4 text-amber-600" />}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.slug);
                          setSelectedBrand(undefined);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between border ${
                          selectedCategory === cat.slug
                            ? "bg-amber-50 text-[#111827] border-amber-300 font-bold"
                            : "bg-white border-[#E5E7EB] text-gray-700"
                        }`}
                      >
                        <span>{cat.name}</span>
                        {selectedCategory === cat.slug && (
                          <Check className="w-4 h-4 text-amber-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* 2. Brand Tab */}
                {activeTab === "brand" && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="mobile-brand-filter-input" className="block text-[11px] font-semibold text-gray-500 mb-1">
                        Filter Brand List
                      </label>
                      <div className="relative">
                        <input
                          id="mobile-brand-filter-input"
                          aria-label="Filter brands list"
                          type="text"
                          placeholder="Filter brands below..."
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          className="w-full text-xs pl-7 pr-2.5 py-1.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-[#111827]"
                        />
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-[55vh] overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedBrand(undefined)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between border ${
                          !selectedBrand
                            ? "bg-amber-50 text-[#111827] border-amber-300 font-bold"
                            : "bg-white border-[#E5E7EB] text-gray-700"
                        }`}
                      >
                        <span>All Brands</span>
                        {!selectedBrand && <Check className="w-4 h-4 text-amber-600" />}
                      </button>
                      {filteredBrands.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBrand(b)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between border ${
                            selectedBrand?.toLowerCase() === b.toLowerCase()
                              ? "bg-amber-50 text-[#111827] border-amber-300 font-bold"
                              : "bg-white border-[#E5E7EB] text-gray-700"
                          }`}
                        >
                          <span>{b}</span>
                          {selectedBrand?.toLowerCase() === b.toLowerCase() && (
                            <Check className="w-4 h-4 text-amber-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footwear: Shoe Type Tab */}
                {isFootwear && activeTab === "shoeType" && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedShoeType(undefined)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between border ${
                        !selectedShoeType
                          ? "bg-amber-50 text-[#111827] border-amber-300 font-bold"
                          : "bg-white border-[#E5E7EB] text-gray-700"
                      }`}
                    >
                      <span>All Shoe Types</span>
                      {!selectedShoeType && <Check className="w-4 h-4 text-amber-600" />}
                    </button>
                    {["Running Shoes", "Sneakers", "Casual Shoes", "Formal Shoes", "Walking Shoes", "Boots"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedShoeType(selectedShoeType?.toLowerCase() === t.toLowerCase() ? undefined : t)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between border ${
                          selectedShoeType?.toLowerCase() === t.toLowerCase()
                            ? "bg-amber-50 text-[#111827] border-amber-300 font-bold"
                            : "bg-white border-[#E5E7EB] text-gray-700"
                        }`}
                      >
                        <span>{t}</span>
                        {selectedShoeType?.toLowerCase() === t.toLowerCase() && (
                          <Check className="w-4 h-4 text-amber-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Footwear: Gender Tab */}
                {isFootwear && activeTab === "gender" && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedGender(undefined)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between border ${
                        !selectedGender
                          ? "bg-amber-50 text-[#111827] border-amber-300 font-bold"
                          : "bg-white border-[#E5E7EB] text-gray-700"
                      }`}
                    >
                      <span>All Genders</span>
                      {!selectedGender && <Check className="w-4 h-4 text-amber-600" />}
                    </button>
                    {["Men", "Women", "Unisex"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSelectedGender(selectedGender?.toLowerCase() === g.toLowerCase() ? undefined : g)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between border ${
                          selectedGender?.toLowerCase() === g.toLowerCase()
                            ? "bg-amber-50 text-[#111827] border-amber-300 font-bold"
                            : "bg-white border-[#E5E7EB] text-gray-700"
                        }`}
                      >
                        <span>{g}</span>
                        {selectedGender?.toLowerCase() === g.toLowerCase() && (
                          <Check className="w-4 h-4 text-amber-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Footwear: Size Tab */}
                {isFootwear && activeTab === "size" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">Select UK Size:</span>
                      {selectedSize && (
                        <button
                          type="button"
                          onClick={() => setSelectedSize(undefined)}
                          className="text-[11px] text-amber-700 font-semibold"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(selectedSize?.toLowerCase() === sz.toLowerCase() ? undefined : sz)}
                          className={`py-3 px-2 rounded-lg border text-center text-xs font-bold transition-all ${
                            selectedSize?.toLowerCase() === sz.toLowerCase()
                              ? "bg-[#F59E0B] text-[#111827] border-[#F59E0B] shadow-xs"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Price & Stock Tab */}
                {activeTab === "price" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#111827] block">
                        Custom Price Range (₹)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="number"
                            placeholder="Min ₹"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full text-xs p-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-[#111827]"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Max ₹"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full text-xs p-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-[#111827]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E5E7EB]">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[#111827] select-none">
                        <input
                          type="checkbox"
                          checked={inStockOnly}
                          onChange={(e) => setInStockOnly(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
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
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between border ${
                        !selectedMinRating
                          ? "bg-amber-50 text-[#111827] border-amber-300 font-bold"
                          : "bg-white border-[#E5E7EB] text-gray-700"
                      }`}
                    >
                      <span>All Ratings</span>
                      {!selectedMinRating && <Check className="w-4 h-4 text-amber-600" />}
                    </button>
                    {[4, 3].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedMinRating(star)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between border ${
                          selectedMinRating === star
                            ? "bg-amber-50 text-[#111827] border-amber-300 font-bold"
                            : "bg-white border-[#E5E7EB] text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="flex text-amber-500">
                            {Array.from({ length: star }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            ))}
                          </div>
                          <span className="text-gray-700 font-medium">&amp; above</span>
                        </div>
                        {selectedMinRating === star && (
                          <Check className="w-4 h-4 text-amber-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-gray-50 border-t border-[#E5E7EB] flex items-center gap-3">
              <button
                type="button"
                onClick={resetAll}
                className="w-1/3 py-2.5 rounded-lg border border-[#E5E7EB] text-xs font-bold text-[#111827] bg-white hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="w-2/3 py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#111827] text-xs font-extrabold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Apply Filters</span>
                {totalProductsCount && (
                  <span className="text-[10px] font-normal opacity-80">
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

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = (props) => (
  <React.Suspense fallback={null}>
    <MobileFilterDrawerInternal {...props} />
  </React.Suspense>
);
