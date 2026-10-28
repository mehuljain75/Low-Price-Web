/**
 * Price History Processing & Truthful Verification Engine
 * Enforces strict data requirements before rendering price trends, 90-day averages,
 * or "All-Time Low" claims. Eliminates conflicting states.
 */

export interface PricePoint {
  date: string; // YYYY-MM-DD or readable format
  price: number;
}

export type PriceHistoryState =
  | "insufficient_data" // 0 or 1 point
  | "tracking_in_progress" // 2+ points but < 14 days tracking span
  | "ready"; // Sufficient historical data

export interface PriceHistoryAnalysis {
  state: PriceHistoryState;
  sanitizedPoints: PricePoint[];
  earliestDate?: string;
  latestDate?: string;
  trackingPeriodDays: number;
  totalObservations: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  isAllTimeLow: boolean;
  verdict: {
    badge: string;
    badgeBg: string;
    headline: string;
    description: string;
    actionableTip: string;
    confidence: "verified" | "provisional" | "tracking";
  };
}

/**
 * Parses dates robustly across ISO and formatted strings
 */
function parseTimestamp(dateStr: string): number {
  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Analyzes price history data points with strict validity checks.
 * Guarantees that "All-Time Low" or "90-day average" is NEVER claimed
 * without sufficient historical tracking span.
 */
export function analyzePriceHistory(
  currentPrice: number,
  originalPrice: number,
  rawHistory: PricePoint[] = []
): PriceHistoryAnalysis {
  // 1. Sanitize prices and sort points chronologically
  const validPoints = rawHistory
    .filter((pt) => typeof pt.price === "number" && !isNaN(pt.price) && pt.price > 0 && Boolean(pt.date))
    .sort((a, b) => parseTimestamp(a.date) - parseTimestamp(b.date));

  // Deduplicate points with identical dates (keep latest price)
  const dedupedMap = new Map<string, PricePoint>();
  for (const pt of validPoints) {
    dedupedMap.set(pt.date, pt);
  }
  const sanitizedPoints = Array.from(dedupedMap.values());

  // 2. Insufficient Data Check (0 or 1 point)
  if (sanitizedPoints.length < 2) {
    return {
      state: "insufficient_data",
      sanitizedPoints,
      trackingPeriodDays: 0,
      totalObservations: sanitizedPoints.length,
      lowestPrice: currentPrice,
      highestPrice: Math.max(currentPrice, originalPrice || currentPrice),
      averagePrice: currentPrice,
      isAllTimeLow: false,
      verdict: {
        badge: "Observation In Progress",
        badgeBg: "bg-gray-100 text-gray-800 border border-gray-200",
        headline: "Price Observation Active",
        description:
          "Continuous tracking is active. Historical price trends and deal drop verdicts require at least two distinct verified price checks.",
        actionableTip: "Price tracking is recording daily fluctuations.",
        confidence: "tracking",
      },
    };
  }

  // 3. Calculate tracking span in days
  const firstTime = parseTimestamp(sanitizedPoints[0].date);
  const lastTime = parseTimestamp(sanitizedPoints[sanitizedPoints.length - 1].date);
  const msDiff = Math.max(0, lastTime - firstTime);
  const trackingPeriodDays = Math.max(1, Math.round(msDiff / (1000 * 60 * 60 * 24)));

  const prices = sanitizedPoints.map((p) => p.price);
  const lowestPrice = Math.min(...prices, currentPrice);
  const highestPrice = Math.max(...prices, currentPrice);
  const averagePrice = Math.round(
    prices.reduce((sum, p) => sum + p, 0) / prices.length
  );

  // 4. Tracking In Progress: fewer than 14 days of tracked history
  if (trackingPeriodDays < 14) {
    return {
      state: "tracking_in_progress",
      sanitizedPoints,
      earliestDate: sanitizedPoints[0].date,
      latestDate: sanitizedPoints[sanitizedPoints.length - 1].date,
      trackingPeriodDays,
      totalObservations: sanitizedPoints.length,
      lowestPrice,
      highestPrice,
      averagePrice,
      isAllTimeLow: false, // Disallow 90-day / All-Time Low claims for provisional data
      verdict: {
        badge: `Tracked ${trackingPeriodDays} Days`,
        badgeBg: "bg-blue-50 text-blue-700 border border-blue-200",
        headline: `Provisional Trend (${trackingPeriodDays} Days Recorded)`,
        description: `Tracked across ${sanitizedPoints.length} checkpoints over the last ${trackingPeriodDays} days. A minimum 14-day history is required to certify all-time lows or 90-day market averages.`,
        actionableTip: "Current trend reflects short-term observation.",
        confidence: "provisional",
      },
    };
  }

  // 5. Ready state: 14+ days of authentic historical data
  const isAllTimeLow = currentPrice <= lowestPrice && trackingPeriodDays >= 30;

  if (isAllTimeLow) {
    return {
      state: "ready",
      sanitizedPoints,
      earliestDate: sanitizedPoints[0].date,
      latestDate: sanitizedPoints[sanitizedPoints.length - 1].date,
      trackingPeriodDays,
      totalObservations: sanitizedPoints.length,
      lowestPrice,
      highestPrice,
      averagePrice,
      isAllTimeLow: true,
      verdict: {
        badge: "All-Time Low",
        badgeBg: "bg-red-50 text-[#B91C1C] border border-red-200",
        headline: `Verified All-Time Low (${trackingPeriodDays}-Day Span)`,
        description: `Today's price of ₹${currentPrice.toLocaleString("en-IN")} is the lowest recorded in the ${trackingPeriodDays}-day tracking history (market average: ₹${averagePrice.toLocaleString("en-IN")}).`,
        actionableTip: "Optimal buying window before price normalizes.",
        confidence: "verified",
      },
    };
  }

  if (currentPrice < averagePrice) {
    const savingsPct = Math.round(((averagePrice - currentPrice) / averagePrice) * 100);
    return {
      state: "ready",
      sanitizedPoints,
      earliestDate: sanitizedPoints[0].date,
      latestDate: sanitizedPoints[sanitizedPoints.length - 1].date,
      trackingPeriodDays,
      totalObservations: sanitizedPoints.length,
      lowestPrice,
      highestPrice,
      averagePrice,
      isAllTimeLow: false,
      verdict: {
        badge: "Great Deal",
        badgeBg: "bg-emerald-50 text-[#15803D] border border-emerald-200",
        headline: `${savingsPct}% Below ${trackingPeriodDays}-Day Average`,
        description: `Currently priced ₹${(averagePrice - currentPrice).toLocaleString("en-IN")} lower than the typical ${trackingPeriodDays}-day price of ₹${averagePrice.toLocaleString("en-IN")}.`,
        actionableTip: "Solid discount below historical benchmark.",
        confidence: "verified",
      },
    };
  }

  return {
    state: "ready",
    sanitizedPoints,
    earliestDate: sanitizedPoints[0].date,
    latestDate: sanitizedPoints[sanitizedPoints.length - 1].date,
    trackingPeriodDays,
    totalObservations: sanitizedPoints.length,
    lowestPrice,
    highestPrice,
    averagePrice,
    isAllTimeLow: false,
    verdict: {
      badge: "Standard Price",
      badgeBg: "bg-gray-100 text-gray-800 border border-gray-200",
      headline: `Near ${trackingPeriodDays}-Day Average`,
      description: `Selling close to its historical benchmark of ₹${averagePrice.toLocaleString("en-IN")} across the last ${trackingPeriodDays} days.`,
      actionableTip: "Consider waiting for upcoming festive sale drops if not urgent.",
      confidence: "verified",
    },
  };
}
