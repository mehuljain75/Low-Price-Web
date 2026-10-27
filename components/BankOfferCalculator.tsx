"use client";

import React, { useState, useMemo } from "react";
import { CreditCard, Check, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { formatINR } from "@/lib/formatters";

interface BankCard {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  discountType: "percent" | "flat";
  discountValue: number;
  maxDiscount: number;
  minOrder: number;
  terms: string;
}

const INDIAN_BANK_OFFERS: BankCard[] = [
  {
    id: "hdfc",
    name: "HDFC Bank Credit Card",
    shortName: "HDFC",
    badge: "10% Instant Off",
    discountType: "percent",
    discountValue: 10,
    maxDiscount: 1500,
    minOrder: 5000,
    terms: "10% instant discount up to ₹1,500 on HDFC Credit Card transactions. Min order ₹5,000.",
  },
  {
    id: "sbi",
    name: "SBI Credit Card",
    shortName: "SBI Card",
    badge: "10% Instant Off",
    discountType: "percent",
    discountValue: 10,
    maxDiscount: 1750,
    minOrder: 7500,
    terms: "10% instant discount up to ₹1,750 on SBI Credit Card transactions. Min order ₹7,500.",
  },
  {
    id: "icici",
    name: "ICICI Bank Credit Card",
    shortName: "ICICI",
    badge: "10% Instant Off",
    discountType: "percent",
    discountValue: 10,
    maxDiscount: 1250,
    minOrder: 5000,
    terms: "10% instant discount up to ₹1,250 on ICICI Bank Cards. Min order ₹5,000.",
  },
  {
    id: "amazon_icici",
    name: "Amazon Pay ICICI Card",
    shortName: "Amazon ICICI",
    badge: "5% Unlimited",
    discountType: "percent",
    discountValue: 5,
    maxDiscount: 100000, // Unlimited
    minOrder: 0,
    terms: "Flat 5% unlimited cashback for Prime members on all purchases. No minimum order limit.",
  },
  {
    id: "axis",
    name: "Axis Bank Credit Card",
    shortName: "Axis Bank",
    badge: "10% Instant Off",
    discountType: "percent",
    discountValue: 10,
    maxDiscount: 1000,
    minOrder: 4000,
    terms: "10% instant discount up to ₹1,000 on Axis Bank Credit Cards. Min order ₹4,000.",
  },
  {
    id: "onecard",
    name: "OneCard Credit Card",
    shortName: "OneCard",
    badge: "Flat ₹1,000 Off",
    discountType: "flat",
    discountValue: 1000,
    maxDiscount: 1000,
    minOrder: 8000,
    terms: "Flat ₹1,000 instant discount on OneCard Credit Card transactions. Min order ₹8,000.",
  },
];

interface BankOfferCalculatorProps {
  basePrice: number;
  retailerName: string;
  offerId: string;
  productTitle?: string;
  productUrl?: string;
  bankOffersDescription?: string;
}

export const BankOfferCalculator: React.FC<BankOfferCalculatorProps> = ({
  basePrice,
  retailerName,
  offerId,
  productTitle,
  productUrl,
  bankOffersDescription,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string>("hdfc");

  // If no verified bank offer exists for this product, render an honest informational note
  if (!bankOffersDescription) {
    return (
      <div className="bg-white rounded-3xl border border-blue-200/80 p-6 sm:p-8 space-y-4 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Bank Offers &amp; Payment Discounts
            </h3>
            <p className="text-xs text-slate-500">
              Save more with partner cards and EMI on Amazon India
            </p>
          </div>
        </div>

        <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">
              Check Amazon checkout for eligible bank cards and EMI offers
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instant card discounts (HDFC, SBI, ICICI, Axis) and No-Cost EMI plans vary depending on active bank campaigns and seller eligibility. Check payment options at Amazon checkout for available savings on this item.
            </p>
          </div>
          <a
            href={`/api/redirect?offerId=${offerId}${productTitle ? `&title=${encodeURIComponent(productTitle)}` : ""}${productUrl ? `&url=${encodeURIComponent(productUrl)}` : ""}`}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm flex-shrink-0"
          >
            <span>View Amazon Offers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  const selectedCard = useMemo(
    () => INDIAN_BANK_OFFERS.find((c) => c.id === selectedCardId) || INDIAN_BANK_OFFERS[0],
    [selectedCardId]
  );

  // Calculate discount for selected card
  const { discountAmount, isEligible, effectivePrice, emiMonthly } = useMemo(() => {
    let discount = 0;
    const eligible = basePrice >= selectedCard.minOrder;

    if (eligible) {
      if (selectedCard.discountType === "percent") {
        const rawDiscount = Math.round((basePrice * selectedCard.discountValue) / 100);
        discount = Math.min(rawDiscount, selectedCard.maxDiscount);
      } else {
        discount = selectedCard.discountValue;
      }
    }

    const effective = Math.max(basePrice - discount, 0);
    // Estimated 6-month or 12-month No Cost EMI
    const emi = effective >= 3000 ? Math.round(effective / 6) : 0;

    return {
      discountAmount: discount,
      isEligible: eligible,
      effectivePrice: effective,
      emiMonthly: emi,
    };
  }, [basePrice, selectedCard]);

  return (
    <div className="bg-white rounded-3xl border border-blue-200/80 p-6 sm:p-8 space-y-6 shadow-xs relative overflow-hidden">
      {/* Background Accent Pill */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-100/50 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Bank & Payment Discount Calculator
              </h3>
              <p className="text-xs text-slate-500">
                Select your credit or debit card to reveal your true checkout price
              </p>
            </div>
          </div>
        </div>
        <span className="self-start sm:self-auto text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Active Festive Offers
        </span>
      </div>

      {/* Card Selection Horizontal Pills */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Choose Your Card Provider:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {INDIAN_BANK_OFFERS.map((card) => {
            const isSelected = card.id === selectedCardId;
            return (
              <button
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-blue-600 border-blue-600 text-white shadow-md scale-[1.02]"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-900"}`}>
                    {card.shortName}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <span
                  className={`text-[10px] mt-2 font-semibold ${
                    isSelected ? "text-blue-100" : "text-blue-700"
                  }`}
                >
                  {card.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Effective Price Result Box */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
            <span>Effective Price with {selectedCard.name}</span>
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {formatINR(effectivePrice)}
            </span>
            {discountAmount > 0 && (
              <span className="text-sm line-through text-slate-400">
                {formatINR(basePrice)}
              </span>
            )}
            {discountAmount > 0 && (
              <span className="bg-emerald-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                Saved {formatINR(discountAmount)} Instant
              </span>
            )}
          </div>

          <p className="text-xs text-blue-200/90 leading-relaxed max-w-lg">
            {isEligible
              ? selectedCard.terms
              : `Order value must be at least ${formatINR(selectedCard.minOrder)} to claim this discount.`}
          </p>

          {emiMonthly > 0 && isEligible && (
            <div className="text-xs text-amber-300 font-semibold pt-0.5">
              Or pay from <strong>{formatINR(emiMonthly)}/month</strong> (6 Months No-Cost EMI)
            </div>
          )}
        </div>

        {/* 1-Click Outbound Buy CTA with Applied Card Discount */}
        <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 flex-shrink-0">
          <a
            href={`/api/redirect?offerId=${offerId}${productTitle ? `&title=${encodeURIComponent(productTitle)}` : ""}${productUrl ? `&url=${encodeURIComponent(productUrl)}` : ""}`}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm transition-all shadow-md text-center group"
          >
            <span>Buy for {formatINR(effectivePrice)} on {retailerName}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Security & Verification Guarantee */}
      <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Discount applied automatically on {retailerName} checkout page
        </span>
      </div>
    </div>
  );
};
