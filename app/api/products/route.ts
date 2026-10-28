import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/data/repository";
import { RetailerSlug } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const searchQuery = searchParams.get("search") || searchParams.get("q") || undefined;
  const categorySlug = searchParams.get("category") || undefined;
  const retailerSlug = (searchParams.get("retailer") as RetailerSlug) || undefined;
  const brand = searchParams.get("brand") || undefined;
  const shoeType = searchParams.get("shoeType") || undefined;
  const gender = searchParams.get("gender") || undefined;
  const size = searchParams.get("size") || undefined;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const minRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined;
  const sortBy = (searchParams.get("sortBy") as "price_asc" | "price_desc" | "discount" | "newest" | "rating") || "discount";
  const inStockOnly = searchParams.get("inStock") === "true";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, parseInt(searchParams.get("limit") || "24", 10));

  const filters = {
    searchQuery,
    categorySlug,
    retailerSlug,
    brand,
    shoeType,
    gender,
    size,
    minPrice,
    maxPrice,
    minRating,
    sortBy,
    inStockOnly,
  };

  // Get items for the specific page
  const pageProducts = await repository.getProducts({
    ...filters,
    page,
    limit,
  });

  // End of results when page returned fewer items than limit or 0
  const hasMore = pageProducts.length >= limit;

  return NextResponse.json({
    products: pageProducts,
    page,
    limit,
    totalCount: (page - 1) * limit + pageProducts.length,
    hasMore,
  });
}
