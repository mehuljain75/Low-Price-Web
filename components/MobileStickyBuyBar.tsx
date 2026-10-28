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
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] shadow-dropdown px-4 py-3 transition-transform duration-150 transform translate-y-0"
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Left: Price & Savings */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-[#111827] tracking-tight">
              {formatINR(price)}
            </span>
            {originalPrice > price && (
              <span className="text-xs text-[#6B7280] line-through font-normal">
                {formatINR(originalPrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-[10px] font-bold text-[#B91C1C] bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                {discount}% OFF
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#6B7280] truncate flex items-center gap-1">
            <span>on <strong className="text-[#111827]">{retailerName}</strong></span>
            {savings > 0 && (
              <span className="text-[#15803D] font-semibold">• Save {formatINR(savings)}</span>
            )}
          </div>
        </div>

        {/* Right: Primary Action Button */}
        <a
          href={`/api/redirect?offerId=${offerId}&title=${encodeURIComponent(title)}${productUrl ? `&url=${encodeURIComponent(productUrl)}` : ""}`}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="flex-shrink-0 flex items-center gap-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#111827] font-bold text-xs px-5 py-2.5 rounded-lg transition-colors shadow-xs"
        >
          <span>Buy on {retailerName || "Store"}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
};
