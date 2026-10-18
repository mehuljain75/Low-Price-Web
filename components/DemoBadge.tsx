import React from "react";
import { Info } from "lucide-react";

interface DemoBadgeProps {
  size?: "sm" | "md";
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({ size = "sm" }) => {
  return (
    <span
      title="This offer is based on sample demo data. Live retailer sync can be activated in the Admin panel."
      className={`inline-flex items-center gap-1 font-semibold rounded uppercase tracking-wider ${
        size === "sm"
          ? "px-1.5 py-0.5 text-[10px] bg-amber-50 text-amber-700 border border-amber-300"
          : "px-2.5 py-1 text-xs bg-amber-100 text-amber-800 border border-amber-300"
      }`}
    >
      <Info className={size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
      Demo Data
    </span>
  );
};
