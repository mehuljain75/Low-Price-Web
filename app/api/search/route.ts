import { NextRequest, NextResponse } from "next/server";
import { getSuggestions } from "@/lib/data/search-suggestions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const category = (searchParams.get("category") || "").trim();
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 8;

  const result = getSuggestions(q, category, isNaN(limit) ? 8 : limit);

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
    },
  });
}
