-- DealFinder India: Initial Normalized PostgreSQL Schema
-- Designed for Supabase Free Tier (low storage, optimal indexes, RLS enabled)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon_name TEXT NOT NULL DEFAULT 'Tag',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Retailers Table
CREATE TABLE IF NOT EXISTS retailers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_text TEXT NOT NULL,
    base_url TEXT NOT NULL,
    affiliate_tag_param TEXT NOT NULL DEFAULT 'tag',
    adapter_type TEXT NOT NULL DEFAULT 'demo',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Products Table (Canonical Products)
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    model_number TEXT,
    gtin TEXT, -- EAN / UPC for exact product barcode matching
    description TEXT,
    image_url TEXT NOT NULL,
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    rating NUMERIC(2, 1) DEFAULT 4.5,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Offers Table (Store specific listings)
CREATE TABLE IF NOT EXISTS offers (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    retailer_id TEXT NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    retailer_product_id TEXT NOT NULL,
    title TEXT NOT NULL,
    product_url TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_stale BOOLEAN NOT NULL DEFAULT FALSE,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    data_source TEXT NOT NULL DEFAULT 'demo',
    delivery_time_estimate TEXT,
    bank_offers_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_retailer_product UNIQUE (retailer_id, retailer_product_id)
);

-- 5. Price History Table (Rolling historical records)
CREATE TABLE IF NOT EXISTS price_history (
    id BIGSERIAL PRIMARY KEY,
    offer_id TEXT NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Sales Events Table (Festive calendar)
CREATE TABLE IF NOT EXISTS sales_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    retailer_slug TEXT NOT NULL,
    retailer_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    badge TEXT NOT NULL,
    description TEXT,
    categories JSONB NOT NULL DEFAULT '[]'::jsonb,
    discount_highlight TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    tips JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- INDEXES FOR LOW-LATENCY READS & MINIMAL STORAGE OVERHEAD
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_gtin ON products(gtin) WHERE gtin IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

CREATE INDEX IF NOT EXISTS idx_offers_product_price ON offers(product_id, price ASC);
CREATE INDEX IF NOT EXISTS idx_offers_retailer ON offers(retailer_id);
CREATE INDEX IF NOT EXISTS idx_offers_last_checked ON offers(last_checked_at);

CREATE INDEX IF NOT EXISTS idx_price_history_offer_recorded ON price_history(offer_id, recorded_at DESC);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_events ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all catalog tables
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Retailers" ON retailers FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Offers" ON offers FOR SELECT USING (true);
CREATE POLICY "Public Read PriceHistory" ON price_history FOR SELECT USING (true);
CREATE POLICY "Public Read SalesEvents" ON sales_events FOR SELECT USING (true);

-- ========================================================
-- LOW-COST MAINTENANCE: 30-DAY RETENTION FOR PRICE HISTORY
-- ========================================================
CREATE OR REPLACE FUNCTION purge_old_price_history()
RETURNS VOID AS $$
BEGIN
    DELETE FROM price_history
    WHERE recorded_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
