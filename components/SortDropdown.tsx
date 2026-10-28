"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown, ChevronDown, Check } from "lucide-react";

interface SortDropdownProps {
  currentSort?: string;
}

const SORT_OPTIONS = [
  { value: "discount", label: "Highest Discount %" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Customer Rating" },
  { value: "newest", label: "Recently Added" },
];

const SortDropdownInternal: React.FC<SortDropdownProps> = ({ currentSort = "discount" }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption = SORT_OPTIONS.find((opt) => opt.value === currentSort) || SORT_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.delete("page"); // Reset pagination
    if (newSort && newSort !== "discount") {
      params.set("sortBy", newSort);
    } else {
      params.delete("sortBy");
    }
    const targetPath = pathname && pathname !== "/" ? pathname : "/products";
    router.push(`${targetPath}?${params.toString()}`);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      <span className="text-xs font-semibold text-[#6B7280] whitespace-nowrap flex items-center gap-1.5">
        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
        <span>Sort by:</span>
      </span>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label="Sort products by"
          className="text-xs bg-white border border-[#E5E7EB] hover:border-gray-300 rounded-lg px-3 py-2 font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>{currentOption.label}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-150 ${isOpen ? "rotate-180 text-amber-600" : ""}`} />
        </button>

        {isOpen && (
          <div
            role="listbox"
            className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100"
          >
            {SORT_OPTIONS.map((opt) => {
              const isSelected = opt.value === currentSort;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSortChange(opt.value)}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-amber-50 text-amber-900 font-bold border-l-2 border-[#F59E0B]"
                      : "text-[#111827] hover:bg-gray-50 font-medium"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const SortDropdown: React.FC<SortDropdownProps> = (props) => (
  <React.Suspense fallback={<div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse" />}>
    <SortDropdownInternal {...props} />
  </React.Suspense>
);

