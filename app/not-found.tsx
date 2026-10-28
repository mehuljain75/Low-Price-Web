import React from "react";
import Link from "next/link";
import { SearchX, ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  const quickCategories = [
    { name: "Shoes & Footwear", href: "/search?q=shoes" },
    { name: "Mobiles", href: "/search?category=mobiles" },
    { name: "Laptops", href: "/search?category=laptops" },
    { name: "Audio & Headphones", href: "/search?category=audio" },
    { name: "Appliances", href: "/search?category=appliances" },
  ];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#F3F4F6]">
      <div className="max-w-xl w-full text-center bg-white rounded-2xl border border-[#E5E7EB] p-8 sm:p-12 shadow-sm">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-200">
          <SearchX className="w-8 h-8" />
        </div>

        {/* Status Code & Headings */}
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 mb-3">
          404 &bull; Product or Page Not Found
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight mb-3">
          Looking for a specific deal?
        </h1>
        <p className="text-sm text-[#6B7280] leading-relaxed mb-8 max-w-md mx-auto">
          The product or page you requested could not be located. It may have expired, been updated, or the link may have changed.
        </p>

        {/* Instant Deal Search Form */}
        <form action="/search" method="GET" className="max-w-md mx-auto mb-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="q"
              placeholder="Search live deals (e.g. shoes, laptops)..."
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:bg-white text-gray-900 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-gray-900 font-bold text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Find Deals
          </button>
        </form>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Link
            href="/deals"
            className="w-full sm:w-auto px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#111827] font-bold text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Browse Today's Deals</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-gray-500" />
            <span>Go to Homepage</span>
          </Link>
        </div>

        {/* Quick Category Chips */}
        <div className="border-t border-[#E5E7EB] pt-6">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">
            Explore Popular Categories
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {quickCategories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="px-3 py-1.5 bg-gray-50 hover:bg-amber-50 hover:text-amber-800 text-xs font-medium text-gray-600 rounded-lg border border-gray-200 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
