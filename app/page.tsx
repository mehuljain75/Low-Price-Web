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
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-amber-50/30 to-slate-50 pt-14 pb-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Amazon India Product Discovery &amp; Deal Finder</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Find Your Next Favorite Product on{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
              Amazon
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover products, explore categories, filter your options, and find the right deal.
          </p>

          {/* Hero Search Box */}
          <div className="max-w-2xl mx-auto pt-2">
            <SearchAutocomplete
              variant="hero"
              placeholder="Search smartphone, laptop, audio, home, fashion (e.g. iPhone 15, Dell XPS)..."
            />

            {/* Trending Suggestions */}
            <div className="flex items-center justify-center gap-2 flex-wrap pt-4 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Popular Searches:</span>
              {["iPhone 15", "Samsung S24", "MacBook Air M2", "Sony XM5", "boAt Airdopes", "Air Fryer"].map((t) => (
                <Link
                  key={t}
                  href={`/search?q=${encodeURIComponent(t)}`}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full transition-colors font-medium text-slate-700"
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Explore Popular Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Browse authentic Amazon India product catalogs by department
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
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
                className="group p-4 bg-white rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all flex flex-col items-center text-center space-y-2.5"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-orange-500 group-hover:text-white text-orange-600 flex items-center justify-center transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-orange-600" />
              <span>Featured Deals on Amazon India</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Top curated discounts across mobiles, computing, electronics, and lifestyle
            </p>
          </div>
          <Link
            href="/deals"
            className="text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
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
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col justify-between space-y-4 shadow-md">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                Tech &amp; Electronics
              </span>
              <h3 className="text-xl font-bold">Mobiles &amp; Laptops</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Discover flagship smartphones from Apple, Samsung, OnePlus, and performance laptops from HP, Dell, and Lenovo on Amazon.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/category/mobiles"
                className="text-xs font-bold px-3.5 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-white transition-colors"
              >
                Mobiles &rarr;
              </Link>
              <Link
                href="/category/laptops"
                className="text-xs font-bold px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              >
                Laptops &rarr;
              </Link>
            </div>
          </div>

          {/* Spotlight 2: Audio & Accessories */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-600 to-amber-700 text-white flex flex-col justify-between space-y-4 shadow-md">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider">
                Sound &amp; Wearables
              </span>
              <h3 className="text-xl font-bold">Audio &amp; Headphones</h3>
              <p className="text-xs text-orange-100 leading-relaxed">
                Explore noise-cancelling headphones from Sony, AirPods from Apple, and budget TWS earbuds from boAt and JBL.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/category/audio"
                className="inline-block text-xs font-bold px-4 py-2 bg-white text-orange-800 hover:bg-orange-50 rounded-xl transition-colors"
              >
                Explore Audio Deals &rarr;
              </Link>
            </div>
          </div>

          {/* Spotlight 3: Home & Kitchen Appliances */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white flex flex-col justify-between space-y-4 shadow-md">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                Home Essentials
              </span>
              <h3 className="text-xl font-bold">Appliances &amp; Lifestyle</h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Air fryers, mixer grinders, water purifiers, and home essentials with verified Amazon customer reviews.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/category/appliances"
                className="inline-block text-xs font-bold px-4 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl transition-colors"
              >
                Browse Appliances &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Product Discovery Stream */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Trending Amazon Products
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Scroll down to discover more verified products across categories
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
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
      <section className="bg-white py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl font-black text-slate-900">
              Why Discover Products With DealFinder
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Clean discovery, real pricing, and direct links to Amazon India
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-orange-100 text-orange-700 flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900">
                  Verified Amazon Catalog
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every product is sourced with verified Amazon ASINs, genuine titles, and authentic merchant pricing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900">
                  Fast Doorstep Delivery
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Direct checkout links route to Amazon India with standard warranty, Amazon Pay options, and Prime delivery eligibility.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-100 text-blue-700 flex-shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900">
                  Clear Filters &amp; Specifications
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
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
