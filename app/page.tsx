import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Smartphone,
  Laptop,
  Headphones,
  Shirt,
  Refrigerator,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Truck,
  Tag,
} from "lucide-react";
import { repository } from "@/lib/data/repository";
import { ProductCard } from "@/components/ProductCard";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { InfiniteProductGrid } from "@/components/InfiniteProductGrid";

export const revalidate = 60; // ISR cache

export default async function HomePage() {
  const categories = await repository.getCategories();
  const featuredComparisons = await repository.getProducts({ sortBy: "discount" });
  const topDeals = featuredComparisons.slice(0, 4);
  const discoveryCatalog = featuredComparisons.slice(4, 28);

  const categoryIcons: Record<string, React.ElementType> = {
    cat_mobiles: Smartphone,
    cat_laptops: Laptop,
    cat_audio: Headphones,
    cat_fashion: Shirt,
    cat_appliances: Refrigerator,
    cat_beauty: Sparkles,
  };

  return (
    <div className="space-y-14 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-12 pb-14 border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gray-50 border border-[#E5E7EB] text-[#111827] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
            <span>Amazon India Product Discovery &amp; Deals</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#111827] tracking-tight max-w-4xl mx-auto leading-tight">
            Discover Top Products on{" "}
            <span className="text-amber-600">
              Amazon India
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            Find authentic products, explore top shopping departments, filter by real reviews, and track genuine price drops across Amazon India.
          </p>

          {/* Hero Search Box */}
          <div className="max-w-2xl mx-auto pt-2">
            <SearchAutocomplete
              variant="hero"
              placeholder="Search mobiles, laptops, audio, home essentials, footwear..."
            />

            {/* Trending Suggestions */}
            <div className="flex items-center justify-center gap-2 flex-wrap pt-4 text-xs text-[#6B7280]">
              <span className="font-semibold text-[#111827]">Trending:</span>
              {["iPhone 15", "Samsung S24", "MacBook Air M2", "Sony XM5", "boAt Airdopes", "Air Fryer"].map((t) => (
                <Link
                  key={t}
                  href={`/search?q=${encodeURIComponent(t)}`}
                  className="px-3 py-1 bg-white hover:bg-gray-100 border border-[#E5E7EB] rounded-lg transition-colors font-medium text-[#111827] shadow-2xs hover:border-gray-300"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">
              Explore Popular Departments
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              Browse authentic Amazon India product catalogs by category
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-semibold text-[#111827] hover:text-amber-600 flex items-center gap-1 transition-colors"
          >
            <span>All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.id] || Sparkles;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group p-4 bg-white rounded-xl border border-[#E5E7EB] hover:border-gray-300 hover:shadow-card transition-all flex flex-col items-center text-center space-y-2.5"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-[#111827] group-hover:text-[#F59E0B] text-gray-700 flex items-center justify-center transition-colors border border-[#E5E7EB]">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#111827] group-hover:text-amber-600 transition-colors">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Deals on Amazon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-500" />
              <span>Featured Deals on Amazon India</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
              Curated genuine price drops across electronics, computing, and lifestyle
            </p>
          </div>
          <Link
            href="/deals"
            className="text-xs sm:text-sm font-semibold text-[#111827] hover:text-amber-600 flex items-center gap-1 transition-colors"
          >
            <span>See All Deals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topDeals.map((comp) => (
            <ProductCard key={comp.product.id} comparison={comp} />
          ))}
        </div>
      </section>

      {/* Category Discovery Spotlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Spotlight 1: Mobiles & Computing */}
          <div className="p-6 rounded-xl bg-[#111827] text-white flex flex-col justify-between space-y-4 shadow-card border border-gray-800">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Tech &amp; Electronics
              </span>
              <h3 className="text-xl font-bold text-white">Mobiles &amp; Laptops</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Discover flagship smartphones from Apple, Samsung, OnePlus, and performance laptops from HP, Dell, and Lenovo on Amazon.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/category/mobiles"
                className="text-xs font-bold px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] rounded-lg text-[#111827] transition-colors shadow-xs"
              >
                Mobiles &rarr;
              </Link>
              <Link
                href="/category/laptops"
                className="text-xs font-semibold px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors border border-white/20"
              >
                Laptops &rarr;
              </Link>
            </div>
          </div>

          {/* Spotlight 2: Audio & Accessories */}
          <div className="p-6 rounded-xl bg-white border border-[#E5E7EB] text-[#111827] flex flex-col justify-between space-y-4 shadow-card">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                Sound &amp; Wearables
              </span>
              <h3 className="text-xl font-bold text-[#111827]">Audio &amp; Headphones</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Explore noise-cancelling headphones from Sony, AirPods from Apple, and budget TWS earbuds from boAt and JBL.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/category/audio"
                className="inline-block text-xs font-bold px-4 py-2 bg-gray-50 hover:bg-gray-100 text-[#111827] rounded-lg transition-colors border border-[#E5E7EB]"
              >
                Explore Audio Deals &rarr;
              </Link>
            </div>
          </div>

          {/* Spotlight 3: Home & Kitchen Appliances */}
          <div className="p-6 rounded-xl bg-white border border-[#E5E7EB] text-[#111827] flex flex-col justify-between space-y-4 shadow-card">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#15803D] uppercase tracking-wider">
                Home Essentials
              </span>
              <h3 className="text-xl font-bold text-[#111827]">Appliances &amp; Lifestyle</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Air fryers, mixer grinders, water purifiers, and home essentials with customer reviews.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/category/appliances"
                className="inline-block text-xs font-bold px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#15803D] rounded-lg transition-colors border border-emerald-200"
              >
                Browse Appliances &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Product Discovery Stream */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">
              Trending Amazon Products
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              Scroll down to discover more products across categories
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-semibold text-[#111827] hover:text-amber-600 flex items-center gap-1 transition-colors"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <InfiniteProductGrid
          initialComparisons={discoveryCatalog}
          filters={{ sortBy: "discount" }}
        />
      </section>

      {/* Trust & Transparency Features */}
      <section className="bg-white py-12 border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-1.5">
            <h2 className="text-2xl font-black text-[#111827]">
              Why Discover Products With DealFinder
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              Clean discovery, real pricing, and direct links to Amazon India
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gray-100 text-[#111827] flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-gray-700" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-[#111827]">
                  Amazon India Catalog
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Every product is sourced with Amazon ASINs, titles, and merchant pricing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gray-100 text-[#111827] flex-shrink-0">
                <Truck className="w-5 h-5 text-gray-700" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-[#111827]">
                  Fast Doorstep Delivery
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Direct checkout links route to Amazon India with standard warranty, Amazon Pay options, and Prime delivery eligibility.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gray-100 text-[#111827] flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-gray-700" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-[#111827]">
                  Clear Filters &amp; Specifications
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Narrow down by price range, brand, department, and customer review rating without cluttered advertisements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
