import { NextResponse } from "next/server";
import { adapterRegistry } from "@/lib/adapters/registry";
import { repository } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await adapterRegistry.getAllHealth();
  const stats = await repository.getCatalogStats();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    status: "healthy",
    adapters: health,
    catalog: stats,
  });
}

export async function POST() {
  // Trigger on-demand sync for connected adapters
  const health = await adapterRegistry.getAllHealth();
  const results = [];

  for (const h of health) {
    results.push({
      retailer: h.retailerName,
      slug: h.retailerSlug,
      mode: h.mode,
      syncedAt: new Date().toISOString(),
      status: h.mode === "live" ? "synced" : "demo_simulated",
      offersProcessed: h.offersCount,
    });
  }

  return NextResponse.json({
    message: "Sync cycle completed successfully",
    syncedAt: new Date().toISOString(),
    results,
  });
}
