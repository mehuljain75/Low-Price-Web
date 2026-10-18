import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base">DealFinder India</span>
              <span className="text-[10px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-mono border border-orange-500/30">
                MVP v1.0
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Empowering Indian shoppers to make smarter decisions by comparing genuine prices, verified discounts, and bank offers across premier retail platforms.
            </p>
            <div className="flex items-center gap-2 text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Free & Unbiased Comparison</span>
            </div>
          </div>

          {/* Supported Retailers */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold uppercase tracking-wider text-xs">
              Tracked Retailers
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center justify-between">
                <span>Amazon India</span>
                <span className="text-[10px] text-amber-400">Associates Ready</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Flipkart</span>
                <span className="text-[10px] text-blue-400">Affiliate API</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Myntra</span>
                <span className="text-[10px] text-pink-400">Aggregator Feed</span>
              </li>
              <li className="flex items-center justify-between">
                <span>AJIO</span>
                <span className="text-[10px] text-slate-300">Partner Feed</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Meesho</span>
                <span className="text-[10px] text-purple-400">Reseller / Direct</span>
              </li>
            </ul>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold uppercase tracking-wider text-xs">
              Top Categories
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=mobiles" className="hover:text-white transition-colors">
                  Mobiles & 5G Smartphones
                </Link>
              </li>
              <li>
                <Link href="/products?category=laptops" className="hover:text-white transition-colors">
                  MacBooks & Laptops
                </Link>
              </li>
              <li>
                <Link href="/products?category=audio" className="hover:text-white transition-colors">
                  Noise Cancelling Audio & TWS
                </Link>
              </li>
              <li>
                <Link href="/products?category=fashion" className="hover:text-white transition-colors">
                  Ethnic Wear & Denim
                </Link>
              </li>
              <li>
                <Link href="/products?category=appliances" className="hover:text-white transition-colors">
                  Smart Home & Kitchen Appliances
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Transparency */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold uppercase tracking-wider text-xs">
              Transparency
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/admin" className="hover:text-white flex items-center gap-1">
                  <span>Data Source Health</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link href="/sales" className="hover:text-white">
                  Festive Sale Calendar 2026
                </Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-white">
                  Today&apos;s Verified Drops
                </Link>
              </li>
              <li className="text-slate-500 text-[11px] pt-1">
                Zero infrastructure waste: Hosted on high-efficiency serverless architecture within ₹0–₹1,000/mo budget.
              </li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure & Legal Notice (Mandatory for ASCI & FTC Compliance) */}
        <div className="border-t border-slate-800 pt-6 space-y-3">
          <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/50 space-y-1.5">
            <p className="text-[11px] text-slate-300 font-medium">
              <strong>Affiliate Disclosure & Pricing Transparency:</strong> DealFinder India is a participant in affiliate advertising programs (including Amazon Associates India, Flipkart Affiliate Program, and partner networks). When you click on outbound links and complete a purchase, we may earn an affiliate commission at zero additional cost to you.
            </p>
            <p className="text-[11px] text-slate-400">
              Prices, stock availability, and promotional bank offers are subject to change by respective retailers. DealFinder India computes the <em>lowest price among currently tracked and verified stores only</em> and does not guarantee that lower prices do not exist in untracked local or unverified marketplaces. All currency values are in Indian Rupees (INR ₹).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
            <div>
              &copy; {new Date().getFullYear()} DealFinder India. Built for the Indian shopper.
            </div>
            <div className="flex items-center gap-4">
              <span>Made with ❤️ in India</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Sparkles className="w-3 h-3 text-orange-400" />
                No web scraping / Clean APIs
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
