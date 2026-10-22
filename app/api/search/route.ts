import { NextRequest, NextResponse } from "next/server";
import { demoProducts, demoOffers, categories } from "@/lib/data/demo-products";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json({
      products: [],
      categories: [],
      trending: ["iPhone 15", "MacBook Air", "Samsung S24", "boAt Airdopes", "Air Fryer", "Kurta"],
    });
  }

  // 1. Find matching categories
  const matchedCategories = categories
    .filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
    .slice(0, 2)
    .map((c) => ({ name: c.name, slug: c.slug }));

  // 2. Find matching products from demo catalog
  const catalogMatches = demoProducts
    .filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.modelNumber && p.modelNumber.toLowerCase().includes(q))
    )
    .slice(0, 5)
    .map((p) => {
      const pOffers = demoOffers.filter((o) => o.productId === p.id);
      const lowest = pOffers.reduce(
        (min, curr) => (curr.price < min ? curr.price : min),
        pOffers[0]?.price || 0
      );
      const mrp = pOffers[0]?.originalPrice || lowest;
      const cat = categories.find((c) => c.id === p.categoryId);

      return {
        id: p.id,
        title: p.title,
        brand: p.brand,
        price: lowest,
        originalPrice: mrp,
        imageUrl: p.imageUrl,
        categorySlug: cat?.slug || "general",
        storeCount: pOffers.length || 1,
      };
    });

  return NextResponse.json(
    {
      products: catalogMatches,
      categories: matchedCategories,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
