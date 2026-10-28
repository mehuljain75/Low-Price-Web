import { describe, it, expect } from "vitest";
import {
  calculateBankOfferEligibility,
  INDIAN_BANK_OFFERS,
  BankCard,
} from "../lib/bank-offers";

describe("Bank Offer Calculation & Eligibility Engine (Bug 2 Fix Verification)", () => {
  const hdfcCard = INDIAN_BANK_OFFERS.find((c) => c.id === "hdfc")!;
  const sbiCard = INDIAN_BANK_OFFERS.find((c) => c.id === "sbi")!;
  const amazonIciciCard = INDIAN_BANK_OFFERS.find((c) => c.id === "amazon_icici")!;
  const onecard = INDIAN_BANK_OFFERS.find((c) => c.id === "onecard")!;

  it("strictly enforces minOrder threshold: ₹999 item with HDFC (min ₹5,000) is NOT eligible", () => {
    const result = calculateBankOfferEligibility({
      listedPrice: 999,
      selectedCard: hdfcCard,
    });

    expect(result.isEligible).toBe(false);
    expect(result.discountAmount).toBe(0);
    expect(result.effectivePrice).toBe(999);
    expect(result.emiMonthly).toBe(0);
    expect(result.ineligibilityReason).toContain("Order value must be at least ₹5,000");
    expect(result.ineligibilityReason).toContain("Add ₹4,001 more");
  });

  it("handles boundary conditions at exact minOrder threshold", () => {
    // ₹4,999: 1 rupee below minOrder
    const justBelow = calculateBankOfferEligibility({
      listedPrice: 4999,
      selectedCard: hdfcCard,
    });
    expect(justBelow.isEligible).toBe(false);
    expect(justBelow.discountAmount).toBe(0);
    expect(justBelow.effectivePrice).toBe(4999);

    // ₹5,000: exact minOrder
    const exactMin = calculateBankOfferEligibility({
      listedPrice: 5000,
      selectedCard: hdfcCard,
    });
    expect(exactMin.isEligible).toBe(true);
    // 10% of 5,000 = 500
    expect(exactMin.discountAmount).toBe(500);
    expect(exactMin.effectivePrice).toBe(4500);
    // EMI eligible for >= 3000: 4500 / 6 = 750
    expect(exactMin.emiMonthly).toBe(750);
  });

  it("correctly caps discount at maxDiscount limit", () => {
    // ₹30,000 purchase with HDFC 10% capped at ₹1,500
    const result = calculateBankOfferEligibility({
      listedPrice: 30000,
      selectedCard: hdfcCard,
    });

    expect(result.isEligible).toBe(true);
    // 10% of 30,000 would be 3,000, but cap is 1,500
    expect(result.discountAmount).toBe(1500);
    expect(result.effectivePrice).toBe(28500);
  });

  it("supports unlimited cashback cards with 0 minOrder (Amazon Pay ICICI)", () => {
    const result = calculateBankOfferEligibility({
      listedPrice: 899,
      selectedCard: amazonIciciCard,
    });

    expect(result.isEligible).toBe(true);
    // 5% of 899 = Math.round(44.95) = 45
    expect(result.discountAmount).toBe(45);
    expect(result.effectivePrice).toBe(854);
  });

  it("supports multi-item cart qualifying spend calculation", () => {
    // Single item is ₹999, but user has ₹6,000 total in cart
    const result = calculateBankOfferEligibility({
      listedPrice: 999,
      qualifyingOrderValue: 6000,
      selectedCard: hdfcCard,
    });

    expect(result.isEligible).toBe(true);
    // 10% of listed price 999 = 100
    expect(result.discountAmount).toBe(100);
    expect(result.effectivePrice).toBe(899);
  });

  it("supports flat discount cards (OneCard ₹1,000 flat on min ₹8,000)", () => {
    const below = calculateBankOfferEligibility({
      listedPrice: 7500,
      selectedCard: onecard,
    });
    expect(below.isEligible).toBe(false);
    expect(below.discountAmount).toBe(0);

    const eligible = calculateBankOfferEligibility({
      listedPrice: 9500,
      selectedCard: onecard,
    });
    expect(eligible.isEligible).toBe(true);
    expect(eligible.discountAmount).toBe(1000);
    expect(eligible.effectivePrice).toBe(8500);
  });

  it("resiliently handles negative, NaN, or infinite price inputs", () => {
    const nanResult = calculateBankOfferEligibility({
      listedPrice: NaN,
      selectedCard: hdfcCard,
    });
    expect(nanResult.isEligible).toBe(false);
    expect(nanResult.effectivePrice).toBe(0);

    const negativeResult = calculateBankOfferEligibility({
      listedPrice: -500,
      selectedCard: hdfcCard,
    });
    expect(negativeResult.isEligible).toBe(false);
    expect(negativeResult.effectivePrice).toBe(0);
  });
});
