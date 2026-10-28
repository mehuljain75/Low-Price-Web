import { NextRequest, NextResponse } from "next/server";
import { getSuggestions } from "@/lib/data/search-suggestions";
import { executeSearchPipeline } from "@/lib/search/search-orchestrator";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || searchParams.get("search") || "").trim();
  const category = (searchParams.get("category") || "").trim();
  const mode = searchParams.get("mode");

  if (mode === "pipeline") {
    const exact = searchParams.get("exact") === "1" || searchParams.get("exact") === "true";
    const brand = searchParams.get("brand") || undefined;
    const shoeType = searchParams.get("shoeType") || undefined;
    const gender = searchParams.get("gender") || undefined;
    const size = searchParams.get("size") || undefined;
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const minRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined;
    const sortBy = (searchParams.get("sortBy") as any) || "discount";
    const inStockOnly = searchParams.get("inStock") === "true";
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 24;

    const pipelineResult = await executeSearchPipeline({
      query: q,
      categorySlug: category || undefined,
      brand,
      shoeType,
      gender,
      size,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
      inStockOnly,
      page,
      limit,
      forceExact: exact,
    });

    return NextResponse.json(pipelineResult, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }

  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 8;

  const result = getSuggestions(q, category, isNaN(limit) ? 8 : limit);

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
    },
  });
}
