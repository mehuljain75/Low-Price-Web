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
} from "lucide-react";
import { repository } from "@/lib/data/repository";
import { formatINR, calculateDiscount, calculateSavings } from "@/lib/formatters";
import { PriceComparisonTable } from "@/components/PriceComparisonTable";
import { ProductCard } from "@/components/ProductCard";
import { DemoBadge } from "@/components/DemoBadge";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import { MobileStickyBuyBar } from "@/components/MobileStickyBuyBar";

interface ProductDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const resolvedParams = await params;
  const comparison = await repository.getProductByIdOrSlug(resolvedParams.id);

  if (!comparison) {
    notFound();
  }

  const { product, lowestOffer, offers, category } = comparison;

  // Fetch related products in the same category
  const allInCategory = await repository.getProducts({
    categorySlug: category?.slug,
  });
  const related = allInCategory.filter((c) => c.product.id !== product.id).slice(0, 3);

  const highestDiscount = lowestOffer
    ? calculateDiscount(lowestOffer.originalPrice, lowestOffer.price)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-slate-900 transition-colors">
          Products
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${category.slug}`}
              className="hover:text-slate-900 transition-colors"
            >
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-900 font-medium truncate max-w-xs">
          {product.title}
        </span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Product Image Box */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center justify-center relative shadow-xs">
          <div className="relative aspect-square w-full max-w-sm flex items-center justify-center">
            <Image
              src={product.imageUrl}
              alt={product.title}
              width={500}
              height={500}
              className="object-contain w-full h-full"
              priority
              unoptimized={product.imageUrl.startsWith("http")}
            />
          </div>

          <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
            {highestDiscount > 0 && (
              <span className="bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {highestDiscount}% OFF
              </span>
            )}
            {lowestOffer?.isDemo && <DemoBadge size="md" />}
          </div>
        </div>

        {/* Right: Product Meta, Summary, Best Price */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
                {product.brand}
              </span>
              {product.modelNumber && (
                <span className="text-xs text-slate-500 font-mono">
                  Model: {product.modelNumber}
                </span>
              )}
              {product.gtin && (
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Barcode className="w-3.5 h-3.5" />
                  EAN: {product.gtin}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Key Variant Specifications (Storage, RAM, Color, etc.) */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Product Specifications & Verified Attributes
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(product.attributes).map(([key, val]) => (
                  <div key={key} className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                      {key}
                    </span>
                    <span className="font-bold text-xs text-slate-800">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lowest Tracked Price Highlight Card */}
          {lowestOffer && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Lowest Price Among Tracked Stores
                </span>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight">
                    {formatINR(lowestOffer.price)}
                  </span>
                  {lowestOffer.originalPrice > lowestOffer.price && (
                    <span className="text-sm text-emerald-200 line-through">
                      MRP: {formatINR(lowestOffer.originalPrice)}
                    </span>
                  )}
                  {lowestOffer.originalPrice > lowestOffer.price && (
                    <span className="bg-amber-300 text-amber-950 text-xs font-black px-2.5 py-1 rounded-full shadow-2xs">
                      Save {formatINR(calculateSavings(lowestOffer.originalPrice, lowestOffer.price))}
                    </span>
                  )}
                </div>
                <div className="text-xs text-emerald-100">
                  Available on <strong>{lowestOffer.retailerName}</strong> • {lowestOffer.shippingCost === 0 ? "Free Shipping" : `+₹${lowestOffer.shippingCost} Shipping`}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0">
                <WhatsAppShareButton
                  title={product.title}
                  price={lowestOffer.price}
                  originalPrice={lowestOffer.originalPrice}
                  productId={product.id}
                  variant="button"
                  className="bg-emerald-800/60 hover:bg-emerald-800 text-white border border-emerald-400/30"
                />
                <a
                  href={`/api/redirect?offerId=${lowestOffer.id}`}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-emerald-800 font-extrabold text-sm hover:bg-emerald-50 transition-colors shadow-sm text-center"
                >
                  Buy for {formatINR(lowestOffer.price)} &rarr;
                </a>
              </div>
            </div>
          )}

          {/* Transparency / Trust Guarantee */}
          <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Retailer Feeds
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              Accurate Model Matching
            </span>
          </div>
        </div>
      </div>

      {/* Cross-Store Price Comparison Matrix */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Compare Stores & Live Offers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time offer listings across verified Indian shopping platforms. Outbound links include partner affiliate tags.
          </p>
        </div>

        <PriceComparisonTable offers={offers} />
      </section>

      {/* Related Products in this category */}
      {related.length > 0 && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              More In {category?.name || "This Category"}
            </h2>
            <Link
              href={`/products?category=${category?.slug}`}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700"
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
        />
      )}
    </div>
  );
}
