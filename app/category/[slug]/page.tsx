import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { repository } from "@/lib/data/repository";
import { InfiniteProductGrid } from "@/components/InfiniteProductGrid";
import { FilterSidebar } from "@/components/FilterSidebar";
import { SortDropdown } from "@/components/SortDropdown";
import { MobileFilterDrawer } from "@/components/MobileFilterDrawer";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    sortBy?: "price_asc" | "price_desc" | "discount" | "newest" | "rating";
    inStock?: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const category = await repository.getCategoryBySlug(resolvedParams.slug);

  if (!category) {
    return {
      title: "Category Not Found | DealFinder India",
      description: "Explore product categories on DealFinder India.",
    };
  }

  return {
    title: `${category.name} Deals & Price Comparison on Amazon India | DealFinder`,
    description: `Discover top ${category.name} on Amazon India. Compare deals, filter by brand, price, and customer ratings.`,
    alternates: {
      canonical: `/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const category = await repository.getCategoryBySlug(resolvedParams.slug);
  if (!category) {
    notFound();
  }

  const brand = resolvedSearchParams.brand;
  const minPrice = resolvedSearchParams.minPrice ? Number(resolvedSearchParams.minPrice) : undefined;
  const maxPrice = resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : undefined;
  const minRating = resolvedSearchParams.minRating ? Number(resolvedSearchParams.minRating) : undefined;
  const sortBy = resolvedSearchParams.sortBy || "discount";
  const inStockOnly = resolvedSearchParams.inStock === "true";

  const categories = await repository.getCategories();
  const brands = await repository.getBrands(category.slug);

  const comparisons = await repository.getProducts({
    categorySlug: category.slug,
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
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
            <Link href="/" className="hover:text-[#111827] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[#111827] transition-colors">
              Products
            </Link>
            <span>/</span>
            <span className="text-[#111827] font-semibold">{category.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight flex items-center gap-2">
            <span>{category.name} on Amazon India</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1 max-w-2xl">
            {category.description || `Discover top ${category.name} deals and prices on Amazon India.`}
          </p>
        </div>

        {/* Sorting Dropdown */}
        <SortDropdown currentSort={sortBy} />
      </div>

      {/* Active Filter Badges */}
      {(brand || minPrice !== undefined || maxPrice !== undefined || minRating !== undefined || inStockOnly) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[#6B7280] font-medium">Active filters:</span>
          {brand && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-[#111827] border border-[#E5E7EB] font-semibold">
              Brand: {brand}
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
            href={`/category/${category.slug}`}
            className="text-xs font-semibold text-[#6B7280] hover:text-[#111827] underline ml-1 transition-colors"
          >
            Clear Filters
          </Link>
        </div>
      )}

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        categories={categories}
        brands={brands}
        currentCategory={category.slug}
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
            currentCategory={category.slug}
            currentBrand={brand}
            currentMinPrice={minPrice}
            currentMaxPrice={maxPrice}
            currentMinRating={minRating}
            currentInStock={inStockOnly}
          />
        </div>

        {/* Right Column: Products List */}
        <div className="lg:col-span-3">
          <InfiniteProductGrid
            initialComparisons={comparisons}
            filters={{
              categorySlug: category.slug,
              brand,
              minPrice,
              maxPrice,
              minRating,
              sortBy,
              inStockOnly,
            }}
            totalProductsCount={comparisons.length}
          />
        </div>
      </div>
    </div>
  );
}
