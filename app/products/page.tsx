import React from "react";
import Link from "next/link";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { repository } from "@/lib/data/repository";
import { ProductCard } from "@/components/ProductCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { SortDropdown } from "@/components/SortDropdown";
import { MobileFilterDrawer } from "@/components/MobileFilterDrawer";
import { RetailerSlug } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    retailer?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: "price_asc" | "price_desc" | "discount" | "newest";
    inStock?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.search;
  const categorySlug = resolvedParams.category;
  const retailerSlug = resolvedParams.retailer as RetailerSlug | undefined;
  const brandQuery = resolvedParams.brand;
  const minPrice = resolvedParams.minPrice ? Number(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? Number(resolvedParams.maxPrice) : undefined;
  const sortBy = resolvedParams.sortBy || "discount";
  const inStockOnly = resolvedParams.inStock === "true";

  const categories = await repository.getCategories();
  const retailers = await repository.getRetailers();
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
    retailerSlug,
    brand: effectiveBrand,
    minPrice,
    maxPrice,
    sortBy,
    inStockOnly,
  });

  const activeCategory = categories.find((c) => c.slug === categorySlug);
  const activeRetailer = retailers.find((r) => r.slug === retailerSlug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header / Breadcrumbs & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {activeCategory ? activeCategory.name : "All Products & Deals"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Found <strong>{comparisons.length} products</strong> across tracked Indian stores
          </p>
        </div>

        {/* Sorting Dropdown */}
        <SortDropdown currentSort={sortBy} />
      </div>

      {/* Active Filter Badges */}
      {(searchQuery || effectiveBrand || activeCategory || activeRetailer || minPrice !== undefined || maxPrice !== undefined || inStockOnly) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Query: &quot;{searchQuery}&quot;
            </span>
          )}
          {effectiveBrand && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
              Brand: {effectiveBrand}
            </span>
          )}
          {activeCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-800">
              Category: {activeCategory.name}
            </span>
          )}
          {activeRetailer && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
              Store: {activeRetailer.name}
            </span>
          )}
          {(minPrice !== undefined || maxPrice !== undefined) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Price: ₹{minPrice || 0} - ₹{maxPrice || "Max"}
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              In Stock Only
            </span>
          )}
          <Link
            href="/products"
            className="text-orange-600 hover:text-orange-700 font-semibold underline ml-1"
          >
            Clear All
          </Link>
        </div>
      )}

      {/* Mobile Filter Drawer (Bottom Sheet on mobile screens) */}
      <MobileFilterDrawer
        categories={categories}
        retailers={retailers}
        brands={brands}
        currentCategory={categorySlug}
        currentRetailer={retailerSlug}
        currentBrand={effectiveBrand}
        currentMinPrice={minPrice}
        currentMaxPrice={maxPrice}
        currentInStock={inStockOnly}
        totalProductsCount={comparisons.length}
      />

      {/* Main Grid: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Column: Filter Sidebar (Desktop Only) */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <FilterSidebar
            categories={categories}
            retailers={retailers}
            brands={brands}
            currentCategory={categorySlug}
            currentRetailer={retailerSlug}
            currentBrand={effectiveBrand}
            currentMinPrice={minPrice}
            currentMaxPrice={maxPrice}
            currentInStock={inStockOnly}
          />
        </div>

        {/* Right Column: Products List */}
        <div className="lg:col-span-3">
          {comparisons.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  No matching products found
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Try adjusting your search query, expanding the price range, or selecting different categories.
                </p>
              </div>
              <div>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                >
                  Reset All Filters
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {comparisons.map((comp) => (
                <ProductCard key={comp.product.id} comparison={comp} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
