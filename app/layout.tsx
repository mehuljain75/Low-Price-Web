import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DealFinder India — Compare Prices Across Amazon, Flipkart, Myntra & More",
  description:
    "Find the lowest price among tracked Indian online stores. Real-time price comparison across Amazon India, Flipkart, Myntra, AJIO, and Meesho with verified discounts and bank offers.",
  keywords: [
    "price comparison india",
    "amazon vs flipkart price",
    "lowest price india",
    "iphone 15 price flipkart amazon",
    "festive deals bbd gif 2026",
    "online shopping discount india",
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "cuelinks:publisher": "281629",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
