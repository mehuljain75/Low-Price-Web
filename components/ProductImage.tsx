"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  unoptimized?: boolean;
}

/**
 * Clean SVG fallback for products when the image is broken, empty, or placeholder.
 * Does not depend on external services like placehold.co.
 */
function FallbackProductIcon({ title }: { title: string }) {
  const initial = title ? title.trim().charAt(0).toUpperCase() : "P";
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-4 select-none">
      <svg
        className="w-12 h-12 text-gray-300 mb-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
      <span className="text-[11px] font-semibold text-gray-400 text-center line-clamp-1 max-w-[120px]">
        {title || "Product"}
      </span>
      <span className="text-[9px] text-gray-400 tracking-wider uppercase mt-0.5">
        Image unavailable
      </span>
    </div>
  );
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  width = 400,
  height = 400,
  className = "object-contain w-full h-full",
  priority = false,
  unoptimized,
}) => {
  const [hasError, setHasError] = useState(false);

  // If source is missing, or uses placehold.co, immediately render clean fallback
  const isInvalidUrl = !src || src.trim() === "" || src.includes("placehold.co");

  if (hasError || isInvalidUrl) {
    return <FallbackProductIcon title={alt} />;
  }

  const shouldBeUnoptimized =
    unoptimized !== undefined ? unoptimized : src.startsWith("http");

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized={shouldBeUnoptimized}
      onError={() => setHasError(true)}
    />
  );
};
