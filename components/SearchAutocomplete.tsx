"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  Flame,
  ArrowUpLeft,
  X,
  ChevronDown,
  ShoppingBag,
  Store,
  Tag,
  CornerDownLeft,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { QuerySuggestion, SearchProductSuggestion } from "@/lib/data/search-suggestions";

interface SearchAutocompleteProps {
  placeholder?: string;
  variant?: "navbar" | "hero";
  initialCategory?: string;
  className?: string;
  onSearchSubmit?: () => void;
}

const CATEGORY_OPTIONS = [
  { slug: "all", label: "All Categories", shortLabel: "All" },
  { slug: "mobiles", label: "Mobiles & Tablets", shortLabel: "Mobiles" },
  { slug: "laptops", label: "Laptops & PCs", shortLabel: "Laptops" },
  { slug: "audio", label: "Audio & Headphones", shortLabel: "Audio" },
  { slug: "fashion", label: "Fashion & Apparel", shortLabel: "Fashion" },
  { slug: "appliances", label: "Home Appliances", shortLabel: "Appliances" },
  { slug: "beauty", label: "Beauty & Personal", shortLabel: "Beauty" },
];

const LOCAL_STORAGE_KEY = "dealfinder_recent_searches";

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  placeholder = "Search iPhone 15, Samsung Galaxy, MacBooks, Earbuds, Kurta...",
  variant = "navbar",
  initialCategory = "all",
  className = "",
  onSearchSubmit,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [suggestions, setSuggestions] = useState<{
    querySuggestions: QuerySuggestion[];
    products: SearchProductSuggestion[];
    categories: Array<{ name: string; slug: string }>;
    trending: string[];
  }>({
    querySuggestions: [],
    products: [],
    categories: [],
    trending: [],
  });

  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors (private browsing, etc.)
    }
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 6);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const removeRecentSearch = (e: React.MouseEvent, termToRemove: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== termToRemove);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Fetch suggestions with 120ms debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions((prev) => ({
        ...prev,
        querySuggestions: [],
        products: [],
      }));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const catParam = selectedCategory !== "all" ? `&category=${encodeURIComponent(selectedCategory)}` : "";
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}${catParam}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.warn("Autocomplete fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build unified flat list of selectable items for keyboard navigation
  const selectableItems = useMemo(() => {
    const hasQuery = query.trim().length > 0;
    if (hasQuery) {
      const items: Array<
        | { type: "suggestion"; data: QuerySuggestion }
        | { type: "product"; data: SearchProductSuggestion }
      > = [];
      suggestions.querySuggestions.forEach((s) => items.push({ type: "suggestion", data: s }));
      suggestions.products.forEach((p) => items.push({ type: "product", data: p }));
      return items;
    } else {
      const items: Array<
        | { type: "recent"; text: string }
        | { type: "trending"; text: string }
      > = [];
      recentSearches.forEach((r) => items.push({ type: "recent", text: r }));
      const trendingToShow = suggestions.trending.length > 0
        ? suggestions.trending
        : ["iPhone 15", "Samsung Galaxy S24", "MacBook Air M2", "Sony WH-1000XM5", "boAt Airdopes", "Air Fryer"];
      trendingToShow.slice(0, 6).forEach((t) => items.push({ type: "trending", text: t }));
      return items;
    }
  }, [query, suggestions, recentSearches]);

  // Execute navigation/search
  const triggerSearch = useCallback(
    (searchTerm: string, categorySlug?: string) => {
      const trimmed = searchTerm.trim().replace(/\s+/g, " ");
      if (!trimmed) return;

      saveRecentSearch(trimmed);
      setIsOpen(false);
      setSelectedIndex(-1);
      if (onSearchSubmit) onSearchSubmit();

      const effectiveCat = categorySlug || (selectedCategory !== "all" ? selectedCategory : undefined);
      const params = new URLSearchParams();
      params.set("q", trimmed);
      if (effectiveCat && effectiveCat !== "all") {
        params.set("category", effectiveCat);
      }

      router.push(`/search?${params.toString()}`);
    },
    [router, selectedCategory, saveRecentSearch, onSearchSubmit]
  );

  const triggerProductClick = useCallback(
    (product: SearchProductSuggestion) => {
      saveRecentSearch(product.title);
      setIsOpen(false);
      setSelectedIndex(-1);
      if (onSearchSubmit) onSearchSubmit();
      router.push(`/products/${product.id}`);
    },
    [router, saveRecentSearch, onSearchSubmit]
  );

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < selectableItems.length) {
      const selected = selectableItems[selectedIndex];
      if (selected.type === "suggestion") {
        triggerSearch(selected.data.text, selected.data.categorySlug);
        return;
      }
      if (selected.type === "product") {
        triggerProductClick(selected.data);
        return;
      }
      if (selected.type === "recent" || selected.type === "trending") {
        triggerSearch(selected.text);
        return;
      }
    }
    if (query.trim()) {
      triggerSearch(query.trim());
    }
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = prev < selectableItems.length - 1 ? prev + 1 : 0;
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : selectableItems.length - 1;
        return next;
      });
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  // Quick fill (Google & Amazon arrow icon)
  const handleFill = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    setQuery(text);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Clear query button
  const handleClear = () => {
    setQuery("");
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const hasQuery = query.trim().length > 0;
  const showRecentOrTrending = !hasQuery && (recentSearches.length > 0 || suggestions.trending.length > 0);
  const showTypingSuggestions = hasQuery && (suggestions.querySuggestions.length > 0 || suggestions.products.length > 0);
  const shouldRenderDropdown = isOpen && (showRecentOrTrending || showTypingSuggestions);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Amazon-style Capsule Search Bar Container */}
      <form
        onSubmit={handleSubmit}
        className={`group relative flex items-center bg-white rounded-full transition-all duration-200 border ${
          isOpen
            ? "border-orange-500 ring-2 ring-orange-500/30 shadow-md"
            : "border-slate-300 hover:border-slate-400 shadow-sm"
        } ${variant === "hero" ? "p-1.5" : "p-0.5"}`}
      >
        {/* Amazon Category Dropdown (Left side) */}
        <div className="relative flex-shrink-0 hidden sm:flex items-center pl-1">
          <label htmlFor="search-category" className="sr-only">Category</label>
          <select
            id="search-category"
            aria-label="Filter search by category"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              inputRef.current?.focus();
            }}
            className={`appearance-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-l-full cursor-pointer transition-colors focus:outline-none pr-7 pl-3 text-xs ${
              variant === "hero" ? "py-2.5" : "py-2"
            }`}
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.shortLabel}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 pointer-events-none" />
          <div className="h-5 w-[1px] bg-slate-200 mx-1"></div>
        </div>

        {/* Search Icon / Loading indicator */}
        <div className="pl-3 pr-1 text-slate-400 flex items-center justify-center flex-shrink-0">
          <Search className={`${variant === "hero" ? "w-5 h-5" : "w-4 h-4"} text-slate-400`} />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          className={`w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none font-normal ${
            variant === "hero" ? "px-2 py-2 text-base" : "px-2 py-1.5 text-sm"
          }`}
        />

        {/* One-click Clear (X) button */}
        {hasQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 mr-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="Clear search input"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Amazon Orange Search / Compare Button */}
        <button
          type="submit"
          className={`flex-shrink-0 flex items-center justify-center gap-1.5 font-bold rounded-full text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-[0.98] transition-all shadow-sm ${
            variant === "hero" ? "px-6 py-2.5 text-sm" : "px-4 py-1.5 text-xs"
          }`}
        >
          <span>Compare</span>
        </button>
      </form>

      {/* Google + Amazon Autocomplete Dropdown */}
      {shouldRenderDropdown && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {/* ZERO-STATE: Recent Searches & Trending */}
          {showRecentOrTrending && (
            <div className="p-2 space-y-3">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearAllRecent}
                      className="hover:text-orange-600 font-semibold lowercase transition-colors"
                    >
                      clear all
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    {recentSearches.map((term, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <div
                          key={`recent-${term}`}
                          role="option"
                          aria-selected={isSelected}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onClick={() => triggerSearch(term)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm cursor-pointer transition-colors ${
                            isSelected ? "bg-orange-50/80 text-orange-950" : "hover:bg-slate-50 text-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="truncate font-medium">{term}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleFill(e, term)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded"
                              title="Fill in search box"
                              aria-label={`Fill ${term}`}
                            >
                              <ArrowUpLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => removeRecentSearch(e, term)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Remove from history"
                              aria-label={`Remove ${term}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div>
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  Trending Searches in India
                </div>
                <div className="flex flex-wrap gap-1.5 px-3 py-1">
                  {(suggestions.trending.length > 0
                    ? suggestions.trending
                    : ["iPhone 15", "Samsung Galaxy S24", "MacBook Air M2", "Sony WH-1000XM5", "boAt Airdopes", "Air Fryer", "Kurta Set"]
                  ).map((trendTerm, idx) => {
                    const globalIdx = recentSearches.length + idx;
                    const isSelected = selectedIndex === globalIdx;
                    return (
                      <button
                        key={trendTerm}
                        type="button"
                        onClick={() => triggerSearch(trendTerm)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          isSelected
                            ? "bg-orange-50 border-orange-300 text-orange-700 scale-105"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <Flame className="w-3 h-3 text-rose-500" />
                        <span>{trendTerm}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE TYPING: Google-style suggestions + Amazon-style product previews */}
          {showTypingSuggestions && (
            <div>
              {/* Category scope indicator banner if active */}
              {selectedCategory !== "all" && (
                <div className="bg-amber-50/70 border-b border-amber-100 px-4 py-1.5 text-xs text-amber-800 flex items-center justify-between">
                  <span>
                    Searching in:{" "}
                    <strong>
                      {CATEGORY_OPTIONS.find((c) => c.slug === selectedCategory)?.label}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className="text-amber-700 hover:text-amber-900 underline font-medium"
                  >
                    Search all categories
                  </button>
                </div>
              )}

              {/* Google-Style Query Predictions */}
              {suggestions.querySuggestions.length > 0 && (
                <div className="py-1">
                  {suggestions.querySuggestions.map((sug, idx) => {
                    const isSelected = selectedIndex === idx;
                    const qLower = query.toLowerCase().trim();
                    const textLower = sug.text.toLowerCase();

                    // Google-style typing bold completion:
                    // If text starts with query, prefix is regular, rest is bold!
                    let prefix = "";
                    let boldSuffix = sug.text;
                    if (textLower.startsWith(qLower)) {
                      prefix = sug.text.slice(0, query.length);
                      boldSuffix = sug.text.slice(query.length);
                    }

                    return (
                      <div
                        key={`sug-${idx}-${sug.text}`}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => triggerSearch(sug.text, sug.categorySlug)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors group ${
                          isSelected ? "bg-orange-50/90 text-orange-950" : "hover:bg-slate-50 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Search
                            className={`w-4 h-4 flex-shrink-0 transition-colors ${
                              isSelected ? "text-orange-600" : "text-slate-400 group-hover:text-slate-600"
                            }`}
                          />
                          <div className="truncate flex items-baseline gap-1.5">
                            {prefix ? (
                              <span>
                                <span className="font-normal text-slate-600">{prefix}</span>
                                <span className="font-bold text-slate-900">{boldSuffix}</span>
                              </span>
                            ) : (
                              <span className="font-medium text-slate-900">{sug.text}</span>
                            )}

                            {/* Amazon-style "in Category" contextual pill */}
                            {sug.isScoped && sug.categoryName && (
                              <span className="text-xs font-medium text-orange-600 ml-1">
                                in <span className="font-bold underline">{sug.categoryName}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick-fill icon (Google ↖) */}
                        <button
                          type="button"
                          onClick={(e) => handleFill(e, sug.text)}
                          className="p-1 text-slate-300 hover:text-slate-700 hover:bg-slate-200/60 rounded flex-shrink-0 transition-colors"
                          title="Insert into search bar"
                          aria-label={`Insert ${sug.text}`}
                        >
                          <ArrowUpLeft className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Amazon-Style Rich Product Preview Cards */}
              {suggestions.products.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50/50 py-2">
                  <div className="px-4 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
                      Matching Products & Best Prices
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium lowercase">
                      live comparisons
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100/80">
                    {suggestions.products.map((p, pIdx) => {
                      const globalIdx = suggestions.querySuggestions.length + pIdx;
                      const isSelected = selectedIndex === globalIdx;

                      return (
                        <div
                          key={`prod-${p.id}`}
                          role="option"
                          aria-selected={isSelected}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          onClick={() => triggerProductClick(p)}
                          className={`w-full px-4 py-2 flex items-center gap-3 cursor-pointer transition-colors ${
                            isSelected ? "bg-orange-50/90" : "hover:bg-white"
                          }`}
                        >
                          {/* Product Thumbnail */}
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 p-1 flex-shrink-0 flex items-center justify-center">
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                              {p.brand}
                            </div>
                            <div className="text-xs font-semibold text-slate-900 truncate">
                              {p.title}
                            </div>
                          </div>

                          {/* Price & Stores */}
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs font-black text-slate-900">
                              {formatINR(p.price)}
                            </div>
                            <div className="text-[10px] font-bold text-orange-600 flex items-center justify-end gap-1">
                              <Store className="w-3 h-3 inline" />
                              <span>Amazon India</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Footer: View all results & Keyboard tips */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <span>View all results for &ldquo;{query}&rdquo;</span>
                  <span className="text-slate-400 font-normal">&rarr;</span>
                </button>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span>Use</span>
                  <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono text-[9px] shadow-2xs">
                    ↑
                  </kbd>
                  <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono text-[9px] shadow-2xs">
                    ↓
                  </kbd>
                  <span>to navigate</span>
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[9px] shadow-2xs">
                    ↵
                  </kbd>
                  <span>to select</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
