import { describe, it, expect } from "vitest";
import { analyzePriceHistory, PricePoint } from "../lib/price-history";

describe("Price History Analysis Engine (Bugs 4 & 6 Fix Verification)", () => {
  it("returns insufficient_data state when observations < 2 and never claims all-time low", () => {
    // 0 points
    const emptyResult = analyzePriceHistory(4999, 7999, []);
    expect(emptyResult.state).toBe("insufficient_data");
    expect(emptyResult.isAllTimeLow).toBe(false);
    expect(emptyResult.verdict.badge).toBe("Observation In Progress");

    // 1 point
    const singleResult = analyzePriceHistory(4999, 7999, [{ date: "2026-10-01", price: 4999 }]);
    expect(singleResult.state).toBe("insufficient_data");
    expect(singleResult.isAllTimeLow).toBe(false);
  });

  it("returns tracking_in_progress for provisional data (< 14 days) and avoids 90-day / all-time low claims", () => {
    const provisionalPoints: PricePoint[] = [
      { date: "2026-10-01", price: 5999 },
      { date: "2026-10-03", price: 5499 },
      { date: "2026-10-05", price: 4999 },
    ];

    const result = analyzePriceHistory(4999, 7999, provisionalPoints);

    expect(result.state).toBe("tracking_in_progress");
    expect(result.trackingPeriodDays).toBe(4);
    expect(result.isAllTimeLow).toBe(false); // Disallowed for < 30 days
    expect(result.verdict.confidence).toBe("provisional");
    expect(result.verdict.badge).toBe("Tracked 4 Days");
    expect(result.verdict.description).toContain("minimum 14-day history is required");
  });

  it("certifies All-Time Low ONLY when tracking period >= 30 days and currentPrice <= lowestPrice", () => {
    const points: PricePoint[] = [
      { date: "2026-08-01", price: 6999 },
      { date: "2026-08-20", price: 6499 },
      { date: "2026-09-10", price: 5999 },
      { date: "2026-10-15", price: 5499 },
    ];

    // Current price 4999 is strictly lower than lowest recorded 5499
    const result = analyzePriceHistory(4999, 8999, points);

    expect(result.state).toBe("ready");
    expect(result.trackingPeriodDays).toBeGreaterThanOrEqual(70);
    expect(result.isAllTimeLow).toBe(true);
    expect(result.verdict.badge).toBe("All-Time Low");
    expect(result.verdict.confidence).toBe("verified");
  });

  it("certifies Great Deal when price is below average but not all-time low", () => {
    const points: PricePoint[] = [
      { date: "2026-08-01", price: 7999 },
      { date: "2026-09-01", price: 6999 },
      { date: "2026-09-15", price: 4999 }, // Previous all-time low was 4999
      { date: "2026-10-01", price: 7499 },
    ];

    // Current price 5999 is below average (~6874), but above lowest (4999)
    const result = analyzePriceHistory(5999, 8999, points);

    expect(result.state).toBe("ready");
    expect(result.isAllTimeLow).toBe(false);
    expect(result.verdict.badge).toBe("Great Deal");
    expect(result.verdict.confidence).toBe("verified");
  });

  it("deduplicates identical dates and sorts chronologically", () => {
    const unsortedAndDuplicatePoints: PricePoint[] = [
      { date: "2026-10-05", price: 5100 },
      { date: "2026-09-01", price: 6000 },
      { date: "2026-10-05", price: 5000 }, // Duplicate date with updated price
    ];

    const result = analyzePriceHistory(5000, 7000, unsortedAndDuplicatePoints);

    expect(result.sanitizedPoints.length).toBe(2);
    expect(result.sanitizedPoints[0].date).toBe("2026-09-01");
    expect(result.sanitizedPoints[1].date).toBe("2026-10-05");
    expect(result.sanitizedPoints[1].price).toBe(5000);
  });

  it("guarantees zero contradictory states: ready state never displays Observation in Progress", () => {
    const points: PricePoint[] = [
      { date: "2026-08-01", price: 4000 },
      { date: "2026-09-01", price: 3800 },
      { date: "2026-10-01", price: 3500 },
    ];

    const result = analyzePriceHistory(3500, 5000, points);
    expect(result.state).toBe("ready");
    expect(result.verdict.badge).not.toBe("Observation In Progress");
    expect(result.verdict.description).not.toContain("Continuous tracking is active");
  });
});
