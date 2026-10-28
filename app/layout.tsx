import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DealFinder India — Amazon Product Discovery, Deals & Price Tracking",
  description:
    "Discover and track prices on Amazon India. Explore top deals, specifications, customer ratings, bank discounts, and price history.",
  keywords: [
    "amazon india deals",
    "amazon price tracker india",
    "lowest price amazon",
    "iphone 15 price amazon",
    "online shopping discount india",
    "amazon associates india",
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
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#F3F4F6] text-[#111827]`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
