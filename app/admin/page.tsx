import React from "react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Database,
  Layers,
  Key,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { adapterRegistry } from "@/lib/adapters/registry";
import { repository } from "@/lib/data/repository";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const healthList = await adapterRegistry.getAllHealth();
  const stats = await repository.getCatalogStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Data Sources & Health Monitor
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Admin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status of retailer adapters, API quota limits, and database connectivity.
          </p>
        </div>

        {/* Sync Action */}
        <div className="flex items-center gap-3">
          <form action="/api/sync" method="POST">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Trigger Manual Sync</span>
            </button>
          </form>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Canonical Products</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {stats.totalProducts}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Normalized catalog items
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Tracked Retailer Offers</span>
            <Database className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {stats.totalOffers}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {stats.trackedRetailersCount} store feeds
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Stale Offers (&gt;24h)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            {stats.staleOffersCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Flagged for price refresh
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Supabase Database</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 mt-2">
            {isSupabaseConfigured ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Connected
              </span>
            ) : (
              <span className="text-slate-600 flex items-center gap-1">
                Demo Provider
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isSupabaseConfigured ? "PostgreSQL Active" : "Local Mock Active"}
          </div>
        </div>
      </div>

      {/* Connected Retailer Adapters Matrix */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Retailer Integration Adapters & API Credentials
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthList.map((adapter) => {
            const isLive = adapter.mode === "live";

            return (
              <div
                key={adapter.retailerId}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      {adapter.retailerName}
                    </h3>
                    <span className="text-xs text-slate-400">
                      Slug: <code className="font-mono text-slate-600">{adapter.retailerSlug}</code>
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isLive
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {isLive ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Live API Mode</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Demo Mode</span>
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {adapter.notes}
                </p>

                {/* Required vs Missing Credentials */}
                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    <span>Configuration Status:</span>
                  </div>

                  {adapter.missingCredentials.length > 0 ? (
                    <div className="bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 space-y-1">
                      <span className="text-[11px] font-semibold text-amber-800 block">
                        Missing in .env.local:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-amber-900 font-mono text-[11px]">
                        {adapter.missingCredentials.map((key) => (
                          <li key={key}>{key}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      All necessary credentials configured.
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span>Offers in Catalog: {adapter.offersCount}</span>
                  <span>Sync cadence: Every {adapter.syncIntervalMinutes}m</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Integration Walkthrough & Next Steps */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-orange-600" />
          <span>How to Activate Live Data for Each Retailer</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm">1. Flipkart Affiliate API</h4>
            <p className="leading-relaxed">
              Register at <strong>affiliate.flipkart.com</strong>. Once approved, copy your Affiliate ID and API Token into <code>.env.local</code>:
            </p>
            <pre className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
{`FLIPKART_AFFILIATE_ID=your_tracking_id
FLIPKART_AFFILIATE_TOKEN=your_secret_token`}
            </pre>
          </div>

          <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm">2. Amazon Associates / PA-API 5.0</h4>
            <p className="leading-relaxed">
              Register at <strong>affiliate-program.amazon.in</strong>. Note: Amazon requires driving <strong>3 qualified sales within 180 days</strong> before unlocking PA-API keys. Direct affiliate redirects work immediately with:
            </p>
            <pre className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
{`AMAZON_ASSOCIATES_TAG=dealfinder-21
AMAZON_ACCESS_KEY=your_key
AMAZON_SECRET_KEY=your_secret`}
            </pre>
          </div>

          <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm">3. Myntra & AJIO via Cuelinks / EarnKaro</h4>
            <p className="leading-relaxed">
              Myntra and AJIO do not provide direct public individual APIs. Publishers sign up on affiliate networks like <strong>Cuelinks.com</strong> or <strong>EarnKaro.com</strong> to get automated sub-ID redirection:
            </p>
            <pre className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
{`CUELINKS_PUBLISHER_ID=your_cuelinks_id`}
            </pre>
          </div>

          <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm">4. Meesho Reseller / Partner Links</h4>
            <p className="leading-relaxed">
              Meesho relies on reseller codes and shared links. Add your referral code:
            </p>
            <pre className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
{`MEESHO_REFERRAL_CODE=your_referral_code`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
