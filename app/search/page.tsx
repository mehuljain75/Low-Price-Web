import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { Search as SearchIcon, ArrowRight } from "lucide-react";
import { repository } from "@/lib/data/repository";
import { InfiniteProductGrid } from "@/components/InfiniteProductGrid";
import { FilterSidebar } from "@/components/FilterSidebar";
import { SortDropdown } from "@/components/SortDropdown";
import { MobileFilterDrawer } from "@/components/MobileFilterDrawer";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    search?: string;
    category?: string;
    brand?: string;
    shoeType?: string;
    gender?: string;
    size?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    sortBy?: "price_asc" | "price_desc" | "discount" | "newest" | "rating";
    inStock?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const query = resolved.q || resolved.search || "";

  return {
    title: query
      ? `Search results for "${query}" on Amazon India | DealFinder`
      : "Product Search on Amazon India | DealFinder",
    description: `Discover and compare prices for "${query}" on Amazon India with deals, specs, and customer reviews.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = await searchParams;
  const searchQuery = (resolved.q || resolved.search || "").trim();
  const categorySlug = resolved.category;
  const brand = resolved.brand;
  const shoeType = resolved.shoeType;
  const gender = resolved.gender;
  const size = resolved.size;
  const minPrice = resolved.minPrice ? Number(resolved.minPrice) : undefined;
  const maxPrice = resolved.maxPrice ? Number(resolved.maxPrice) : undefined;
  const minRating = resolved.minRating ? Number(resolved.minRating) : undefined;
  const sortBy = resolved.sortBy || "discount";
  const inStockOnly = resolved.inStock === "true";

  const categories = await repository.getCategories();
  const brands = await repository.getBrands(categorySlug);

  const comparisons = await repository.getProducts({
    searchQuery,
    categorySlug,
    brand,
    shoeType,
    gender,
    size,
    minPrice,
    maxPrice,
    minRating,
    sortBy,
    inStockOnly,
    page: 1,
    limit: 24,
  });

  // Helper to remove one filter while keeping other active filters and q
  const getFilterRemoveUrl = (removeKey: string) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (categorySlug && removeKey !== "category") params.set("category", categorySlug);
    if (brand && removeKey !== "brand") params.set("brand", brand);
    if (shoeType && removeKey !== "shoeType") params.set("shoeType", shoeType);
    if (gender && removeKey !== "gender") params.set("gender", gender);
    if (size && removeKey !== "size") params.set("size", size);
    if (minPrice !== undefined && removeKey !== "price") params.set("minPrice", String(minPrice));
    if (maxPrice !== undefined && removeKey !== "price") params.set("maxPrice", String(maxPrice));
    if (minRating !== undefined && removeKey !== "rating") params.set("minRating", String(minRating));
    if (inStockOnly && removeKey !== "inStock") params.set("inStock", "true");
    if (sortBy && sortBy !== "discount") params.set("sortBy", sortBy);
    return `/search?${params.toString()}`;
  };

  const hasAnyFilter = Boolean(
    brand ||
    categorySlug ||
    shoeType ||
    gender ||
    size ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    minRating !== undefined ||
    inStockOnly
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header */}
      <div className="space-y-4 pb-4 border-b border-[#E5E7EB]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
              <Link href="/" className="hover:text-[#111827] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#111827] font-semibold">Search</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
              {searchQuery ? (
                <>
                  Results for &ldquo;<span className="text-amber-600">{searchQuery}</span>&rdquo;
                </>
              ) : (
                "Search Amazon Products"
              )}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
              {comparisons.length > 0
                ? `Found ${comparisons.length} product listings on Amazon India`
                : "Enter product keywords to explore deals on Amazon India"}
            </p>
          </div>

          {/* Sorting Dropdown */}
          <SortDropdown currentSort={sortBy} />
        </div>
      </div>

      {/* Active Filter Badges */}
      {(searchQuery || hasAnyFilter) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[#6B7280] font-medium">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-[#111827] font-medium border border-[#E5E7EB]">
              Query: &quot;{searchQuery}&quot;
            </span>
          )}
          {categorySlug && (
            <Link
              href={getFilterRemoveUrl("category")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-[#111827] border border-amber-200 font-semibold hover:bg-amber-100 transition-colors"
              title="Remove category filter"
            >
              <span>Category: {categories.find((c) => c.slug === categorySlug)?.name || categorySlug}</span>
              <span className="font-bold text-amber-700">×</span>
            </Link>
          )}
          {brand && (
            <Link
              href={getFilterRemoveUrl("brand")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-[#111827] border border-[#E5E7EB] font-semibold hover:bg-gray-200 transition-colors"
              title="Remove brand filter"
            >
              <span>Brand: {brand}</span>
              <span className="font-bold text-gray-600">×</span>
            </Link>
          )}
          {shoeType && (
            <Link
              href={getFilterRemoveUrl("shoeType")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-[#111827] border border-amber-200 font-semibold hover:bg-amber-100 transition-colors"
              title="Remove shoe type filter"
            >
              <span>Type: {shoeType}</span>
              <span className="font-bold text-amber-700">×</span>
            </Link>
          )}
          {gender && (
            <Link
              href={getFilterRemoveUrl("gender")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-[#111827] border border-[#E5E7EB] font-medium hover:bg-gray-200 transition-colors"
              title="Remove gender filter"
            >
              <span>Gender: {gender}</span>
              <span className="font-bold text-gray-600">×</span>
            </Link>
          )}
          {size && (
            <Link
              href={getFilterRemoveUrl("size")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F59E0B] text-[#111827] border border-[#F59E0B] font-bold hover:bg-amber-500 transition-colors"
              title="Remove size filter"
            >
              <span>Size: {size}</span>
              <span className="font-black">×</span>
            </Link>
          )}
          {(minPrice !== undefined || maxPrice !== undefined) && (
            <Link
              href={getFilterRemoveUrl("price")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-[#15803D] border border-emerald-200 font-semibold hover:bg-emerald-100 transition-colors"
              title="Remove price filter"
            >
              <span>Price: ₹{minPrice || 0} - ₹{maxPrice || "Max"}</span>
              <span className="font-bold text-[#15803D]">×</span>
            </Link>
          )}
          {minRating !== undefined && (
            <Link
              href={getFilterRemoveUrl("rating")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-[#111827] border border-amber-200 font-semibold hover:bg-amber-100 transition-colors"
              title="Remove rating filter"
            >
              <span>{minRating}★ &amp; above</span>
              <span className="font-bold text-amber-700">×</span>
            </Link>
          )}
          {inStockOnly && (
            <Link
              href={getFilterRemoveUrl("inStock")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-[#15803D] border border-emerald-200 font-semibold hover:bg-emerald-100 transition-colors"
              title="Remove stock filter"
            >
              <span>In Stock Only</span>
              <span className="font-bold text-[#15803D]">×</span>
            </Link>
          )}
          {hasAnyFilter && (
            <Link
              href={searchQuery ? `/search?q=${encodeURIComponent(searchQuery)}` : "/search"}
              className="text-xs font-semibold text-[#6B7280] hover:text-[#111827] underline ml-1 transition-colors"
            >
              Clear Filters
            </Link>
          )}
        </div>
      )}

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        categories={categories}
        brands={brands}
        currentCategory={categorySlug}
        currentBrand={brand}
        currentShoeType={shoeType}
        currentGender={gender}
        currentSize={size}
        currentMinPrice={minPrice}
        currentMaxPrice={maxPrice}
        currentMinRating={minRating}
        currentInStock={inStockOnly}
        searchQuery={searchQuery}
        totalProductsCount={comparisons.length}
      />

      {/* Main Grid: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Column: Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <FilterSidebar
            categories={categories}
            brands={brands}
            currentCategory={categorySlug}
            currentBrand={brand}
            currentShoeType={shoeType}
            currentGender={gender}
            currentSize={size}
            currentMinPrice={minPrice}
            currentMaxPrice={maxPrice}
            currentMinRating={minRating}
            currentInStock={inStockOnly}
            searchQuery={searchQuery}
          />
        </div>

        {/* Right Column: Products List or No Results */}
        <div className="lg:col-span-3">
          {comparisons.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <SearchIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#111827]">
                  No matching Amazon products found
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                  {hasAnyFilter
                    ? `No products match the selected filters for "${searchQuery}". Try clearing filters or searching for another item.`
                    : `We couldn't find products matching "${searchQuery}". Try checking spelling, using more general keywords, or browsing popular categories below.`}
                </p>
              </div>

              {hasAnyFilter && (
                <div className="pt-1">
                  <Link
                    href={searchQuery ? `/search?q=${encodeURIComponent(searchQuery)}` : "/search"}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#111827] text-white hover:bg-black text-xs font-bold transition-colors"
                  >
                    Reset All Filters
                  </Link>
                </div>
              )}

              {/* Suggestions */}
              <div className="pt-3 flex items-center justify-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400 font-medium w-full block">Try searching for:</span>
                {["Shoes", "Running Shoes", "Nike Shoes", "iPhone 15", "Laptops", "Air Fryer", "Headphones"].map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-amber-50 hover:text-amber-900 border border-gray-200 text-xs font-semibold text-gray-700 transition-colors"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <InfiniteProductGrid
              initialComparisons={comparisons}
              filters={{
                searchQuery,
                categorySlug,
                brand,
                shoeType,
                gender,
                size,
                minPrice,
                maxPrice,
                minRating,
                sortBy,
                inStockOnly,
              }}
              totalProductsCount={comparisons.length}
            />
          )}
        </div>
      </div>
    </div>
  );
}
