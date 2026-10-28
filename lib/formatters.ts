/**
 * Formats a number into Indian Rupee (INR) representation with ₹ symbol
 * and Indian comma grouping (lakhs & crores: 1,00,000)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "₹0";
  }

  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(rounded);

  return `₹${formatted}`;
}

/**
 * Calculates percentage discount from MRP (originalPrice) and current price
 */
export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  if (
    typeof originalPrice !== "number" ||
    typeof currentPrice !== "number" ||
    isNaN(originalPrice) ||
    isNaN(currentPrice) ||
    originalPrice <= 0 ||
    currentPrice <= 0 ||
    originalPrice <= currentPrice
  ) {
    return 0;
  }
  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return Math.round(discount);
}

/**
 * Calculates Rupee savings amount between MRP and discounted price
 */
export function calculateSavings(originalPrice: number, currentPrice: number): number {
  if (
    typeof originalPrice !== "number" ||
    typeof currentPrice !== "number" ||
    isNaN(originalPrice) ||
    isNaN(currentPrice) ||
    originalPrice <= 0 ||
    currentPrice <= 0 ||
    originalPrice <= currentPrice
  ) {
    return 0;
  }
  return Math.max(0, originalPrice - currentPrice);
}

/**
 * Returns human-readable relative time (e.g. "Just now", "25m ago", "2h ago", "1d ago")
 */
export function getRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 0) return "Recently";

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 5) return "Recently";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "Recently";
  }
}

/**
 * Checks if an offer price timestamp is older than maxAgeHours (default 24h)
 */
export function isOfferStale(isoString: string, maxAgeHours: number = 24): boolean {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diffHours >= maxAgeHours;
  } catch {
    return true;
  }
}
