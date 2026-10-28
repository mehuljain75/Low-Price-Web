"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
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
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] shadow-card">
      {/* Top Banner Notice */}
      <div className="bg-[#111827] text-gray-300 text-xs py-1.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="bg-[#F59E0B] text-[#111827] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide">
            Amazon India Deals
          </span>
          <span className="text-gray-300">
            Catalog discovery and price tracking powered by Amazon Associates.
          </span>
          <Link
            href="/deals"
            className="text-[#F59E0B] hover:text-amber-400 font-semibold transition-colors"
          >
            Today&apos;s Drops &rarr;
          </Link>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-6">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 flex-shrink-0 group focus:outline-none"
            aria-label="DealFinder India Homepage"
          >
            <div className="w-10 h-10 rounded-xl bg-[#111827] text-[#F59E0B] flex items-center justify-center border border-gray-800 shadow-xs group-hover:bg-slate-800 transition-colors">
              <Tag className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-[#111827]">
                  DealFinder
                </span>
                <span className="font-bold text-[10px] bg-gray-100 text-[#111827] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                  IN
                </span>
              </div>
              <span className="text-[10px] text-[#6B7280] font-medium -mt-0.5">
                Amazon Deals &amp; Discovery
              </span>
            </div>
          </Link>

          {/* Desktop Search Engine (Amazon + Google Style Typeahead) */}
          <div className="hidden md:flex flex-1 max-w-xl relative items-center">
            <SearchAutocomplete variant="navbar" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
            <Link
              href="/products"
              className="text-xs font-semibold text-gray-700 hover:text-[#111827] transition-colors py-1"
            >
              All Products
            </Link>
            <Link
              href="/deals"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#111827] transition-colors py-1"
            >
              <Flame className="w-4 h-4 text-[#F59E0B]" />
              <span>Today&apos;s Deals</span>
            </Link>
            <Link
              href="/sales"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#111827] transition-colors py-1"
            >
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>Upcoming Sales</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-[#111827] border border-[#E5E7EB] transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-[#15803D]" />
              <span>Data Sources</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:text-[#111827] hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#111827]" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Engine: Only rendered on sub-pages; on homepage ('/') Hero search provides the primary search box */}
        {pathname !== "/" && (
          <div className="md:hidden pb-3">
            <SearchAutocomplete
              variant="navbar"
              placeholder="Search mobiles, laptops, fashion, electronics..."
            />
          </div>
        )}
      </div>

      {/* Sub-navigation Category Bar */}
      <div className="bg-[#F9FAFB] border-t border-[#E5E7EB] overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 py-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">
            Departments:
          </span>
          {navCategories.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-[#111827] hover:bg-white px-2.5 py-1 rounded-md transition-colors whitespace-nowrap border border-transparent hover:border-[#E5E7EB]"
              >
                <Icon className="w-3.5 h-3.5 text-gray-400" />
                <span>{c.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#E5E7EB] px-4 pt-3 pb-6 space-y-1 shadow-dropdown">
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-gray-800 py-2.5 px-3 rounded-lg hover:bg-gray-50 border-b border-gray-100"
          >
            All Products
          </Link>
          <Link
            href="/deals"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-800 py-2.5 px-3 rounded-lg hover:bg-gray-50 border-b border-gray-100"
          >
            <Flame className="w-4 h-4 text-[#F59E0B]" />
            <span>Today&apos;s Deals</span>
          </Link>
          <Link
            href="/sales"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-800 py-2.5 px-3 rounded-lg hover:bg-gray-50 border-b border-gray-100"
          >
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>Upcoming Sales</span>
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-800 py-2.5 px-3 rounded-lg hover:bg-gray-50"
          >
            <Activity className="w-4 h-4 text-[#15803D]" />
            <span>Data Sources</span>
          </Link>
        </div>
      )}
    </header>
  );
};
