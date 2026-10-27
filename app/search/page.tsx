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
    description: `Discover and compare prices for "${query}" on Amazon India with verified deals, specs, and reviews.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = await searchParams;
  const searchQuery = (resolved.q || resolved.search || "").trim();
  const categorySlug = resolved.category;
  const brand = resolved.brand;
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
    minPrice,
    maxPrice,
    minRating,
    sortBy,
    inStockOnly,
    page: 1,
    limit: 24,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header & Search Input */}
      <div className="space-y-4 pb-4 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/" className="hover:text-slate-900 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold">Search</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {searchQuery ? (
                <>
                  Results for &ldquo;<span className="text-orange-600">{searchQuery}</span>&rdquo;
                </>
              ) : (
                "Search Amazon Products"
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {comparisons.length > 0
                ? `Found ${comparisons.length}+ verified product listings on Amazon India`
                : "Enter product keywords to explore live deals on Amazon India"}
            </p>
          </div>

          {/* Sorting Dropdown */}
          <SortDropdown currentSort={sortBy} />
        </div>

        {/* Embedded Search Input */}
        <div className="max-w-xl">
          <SearchAutocomplete
            variant="hero"
            placeholder="Search Amazon India (e.g. iPhone 15, Dell XPS, Sony XM5)..."
          />
        </div>
      </div>

      {/* Active Filter Badges */}
      {(searchQuery || brand || categorySlug || minPrice !== undefined || maxPrice !== undefined || minRating !== undefined || inStockOnly) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
              Query: &quot;{searchQuery}&quot;
            </span>
          )}
          {categorySlug && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 font-medium">
              Category: {categories.find((c) => c.slug === categorySlug)?.name || categorySlug}
            </span>
          )}
          {brand && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
              Brand: {brand}
            </span>
          )}
          {(minPrice !== undefined || maxPrice !== undefined) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Price: ₹{minPrice || 0} - ₹{maxPrice || "Max"}
            </span>
          )}
          {minRating !== undefined && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
              {minRating}★ &amp; above
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              In Stock Only
            </span>
          )}
          <Link
            href={searchQuery ? `/search?q=${encodeURIComponent(searchQuery)}` : "/search"}
            className="text-orange-600 hover:text-orange-700 font-semibold underline ml-1"
          >
            Clear Filters
          </Link>
        </div>
      )}

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        categories={categories}
        brands={brands}
        currentCategory={categorySlug}
        currentBrand={brand}
        currentMinPrice={minPrice}
        currentMaxPrice={maxPrice}
        currentMinRating={minRating}
        currentInStock={inStockOnly}
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
            currentMinPrice={minPrice}
            currentMaxPrice={maxPrice}
            currentMinRating={minRating}
            currentInStock={inStockOnly}
          />
        </div>

        {/* Right Column: Products List or No Results */}
        <div className="lg:col-span-3">
          {comparisons.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 mx-auto flex items-center justify-center">
                <SearchIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  No matching Amazon products found
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  We couldn&apos;t find products matching &ldquo;{searchQuery}&rdquo;. Try checking spelling, using more general keywords, or browsing popular categories below.
                </p>
              </div>

              {/* Suggestions */}
              <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                {["Mobiles", "Laptops", "Headphones", "Air Fryer", "Smartwatch"].map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-xs font-semibold text-slate-700 transition-colors"
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
