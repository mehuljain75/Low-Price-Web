/**
 * Bank Offer Calculation & Eligibility Engine
 * Provides mathematical validation, eligibility checks, and effective price calculations
 * for Indian credit card, debit card, and EMI checkout discounts.
 */

export interface BankCard {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  discountType: "percent" | "flat";
  discountValue: number;
  maxDiscount: number;
  minOrder: number;
  terms: string;
  cardType?: "credit" | "debit" | "all";
}

export const INDIAN_BANK_OFFERS: BankCard[] = [
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
    cardType: "credit",
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
    cardType: "credit",
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
    cardType: "credit",
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
    cardType: "credit",
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
    cardType: "credit",
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
    cardType: "credit",
  },
];

export interface BankOfferCalculationInput {
  listedPrice: number;
  qualifyingOrderValue?: number;
  selectedCard: BankCard;
  paymentMethod?: string;
  cardType?: "credit" | "debit" | "all";
}

export interface BankOfferCalculationResult {
  isEligible: boolean;
  ineligibilityReason?: string;
  listedPrice: number;
  qualifyingOrderValue: number;
  discountAmount: number;
  effectivePrice: number;
  emiMonthly: number;
  appliedCard: BankCard;
  savingsMessage?: string;
}

/**
 * Sanitizes numeric price inputs against NaN, Infinity, negative values
 */
function sanitizePrice(val: unknown): number {
  if (typeof val !== "number" || isNaN(val) || !isFinite(val)) {
    return 0;
  }
  return Math.max(0, Math.round(val));
}

/**
 * Calculates bank offer discount, eligibility, and effective price.
 * Guarantees zero negative prices, handles minimum spends, and caps maximum discounts.
 */
export function calculateBankOfferEligibility(input: BankOfferCalculationInput): BankOfferCalculationResult {
  const listedPrice = sanitizePrice(input.listedPrice);
  const qualifyingOrderValue = input.qualifyingOrderValue !== undefined
    ? sanitizePrice(input.qualifyingOrderValue)
    : listedPrice;

  const card = input.selectedCard;

  // 1. Check card type eligibility if specified
  if (input.cardType && card.cardType && card.cardType !== "all" && input.cardType !== card.cardType) {
    return {
      isEligible: false,
      ineligibilityReason: `Offer is only valid on ${card.cardType.toUpperCase()} cards.`,
      listedPrice,
      qualifyingOrderValue,
      discountAmount: 0,
      effectivePrice: listedPrice,
      emiMonthly: 0,
      appliedCard: card,
    };
  }

  // 2. Minimum Order Value Check (crucial fix for Bug 2)
  if (qualifyingOrderValue < card.minOrder) {
    const shortfall = card.minOrder - qualifyingOrderValue;
    return {
      isEligible: false,
      ineligibilityReason: `Order value must be at least ₹${card.minOrder.toLocaleString("en-IN")} to qualify. Add ₹${shortfall.toLocaleString("en-IN")} more to your cart.`,
      listedPrice,
      qualifyingOrderValue,
      discountAmount: 0,
      effectivePrice: listedPrice,
      emiMonthly: 0,
      appliedCard: card,
    };
  }

  // 3. Compute discount based on listed product price (capped at card.maxDiscount)
  let rawDiscount = 0;
  if (card.discountType === "percent") {
    rawDiscount = Math.round((listedPrice * card.discountValue) / 100);
  } else {
    rawDiscount = card.discountValue;
  }

  // Never discount more than listed price itself, and cap at maxDiscount
  const discountAmount = Math.min(rawDiscount, card.maxDiscount, listedPrice);
  const effectivePrice = Math.max(0, listedPrice - discountAmount);

  // EMI availability: 6-month No-Cost EMI for effective transactions >= ₹3,000
  const emiMonthly = effectivePrice >= 3000 ? Math.round(effectivePrice / 6) : 0;

  return {
    isEligible: true,
    listedPrice,
    qualifyingOrderValue,
    discountAmount,
    effectivePrice,
    emiMonthly,
    appliedCard: card,
    savingsMessage: `Saved ₹${discountAmount.toLocaleString("en-IN")} instant discount with ${card.name}`,
  };
}
