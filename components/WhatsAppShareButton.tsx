"use client";

import React, { useState } from "react";
import { MessageCircle, Check, Share2 } from "lucide-react";
import { formatINR, calculateDiscount } from "@/lib/formatters";

interface WhatsAppShareButtonProps {
  title: string;
  price: number;
  originalPrice: number;
  productId?: string;
  productUrl?: string;
  variant?: "button" | "icon" | "pill";
  className?: string;
}

export const WhatsAppShareButton: React.FC<WhatsAppShareButtonProps> = ({
  title,
  price,
  originalPrice,
  productId,
  productUrl,
  variant = "button",
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      if (productUrl) return productUrl.startsWith("http") ? productUrl : `${window.location.origin}${productUrl}`;
      if (productId) return `${window.location.origin}/products/${productId}`;
      return window.location.href;
    }
    return `https://low-price-web.jainmehul257.workers.dev/products/${productId || ""}`;
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const discount = calculateDiscount(originalPrice, price);
    const formattedPrice = formatINR(price);
    const targetUrl = getShareUrl();

    const discountText = discount > 0 ? ` (${discount}% OFF)` : "";
    const message = `🔥 *Deal Alert on DealFinder India!* \n\n*${title.trim()}*\n💰 Deal Price: *${formattedPrice}*${discountText}\n\n🔍 Compare live prices across Amazon, Flipkart & top stores:\n👉 ${targetUrl}`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in a new tab
    if (typeof window !== "undefined") {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleShare}
        type="button"
        title="Share Deal on WhatsApp"
        aria-label="Share Deal on WhatsApp"
        className={`w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-500 flex items-center justify-center transition-all shadow-2xs group/btn ${className}`}
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-600 group-hover/btn:text-white" />
        ) : (
          <svg
            className="w-4 h-4 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        )}
      </button>
    );
  }

  if (variant === "pill") {
    return (
      <button
        onClick={handleShare}
        type="button"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 hover:border-emerald-600 transition-all shadow-2xs ${className}`}
      >
        <svg
          className="w-3.5 h-3.5 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span>{copied ? "Link Copied!" : "Share on WhatsApp"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      type="button"
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md transition-all ${className}`}
    >
      <svg
        className="w-4 h-4 fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      <span>{copied ? "Deal Copied!" : "Share Deal on WhatsApp"}</span>
    </button>
  );
};
