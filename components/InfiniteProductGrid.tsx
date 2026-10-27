"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ProductCard } from "./ProductCard";
import { PriceComparison } from "@/lib/types";
import { Loader2, ArrowUp, Sparkles, RefreshCw, AlertCircle, Search } from "lucide-react";

interface InfiniteProductGridProps {
  initialComparisons: PriceComparison[];
  filters: {
    searchQuery?: string;
    categorySlug?: string;
    retailerSlug?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: string;
    inStockOnly?: boolean;
  };
  totalProductsCount?: number | string;
}

export const InfiniteProductGrid: React.FC<InfiniteProductGridProps> = ({
  initialComparisons,
  filters,
  totalProductsCount,
}) => {
  const [products, setProducts] = useState<PriceComparison[]>(initialComparisons);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialComparisons.length >= 24);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const pageRef = useRef(1);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Serialize filter values so object reference changes don't cause spurious re-renders
  const filterKey = useMemo(() => {
    return [
      filters.searchQuery || "",
      filters.categorySlug || "",
      filters.retailerSlug || "",
      filters.brand || "",
      filters.minPrice ?? "",
      filters.maxPrice ?? "",
      filters.minRating ?? "",
      filters.sortBy || "",
      filters.inStockOnly ? "inStock" : "",
    ].join("|");
  }, [
    filters.searchQuery,
    filters.categorySlug,
    filters.retailerSlug,
    filters.brand,
    filters.minPrice,
    filters.maxPrice,
    filters.minRating,
    filters.sortBy,
    filters.inStockOnly,
  ]);

  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Reset when filters actually change, and abort in-flight requests
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setProducts(initialComparisons);
    setPage(1);
    pageRef.current = 1;
    setHasMore(initialComparisons.length >= 24);
    setIsLoading(false);
    setLoadError(null);
    isFetchingRef.current = false;
  }, [filterKey, initialComparisons]);

  // Monitor scroll for Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    setLoadError(null);

    const currentFilters = filtersRef.current;
    const nextPage = pageRef.current + 1;

    // Create fresh AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const params = new URLSearchParams();
      if (currentFilters.searchQuery) params.set("search", currentFilters.searchQuery);
      if (currentFilters.categorySlug && currentFilters.categorySlug !== "all") {
        params.set("category", currentFilters.categorySlug);
      }
      if (currentFilters.retailerSlug && currentFilters.retailerSlug !== "all") {
        params.set("retailer", currentFilters.retailerSlug);
      }
      if (currentFilters.brand) params.set("brand", currentFilters.brand);
      if (currentFilters.minPrice !== undefined) params.set("minPrice", String(currentFilters.minPrice));
      if (currentFilters.maxPrice !== undefined) params.set("maxPrice", String(currentFilters.maxPrice));
      if (currentFilters.minRating !== undefined) params.set("minRating", String(currentFilters.minRating));
      if (currentFilters.sortBy) params.set("sortBy", currentFilters.sortBy);
      if (currentFilters.inStockOnly) params.set("inStock", "true");
      params.set("page", String(nextPage));
      params.set("limit", "24");

      const res = await fetch(`/api/products?${params.toString()}`, {
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json();
        const newItems: PriceComparison[] = data.products || [];

        if (newItems.length > 0) {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.product.id));
            const unique = newItems.filter((item) => !existingIds.has(item.product.id));
            return [...prev, ...unique];
          });
          setPage(nextPage);
          pageRef.current = nextPage;
          setHasMore(data.hasMore !== undefined ? data.hasMore : newItems.length >= 24);
        } else {
          setHasMore(false);
        }
      } else {
        setLoadError("Unable to load additional products. Please try again.");
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") {
        // Obsolete request cleanly cancelled
        return;
      }
      setLoadError("Network error while loading more products.");
      console.warn("Failed to load more products:", err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [hasMore]);

  // IntersectionObserver for Amazon-style continuous scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingRef.current && hasMore && !loadError) {
          loadMore();
        }
      },
      { rootMargin: "500px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore, loadError]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (products.length === 0 && !isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 mx-auto flex items-center justify-center">
          <Search className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">No matching Amazon products found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Try loosening your price filters, selecting a different brand, or clearing search keywords.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Amazon-First Results Status Banner */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs">
        <span className="text-slate-600 font-medium">
          Showing <strong>1–{products.length}</strong> {totalProductsCount ? `of ${totalProductsCount}` : ""} Amazon products
        </span>
        <span className="inline-flex items-center gap-1.5 text-orange-800 font-bold bg-orange-100/70 px-2.5 py-0.5 rounded-full border border-orange-200 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span>Amazon India Verified Catalog</span>
        </span>
      </div>

      {/* Main Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((comp) => (
          <ProductCard key={comp.product.id} comparison={comp} />
        ))}

        {/* Loading Skeletons when fetching next batch */}
        {isLoading &&
          [1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={`skeleton-${n}`}
              className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse shadow-xs"
            >
              <div className="aspect-square w-full bg-slate-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-slate-200" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-16 bg-orange-100 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="h-5 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-emerald-100 rounded" />
              </div>
            </div>
          ))}
      </div>

      {/* Bottom Sentinel & Control Bar */}
      <div ref={sentinelRef} className="pt-6 pb-12 flex flex-col items-center justify-center gap-4">
        {isLoading ? (
          <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
            <span>Loading more Amazon India products...</span>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 px-4 py-2 rounded-xl border border-rose-200">
              <AlertCircle className="w-4 h-4" />
              <span>{loadError}</span>
            </div>
            <button
              type="button"
              onClick={loadMore}
              className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Loading</span>
            </button>
          </div>
        ) : hasMore ? (
          <button
            type="button"
            onClick={loadMore}
            className="group px-6 py-2.5 rounded-full bg-white hover:bg-orange-500 hover:text-white border border-slate-300 hover:border-orange-500 text-slate-800 text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Load More Products</span>
            <span className="text-[10px] text-slate-400 group-hover:text-orange-100">
              (Scroll down to auto-load)
            </span>
          </button>
        ) : (
          <div className="text-center py-4 text-xs font-semibold text-slate-400">
            You&apos;ve reached the end of the results.
          </div>
        )}
      </div>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-slate-900/90 text-white shadow-xl hover:bg-orange-600 hover:scale-110 transition-all duration-200 backdrop-blur-xs flex items-center justify-center cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
