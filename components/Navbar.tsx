"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Flame,
  Calendar,
  Activity,
  Menu,
  X,
  Tag,
  Smartphone,
  Laptop,
  Headphones,
  Shirt,
  Refrigerator,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";

interface SearchSuggestionProduct {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  categorySlug: string;
  storeCount: number;
}

export const Navbar: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    products: SearchSuggestionProduct[];
    categories: Array<{ name: string; slug: string }>;
  }>({ products: [], categories: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions({ products: [], categories: [] });
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.warn("Search autocomplete fetch failed:", err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navCategories = [
    { name: "Mobiles", slug: "mobiles", icon: Smartphone },
    { name: "Laptops", slug: "laptops", icon: Laptop },
    { name: "Audio", slug: "audio", icon: Headphones },
    { name: "Fashion", slug: "fashion", icon: Shirt },
    { name: "Appliances", slug: "appliances", icon: Refrigerator },
    { name: "Beauty", slug: "beauty", icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 text-center">
        <span className="inline-flex items-center gap-1.5 flex-wrap justify-center">
          <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded uppercase">
            Festive Season 2026
          </span>
          <span>
            Tracking verified price drops across Amazon, Flipkart, Myntra, AJIO & Meesho in Real-time.
          </span>
          <Link
            href="/sales"
            className="text-orange-400 hover:text-orange-300 font-semibold underline ml-1"
          >
            See Sale Dates &rarr;
          </Link>
        </span>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Tag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  DealFinder
                </span>
                <span className="font-bold text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                  IN 🇮🇳
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium -mt-0.5">
                Indian Price Comparison
              </span>
            </div>
          </Link>

          {/* Search Form with Live Autocomplete */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-xl relative items-center">
            <form onSubmit={handleSearch} className="w-full relative">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search iPhone 15, Samsung Galaxy, MacBooks, Earbuds, Kurta..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (suggestions.products.length > 0 || suggestions.categories.length > 0) {
                      setShowDropdown(true);
                    }
                  }}
                  className="w-full pl-10 pr-24 py-2 text-sm bg-slate-50 border border-slate-300 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium text-xs px-4 py-1.5 rounded-full transition-colors shadow-sm"
                >
                  Compare
                </button>
              </div>
            </form>

            {/* Live Autocomplete Dropdown */}
            {showDropdown && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                {suggestions.categories.length > 0 && (
                  <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-2">
                      Categories:
                    </span>
                    {suggestions.categories.map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => {
                          setShowDropdown(false);
                          router.push(`/products?category=${c.slug}`);
                        }}
                        className="text-xs bg-white hover:bg-orange-50 hover:text-orange-600 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                      >
                        {c.name} &rarr;
                      </button>
                    ))}
                  </div>
                )}

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {suggestions.products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setShowDropdown(false);
                        router.push(`/products/${p.id}`);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-orange-50/50 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 p-1 flex-shrink-0 flex items-center justify-center">
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">
                          {p.brand}
                        </div>
                        <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-orange-600">
                          {p.title}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-black text-slate-900">
                          {formatINR(p.price)}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold">
                          {p.storeCount} Stores
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  className="w-full py-2.5 px-4 text-xs font-bold text-center bg-slate-50 hover:bg-slate-100 text-orange-600 transition-colors border-t border-slate-100 block"
                >
                  View all results for &ldquo;{searchQuery}&rdquo; &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/products"
              className="text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors"
            >
              All Products
            </Link>
            <Link
              href="/deals"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors"
            >
              <Flame className="w-4 h-4 text-rose-500" />
              <span>Today&apos;s Deals</span>
            </Link>
            <Link
              href="/sales"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Upcoming Sales</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data Sources</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3 relative">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search mobiles, laptops, fashion..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.products.length > 0 || suggestions.categories.length > 0) {
                  setShowDropdown(true);
                }
              }}
              className="w-full pl-9 pr-20 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-orange-600 text-white text-xs font-semibold px-3 py-1 rounded"
            >
              Search
            </button>
          </form>

          {/* Mobile Live Autocomplete Dropdown */}
          {showDropdown && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {suggestions.products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      router.push(`/products/${p.id}`);
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-orange-50/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded bg-white border border-slate-200 p-0.5 flex-shrink-0 flex items-center justify-center">
                      <img src={p.imageUrl} alt={p.title} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-orange-600 font-bold uppercase">{p.brand}</div>
                      <div className="text-xs font-medium text-slate-900 truncate">{p.title}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-black text-slate-900">{formatINR(p.price)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-navigation Category Bar */}
      <div className="bg-slate-50 border-t border-slate-200 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 py-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
            Categories:
          </span>
          {navCategories.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.slug}
                href={`/products?category=${c.slug}`}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-orange-600 whitespace-nowrap transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <span>{c.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-2 border-b border-slate-100"
          >
            All Products
          </Link>
          <Link
            href="/deals"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-medium text-rose-600 py-2 border-b border-slate-100"
          >
            <Flame className="w-4 h-4" />
            Today&apos;s Deals (Verified Drops)
          </Link>
          <Link
            href="/sales"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 py-2 border-b border-slate-100"
          >
            <Calendar className="w-4 h-4" />
            Upcoming Indian Sales
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 py-2"
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            Admin & Data Sources
          </Link>
        </div>
      )}
    </header>
  );
};
