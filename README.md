# DealFinder India 🇮🇳 — E-Commerce Price-Comparison SaaS (MVP)

A modern, high-performance Indian e-commerce price-comparison platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase PostgreSQL**.

DealFinder India tracks, verifies, and compares real-world pricing and bank offers across India's leading shopping platforms: **Amazon India, Flipkart, Myntra, AJIO, and Meesho**.

---

## 🚀 Key Features Built in Phase 1

1. **Homepage (`/`)**:
   - Hero search engine tailored for Indian electronics, mobiles, and fashion queries.
   - Quick category shortcuts (Mobiles, Laptops, Audio, Fashion, Appliances, Beauty).
   - Real-time verified price drops showcase.
   - Consumer trust guarantee & strict non-inflated MRP transparency.
2. **Product Listing Page (`/products`)**:
   - Dynamic multi-filter sidebar (Category, Retailer/Store, Price Range in ₹, In-stock only).
   - Sorting by Highest Discount %, Price: Low-to-High, Price: High-to-Low, and Recently Added.
   - Standardized product cards with Indian Rupee formatting (`₹`), store availability tags, relative update time, and direct deal links.
3. **Product Details & Comparison Page (`/products/[id]`)**:
   - Side-by-side price comparison matrix across Amazon, Flipkart, Myntra, AJIO, and Meesho.
   - **"Lowest among tracked stores"** certified badge.
   - Instant bank discount and cashback notes (HDFC, SBI, ICICI, Axis).
   - Estimated checkout cost (including retailer-specific shipping thresholds).
   - Strict variant specifications guard (Storage, RAM, Color, Size).
4. **Today's Deals Page (`/deals`)**:
   - Curated list of verified price drops filtered by steep discount tiers (≥15%, ≥20%, ≥40%, ≥60%).
   - Store-level deal isolation (e.g., Flipkart Big Billion preview drops vs Amazon Great Indian Festival drops).
5. **Upcoming Sales Calendar (`/sales`)**:
   - Curated calendar of major Indian shopping festivals (Flipkart Big Billion Days, Amazon Great Indian Festival, Myntra Big Fashion Festival, AJIO All Stars Sale, Meesho Maha Indian Shopping Festival).
   - Target discounts, expected dates, and insider shopping strategy checklist (early access, bank card prep).
6. **Data Sources & Health Dashboard (`/admin`)**:
   - Live vs Demo operational mode status for each retailer adapter.
   - Breakdown of missing environment variables and credentials.
   - Catalog metrics (total products, offers, stale offers).
   - Manual sync trigger button and API endpoint.
7. **Compliant Affiliate Routing Engine (`/api/redirect?offerId=...`)**:
   - Complies with Indian ASCI guidelines and FTC affiliate disclosures.
   - Directs users to merchant product pages with affiliate tags (`tag=dealfinder-21`, `affid=dealfinder`, etc.) and sub-ID click tracking.
   - Marked with `rel="nofollow sponsored noopener"` and anti-caching HTTP 307 headers.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server Components & ISR) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS with Indian E-Commerce Brand Palette |
| **Database** | Supabase PostgreSQL (Free Tier: 500MB DB, RLS enabled) |
| **Icons** | Lucide React |
| **Testing** | Vitest (Automated unit tests for price comparison and variant matching) |
| **Deployment Target** | Cloudflare Pages / OpenNext, Railway, or VPS (Permits commercial affiliate use) |

---

## 📦 Project Structure

```
.
├── app/
│   ├── layout.tsx                # Root layout with Indian navigation, search & footer
│   ├── globals.css               # Tailwind CSS setup & custom utility classes
│   ├── page.tsx                  # 1. Homepage (Search hero, category grid, top deals)
│   ├── products/
│   │   ├── page.tsx              # 2. Product Listing (Category/price filters, sorting)
│   │   └── [id]/page.tsx         # 3. Product Details (Cross-store comparison table, variant specs)
│   ├── deals/
│   │   └── page.tsx              # 4. Today's Deals (Price drops, threshold tabs)
│   ├── sales/
│   │   └── page.tsx              # 5. Upcoming Indian Sales (Festival calendar & tips)
│   ├── admin/
│   │   └── page.tsx              # 6. Admin & Data Source Health Monitor
│   └── api/
│       ├── redirect/route.ts     # Outbound affiliate redirect handler with sub-id tracking
│       └── sync/route.ts         # Retailer sync trigger & health JSON endpoint
├── components/
│   ├── Navbar.tsx                # Sticky navbar with instant search & category drawer
│   ├── Footer.tsx                # Footer with ASCI affiliate disclosure & currency policies
│   ├── ProductCard.tsx           # Standardized card with Indian Rupee formatting
│   ├── PriceComparisonTable.tsx  # Multi-retailer comparison table
│   ├── FilterSidebar.tsx         # Category, store, price range filter controls
│   ├── StalePriceWarning.tsx     # Stale price alert badge (>24 hours)
│   └── DemoBadge.tsx             # Visual badge for demo/fictional prices
├── lib/
│   ├── types.ts                  # Core TypeScript types and interfaces
│   ├── formatters.ts             # INR (₹) number formatting (lakhs/crores) & relative time
│   ├── matching.ts               # Normalized product & variant matching engine
│   ├── supabase.ts               # Supabase PostgreSQL client initialization
│   ├── adapters/
│   │   ├── types.ts              # RetailerAdapter interface
│   │   ├── registry.ts           # Central adapter registry & URL builder
│   │   ├── flipkart.ts           # Flipkart Affiliate API adapter
│   │   ├── amazon.ts             # Amazon Creators / PA-API 5.0 adapter
│   │   ├── myntra.ts             # Myntra affiliate aggregator feed adapter
│   │   ├── ajio.ts               # AJIO partner network adapter
│   │   └── meesho.ts             # Meesho reseller / referral adapter
│   └── data/
│       ├── demo-products.ts      # Rich Indian catalog (iPhones, MacBooks, Galaxy S24, Fashion)
│       ├── repository.ts         # Unified data repository with local fallback
│       └── sales-calendar.ts     # Curated Indian mega sales calendar
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # PostgreSQL schema, RLS policies, indexes, retention
├── tests/
│   ├── comparison.test.ts        # Unit tests for price comparison logic & staleness
│   └── matching.test.ts          # Unit tests for variant guards (128GB vs 256GB guard)
├── .env.example                  # Environment variable template with complete instructions
├── vitest.config.ts              # Vitest test configuration
└── README.md                     # You are here
```

---

## 🏃 Local Execution Runbook

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Unit Tests
```bash
npm test
```
All 16 unit tests for price comparison, discount calculations, stale price detection, and variant mismatch guards will run via Vitest.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The platform boots in **Demo Mode** out of the box with realistic Indian products (iPhone 15, Samsung S24, MacBooks, boAt earbuds, Levi's shirts, Libas Kurtas, Philips Air Fryers).

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🏪 Retailer Integrations: Live vs Demo Status

| Retailer | Current Mode | Integration Candidate | What is Needed to Go Live |
|---|---|---|---|
| **Flipkart** | Demo | Flipkart Affiliate API 1.0 | Register at [affiliate.flipkart.com](https://affiliate.flipkart.com) and add `FLIPKART_AFFILIATE_ID` and `FLIPKART_AFFILIATE_TOKEN` to `.env.local`. |
| **Amazon India** | Demo | Amazon Associates / PA-API 5.0 | Register at [affiliate-program.amazon.in](https://affiliate-program.amazon.in). Add `AMAZON_ASSOCIATES_TAG=dealfinder-21` (outbound link routing works immediately). To access PA-API keys, Amazon requires **3 qualifying sales within the first 180 days**. |
| **Myntra** | Demo | Affiliate Aggregator Feed | Myntra does not provide a direct individual API. Sign up on [Cuelinks](https://www.cuelinks.com) or [EarnKaro](https://earnkaro.com) and set `CUELINKS_PUBLISHER_ID` in `.env.local`. |
| **AJIO** | Demo | Reliance Partner Network | AJIO operates via affiliate networks (Cuelinks, Admitad, or Involve Asia). Set `AJIO_AFFILIATE_ID` or `CUELINKS_PUBLISHER_ID` in `.env.local`. |
| **Meesho** | Demo | Reseller / Referral Link Routing | Meesho does not provide a public developer API. Set your referral identifier `MEESHO_REFERRAL_CODE` in `.env.local`. |

---

## 💰 Low-Cost Deployment Guide (Budget: ₹0–₹1,000/month)

> [!CAUTION]
> **Do NOT use Vercel Hobby**: Vercel's Terms of Service explicitly prohibit commercial affiliate websites on the free Hobby plan. Doing so risks account suspension.

### Recommended Commercial-Compliant Hosting Options:

1. **Option A: Cloudflare Pages / OpenNext (Cost: ₹0/month)**
   - Cloudflare Pages allows commercial websites within its free tier.
   - 100,000 free requests per day, unlimited bandwidth, global edge CDN with points of presence across India (Mumbai, Chennai, Bangalore, New Delhi).
   - Deploy using `@opennextjs/cloudflare` or standard Cloudflare Pages GitHub integration.

2. **Option B: Railway / Render / Fly.io (Cost: ₹0–₹400/month)**
   - Docker container runtime for standard Node.js Next.js server.
   - Railway Starter includes $5 monthly credit (covers full low-traffic MVP usage).
   - Render Web Services offers free and \$7/mo tiers with commercial support.

3. **Database: Supabase PostgreSQL Free Tier (Cost: ₹0/month)**
   - Includes 500 MB database storage, up to 50,000 monthly active users, and unlimited API requests.
   - Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor.
   - Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
   - The migration includes an automated 30-day price history purge function (`purge_old_price_history`) to prevent database storage bloat.

---

## 📋 What to Do Next

1. **Apply for Retailer Affiliate Accounts**:
   - Apply on [Amazon Associates India](https://affiliate-program.amazon.in) to secure your Associate Tag.
   - Apply on [Flipkart Affiliate Program](https://affiliate.flipkart.com) for API access.
   - Create a publisher account on [Cuelinks](https://www.cuelinks.com) to instantly cover Myntra, AJIO, Tata CLiQ, and Nykaa with a single master publisher ID.
2. **Provision Free Supabase Database**:
   - Create a free project on [supabase.com](https://supabase.com).
   - Execute `supabase/migrations/001_initial_schema.sql` in the SQL Editor.
   - Add your Supabase project URL and anon key to `.env.local`.
3. **Deploy to Cloudflare Pages or Railway**:
   - Push this workspace to your private GitHub repository.
   - Link the repository to Cloudflare Pages or Railway.
   - Add your production domain (e.g., `dealfinder.in`).
