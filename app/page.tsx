import React from "react";
import Link from "next/link";
import {
  Search,
  Flame,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Smartphone,
  Laptop,
  Headphones,
  Shirt,
  Refrigerator,
  Sparkles,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { repository } from "@/lib/data/repository";
import { ProductCard } from "@/components/ProductCard";

export const revalidate = 60; // ISR cache for fast loading

export default async function HomePage() {
  const categories = await repository.getCategories();
  const featuredComparisons = await repository.getProducts({ sortBy: "discount" });
  const topDeals = featuredComparisons.slice(0, 4);
  const trendingComparisons = featuredComparisons.slice(4, 8);

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
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-amber-50/40 to-slate-50 pt-12 pb-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Smart Indian Price Comparison Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Stop Overpaying. Compare Real Prices Across{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-blue-600">
              India&apos;s Top Stores.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Instantly compare live and verified offers across <strong>Amazon India, Flipkart, Myntra, AJIO, and Meesho</strong>.
            Never miss genuine price drops or bank card discounts.
          </p>

          {/* Hero Search Box */}
          <div className="max-w-2xl mx-auto pt-2">
            <form
              action="/products"
              method="GET"
              className="relative flex items-center shadow-lg rounded-full overflow-hidden border border-slate-300 bg-white p-1.5 focus-within:ring-2 focus-within:ring-orange-500 transition-all"
            >
              <Search className="w-5 h-5 text-slate-400 ml-4 flex-shrink-0" />
              <input
                type="text"
                name="search"
                placeholder="Search smartphone, laptop, audio, fashion (e.g. iPhone 15, S24, MacBook)..."
                className="w-full px-4 py-2.5 text-sm sm:text-base focus:outline-none text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm px-6 py-3 rounded-full flex-shrink-0 shadow-sm transition-all"
              >
                Compare Now
              </button>
            </form>

            {/* Quick Trending Suggestions */}
            <div className="flex items-center justify-center gap-2 flex-wrap pt-4 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Trending:</span>
              {["iPhone 15", "Samsung S24", "MacBook Air M2", "Sony XM5", "boAt Airdopes", "Air Fryer"].map((t) => (
                <Link
                  key={t}
                  href={`/products?search=${encodeURIComponent(t)}`}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full transition-colors font-medium text-slate-700"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Explore Popular Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Curated product catalogs with cross-retailer offer mapping
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.id] || Sparkles;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
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

      {/* Today's Featured Price Drops */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Today&apos;s Verified Price Drops
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Products with the steepest genuine price discounts compared to MRP
              </p>
            </div>
          </div>
          <Link
            href="/deals"
            className="text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <span>All Deals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topDeals.map((comp) => (
            <ProductCard key={comp.product.id} comparison={comp} />
          ))}
        </div>
      </section>

      {/* Upcoming Festive Sales Banner Promo */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-3 z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Calendar className="w-3.5 h-3.5" />
              <span>Indian Festival Sales 2026</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Flipkart BBD & Amazon Great Indian Festival Are Coming!
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Don&apos;t get misled by fake discounts. Our price history tracking monitors pre-sale prices to guarantee you get real savings during Diwali and festive mega sales.
            </p>
            <div className="pt-2">
              <Link
                href="/sales"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-md transition-colors"
              >
                <span>View Full 2026 Sale Schedule & Tips</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="z-10 grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
              <span className="block text-2xl font-black text-amber-400">Up to 80%</span>
              <span className="text-xs text-slate-300">Target Discounts</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
              <span className="block text-2xl font-black text-emerald-400">5 Stores</span>
              <span className="text-xs text-slate-300">Live Comparisons</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Comparisons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Trending Comparisons
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Most searched electronics, mobiles, and fashion items
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingComparisons.map((comp) => (
            <ProductCard key={comp.product.id} comparison={comp} />
          ))}
        </div>
      </section>

      {/* Value Proposition / Trust Features */}
      <section className="bg-white py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl font-black text-slate-900">
              Why Indian Shoppers Trust DealFinder
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Built on transparency, speed, and real verified retailer feeds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 flex-shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900">
                  Strict Variant Matching
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We never compare 128GB with 256GB models. You get apples-to-apples price comparisons across authorized retailer feeds.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-100 text-blue-700 flex-shrink-0">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900">
                  Bank Offers & Card Perks
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We display instant bank discount notes (HDFC, SBI, ICICI, Axis) so you know your true checkout cost.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900">
                  Zero Scraping / Safe Links
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We operate through legitimate affiliate partner APIs and data feeds, adhering to Indian ASCI and global advertising standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
