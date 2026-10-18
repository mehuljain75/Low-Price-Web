import { Product, Offer, PriceComparison, Category } from "./types";
import { calculateDiscount, isOfferStale } from "./formatters";

/**
 * Normalizes title or model string for reliable fuzzy/token matching
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks whether two products or offers have compatible variant specifications.
 * Ensures variants like "128 GB" vs "256 GB" or "Size M" vs "Size XL" are NEVER conflated.
 */
export function areVariantsCompatible(
  attrA: Record<string, string | undefined>,
  attrB: Record<string, string | undefined>
): boolean {
  const criticalKeys = ["storage", "ram", "size", "modelNumber"];

  for (const key of criticalKeys) {
    const valA = attrA[key];
    const valB = attrB[key];

    if (valA && valB) {
      const normA = normalizeString(valA).replace(/\s+/g, "");
      const normB = normalizeString(valB).replace(/\s+/g, "");
      if (normA !== normB) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Matches an incoming retailer listing to a canonical product.
 * Returns true only when:
 * 1. GTIN/EAN exactly matches (if both provide GTIN), OR
 * 2. Brand matches and Model Number matches, AND variant attributes are compatible.
 */
export function matchesCanonicalProduct(
  product: Product,
  candidate: {
    brand: string;
    modelNumber?: string;
    gtin?: string;
    attributes?: Record<string, string | undefined>;
    title?: string;
  }
): boolean {
  // If GTIN/EAN is present on both, it is the golden identifier
  if (product.gtin && candidate.gtin) {
    return product.gtin.trim() === candidate.gtin.trim();
  }

  // Must match brand
  if (normalizeString(product.brand) !== normalizeString(candidate.brand)) {
    return false;
  }

  // If model number is present, check model
  if (product.modelNumber && candidate.modelNumber) {
    if (normalizeString(product.modelNumber) !== normalizeString(candidate.modelNumber)) {
      return false;
    }
  }

  // Validate variant attributes (Storage, RAM, Size) to prevent false combinations
  if (candidate.attributes) {
    if (!areVariantsCompatible(product.attributes, candidate.attributes)) {
      return false;
    }
  }

  return true;
}

/**
 * Computes price comparison metrics across a product and its verified offers.
 * Enforces the rule: "Lowest among tracked stores" (never claims market-wide absolute lowest).
 */
export function computeProductComparison(
  product: Product,
  offers: Offer[],
  category?: Category
): PriceComparison {
  const productOffers = offers.filter((o) => o.productId === product.id);

  // Update staleness
  const processedOffers = productOffers.map((o) => ({
    ...o,
    isStale: isOfferStale(o.lastCheckedAt),
  }));

  // Sort offers by price ascending (in stock first, then out of stock)
  const sortedOffers = [...processedOffers].sort((a, b) => {
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;
    return a.price - b.price;
  });

  const availableOffers = sortedOffers.filter((o) => o.inStock);
  const lowestOffer = availableOffers.length > 0 ? availableOffers[0] : (sortedOffers[0] || null);

  // Find offer with highest percentage discount
  let highestDiscountOffer: Offer | null = null;
  let maxDiscount = -1;

  for (const off of sortedOffers) {
    const disc = calculateDiscount(off.originalPrice, off.price);
    if (disc > maxDiscount) {
      maxDiscount = disc;
      highestDiscountOffer = off;
    }
  }

  const prices = sortedOffers.map((o) => o.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  // Savings between lowest tracked price and highest tracked price (or MRP)
  let savingsAmount = 0;
  let savingsPercentage = 0;

  if (lowestOffer) {
    const comparisonBaseline = maxPrice > lowestOffer.price ? maxPrice : lowestOffer.originalPrice;
    if (comparisonBaseline > lowestOffer.price) {
      savingsAmount = comparisonBaseline - lowestOffer.price;
      savingsPercentage = calculateDiscount(comparisonBaseline, lowestOffer.price);
    }
  }

  const hasStalePrices = processedOffers.some((o) => o.isStale);

  return {
    product,
    category,
    offers: sortedOffers,
    lowestOffer,
    highestDiscountOffer,
    trackedStoresCount: sortedOffers.length,
    savingsAmount,
    savingsPercentage,
    hasStalePrices,
    priceRange: {
      min: minPrice,
      max: maxPrice,
    },
  };
}
