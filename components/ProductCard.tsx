"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Clock, ShieldAlert, ArrowRight } from "lucide-react";
import { PriceComparison } from "@/lib/types";
import { formatINR, calculateDiscount, calculateSavings, getRelativeTime } from "@/lib/formatters";
import { getRetailerMetadata, isValidRetailerUrl } from "@/lib/retailer-utils";
import { DemoBadge } from "./DemoBadge";
import { WhatsAppShareButton } from "./WhatsAppShareButton";
import { ProductImage } from "./ProductImage";

interface ProductCardProps {
  comparison: PriceComparison;
}

export const ProductCard: React.FC<ProductCardProps> = ({ comparison }) => {
  const { product, lowestOffer, offers, hasStalePrices, category } = comparison;

  if (
    !product ||
    !lowestOffer ||
    typeof lowestOffer.price !== "number" ||
    lowestOffer.price <= 0 ||
    lowestOffer.inStock === false ||
    !offers ||
    offers.length === 0 ||
    !offers.some((o) => o.retailerSlug === "amazon" && o.price > 0 && o.inStock !== false)
  ) {
    return null;
  }

  const hasValidDiscount =
    lowestOffer.originalPrice > lowestOffer.price &&
    lowestOffer.originalPrice > 0 &&
    lowestOffer.price > 0;

  const discountPercent = hasValidDiscount
    ? calculateDiscount(lowestOffer.originalPrice, lowestOffer.price)
    : 0;

  return (
    <div className="group bg-white rounded-xl border border-[#E5E7EB] hover:border-gray-300 hover:shadow-card-hover transition-all duration-150 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Top Badges & Product Image */}
        <div className="relative aspect-square w-full bg-white p-5 flex items-center justify-center border-b border-[#E5E7EB]">
          <Link href={`/products/${product.id}`} className="w-full h-full flex items-center justify-center">
            <ProductImage
              src={product.imageUrl}
              alt={product.title}
              width={400}
              height={400}
              className="object-contain w-full h-full group-hover:scale-[1.02] transition-transform duration-200"
            />
          </Link>

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10 pointer-events-none">
            {hasValidDiscount && discountPercent > 0 && (
              <span className="bg-red-50 text-[#B91C1C] text-[10px] font-bold px-2 py-0.5 rounded border border-red-200 shadow-2xs">
                {discountPercent}% OFF
              </span>
            )}
            {lowestOffer.provenance === "amazon_paapi_live" ? (
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300 shadow-2xs flex items-center gap-1">
                <span>Amazon Live</span>
              </span>
            ) : lowestOffer.isDemo ? (
              <DemoBadge size="sm" />
            ) : (lowestOffer.isStale || hasStalePrices) ? (
              <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 shadow-2xs flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Cached Price</span>
              </span>
            ) : lowestOffer.inStock ? (
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 shadow-2xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>In Stock</span>
              </span>
            ) : null}
          </div>

          <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
            <WhatsAppShareButton
              title={product.title}
              price={lowestOffer.price}
              originalPrice={lowestOffer.originalPrice}
              productId={product.id}
              variant="icon"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2.5">
          {/* Brand, Category & Rating */}
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-gray-500">
              {product.brand}
            </span>
            {product.rating !== undefined && product.rating > 0 ? (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                <span>★</span>
                <span>{product.rating.toFixed(1)}</span>
                {product.ratingCount ? (
                  <span className="text-[10px] text-gray-500 font-normal">
                    ({product.ratingCount})
                  </span>
                ) : null}
              </div>
            ) : category ? (
              <span className="text-[11px] text-[#6B7280]">
                {category.name}
              </span>
            ) : null}
          </div>

          {/* Title */}
          <Link
            href={`/products/${product.id}`}
            className="block font-bold text-sm text-[#111827] group-hover:text-amber-600 line-clamp-2 leading-snug transition-colors"
            title={product.title}
          >
            {product.title}
          </Link>

          {/* Available Sizes / Footwear Chips */}
          {product.attributes?.availableSizes ? (
            <div className="flex items-center gap-1 flex-wrap pt-0.5">
              <span className="text-[10px] text-gray-400 font-medium">Sizes:</span>
              {(typeof product.attributes.availableSizes === "string"
                ? product.attributes.availableSizes.split(",").map((s) => s.trim())
                : (product.attributes.availableSizes as string[])
              ).slice(0, 5).map((sz: string) => (
                <span
                  key={sz}
                  className="px-1.5 py-0.5 bg-gray-50 text-gray-700 rounded text-[9px] font-semibold border border-[#E5E7EB]"
                >
                  {sz}
                </span>
              ))}
              {(typeof product.attributes.availableSizes === "string"
                ? product.attributes.availableSizes.split(",")
                : (product.attributes.availableSizes as string[])
              ).length > 5 && (
                <span className="text-[9px] text-gray-400 font-medium">
                  +{(typeof product.attributes.availableSizes === "string" ? product.attributes.availableSizes.split(",") : (product.attributes.availableSizes as string[])).length - 5}
                </span>
              )}
            </div>
          ) : product.attributes && Object.keys(product.attributes).length > 0 ? (
            <div className="flex flex-wrap gap-1 text-[10px] text-[#6B7280] pt-0.5">
              {product.attributes.storage && (
                <span className="px-1.5 py-0.5 bg-gray-50 text-gray-700 rounded border border-[#E5E7EB]">
                  {product.attributes.storage}
                </span>
              )}
              {product.attributes.color && (
                <span className="px-1.5 py-0.5 bg-gray-50 text-gray-700 rounded border border-[#E5E7EB]">
                  {product.attributes.color}
                </span>
              )}
              {product.attributes.size && (
                <span className="px-1.5 py-0.5 bg-gray-50 text-gray-700 rounded border border-[#E5E7EB]">
                  Size: {product.attributes.size}
                </span>
              )}
            </div>
          ) : null}

          {/* Pricing Stack */}
          <div className="pt-1.5">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl font-black text-[#111827] tracking-tight">
                {formatINR(lowestOffer.price)}
              </span>
              {hasValidDiscount && (
                <span className="text-xs text-[#6B7280] line-through font-normal">
                  {formatINR(lowestOffer.originalPrice)}
                </span>
              )}
              {hasValidDiscount && (
                <span className="text-[10px] font-bold text-[#15803D] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Save {formatINR(calculateSavings(lowestOffer.originalPrice, lowestOffer.price))}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-1">
              <span>
                on <strong className="text-[#111827] font-semibold">Amazon India</strong>
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <Clock className="w-3 h-3 text-gray-400" />
                {getRelativeTime(lowestOffer.lastCheckedAt)}
              </span>
            </div>
          </div>

          {/* Stale warning indicator if flagged */}
          {lowestOffer.isStale && (
            <div className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded flex items-center gap-1.5 border border-amber-200">
              <ShieldAlert className="w-3 h-3 text-amber-600 flex-shrink-0" />
              <span>Price checked &gt;24h ago; verify on Amazon</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons: Details & Buy on Retailer */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <Link
          href={`/products/${product.id}`}
          className="py-2 px-3 text-xs font-semibold rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 transition-colors flex items-center justify-center gap-1 cursor-pointer text-center"
        >
          <span>Details</span>
          <ArrowRight className="w-3 h-3 text-gray-500" />
        </Link>
        {lowestOffer.productUrl && isValidRetailerUrl(lowestOffer.productUrl, lowestOffer.retailerSlug) ? (
          <a
            href={`/api/redirect?offerId=${lowestOffer.id}&title=${encodeURIComponent(product.title)}&url=${encodeURIComponent(lowestOffer.productUrl || "")}`}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="py-2 px-3 text-xs font-bold rounded-lg text-[#111827] bg-[#F59E0B] hover:bg-[#D97706] shadow-2xs hover:shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer text-center"
          >
            <span>{getRetailerMetadata(lowestOffer.retailerSlug).buttonLabel}</span>
            <ExternalLink className="w-3 h-3 text-[#111827]" />
          </a>
        ) : (
          <span
            className="py-2 px-3 text-xs font-medium rounded-lg text-gray-400 bg-gray-100 border border-gray-200 flex items-center justify-center text-center cursor-not-allowed"
            title="Listing is currently unavailable on this store"
          >
            Unavailable
          </span>
        )}
      </div>
    </div>
  );
};
