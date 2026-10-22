"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, ShoppingBag, ShieldCheck } from "lucide-react";
import { formatINR, calculateDiscount } from "@/lib/formatters";

interface MobileStickyBuyBarProps {
  title: string;
  price: number;
  originalPrice: number;
  retailerName: string;
  offerId: string;
  inStock: boolean;
  productUrl?: string;
}

export const MobileStickyBuyBar: React.FC<MobileStickyBuyBarProps> = ({
  title,
  price,
  originalPrice,
  retailerName,
  offerId,
  inStock,
  productUrl,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down 250px
      if (window.scrollY > 250) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  const discount = calculateDiscount(originalPrice, price);
  const savings = originalPrice > price ? originalPrice - price : 0;

  return (
    <aside
      aria-label="Sticky checkout offer"
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-4 py-3 transition-transform duration-300 transform translate-y-0"
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Left: Price & Savings */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-slate-900 tracking-tight">
              {formatINR(price)}
            </span>
            {originalPrice > price && (
              <span className="text-xs text-slate-400 line-through">
                {formatINR(originalPrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-[10px] font-bold text-rose-600">
                {discount}% OFF
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
            <span>on <strong>{retailerName}</strong></span>
            {savings > 0 && (
              <span className="text-emerald-700 font-semibold">• Save {formatINR(savings)}</span>
            )}
          </div>
        </div>

        {/* Right: Primary Action Button */}
        <a
          href={`/api/redirect?offerId=${offerId}&title=${encodeURIComponent(title)}${productUrl ? `&url=${encodeURIComponent(productUrl)}` : ""}`}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="flex-shrink-0 flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md active:scale-95 transition-all"
        >
          <span>Go to Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
};
