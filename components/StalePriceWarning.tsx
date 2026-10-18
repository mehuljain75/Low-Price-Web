import React from "react";
import { AlertTriangle } from "lucide-react";

interface StalePriceWarningProps {
  lastCheckedTime?: string;
  className?: string;
}

export const StalePriceWarning: React.FC<StalePriceWarningProps> = ({
  lastCheckedTime,
  className = "",
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-50 text-amber-800 text-xs border border-amber-200 ${className}`}
    >
      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
      <span>
        Price may have changed. Last checked{" "}
        <strong>{lastCheckedTime || "> 24 hours ago"}</strong>. Verify on retailer site.
      </span>
    </div>
  );
};
