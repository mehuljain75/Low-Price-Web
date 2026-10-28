import type { Metadata } from "next";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  Tag,
  ArrowLeft,
  Share2,
  CheckCircle,
  Truck,
  Sparkles,
  Barcode,
  Search,
} from "lucide-react";
import { repository, hasActivePresentDeal } from "@/lib/data/repository";
import { PriceComparison } from "@/lib/types";
import { formatINR, calculateDiscount, calculateSavings } from "@/lib/formatters";
import { PriceComparisonTable } from "@/components/PriceComparisonTable";
import { ProductCard } from "@/components/ProductCard";
import { DemoBadge } from "@/components/DemoBadge";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import { MobileStickyBuyBar } from "@/components/MobileStickyBuyBar";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { BankOfferCalculator } from "@/components/BankOfferCalculator";
import { ProductImage } from "@/components/ProductImage";

interface ProductDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductDetailsPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const cleanId = decodeURIComponent(resolvedParams.id || "");
  const comparison = await repository.getProductByIdOrSlug(cleanId);
  if (!comparison || !hasActivePresentDeal(comparison)) {
    return {
      title: "Deal Unavailable | Best Live Amazon Deals | DealFinder India",
      description: "This deal is currently unavailable or expired. Browse verified live deals and price drops on Amazon India.",
    };
  }

  const { product, lowestOffer } = comparison;
  const lowestPrice = lowestOffer ? formatINR(lowestOffer.price) : "";
  const discount = lowestOffer
    ? calculateDiscount(lowestOffer.originalPrice, lowestOffer.price)
    : 0;

  return {
    title: `${product.title} Lowest Price in India: ${lowestPrice} | DealFinder`,
    description: `Price drop on Amazon India for ${product.title}. Best price today is ${lowestPrice} (${discount}% OFF). Amazon pricing and deal details.`,
    openGraph: {
      title: `${product.title} — Best Price ${lowestPrice}`,
      description: `Track price drops on Amazon India on DealFinder India.`,
      images: [
        {
          url: product.imageUrl,
          width: 600,
          height: 600,
          alt: product.title,
        },
      ],
    },
    alternates: {
      canonical: `/products/${product.id}`,
    },
  };
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const resolvedParams = await params;
  const cleanId = decodeURIComponent(resolvedParams.id || "");
  const comparison = await repository.getProductByIdOrSlug(cleanId);

  const isDealPresent = comparison && hasActivePresentDeal(comparison);

  if (!isDealPresent) {
    const alternativeDeals = await repository.getProducts({
      categorySlug: comparison?.category?.slug,
      limit: 8,
      sortBy: "discount",
    });

    const popularCategories = [
      { name: "Shoes & Footwear", href: "/search?q=shoes" },
      { name: "Mobiles", href: "/search?category=mobiles" },
      { name: "Laptops", href: "/search?category=laptops" },
      { name: "Audio & Headphones", href: "/search?category=audio" },
      { name: "Watches", href: "/search?category=watches" },
      { name: "Appliances", href: "/search?category=appliances" },
    ];

    const suggestedQuery = cleanId
      .replace(/^prod_amz_/, "")
      .replace(/^amazon-/, "")
      .replace(/[-_]+/g, " ")
      .trim();

    return (
      <div className="min-h-screen bg-[#F8F9FA] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Notice */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 shadow-sm mb-10 text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Deal No Longer Active
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
              This deal is currently unavailable
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
              The deal or price you followed has either expired or is currently out of stock on Amazon India.
              We only show verified, live deals so you never waste time. Search for another deal or explore our top live picks below.
            </p>

            {/* Instant Deal Search Form */}
            <form action="/search" method="GET" className="max-w-xl mx-auto mb-6 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  defaultValue={suggestedQuery.length > 2 && !/^\d+$/.test(suggestedQuery) ? suggestedQuery : ""}
                  placeholder="Search live deals (e.g. Nike shoes, iPhone, boAt)..."
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:bg-white text-gray-900 transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-gray-900 font-bold text-sm rounded-xl transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                Search Deals
              </button>
            </form>

            {/* Quick Categories */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-400 mr-1">Trending:</span>
              {popularCategories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-amber-50 hover:text-amber-900 text-xs font-medium text-gray-700 rounded-lg border border-gray-200 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Alternative Active Deals Grid */}
          {alternativeDeals.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Live Verified Deals Available Now
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Hand-picked in-stock price drops with active Amazon offers
                  </p>
                </div>
                <Link
                  href="/deals"
                  className="text-sm font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 group"
                >
                  <span>See all deals</span>
                  <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {alternativeDeals.map((alt) => (
                  <ProductCard key={alt.product.id} comparison={alt} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const { product, lowestOffer, offers, category } = comparison;
  // Strictly isolate customer-facing offers to verified Amazon India listings
  const verifiedOffers = (offers || []).filter((o) => o.retailerSlug === "amazon");

  // Fetch related products in the same category (deduplicated by model/title and brand variety)
  const allInCategory = await repository.getProducts({
    categorySlug: category?.slug,
  });

  const getBaseTitle = (t: string) =>
    t
      .replace(/\s*\([^)]*\)\s*$/, "")
      .replace(/\s*-\s*[^-]+$/, "")
      .trim()
      .toLowerCase();

  const currentBaseTitle = getBaseTitle(product.title);
  const seenTitles = new Set<string>([currentBaseTitle]);
  if (product.modelNumber) {
    seenTitles.add(`${product.brand} ${product.modelNumber}`.trim().toLowerCase());
  }

  const primaryRelated: PriceComparison[] = [];
  const secondaryRelated: PriceComparison[] = [];
  const seenBrands = new Set<string>([product.brand.toLowerCase()]);

  for (const comp of allInCategory) {
    if (comp.product.id === product.id) continue;
    const base = getBaseTitle(comp.product.title);
    if (seenTitles.has(base)) continue;
    seenTitles.add(base);

    const b = (comp.product.brand || "").toLowerCase();
    if (!seenBrands.has(b) && primaryRelated.length < 3) {
      seenBrands.add(b);
      primaryRelated.push(comp);
    } else {
      secondaryRelated.push(comp);
    }
  }

  const related = [...primaryRelated, ...secondaryRelated].slice(0, 3);

  const highestDiscount = lowestOffer
    ? calculateDiscount(lowestOffer.originalPrice, lowestOffer.price)
    : 0;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    image: [product.imageUrl],
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    ...(product.gtin && { gtin: product.gtin }),
    ...(product.modelNumber && { mpn: product.modelNumber }),
    ...(product.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.ratingCount || 100,
      },
    }),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: lowestOffer ? lowestOffer.price : 0,
      highPrice: Math.max(...verifiedOffers.map((o) => o.price), lowestOffer?.price || 0),
      offerCount: verifiedOffers.length,
      offers: verifiedOffers.map((o) => ({
        "@type": "Offer",
        price: o.price,
        priceCurrency: "INR",
        availability: o.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: o.retailerName,
        },
        url: o.productUrl,
      })),
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Schema.org Product Structured Data for SEO Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#6B7280]">
        <Link href="/" className="hover:text-[#111827] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#111827] transition-colors">
          Products
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${category.slug}`}
              className="hover:text-[#111827] transition-colors"
            >
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-[#111827] font-semibold truncate max-w-xs">
          {product.title}
        </span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Product Image Box */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E5E7EB] p-6 flex flex-col items-center justify-center relative shadow-card">
          <div className="relative aspect-square w-full max-w-sm flex items-center justify-center">
            <ProductImage
              src={product.imageUrl}
              alt={product.title}
              width={500}
              height={500}
              className="object-contain w-full h-full"
              priority
            />
          </div>

          <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
            {highestDiscount > 0 && (
              <span className="bg-red-50 text-[#B91C1C] border border-red-200 text-xs font-bold px-2.5 py-1 rounded-md shadow-2xs">
                Save {highestDiscount}%
              </span>
            )}
            {lowestOffer?.isDemo && <DemoBadge size="md" />}
          </div>
        </div>

        {/* Right: Product Meta, Summary, Best Price */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md border border-[#E5E7EB]">
                {product.brand}
              </span>
              {product.modelNumber && (
                <span className="text-xs text-[#6B7280] font-mono">
                  Model: {product.modelNumber}
                </span>
              )}
              {product.gtin && (
                <span className="text-xs text-[#6B7280] font-mono flex items-center gap-1">
                  <Barcode className="w-3.5 h-3.5" />
                  EAN: {product.gtin}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight leading-snug">
              {product.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Key Variant Specifications (Storage, RAM, Color, etc.) */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-2 shadow-2xs">
              <div className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                Product Specifications
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.entries(product.attributes).map(([key, val]) => (
                  <div key={key} className="bg-gray-50 p-2.5 rounded-lg border border-[#E5E7EB]">
                    <span className="block text-[10px] text-[#6B7280] uppercase font-semibold">
                      {key}
                    </span>
                    <span className="font-bold text-xs text-[#111827]">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lowest Tracked Price Highlight Card */}
          {lowestOffer && (
            <div className="bg-[#111827] rounded-xl p-5 sm:p-6 text-white shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-800">
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <span>Amazon Deal Price</span>
                </span>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    {formatINR(lowestOffer.price)}
                  </span>
                  {lowestOffer.originalPrice > lowestOffer.price && (
                    <span className="text-sm text-gray-400 line-through">
                      MRP: {formatINR(lowestOffer.originalPrice)}
                    </span>
                  )}
                  {lowestOffer.originalPrice > lowestOffer.price && (
                    <span className="bg-amber-400 text-[#111827] text-xs font-extrabold px-2.5 py-1 rounded-md shadow-2xs">
                      Save {formatINR(calculateSavings(lowestOffer.originalPrice, lowestOffer.price))}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-300">
                  Available on <strong className="text-white">{lowestOffer.retailerName}</strong> • {lowestOffer.shippingCost === 0 ? "Free Shipping" : `+₹${lowestOffer.shippingCost} Shipping`}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0">
                <WhatsAppShareButton
                  title={product.title}
                  price={lowestOffer.price}
                  originalPrice={lowestOffer.originalPrice}
                  productId={product.id}
                  variant="button"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-bold"
                />
                <a
                  href={`/api/redirect?offerId=${lowestOffer.id}&title=${encodeURIComponent(product.title)}&url=${encodeURIComponent(lowestOffer.productUrl || "")}`}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#111827] font-bold text-sm transition-colors shadow-xs text-center cursor-pointer"
                >
                  Buy on {lowestOffer.retailerName} &rarr;
                </a>
              </div>
            </div>
          )}

          {/* Transparency / Trust Guarantee */}
          <div className="flex items-center gap-4 text-xs text-[#6B7280] pt-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              {lowestOffer?.retailerName || "Store"} Verified Listing
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-gray-500" />
              Direct Retail Partner Tag
            </span>
          </div>
        </div>
      </div>

      {/* Store Offers & Pricing */}
      <section className="bg-white rounded-xl border border-[#E5E7EB] p-6 sm:p-8 space-y-6 shadow-card">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">
            Store Offers &amp; Pricing
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Offer details across verified Indian retailers. Direct checkout includes partner tag routing.
          </p>
        </div>

        <PriceComparisonTable offers={verifiedOffers} />
      </section>

      {/* Bank & Payment Card Discount Calculator */}
      {lowestOffer && (
        <BankOfferCalculator
          basePrice={lowestOffer.price}
          retailerName={lowestOffer.retailerName}
          offerId={lowestOffer.id}
          productTitle={product.title}
          productUrl={lowestOffer.productUrl}
          bankOffersDescription={lowestOffer.bankOffersDescription}
        />
      )}

      {/* Price History & Deal Verdict */}
      {lowestOffer && (
        <PriceHistoryChart
          currentPrice={lowestOffer.price}
          originalPrice={lowestOffer.originalPrice}
          productTitle={product.title}
        />
      )}

      {/* Related Products in this category */}
      {related.length > 0 && (
        <section className="space-y-5 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#111827] tracking-tight">
              More In {category?.name || "This Category"}
            </h2>
            <Link
              href={`/products?category=${category?.slug}`}
              className="text-xs font-semibold text-[#111827] hover:text-amber-600 transition-colors"
            >
              Browse Category &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((comp) => (
              <ProductCard key={comp.product.id} comparison={comp} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Buy Bar */}
      {lowestOffer && (
        <MobileStickyBuyBar
          title={product.title}
          price={lowestOffer.price}
          originalPrice={lowestOffer.originalPrice}
          retailerName={lowestOffer.retailerName}
          offerId={lowestOffer.id}
          inStock={lowestOffer.inStock}
          productUrl={lowestOffer.productUrl}
        />
      )}
    </div>
  );
}
