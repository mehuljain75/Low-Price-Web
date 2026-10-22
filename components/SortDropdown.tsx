"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

interface SortDropdownProps {
  currentSort?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ currentSort = "discount" }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort && newSort !== "discount") {
      params.set("sortBy", newSort);
    } else {
      params.delete("sortBy");
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="sort-select"
        className="text-xs font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1"
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        <span>Sort by:</span>
      </label>
      <select
        id="sort-select"
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="text-xs bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs transition-colors cursor-pointer"
      >
        <option value="discount">Highest Discount %</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="newest">Recently Added</option>
      </select>
    </div>
  );
};
