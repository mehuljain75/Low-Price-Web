"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
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
} from "lucide-react";
import { SearchAutocomplete } from "./SearchAutocomplete";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
            Amazon India Live Deals
          </span>
          <span>
            Real-time verified pricing, price drops & endless catalog powered by Amazon Associates.
          </span>
          <Link
            href="/deals"
            className="text-orange-400 hover:text-orange-300 font-semibold underline ml-1"
          >
            View Today&apos;s Drops &rarr;
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
                Amazon Deals & Discovery
              </span>
            </div>
          </Link>

          {/* Desktop Search Engine (Amazon + Google Style Typeahead) */}
          <div className="hidden md:flex flex-1 max-w-xl relative items-center">
            <SearchAutocomplete variant="navbar" />
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

        {/* Mobile Search Engine */}
        <div className="md:hidden pb-3">
          <SearchAutocomplete
            variant="navbar"
            placeholder="Search mobiles, laptops, fashion, electronics..."
          />
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
                href={`/category/${c.slug}`}
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
