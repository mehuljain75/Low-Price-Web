"use client";

import React, { useState, useMemo } from "react";
import { TrendingDown, Flame, Sparkles, AlertCircle, Clock, ShieldCheck, Info } from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { analyzePriceHistory, PricePoint } from "@/lib/price-history";

interface PriceHistoryChartProps {
  currentPrice: number;
  originalPrice: number;
  productTitle?: string;
  priceHistory?: PricePoint[];
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  currentPrice,
  originalPrice,
  productTitle = "Product",
  priceHistory = [],
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);

  const analysis = useMemo(() => {
    return analyzePriceHistory(currentPrice, originalPrice, priceHistory);
  }, [currentPrice, originalPrice, priceHistory]);

  const { state, sanitizedPoints, trackingPeriodDays, lowestPrice, averagePrice, verdict } = analysis;

  // State 1: Insufficient Data (< 2 points)
  if (state === "insufficient_data") {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 sm:p-8 space-y-4 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
              Price History &amp; Trend
            </h2>
          </div>
          <span className="self-start sm:self-auto text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-[#E5E7EB]">
            Observation In Progress
          </span>
        </div>

        <div className="p-5 sm:p-6 bg-gray-50 border border-[#E5E7EB] rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl flex-shrink-0 border border-amber-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="text-sm font-bold text-[#111827]">
              Price History Tracking Active
            </h4>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              DealFinder India is continuously observing retailer price fluctuations for {productTitle}. Historical price trends and verified deal drop verdicts are certified once observation records sufficient price checkpoints.
            </p>
            <div className="flex items-center gap-3 text-xs pt-1">
              <span className="text-[#6B7280]">
                Current price: <strong className="text-[#111827]">{formatINR(currentPrice)}</strong>
              </span>
              {originalPrice > currentPrice && (
                <>
                  <span className="text-gray-300">&bull;</span>
                  <span className="text-[#6B7280]">
                    MRP: <span className="line-through">{formatINR(originalPrice)}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chart dimensions & scaling
  const chartHeight = 160;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 24;

  const highestPrice = Math.max(...sanitizedPoints.map((p) => p.price), currentPrice);
  const minPlot = Math.floor(lowestPrice * 0.95);
  const maxPlot = Math.ceil(highestPrice * 1.05);
  const priceRange = maxPlot - minPlot || 1;

  const getX = (index: number) =>
    paddingX + (index / (sanitizedPoints.length - 1)) * (chartWidth - paddingX * 2);
  const getY = (price: number) =>
    chartHeight - paddingY - ((price - minPlot) / priceRange) * (chartHeight - paddingY * 2);

  const pathPoints = sanitizedPoints.map((p, i) => `${getX(i)},${getY(p.price)}`).join(" ");
  const areaPath = `${getX(0)},${chartHeight - paddingY} ${pathPoints} ${getX(
    sanitizedPoints.length - 1
  )},${chartHeight - paddingY}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Header & Truthful Tracking Window */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
              Price History &amp; Trend
            </h2>
            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${verdict.badgeBg}`}>
              {verdict.badge}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {state === "tracking_in_progress"
              ? `Provisional tracking data across ${sanitizedPoints.length} checkpoints (${trackingPeriodDays} days)`
              : `Certified price tracking across Indian stores over the last ${trackingPeriodDays} days`}
          </p>
        </div>

        {/* Tracking Period Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span>Tracking Window: {trackingPeriodDays} {trackingPeriodDays === 1 ? "Day" : "Days"}</span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-green-50/70 border border-green-200 rounded-xl p-3 sm:p-4 text-center">
          <span className="block text-[10px] sm:text-xs text-green-700 font-bold uppercase tracking-wider">
            {state === "ready" ? "Lowest Tracked" : "Period Low"}
          </span>
          <span className="text-base sm:text-2xl font-black text-[#15803D] mt-0.5 block">
            {formatINR(lowestPrice)}
          </span>
          <span className="text-[10px] text-green-700">Past {trackingPeriodDays} days</span>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 text-center">
          <span className="block text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">
            Average Price
          </span>
          <span className="text-base sm:text-2xl font-black text-[#111827] mt-0.5 block">
            {formatINR(averagePrice)}
          </span>
          <span className="text-[10px] text-gray-400">
            {state === "ready" ? "Market benchmark" : "Provisional average"}
          </span>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 sm:p-4 text-center">
          <span className="block text-[10px] sm:text-xs text-amber-800 font-bold uppercase tracking-wider">
            Current Price
          </span>
          <span className="text-base sm:text-2xl font-black text-amber-900 mt-0.5 block">
            {formatINR(currentPrice)}
          </span>
          <span className="text-[10px] text-amber-700 font-medium">Live best offer</span>
        </div>
      </div>

      {/* SVG Interactive Sparkline Trend */}
      <div className="relative pt-2">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-40 sm:h-48 overflow-visible select-none"
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={chartWidth - paddingX}
            y2={paddingY}
            stroke="#E5E7EB"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={chartHeight / 2}
            x2={chartWidth - paddingX}
            y2={chartHeight / 2}
            stroke="#E5E7EB"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={chartHeight - paddingY}
            x2={chartWidth - paddingX}
            y2={chartHeight - paddingY}
            stroke="#D1D5DB"
            strokeWidth="1"
          />

          {/* Gradient Area Fill */}
          <polygon points={areaPath} fill="url(#priceGradient)" />

          {/* Price Line */}
          <polyline
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pathPoints}
          />

          {/* Interactive Data Points */}
          {sanitizedPoints.map((pt, i) => {
            const cx = getX(i);
            const cy = getY(pt.price);
            const isLast = i === sanitizedPoints.length - 1;
            const isHovered = hoveredPoint?.date === pt.date;

            return (
              <g key={`${pt.date}-${i}`} className="cursor-pointer">
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : isLast ? 5 : 3.5}
                  className={`transition-all duration-150 ${
                    isLast
                      ? "fill-[#F59E0B] stroke-white stroke-2"
                      : isHovered
                      ? "fill-[#111827] stroke-white stroke-2"
                      : "fill-amber-400 stroke-white stroke-1"
                  }`}
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* Date labels below */}
                {(i === 0 || i === Math.floor(sanitizedPoints.length / 2) || isLast) && (
                  <text
                    x={cx}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    className="text-[10px] fill-gray-400 font-medium"
                  >
                    {pt.date}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#111827] text-white text-xs px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 pointer-events-none">
            <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>
              {hoveredPoint.date}: <strong>{formatINR(hoveredPoint.price)}</strong>
            </span>
          </div>
        )}
      </div>

      {/* AI Deal Verdict Banner */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-700 flex-shrink-0 mt-0.5">
          {verdict.confidence === "provisional" ? (
            <Info className="w-5 h-5" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[#111827]">{verdict.headline}</h4>
          <p className="text-xs text-gray-600 leading-relaxed">{verdict.description}</p>
          <p className="text-xs font-semibold text-amber-800 pt-0.5">{verdict.actionableTip}</p>
        </div>
      </div>
    </div>
  );
};
