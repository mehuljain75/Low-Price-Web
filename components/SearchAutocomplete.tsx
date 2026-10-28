"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  Check,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { QuerySuggestion, SearchProductSuggestion } from "@/lib/data/search-suggestions";

interface SearchAutocompleteProps {
  placeholder?: string;
  variant?: "navbar" | "hero";
  initialCategory?: string;
  initialQuery?: string;
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

interface DropdownItem {
  id: string;
  type: "category" | "shoeType" | "switch";
  label: string;
  description?: string;
  slug?: string;
  shoeType?: string;
  searchKeyword?: string;
  isSelected: boolean;
}

interface DropdownGroup {
  title: string;
  items: DropdownItem[];
}

const SearchAutocompleteInternal: React.FC<SearchAutocompleteProps> = ({
  placeholder = "Search iPhone 15, Samsung Galaxy, MacBooks, Earbuds, Kurta...",
  variant = "navbar",
  initialCategory = "all",
  initialQuery = "",
  className = "",
  onSearchSubmit,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const urlParamQuery = searchParams ? (searchParams.get("q") || searchParams.get("search") || "") : "";
  const urlParamCategory = searchParams ? (searchParams.get("category") || "all") : "all";
  const urlParamShoeType = searchParams ? (searchParams.get("shoeType") || "") : "";

  const [query, setQuery] = useState(initialQuery || urlParamQuery || "");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || urlParamCategory);
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [focusedCategoryIdx, setFocusedCategoryIdx] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Synchronize query in input when URL param changes
  useEffect(() => {
    if (urlParamQuery && urlParamQuery !== query) {
      setQuery(urlParamQuery);
    }
  }, [urlParamQuery]);

  // Synchronize selectedCategory with URL param category
  useEffect(() => {
    if (urlParamCategory) {
      setSelectedCategory(urlParamCategory);
    }
  }, [urlParamCategory]);

  const qLower = (query || urlParamQuery || "").toLowerCase().trim();

  const isFootwear =
    qLower.includes("shoe") ||
    qLower.includes("sneaker") ||
    qLower.includes("running") ||
    qLower.includes("boot") ||
    qLower.includes("footwear") ||
    qLower.includes("clog") ||
    qLower.includes("heel") ||
    Boolean(urlParamShoeType);

  const isMobile =
    qLower.includes("phone") ||
    qLower.includes("mobile") ||
    qLower.includes("iphone") ||
    qLower.includes("pixel") ||
    qLower.includes("samsung") ||
    qLower.includes("oneplus");

  const isLaptop =
    qLower.includes("laptop") ||
    qLower.includes("macbook") ||
    qLower.includes("dell") ||
    qLower.includes("thinkpad") ||
    qLower.includes("computer");

  const isAudio =
    qLower.includes("headphone") ||
    qLower.includes("earphone") ||
    qLower.includes("earbud") ||
    qLower.includes("airpod") ||
    qLower.includes("speaker") ||
    qLower.includes("soundbar");

  // Display label on the trigger button
  const displayCategoryLabel = useMemo(() => {
    if (urlParamShoeType) {
      return urlParamShoeType;
    }
    if (selectedCategory && selectedCategory !== "all") {
      const match = CATEGORY_OPTIONS.find((c) => c.slug === selectedCategory);
      return match ? match.shortLabel : selectedCategory;
    }
    if (isFootwear) return "Shoes";
    if (isMobile) return "Mobiles";
    if (isLaptop) return "Laptops";
    if (isAudio) return "Audio";
    return "All";
  }, [selectedCategory, urlParamShoeType, isFootwear, isMobile, isLaptop, isAudio]);

  const categoryGroups = useMemo<DropdownGroup[]>(() => {
    // 1. Footwear query detected:
    if (isFootwear) {
      return [
        {
          title: "Refine Footwear Results",
          items: [
            {
              id: "cat_all_shoes",
              type: "category",
              slug: "all",
              label: "All Footwear Results",
              isSelected: (selectedCategory === "all" || !selectedCategory) && !urlParamShoeType,
            },
            {
              id: "cat_fashion_footwear",
              type: "category",
              slug: "fashion",
              label: "Fashion & Footwear Catalog",
              isSelected: selectedCategory === "fashion" && !urlParamShoeType,
            },
            {
              id: "st_running",
              type: "shoeType",
              shoeType: "Running Shoes",
              label: "Running Shoes",
              description: "Lightweight road & marathon shoes",
              isSelected: urlParamShoeType.toLowerCase() === "running shoes",
            },
            {
              id: "st_sneakers",
              type: "shoeType",
              shoeType: "Sneakers",
              label: "Casual Sneakers",
              description: "Lifestyle & retro sneakers",
              isSelected: urlParamShoeType.toLowerCase() === "sneakers",
            },
            {
              id: "st_casual",
              type: "shoeType",
              shoeType: "Casual Shoes",
              label: "Casual & Slip-Ons",
              isSelected: urlParamShoeType.toLowerCase() === "casual shoes",
            },
            {
              id: "st_formal",
              type: "shoeType",
              shoeType: "Formal Shoes",
              label: "Formal & Dress Shoes",
              isSelected: urlParamShoeType.toLowerCase() === "formal shoes",
            },
            {
              id: "st_walking",
              type: "shoeType",
              shoeType: "Walking Shoes",
              label: "Walking & Training",
              isSelected: urlParamShoeType.toLowerCase() === "walking shoes",
            },
            {
              id: "st_boots",
              type: "shoeType",
              shoeType: "Boots",
              label: "Boots & High Tops",
              isSelected: urlParamShoeType.toLowerCase() === "boots",
            },
          ],
        },
        {
          title: "Switch to Another Category",
          items: [
            {
              id: "switch_mobiles",
              type: "switch",
              slug: "mobiles",
              label: "Mobiles & Tablets",
              searchKeyword: "smartphones",
              isSelected: selectedCategory === "mobiles",
            },
            {
              id: "switch_laptops",
              type: "switch",
              slug: "laptops",
              label: "Laptops & PCs",
              searchKeyword: "laptops",
              isSelected: selectedCategory === "laptops",
            },
            {
              id: "switch_audio",
              type: "switch",
              slug: "audio",
              label: "Audio & Headphones",
              searchKeyword: "headphones",
              isSelected: selectedCategory === "audio",
            },
            {
              id: "switch_appliances",
              type: "switch",
              slug: "appliances",
              label: "Home Appliances",
              searchKeyword: "appliances",
              isSelected: selectedCategory === "appliances",
            },
            {
              id: "switch_beauty",
              type: "switch",
              slug: "beauty",
              label: "Beauty & Personal Care",
              searchKeyword: "beauty",
              isSelected: selectedCategory === "beauty",
            },
          ],
        },
      ];
    }

    // 2. Mobile / Phone query detected:
    if (isMobile) {
      return [
        {
          title: "Refine Mobile Results",
          items: [
            {
              id: "cat_all_mobiles",
              type: "category",
              slug: "all",
              label: "All Mobile Results",
              isSelected: selectedCategory === "all" || !selectedCategory,
            },
            {
              id: "cat_mobiles",
              type: "category",
              slug: "mobiles",
              label: "Mobiles & Tablets Catalog",
              isSelected: selectedCategory === "mobiles",
            },
            {
              id: "cat_audio_acc",
              type: "category",
              slug: "audio",
              label: "Compatible Audio & AirPods",
              isSelected: selectedCategory === "audio",
            },
          ],
        },
        {
          title: "Switch to Another Category",
          items: [
            {
              id: "switch_laptops",
              type: "switch",
              slug: "laptops",
              label: "Laptops & PCs",
              searchKeyword: "laptops",
              isSelected: false,
            },
            {
              id: "switch_fashion",
              type: "switch",
              slug: "fashion",
              label: "Fashion & Footwear",
              searchKeyword: "shoes",
              isSelected: false,
            },
            {
              id: "switch_appliances",
              type: "switch",
              slug: "appliances",
              label: "Home Appliances",
              searchKeyword: "appliances",
              isSelected: false,
            },
            {
              id: "switch_beauty",
              type: "switch",
              slug: "beauty",
              label: "Beauty & Personal Care",
              searchKeyword: "beauty",
              isSelected: false,
            },
          ],
        },
      ];
    }

    // 3. Laptop query detected:
    if (isLaptop) {
      return [
        {
          title: "Refine Laptop Results",
          items: [
            {
              id: "cat_all_laptops",
              type: "category",
              slug: "all",
              label: "All Laptop Results",
              isSelected: selectedCategory === "all" || !selectedCategory,
            },
            {
              id: "cat_laptops",
              type: "category",
              slug: "laptops",
              label: "Laptops & PCs Catalog",
              isSelected: selectedCategory === "laptops",
            },
          ],
        },
        {
          title: "Switch to Another Category",
          items: [
            {
              id: "switch_mobiles",
              type: "switch",
              slug: "mobiles",
              label: "Mobiles & Tablets",
              searchKeyword: "smartphones",
              isSelected: false,
            },
            {
              id: "switch_audio",
              type: "switch",
              slug: "audio",
              label: "Audio & Headphones",
              searchKeyword: "headphones",
              isSelected: false,
            },
            {
              id: "switch_fashion",
              type: "switch",
              slug: "fashion",
              label: "Fashion & Footwear",
              searchKeyword: "shoes",
              isSelected: false,
            },
            {
              id: "switch_appliances",
              type: "switch",
              slug: "appliances",
              label: "Home Appliances",
              searchKeyword: "appliances",
              isSelected: false,
            },
            {
              id: "switch_beauty",
              type: "switch",
              slug: "beauty",
              label: "Beauty & Personal Care",
              searchKeyword: "beauty",
              isSelected: false,
            },
          ],
        },
      ];
    }

    // 4. Default / Generic categories:
    return [
      {
        title: "All Amazon Categories",
        items: CATEGORY_OPTIONS.map((c) => ({
          id: `cat_${c.slug}`,
          type: "category" as const,
          slug: c.slug,
          label: c.label,
          isSelected: selectedCategory === c.slug || (!selectedCategory && c.slug === "all"),
        })),
      },
    ];
  }, [isFootwear, isMobile, isLaptop, selectedCategory, urlParamShoeType]);

  const flatCategoryItems = useMemo(() => {
    return categoryGroups.flatMap((g) => g.items);
  }, [categoryGroups]);

  const categoryContainerRef = useRef<HTMLDivElement>(null);

  // Close category dropdown on outside click
  useEffect(() => {
    const handleCategoryClickOutside = (e: MouseEvent) => {
      if (categoryContainerRef.current && !categoryContainerRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
        setFocusedCategoryIdx(-1);
      }
    };
    document.addEventListener("mousedown", handleCategoryClickOutside);
    return () => document.removeEventListener("mousedown", handleCategoryClickOutside);
  }, []);

  const handleCategorySelection = useCallback(
    (item: DropdownItem) => {
      setIsCategoryOpen(false);
      setFocusedCategoryIdx(-1);

      if (item.type === "switch" && item.slug) {
        // User wants to switch to a different department
        const newQuery = item.searchKeyword || item.slug;
        setQuery(newQuery);
        setSelectedCategory(item.slug);

        const params = new URLSearchParams();
        params.set("q", newQuery);
        params.set("category", item.slug);
        // Resets pagination (page omitted) & clears incompatible filters
        router.push(`/search?${params.toString()}`);
        return;
      }

      if (item.type === "shoeType" && item.shoeType) {
        // Footwear refinement selected
        setSelectedCategory("fashion");
        const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
        params.delete("page"); // Resets pagination
        params.set("category", "fashion");
        params.set("shoeType", item.shoeType);
        if (query.trim()) {
          params.set("q", query.trim());
        }
        router.push(`/search?${params.toString()}`);
        return;
      }

      if (item.type === "category" && item.slug) {
        setSelectedCategory(item.slug);
        const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
        params.delete("page"); // Resets pagination

        if (item.slug === "all") {
          params.delete("category");
          params.delete("shoeType");
        } else {
          params.set("category", item.slug);
          if (item.slug !== "fashion") {
            // Clears incompatible footwear filters when switching away from fashion
            params.delete("shoeType");
            params.delete("gender");
            params.delete("size");
          }
        }

        if (query.trim()) {
          params.set("q", query.trim());
        }

        if (pathname && (pathname.startsWith("/search") || pathname.startsWith("/products"))) {
          router.push(`${pathname}?${params.toString()}`);
        } else if (query.trim()) {
          router.push(`/search?${params.toString()}`);
        }
        return;
      }
    },
    [query, searchParams, pathname, router]
  );

  const handleCategoryKeyDown = (e: React.KeyboardEvent) => {
    if (!isCategoryOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsCategoryOpen(true);
        setFocusedCategoryIdx(0);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsCategoryOpen(false);
      setFocusedCategoryIdx(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedCategoryIdx((prev) => (prev < flatCategoryItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedCategoryIdx((prev) => (prev > 0 ? prev - 1 : flatCategoryItems.length - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusedCategoryIdx >= 0 && focusedCategoryIdx < flatCategoryItems.length) {
        handleCategorySelection(flatCategoryItems[focusedCategoryIdx]);
      }
    }
  };

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
        className={`group relative flex items-center bg-white rounded-xl transition-all duration-150 border ${
          isOpen
            ? "border-amber-500 ring-2 ring-amber-500/20 shadow-sm"
            : "border-[#E5E7EB] hover:border-gray-300 shadow-xs"
        } ${variant === "hero" ? "p-1.5" : "p-1"}`}
      >
        {/* Custom Accessible Category Dropdown (Left side) */}
        <div ref={categoryContainerRef} className="relative flex-shrink-0 flex items-center pl-1">
          <button
            type="button"
            id="search-category-button"
            aria-haspopup="listbox"
            aria-expanded={isCategoryOpen}
            aria-label="Filter search by category"
            onClick={(e) => {
              e.stopPropagation();
              setIsCategoryOpen((prev) => !prev);
              setIsOpen(false); // Close suggestions autocomplete when toggling category
            }}
            onKeyDown={handleCategoryKeyDown}
            className={`flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-[#111827] font-semibold rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20 px-2.5 sm:px-3 text-xs border border-transparent hover:border-[#E5E7EB] ${
              variant === "hero" ? "py-2.5" : "py-1.5"
            }`}
          >
            <span className="truncate max-w-[70px] sm:max-w-[110px] select-none">{displayCategoryLabel}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-150 ${
                isCategoryOpen ? "rotate-180 text-amber-600" : ""
              }`}
            />
          </button>
          <div className="h-5 w-[1px] bg-[#E5E7EB] mx-1.5"></div>

          {/* Custom Accessible Dropdown Menu */}
          {isCategoryOpen && (
            <div
              role="listbox"
              aria-labelledby="search-category-button"
              className="absolute top-full left-0 mt-2 w-72 max-w-[calc(100vw-32px)] max-h-96 overflow-y-auto bg-white rounded-xl border border-[#E5E7EB] shadow-dropdown z-50 py-1.5 focus:outline-none animate-in fade-in-50 zoom-in-95 duration-100 divide-y divide-[#E5E7EB]/60"
            >
              {categoryGroups.map((group, gIdx) => (
                <div key={group.title} className={gIdx > 0 ? "pt-1.5" : ""}>
                  <div className="px-3.5 py-1 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider bg-gray-50/80">
                    {group.title}
                  </div>
                  <div className="py-1">
                    {group.items.map((item) => {
                      const itemIdx = flatCategoryItems.findIndex((fi) => fi.id === item.id);
                      const isFocused = itemIdx === focusedCategoryIdx;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={item.isSelected}
                          onClick={() => handleCategorySelection(item)}
                          onMouseEnter={() => setFocusedCategoryIdx(itemIdx)}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            item.isSelected
                              ? "bg-amber-50 text-amber-900 font-bold border-l-2 border-[#F59E0B]"
                              : isFocused
                              ? "bg-gray-100 text-[#111827] font-semibold"
                              : "text-[#111827] hover:bg-gray-50 font-medium"
                          }`}
                        >
                          <div className="flex flex-col pr-2">
                            <span>{item.label}</span>
                            {item.description && (
                              <span className="text-[10px] text-[#6B7280] font-normal">
                                {item.description}
                              </span>
                            )}
                          </div>
                          {item.isSelected && (
                            <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Icon / Loading indicator */}
        <div className="pl-2 pr-1 text-gray-400 flex items-center justify-center flex-shrink-0">
          <Search className={`${variant === "hero" ? "w-5 h-5" : "w-4 h-4"} text-gray-400`} />
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
          className={`w-full bg-transparent text-[#111827] placeholder:text-gray-400 focus:outline-none font-normal ${
            variant === "hero" ? "px-2 py-2 text-base" : "px-2 py-1.5 text-sm"
          }`}
        />

        {/* One-click Clear (X) button */}
        {hasQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Clear search input"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Search Button */}
        <button
          type="submit"
          className={`flex-shrink-0 flex items-center justify-center gap-1.5 font-bold rounded-lg text-[#111827] bg-[#F59E0B] hover:bg-[#D97706] active:scale-[0.98] transition-all shadow-xs ${
            variant === "hero" ? "px-6 py-2.5 text-sm" : "px-4 py-2 text-xs"
          }`}
        >
          <span>Search</span>
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {shouldRenderDropdown && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden z-50 divide-y divide-[#E5E7EB] animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {/* ZERO-STATE: Recent Searches & Trending */}
          {showRecentOrTrending && (
            <div className="p-2 space-y-3">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearAllRecent}
                      className="hover:text-[#111827] font-semibold lowercase transition-colors"
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
                            isSelected ? "bg-amber-50 text-[#111827]" : "hover:bg-gray-50 text-gray-800"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate font-medium">{term}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleFill(e, term)}
                              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded"
                              title="Fill in search box"
                              aria-label={`Fill ${term}`}
                            >
                              <ArrowUpLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => removeRecentSearch(e, term)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
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
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
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
                            ? "bg-amber-50 border-amber-300 text-amber-900 scale-102"
                            : "bg-gray-50 hover:bg-gray-100 border-[#E5E7EB] text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <Flame className="w-3 h-3 text-amber-500" />
                        <span>{trendTerm}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE TYPING: Suggestions + Product Previews */}
          {showTypingSuggestions && (
            <div>
              {/* Category scope indicator banner if active */}
              {selectedCategory !== "all" && (
                <div className="bg-gray-50 border-b border-[#E5E7EB] px-4 py-1.5 text-xs text-gray-700 flex items-center justify-between">
                  <span>
                    Searching in:{" "}
                    <strong className="text-[#111827]">
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

              {/* Query Predictions */}
              {suggestions.querySuggestions.length > 0 && (
                <div className="py-1">
                  {suggestions.querySuggestions.map((sug, idx) => {
                    const isSelected = selectedIndex === idx;
                    const qLower = query.toLowerCase().trim();
                    const textLower = sug.text.toLowerCase();

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
                          isSelected ? "bg-amber-50/90 text-[#111827]" : "hover:bg-gray-50 text-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Search
                            className={`w-4 h-4 flex-shrink-0 transition-colors ${
                              isSelected ? "text-amber-500" : "text-gray-400 group-hover:text-gray-600"
                            }`}
                          />
                          <div className="truncate flex items-baseline gap-1.5">
                            {prefix ? (
                              <span>
                                <span className="font-normal text-gray-600">{prefix}</span>
                                <span className="font-bold text-[#111827]">{boldSuffix}</span>
                              </span>
                            ) : (
                              <span className="font-medium text-[#111827]">{sug.text}</span>
                            )}

                            {sug.isScoped && sug.categoryName && (
                              <span className="text-xs font-medium text-amber-700 ml-1">
                                in <span className="font-bold underline">{sug.categoryName}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleFill(e, sug.text)}
                          className="p-1 text-gray-300 hover:text-gray-700 hover:bg-gray-200/60 rounded flex-shrink-0 transition-colors"
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

              {/* Product Preview Cards */}
              {suggestions.products.length > 0 && (
                <div className="border-t border-[#E5E7EB] bg-gray-50/50 py-2">
                  <div className="px-4 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                      Matching Amazon Products
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Amazon offers
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
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
                            isSelected ? "bg-amber-50" : "hover:bg-white"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E7EB] p-1 flex-shrink-0 flex items-center justify-center">
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                              {p.brand}
                            </div>
                            <div className="text-xs font-semibold text-[#111827] truncate">
                              {p.title}
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="text-xs font-black text-[#111827]">
                              {formatINR(p.price)}
                            </div>
                            <div className="text-[10px] font-semibold text-gray-500 flex items-center justify-end gap-1">
                              <Store className="w-3 h-3 inline text-amber-600" />
                              <span>Amazon India</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Footer */}
              <div className="px-4 py-2.5 bg-gray-50 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="font-bold text-[#111827] hover:text-amber-600 flex items-center gap-1 transition-colors"
                >
                  <span>View all results for &ldquo;{query}&rdquo;</span>
                  <span className="text-gray-400 font-normal">&rarr;</span>
                </button>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-gray-400">
                  <span>Use</span>
                  <kbd className="px-1 py-0.5 bg-white border border-[#E5E7EB] rounded font-mono text-[9px] shadow-2xs">
                    ↑
                  </kbd>
                  <kbd className="px-1 py-0.5 bg-white border border-[#E5E7EB] rounded font-mono text-[9px] shadow-2xs">
                    ↓
                  </kbd>
                  <span>to navigate</span>
                  <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E7EB] rounded font-mono text-[9px] shadow-2xs">
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

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = (props) => {
  return (
    <React.Suspense
      fallback={
        <div className={`relative w-full ${props.className || ""}`}>
          <div className="h-10 sm:h-11 w-full bg-gray-50 border border-[#E5E7EB] rounded-xl animate-pulse" />
        </div>
      }
    >
      <SearchAutocompleteInternal {...props} />
    </React.Suspense>
  );
};
