import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#111827] text-gray-300 pt-12 pb-8 border-t border-gray-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base">DealFinder India</span>
              <span className="text-[10px] bg-[#F59E0B]/15 text-[#F59E0B] px-1.5 py-0.5 rounded font-mono border border-[#F59E0B]/30">
                MVP v1.0
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed text-xs">
              Empowering Indian shoppers to make smarter decisions by discovering genuine prices, curated discounts, and bank offers on Amazon India.
            </p>
            <div className="flex items-center gap-2 text-gray-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Free & Unbiased Discovery</span>
            </div>
          </div>

          {/* Supported Retailers */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold uppercase tracking-wider text-xs">
              Retailer Platforms
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center justify-between">
                <span>Amazon India</span>
                <span className="text-[10px] text-amber-400 font-semibold">Active (Associates)</span>
              </li>
              <li className="flex items-center justify-between opacity-60">
                <span>Flipkart</span>
                <span className="text-[10px] text-gray-500">Pending Approval</span>
              </li>
              <li className="flex items-center justify-between opacity-60">
                <span>Myntra</span>
                <span className="text-[10px] text-gray-500">Pending Approval</span>
              </li>
              <li className="flex items-center justify-between opacity-60">
                <span>AJIO</span>
                <span className="text-[10px] text-gray-500">Pending Approval</span>
              </li>
              <li className="flex items-center justify-between opacity-60">
                <span>Meesho</span>
                <span className="text-[10px] text-gray-500">Pending Approval</span>
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
                  Today&apos;s Deal Drops
                </Link>
              </li>
              <li className="text-slate-500 text-[11px] pt-1">
                Zero infrastructure waste: Hosted on high-efficiency serverless architecture within ₹0–₹1,000/mo budget.
              </li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure & Legal Notice (Mandatory for ASCI & FTC Compliance) */}
        <div className="border-t border-gray-800 pt-6 space-y-3">
          <div className="bg-gray-800/60 p-3.5 rounded-xl border border-gray-700/50 space-y-1.5">
            <p className="text-[11px] text-gray-300 font-medium">
              <strong>Affiliate Disclosure & Pricing Transparency:</strong> DealFinder India is a participant in affiliate advertising programs (including Amazon Associates India, Flipkart Affiliate Program, and partner networks). When you click on outbound links and complete a purchase, we may earn an affiliate commission at zero additional cost to you.
            </p>
            <p className="text-[11px] text-gray-400">
              Prices, stock availability, and promotional bank offers are subject to change by respective retailers. DealFinder India computes prices among currently tracked Amazon India catalog listings and does not guarantee that lower prices do not exist in untracked local marketplaces. All currency values are in Indian Rupees (INR ₹).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-gray-400 text-[11px] gap-2">
            <div>
              &copy; {new Date().getFullYear()} DealFinder India. Built for the Indian shopper.
            </div>
            <div className="flex items-center gap-4">
              <span>Made with ❤️ in India</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-gray-400">
                <Sparkles className="w-3 h-3 text-[#F59E0B]" />
                Affiliate Partner APIs
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
