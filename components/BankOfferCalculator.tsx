"use client";

import React, { useState, useMemo } from "react";
import { CreditCard, Check, Sparkles, ArrowRight, ShieldCheck, AlertCircle, ShoppingCart } from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { INDIAN_BANK_OFFERS, calculateBankOfferEligibility } from "@/lib/bank-offers";

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
  const [customCartValue, setCustomCartValue] = useState<string>("");
  const [isCustomCartOpen, setIsCustomCartOpen] = useState<boolean>(false);

  const selectedCard = useMemo(
    () => INDIAN_BANK_OFFERS.find((c) => c.id === selectedCardId) || INDIAN_BANK_OFFERS[0],
    [selectedCardId]
  );

  const cartValueNumber = useMemo(() => {
    if (!customCartValue.trim()) return undefined;
    const num = parseFloat(customCartValue);
    return isNaN(num) || num < 0 ? undefined : num;
  }, [customCartValue]);

  // Calculate discount and eligibility using the engine
  const calculation = useMemo(() => {
    return calculateBankOfferEligibility({
      listedPrice: basePrice,
      qualifyingOrderValue: cartValueNumber,
      selectedCard,
    });
  }, [basePrice, cartValueNumber, selectedCard]);

  // If no verified bank offer exists for this product, render an honest informational note
  if (!bankOffersDescription) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-4 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#111827] tracking-tight">
              Bank Offers &amp; Payment Discounts
            </h3>
            <p className="text-xs text-gray-500">
              Check partner cards and EMI savings on {retailerName}
            </p>
          </div>
        </div>

        <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#111827]">
              Check {retailerName} checkout for eligible bank cards and EMI offers
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Instant card discounts and No-Cost EMI plans vary depending on active bank campaigns and seller eligibility. Check payment options at {retailerName} checkout for available savings on this item.
            </p>
          </div>
          <a
            href={`/api/redirect?offerId=${offerId}${productTitle ? `&title=${encodeURIComponent(productTitle)}` : ""}${productUrl ? `&url=${encodeURIComponent(productUrl)}` : ""}`}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-amber-600 text-[#111827] font-bold text-xs transition-colors shadow-xs flex-shrink-0"
          >
            <span>View {retailerName} Offers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  const { isEligible, discountAmount, effectivePrice, emiMonthly, ineligibilityReason } = calculation;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#111827] tracking-tight">
                Bank & Payment Discount Calculator
              </h3>
              <p className="text-xs text-gray-500">
                Select your credit or debit card to calculate true checkout savings on {retailerName}
              </p>
            </div>
          </div>
        </div>
        <span className="self-start sm:self-auto text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Verified Offers
        </span>
      </div>

      {/* Card Selection Horizontal Pills */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
          Choose Your Card Provider:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {INDIAN_BANK_OFFERS.map((card) => {
            const isSelected = card.id === selectedCardId;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelectedCardId(card.id)}
                className={`p-3 rounded-lg border text-left transition-all duration-150 flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#111827] border-[#111827] text-white shadow-xs"
                    : "bg-gray-50 hover:bg-gray-100 border-[#E5E7EB] text-gray-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-[#111827]"}`}>
                    {card.shortName}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#F59E0B]" />}
                </div>
                <span
                  className={`text-[10px] mt-2 font-semibold ${
                    isSelected ? "text-[#F59E0B]" : "text-[#6B7280]"
                  }`}
                >
                  {card.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-Item / Cart Qualifying Spend Toggle */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-xs">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsCustomCartOpen(!isCustomCartOpen)}
            className="flex items-center gap-1.5 font-medium text-gray-700 hover:text-black transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
            <span>Ordering multiple items? Check cart-level eligibility</span>
            <span className="text-amber-600 text-[11px] underline ml-1">
              {isCustomCartOpen ? "Hide" : "Enter cart total"}
            </span>
          </button>
          {customCartValue && (
            <button
              type="button"
              onClick={() => setCustomCartValue("")}
              className="text-gray-400 hover:text-gray-600 text-[11px]"
            >
              Reset
            </button>
          )}
        </div>

        {isCustomCartOpen && (
          <div className="mt-2.5 pt-2.5 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="cart-value-input" className="text-gray-600 text-xs">
              Expected total cart value on {retailerName}: ₹
            </label>
            <input
              id="cart-value-input"
              type="number"
              min="0"
              placeholder={basePrice.toString()}
              value={customCartValue}
              onChange={(e) => setCustomCartValue(e.target.value)}
              className="w-32 px-2.5 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
            <span className="text-[11px] text-gray-500">
              (Item price: {formatINR(basePrice)})
            </span>
          </div>
        )}
      </div>

      {/* Calculation Result Box */}
      <div
        className={`rounded-xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-5 border transition-all ${
          isEligible
            ? "bg-[#111827] text-white border-gray-800"
            : "bg-amber-50/70 border-amber-200 text-gray-900"
        }`}
      >
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <span className={isEligible ? "text-gray-400" : "text-amber-900"}>
              {isEligible
                ? `Effective Price with ${selectedCard.name}`
                : `Eligibility Status: Minimum Order Not Met`}
            </span>
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <span
              className={`text-3xl sm:text-4xl font-black tracking-tight ${
                isEligible ? "text-white" : "text-gray-900"
              }`}
            >
              {formatINR(effectivePrice)}
            </span>
            {isEligible && discountAmount > 0 && (
              <span className="text-sm line-through text-gray-400 font-normal">
                {formatINR(basePrice)}
              </span>
            )}
            {isEligible && discountAmount > 0 ? (
              <span className="bg-emerald-50 text-[#15803D] border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded shadow-2xs">
                Saved {formatINR(discountAmount)} Instant
              </span>
            ) : !isEligible ? (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-2.5 py-0.5 rounded shadow-2xs flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                Min Spend {formatINR(selectedCard.minOrder)} Required
              </span>
            ) : null}
          </div>

          <p
            className={`text-xs leading-relaxed max-w-lg ${
              isEligible ? "text-gray-300" : "text-gray-700 font-medium"
            }`}
          >
            {isEligible ? selectedCard.terms : ineligibilityReason}
          </p>

          {emiMonthly > 0 && isEligible && (
            <div className="text-xs text-[#F59E0B] font-semibold pt-0.5">
              Or pay from <strong>{formatINR(emiMonthly)}/month</strong> (6 Months No-Cost EMI)
            </div>
          )}
        </div>

        {/* 1-Click Outbound Buy CTA */}
        <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 flex-shrink-0">
          <a
            href={`/api/redirect?offerId=${offerId}${productTitle ? `&title=${encodeURIComponent(productTitle)}` : ""}${productUrl ? `&url=${encodeURIComponent(productUrl)}` : ""}`}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#111827] font-bold text-sm transition-colors shadow-xs text-center group"
          >
            <span>
              {isEligible
                ? `Buy for ${formatINR(effectivePrice)} on ${retailerName}`
                : `Buy on ${retailerName} (${formatINR(basePrice)})`}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Security & Verification Guarantee */}
      <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#15803D]" />
          {isEligible
            ? `Discount applied automatically on ${retailerName} checkout page when using an eligible card`
            : `Standard listed price of ${formatINR(basePrice)} applies at checkout unless total cart meets ${formatINR(selectedCard.minOrder)}`}
        </span>
      </div>
    </div>
  );
};
