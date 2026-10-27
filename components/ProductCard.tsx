"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Tag, Clock, ArrowRight, ShieldAlert } from "lucide-react";
import { PriceComparison } from "@/lib/types";
import { formatINR, calculateDiscount, calculateSavings, getRelativeTime } from "@/lib/formatters";
import { DemoBadge } from "./DemoBadge";
import { WhatsAppShareButton } from "./WhatsAppShareButton";

interface ProductCardProps {
  comparison: PriceComparison;
}

export const ProductCard: React.FC<ProductCardProps> = ({ comparison }) => {
  const { product, lowestOffer, offers, hasStalePrices, category } = comparison;

  if (!lowestOffer) return null;

  const discountPercent = calculateDiscount(
    lowestOffer.originalPrice,
    lowestOffer.price
  );

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
      <div>
        {/* Top Badges & Product Image */}
        <div className="relative aspect-square w-full bg-slate-50 p-4 flex items-center justify-center overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.title}
            width={400}
            height={400}
            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
            unoptimized={product.imageUrl.startsWith("http")}
          />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
            {discountPercent > 0 && (
              <span className="bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {discountPercent}% OFF
              </span>
            )}
            {lowestOffer.isDemo ? (
              <DemoBadge size="sm" />
            ) : (
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
                LIVE DEAL
              </span>
            )}
          </div>

          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
            <WhatsAppShareButton
              title={product.title}
              price={lowestOffer.price}
              originalPrice={lowestOffer.originalPrice}
              productId={product.id}
              variant="icon"
            />
            <span className="bg-orange-50 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200 shadow-2xs">
              Amazon India
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2">
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-slate-600">
              {product.brand}
            </span>
            {category && (
              <span className="text-[11px] text-slate-400">
                {category.name}
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            href={`/products/${product.id}`}
            className="block font-semibold text-sm text-slate-900 group-hover:text-orange-600 line-clamp-2 leading-snug"
            title={product.title}
          >
            {product.title}
          </Link>

          {/* Variant specs if applicable */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="flex flex-wrap gap-1 text-[10px] text-slate-500 pt-0.5">
              {product.attributes.storage && (
                <span className="px-1.5 py-0.5 bg-slate-100 rounded">
                  {product.attributes.storage}
                </span>
              )}
              {product.attributes.color && (
                <span className="px-1.5 py-0.5 bg-slate-100 rounded">
                  {product.attributes.color}
                </span>
              )}
              {product.attributes.size && (
                <span className="px-1.5 py-0.5 bg-slate-100 rounded">
                  Size: {product.attributes.size}
                </span>
              )}
            </div>
          )}

          {/* Pricing Stack */}
          <div className="pt-2">
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Amazon Deal Price:
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl font-black text-slate-900 tracking-tight">
                {formatINR(lowestOffer.price)}
              </span>
              {lowestOffer.originalPrice > lowestOffer.price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatINR(lowestOffer.originalPrice)}
                </span>
              )}
              {lowestOffer.originalPrice > lowestOffer.price && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Save {formatINR(calculateSavings(lowestOffer.originalPrice, lowestOffer.price))}
                </span>
              )}
            </div>
          </div>

          {/* Lowest Store Info */}
          <div className="flex items-center justify-between text-xs pt-1 pb-1 border-t border-slate-100">
            <span className="text-slate-600 text-[11px]">
              on <strong className="text-slate-900">Amazon India</strong>
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getRelativeTime(lowestOffer.lastCheckedAt)}
            </span>
          </div>

          {/* Stale warning indicator if flagged */}
          {lowestOffer.isStale && (
            <div className="text-[10px] text-amber-700 bg-amber-50 p-1 rounded flex items-center gap-1 border border-amber-200">
              <ShieldAlert className="w-3 h-3 text-amber-600 flex-shrink-0" />
              <span>Price may vary (checked &gt;24h ago)</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <Link
          href={`/products/${product.id}`}
          className="flex items-center justify-center gap-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          <span>Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <a
          href={`/api/redirect?offerId=${lowestOffer.id}&title=${encodeURIComponent(product.title)}&url=${encodeURIComponent(lowestOffer.productUrl || "")}`}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="flex items-center justify-center gap-1 py-2 px-3 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-colors"
        >
          <span>Buy on Amazon</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
