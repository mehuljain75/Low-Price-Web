import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import {
  Search as SearchIcon,
  ArrowRight,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { repository } from "@/lib/data/repository";
import { InfiniteProductGrid } from "@/components/InfiniteProductGrid";
import { FilterSidebar } from "@/components/FilterSidebar";
import { SortDropdown } from "@/components/SortDropdown";
import { MobileFilterDrawer } from "@/components/MobileFilterDrawer";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { executeSearchPipeline } from "@/lib/search/search-orchestrator";

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
    exact?: string;
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
  const forceExact = resolved.exact === "1" || resolved.exact === "true";

  const categories = await repository.getCategories();
  const brands = await repository.getBrands(categorySlug);

  const searchResult = await executeSearchPipeline({
    query: searchQuery,
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
    forceExact,
  });

  const comparisons = searchResult.results;

  // Helper to remove one filter while keeping other active filters and q
  const getFilterRemoveUrl = (removeKey: string) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (forceExact) params.set("exact", "1");
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
      {/* Top Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <SearchAutocomplete
          variant="hero"
          initialCategory={categorySlug || "all"}
          initialQuery={searchQuery}
          placeholder="Search Amazon products, brands, or deals (e.g., iPhone 15, Cadbury Chocolate, Nike)..."
        />
      </div>

      {/* Query Correction Notice (High-confidence typo correction) */}
      {searchResult.searchStatus === "corrected" && searchResult.correctedQuery && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm animate-in fade-in duration-150">
          <div className="flex items-start sm:items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="text-gray-700">Showing results for </span>
              <span className="font-bold text-[#111827] underline decoration-amber-500 decoration-2">
                {searchResult.correctedQuery}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm ml-2">
                Search instead for{" "}
                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery)}&exact=1`}
                  className="text-amber-700 hover:text-amber-900 underline font-semibold transition-colors"
                >
                  {searchQuery}
                </Link>
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full w-fit">
            Spelling auto-corrected
          </span>
        </div>
      )}

      {/* "Did you mean?" suggestions */}
      {searchResult.didYouMean && searchResult.searchStatus !== "corrected" && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm">
          <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-gray-600">Did you mean:</span>
          <Link
            href={`/search?q=${encodeURIComponent(searchResult.didYouMean)}`}
            className="font-bold text-amber-700 hover:text-amber-800 hover:underline"
          >
            {searchResult.didYouMean}
          </Link>
        </div>
      )}

      {/* Upstream Amazon Search Availability Notice */}
      {comparisons.length > 0 &&
        searchQuery &&
        searchResult.amazonApiStatus !== "ready" &&
        searchResult.amazonApiStatus !== "empty" && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
              <span>
                Live Amazon product search is currently unavailable ({searchResult.amazonApiStatus === "unconfigured" ? "API keys pending" : searchResult.amazonApiStatus}). Showing matching results from our verified catalog.
              </span>
            </div>
            <a
              href={searchResult.externalSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline hover:text-amber-700 whitespace-nowrap self-end sm:self-auto"
            >
              Search Amazon India &rarr;
            </a>
          </div>
        )}

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
                  Results for &ldquo;
                  <span className="text-amber-600">
                    {searchResult.correctedQuery && searchResult.searchStatus === "corrected"
                      ? searchResult.correctedQuery
                      : searchQuery}
                  </span>
                  &rdquo;
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
      {(searchQuery || hasAnyFilter || searchResult.intent.maxPrice) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[#6B7280] font-medium">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-[#111827] font-medium border border-[#E5E7EB]">
              Query: &quot;{searchQuery}&quot;
            </span>
          )}
          {searchResult.intent.maxPrice && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              Budget: Under ₹{searchResult.intent.maxPrice.toLocaleString("en-IN")}
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

        {/* Right Column: Products List or Zero-Results Recovery */}
        <div className="lg:col-span-3">
          {comparisons.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center space-y-8 shadow-xs">
              {/* Header / Notice */}
              <div className="max-w-xl mx-auto space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                  <SearchIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#111827]">
                  No direct matches found in our catalog for &ldquo;{searchQuery || "your search"}&rdquo;
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {hasAnyFilter
                    ? "No products matched your combined filters. Try clearing filters or searching for more general keywords."
                    : "While this exact item is currently not in our indexed catalog, you can search live listings, verified stock, and Prime offers directly on Amazon India."}
                </p>
              </div>

              {/* Primary Recovery CTA: External Amazon India Search (Option B) */}
              {searchResult.externalSearchUrl && searchQuery && (
                <div className="max-w-lg mx-auto bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 text-left space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                        External Amazon India Search
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                      Opens outside DealFinder
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">
                      Couldn&apos;t find the exact product? Search Amazon India.
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Search directly across millions of live sellers, verified reviews, Prime offers, and Lightning Deals on Amazon.in.
                    </p>
                  </div>
                  <a
                    href={searchResult.externalSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-[#FF9900] hover:bg-[#E68A00] text-black font-bold text-sm shadow-sm transition-all hover:scale-[1.01]"
                  >
                    <span>Search Amazon India for {searchQuery}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Reset Filters CTA if any filter active */}
              {hasAnyFilter && (
                <div className="pt-2">
                  <Link
                    href={searchQuery ? `/search?q=${encodeURIComponent(searchQuery)}` : "/search"}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#111827] text-white hover:bg-black text-xs font-bold transition-colors"
                  >
                    Reset All Filters
                  </Link>
                </div>
              )}

              {/* Popular Categories Grid */}
              <div className="pt-4 border-t border-gray-100 max-w-2xl mx-auto space-y-4 text-left">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
                  Or browse popular shopping categories
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { name: "Mobiles & Tablets", slug: "mobiles", desc: "iPhones, Samsung, OnePlus" },
                    { name: "Laptops & PCs", slug: "laptops", desc: "MacBooks, Gaming, Dell" },
                    { name: "Audio & Headphones", slug: "audio", desc: "Sony, boAt, AirPods" },
                    { name: "Fashion & Apparel", slug: "fashion", desc: "Kurtas, Footwear, Watches" },
                    { name: "Home Appliances", slug: "appliances", desc: "Air Fryers, Kitchen" },
                    { name: "Beauty & Personal", slug: "beauty", desc: "Skincare, Grooming" },
                  ].map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/search?category=${cat.slug}`}
                      className="p-3 rounded-xl bg-gray-50 hover:bg-amber-50 hover:border-amber-200 border border-gray-200 transition-all group"
                    >
                      <div className="font-semibold text-xs text-gray-900 group-hover:text-amber-900">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate mt-0.5">{cat.desc}</div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Popular Search Suggestions Pills */}
              <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400 font-medium w-full block">
                  Popular searches:
                </span>
                {[
                  "Chocolate",
                  "Protein Powder",
                  "Running Shoes",
                  "Nike Shoes",
                  "iPhone 15",
                  "Laptops Under 50000",
                  "Smart TV",
                  "Air Fryer",
                  "Bluetooth Headphones",
                ].map((term) => (
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
            <div className="space-y-8">
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

              {/* Persistent Option B Fallback at Bottom of Results */}
              {searchResult.externalSearchUrl && searchQuery && (
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        External Search
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 pt-0.5">
                      Couldn&apos;t find the exact product? Search Amazon India.
                    </h4>
                    <p className="text-xs text-gray-500">
                      Browse all live marketplace listings, customer reviews, and Lightning Deals directly on Amazon India (opens in a new tab).
                    </p>
                  </div>
                  <a
                    href={searchResult.externalSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#111827] text-white hover:bg-black text-xs font-bold transition-colors flex-shrink-0"
                  >
                    <span>Search Amazon India for {searchQuery}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
