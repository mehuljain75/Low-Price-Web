import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { repository } from "@/lib/data/repository";
import { InfiniteProductGrid } from "@/components/InfiniteProductGrid";
import { FilterSidebar } from "@/components/FilterSidebar";
import { SortDropdown } from "@/components/SortDropdown";
import { MobileFilterDrawer } from "@/components/MobileFilterDrawer";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    q?: string;
    category?: string;
    retailer?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    sortBy?: "price_asc" | "price_desc" | "discount" | "newest" | "rating";
    inStock?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.search || resolvedParams.q;
  const categorySlug = resolvedParams.category;
  const brandQuery = resolvedParams.brand;
  const minPrice = resolvedParams.minPrice ? Number(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? Number(resolvedParams.maxPrice) : undefined;
  const minRating = resolvedParams.minRating ? Number(resolvedParams.minRating) : undefined;
  const sortBy = resolvedParams.sortBy || "discount";
  const inStockOnly = resolvedParams.inStock === "true";

  const categories = await repository.getCategories();
  const brands = await repository.getBrands(categorySlug);

  // If a category is selected and the active brand does not belong to that category, reset it
  const effectiveBrand =
    brandQuery && categorySlug && categorySlug !== "all"
      ? brands.some((b) => b.toLowerCase() === brandQuery.toLowerCase())
        ? brandQuery
        : undefined
      : brandQuery;

  const comparisons = await repository.getProducts({
    searchQuery,
    categorySlug,
    brand: effectiveBrand,
    minPrice,
    maxPrice,
    minRating,
    sortBy,
    inStockOnly,
    page: 1,
    limit: 24,
  });

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header / Breadcrumbs & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
            <Link href="/" className="hover:text-[#111827] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#111827] font-semibold">Products</span>
            {activeCategory && (
              <>
                <span>/</span>
                <span className="text-[#111827] font-semibold">{activeCategory.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
            {activeCategory ? `${activeCategory.name} on Amazon India` : "All Amazon India Products"}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Browse deals, filter by department, brand, and customer ratings on Amazon India
          </p>
        </div>

        {/* Sorting Dropdown */}
        <SortDropdown currentSort={sortBy} />
      </div>

      {/* Active Filter Badges */}
      {(searchQuery || effectiveBrand || activeCategory || minPrice !== undefined || maxPrice !== undefined || minRating !== undefined || inStockOnly) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[#6B7280] font-medium">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-[#111827] font-medium border border-[#E5E7EB]">
              Query: &quot;{searchQuery}&quot;
            </span>
          )}
          {effectiveBrand && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-[#111827] border border-[#E5E7EB] font-semibold">
              Brand: {effectiveBrand}
            </span>
          )}
          {activeCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-[#111827] border border-amber-200 font-semibold">
              Category: {activeCategory.name}
            </span>
          )}
          {(minPrice !== undefined || maxPrice !== undefined) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-[#15803D] border border-emerald-200 font-semibold">
              Price: ₹{minPrice || 0} - ₹{maxPrice || "Max"}
            </span>
          )}
          {minRating !== undefined && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-[#111827] border border-amber-200 font-semibold">
              {minRating}★ &amp; above
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-[#15803D] border border-emerald-200 font-semibold">
              In Stock Only
            </span>
          )}
          <Link
            href="/products"
            className="text-xs font-semibold text-[#6B7280] hover:text-[#111827] underline ml-1 transition-colors"
          >
            Clear All
          </Link>
        </div>
      )}

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        categories={categories}
        brands={brands}
        currentCategory={categorySlug}
        currentBrand={effectiveBrand}
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
            currentBrand={effectiveBrand}
            currentMinPrice={minPrice}
            currentMaxPrice={maxPrice}
            currentMinRating={minRating}
            currentInStock={inStockOnly}
          />
        </div>

        {/* Right Column: Products List */}
        <div className="lg:col-span-3">
          {comparisons.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#111827]">
                  No matching Amazon products found
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                  Try adjusting your search query, expanding the price range, or clearing filters.
                </p>
              </div>
              <div>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl bg-[#F59E0B] hover:bg-amber-600 text-[#111827] transition-colors cursor-pointer"
                >
                  Reset All Filters
                </Link>
              </div>
            </div>
          ) : (
            <InfiniteProductGrid
              initialComparisons={comparisons}
              filters={{
                searchQuery,
                categorySlug,
                brand: effectiveBrand,
                minPrice,
                maxPrice,
                minRating,
                sortBy,
                inStockOnly,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
