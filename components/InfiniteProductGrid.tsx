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
    shoeType?: string;
    gender?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: string;
    inStockOnly?: boolean;
  };
  totalProductsCount?: number | string;
}

function deduplicateProductList(items: PriceComparison[]): PriceComparison[] {
  const seenIds = new Set<string>();
  const seenAsins = new Set<string>();
  const seenTitles = new Set<string>();

  return items.filter((item) => {
    if (seenIds.has(item.product.id)) return false;
    seenIds.add(item.product.id);

    const amz = item.offers.find((o) => o.retailerSlug === "amazon");
    const asin = (amz?.retailerProductId || "").toUpperCase().trim();
    if (asin && /^B0[A-Z0-9]{8}$/.test(asin)) {
      if (seenAsins.has(asin)) return false;
      seenAsins.add(asin);
    }

    const titleNorm = item.product.title
      .replace(/\s*\([^)]*\)\s*$/g, "")
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
    if (titleNorm) {
      if (seenTitles.has(titleNorm)) return false;
      seenTitles.add(titleNorm);
    }

    return true;
  });
}

export const InfiniteProductGrid: React.FC<InfiniteProductGridProps> = ({
  initialComparisons,
  filters,
  totalProductsCount,
}) => {
  const numericTotal =
    totalProductsCount !== undefined && !isNaN(Number(totalProductsCount))
      ? Number(totalProductsCount)
      : undefined;

  const [products, setProducts] = useState<PriceComparison[]>(() => deduplicateProductList(initialComparisons));
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(() => {
    const clean = deduplicateProductList(initialComparisons);
    if (numericTotal !== undefined) {
      return clean.length < numericTotal;
    }
    return initialComparisons.length >= 24;
  });
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
      filters.shoeType || "",
      filters.gender || "",
      filters.size || "",
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
    filters.shoeType,
    filters.gender,
    filters.size,
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
    const cleanInitial = deduplicateProductList(initialComparisons);
    setProducts(cleanInitial);
    setPage(1);
    pageRef.current = 1;
    const canHaveMore =
      numericTotal !== undefined
        ? cleanInitial.length < numericTotal
        : cleanInitial.length >= 24;
    setHasMore(canHaveMore);
    setIsLoading(false);
    setLoadError(null);
    isFetchingRef.current = false;
  }, [filterKey, initialComparisons, numericTotal]);

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
      if (currentFilters.shoeType) params.set("shoeType", currentFilters.shoeType);
      if (currentFilters.gender) params.set("gender", currentFilters.gender);
      if (currentFilters.size) params.set("size", currentFilters.size);
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
            const existingAsins = new Set(
              prev
                .map((p) => {
                  const amz = p.offers.find((o) => o.retailerSlug === "amazon");
                  return (amz?.retailerProductId || "").toUpperCase();
                })
                .filter((a) => /^B0[A-Z0-9]{8}$/.test(a))
            );
            const existingTitles = new Set(
              prev.map((p) =>
                p.product.title
                  .replace(/\s*\([^)]*\)\s*$/g, "")
                  .replace(/[^a-zA-Z0-9\s]/g, " ")
                  .toLowerCase()
                  .replace(/\s+/g, " ")
                  .trim()
              )
            );

            const unique = newItems.filter((item) => {
              if (existingIds.has(item.product.id)) return false;
              const amz = item.offers.find((o) => o.retailerSlug === "amazon");
              const asin = (amz?.retailerProductId || "").toUpperCase();
              if (asin && /^B0[A-Z0-9]{8}$/.test(asin) && existingAsins.has(asin)) return false;
              const titleNorm = item.product.title
                .replace(/\s*\([^)]*\)\s*$/g, "")
                .replace(/[^a-zA-Z0-9\s]/g, " ")
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();
              if (titleNorm && existingTitles.has(titleNorm)) return false;
              return true;
            });
            const combined = [...prev, ...unique];
            const moreAvailable =
              data.hasMore !== undefined
                ? data.hasMore
                : numericTotal !== undefined
                ? combined.length < numericTotal
                : newItems.length >= 24;
            setHasMore(moreAvailable && unique.length > 0);
            return combined;
          });
          setPage(nextPage);
          pageRef.current = nextPage;
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
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 sm:p-16 text-center space-y-4 shadow-card">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-[#E5E7EB] text-[#111827] mx-auto flex items-center justify-center">
          <Search className="w-6 h-6 text-gray-500" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-lg font-bold text-[#111827]">No matching Amazon products found</h3>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            Try loosening your price filters, selecting a different brand, or searching with broader keywords.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Status Banner */}
      <div className="flex items-center justify-between bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs shadow-card">
        <span className="text-[#6B7280] font-medium">
          Showing <strong className="text-[#111827]">1–{products.length}</strong> {totalProductsCount ? `of ${totalProductsCount}` : ""} products
        </span>
        <span className="inline-flex items-center gap-1.5 text-amber-900 font-bold bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
          <span>Verified Catalog</span>
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
              className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden animate-pulse shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="aspect-square w-full bg-gray-50 border-b border-[#E5E7EB] flex items-center justify-center p-6">
                  <div className="w-16 h-16 rounded-xl bg-gray-200/60" />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                    <div className="h-3 w-10 bg-gray-100 rounded" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  </div>
                  <div className="pt-2 flex items-baseline gap-2">
                    <div className="h-6 w-24 bg-gray-200 rounded" />
                    <div className="h-4 w-16 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
              <div className="p-4 pt-0">
                <div className="h-9 w-full bg-gray-200/70 rounded-lg" />
              </div>
            </div>
          ))}
      </div>

      {/* Bottom Sentinel & Control Bar */}
      <div ref={sentinelRef} className="pt-6 pb-12 flex flex-col items-center justify-center gap-4">
        {isLoading ? (
          <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-[#E5E7EB] text-[#111827] text-xs font-bold shadow-card">
            <Loader2 className="w-4 h-4 animate-spin text-[#F59E0B]" />
            <span>Loading more Amazon India products...</span>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B91C1C] bg-red-50 px-4 py-2.5 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 text-[#B91C1C]" />
              <span>{loadError}</span>
            </div>
            <button
              type="button"
              onClick={loadMore}
              className="px-5 py-2.5 rounded-lg bg-[#111827] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Loading</span>
            </button>
          </div>
        ) : hasMore ? (
          <button
            type="button"
            onClick={loadMore}
            className="group px-6 py-2.5 rounded-lg bg-white hover:bg-gray-50 border border-[#E5E7EB] hover:border-gray-300 text-[#111827] text-xs font-bold shadow-xs hover:shadow-card transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Load More Products</span>
            <span className="text-[10px] text-[#6B7280]">
              (Scroll down to auto-load)
            </span>
          </button>
        ) : (
          <div className="text-center py-6 text-xs font-medium text-[#6B7280] flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gray-200"></span>
            <span>You&apos;ve reached the end of results</span>
            <span className="h-px w-10 bg-gray-200"></span>
          </div>
        )}
      </div>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#111827] text-white shadow-xl hover:bg-[#F59E0B] hover:text-[#111827] transition-all duration-150 flex items-center justify-center cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
