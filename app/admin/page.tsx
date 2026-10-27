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
import { providerRegistry } from "@/lib/providers/retailer-provider";
import { repository } from "@/lib/data/repository";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const healthList = await adapterRegistry.getAllHealth();
  const stats = await repository.getCatalogStats();
  const providers = providerRegistry.getAllProviders();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Data Sources & Retailer Architecture
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Admin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status of Amazon PA-API 5.0, pending Cuelinks affiliate integrations, and database feeds.
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
            <span>Primary Provider</span>
            <Layers className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            Amazon India
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Active on Customer Listings
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Networks</span>
            <Database className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            4 Stores
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">
            Cuelinks Approval Pending
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Associates Tag</span>
            <Key className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-base font-black text-blue-600 mt-2 font-mono">
            dealfinderin-21
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Direct monetized routing
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
                Local / Edge Store
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isSupabaseConfigured ? "PostgreSQL Active" : "Edge Memory Active"}
          </div>
        </div>
      </div>

      {/* Customer-Facing Retailer Provider Architecture */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Retailer Integration Architecture & Live Status
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Strict isolation: Inactive feeds hidden from customers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthList.map((adapter) => {
            const isAmazon = adapter.retailerSlug === "amazon";
            const isLive = adapter.mode === "live";

            return (
              <div
                key={adapter.retailerId}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <span>{adapter.retailerName}</span>
                      {isAmazon && (
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full border border-orange-200">
                          Active Store
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-slate-400">
                      Slug: <code className="font-mono text-slate-600">{adapter.retailerSlug}</code>
                    </span>
                  </div>

                  {isAmazon ? (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        isLive
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-blue-100 text-blue-800 border border-blue-300"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isLive ? "Live PA-API 5.0" : "Tag Active (dealfinderin-21)"}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pending Cuelinks (Inactive)</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {adapter.notes}
                </p>

                {/* Required vs Missing Credentials */}
                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    <span>Configuration & Approval Status:</span>
                  </div>

                  {adapter.missingCredentials.length > 0 ? (
                    <div className="bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 space-y-1">
                      <span className="text-[11px] font-semibold text-amber-800 block">
                        Action Required:
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
                      Integration active and verified.
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span>Customer Listings: {isAmazon ? "Active (Endless Catalog)" : "Hidden (No fake offers)"}</span>
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
            <h4 className="font-bold text-slate-900 text-sm">3. Flipkart, Myntra & AJIO via Cuelinks</h4>
            <p className="leading-relaxed">
              Stores like Myntra, AJIO, and Flipkart can be monetized via affiliate aggregators like <strong>Cuelinks.com</strong> with automated link redirection:
            </p>
            <pre className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
{`CUELINKS_PUBLISHER_ID=281629`}
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
