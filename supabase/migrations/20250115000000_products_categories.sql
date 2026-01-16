-- Products and Categories Enhancement Migration
-- Run this in Supabase SQL Editor
-- This migration is SAFE and will not break existing data

-- =============================================
-- STEP 1: CREATE CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    color_class TEXT DEFAULT 'bg-secondary-100 text-secondary-700 border-secondary-200',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (for re-runnability)
DROP POLICY IF EXISTS "Anyone can read active categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

-- Public can read active categories
CREATE POLICY "Anyone can read active categories"
    ON categories FOR SELECT
    USING (is_active = true);

-- Admins can do everything with categories
CREATE POLICY "Admins can manage categories"
    ON categories FOR ALL
    USING (public.is_admin());

-- =============================================
-- STEP 2: SEED CATEGORIES
-- =============================================
INSERT INTO categories (id, label, description, color_class, sort_order) VALUES
    ('grade-a', 'Grade A', 'Premium quality pallets with minimal wear', 'bg-green-100 text-green-700 border-green-200', 1),
    ('grade-b', 'Grade B', 'Good quality pallets with some cosmetic wear', 'bg-blue-100 text-blue-700 border-blue-200', 2),
    ('heat-treated', 'Heat Treated', 'ISPM-15 certified heat treated pallets for export', 'bg-orange-100 text-orange-700 border-orange-200', 3),
    ('custom', 'Custom', 'Custom built pallets to your specifications', 'bg-purple-100 text-purple-700 border-purple-200', 4)
ON CONFLICT (id) DO UPDATE SET
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    color_class = EXCLUDED.color_class,
    sort_order = EXCLUDED.sort_order;

-- =============================================
-- STEP 3: ADD NEW COLUMNS TO EXISTING PRODUCTS TABLE
-- These are safe ALTER statements that don't break existing data
-- =============================================

-- Add category_id column if it doesn't exist (will reference categories table)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'category_id') THEN
        ALTER TABLE products ADD COLUMN category_id TEXT;
    END IF;
END $$;

-- Add is_heat_treated if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'is_heat_treated') THEN
        ALTER TABLE products ADD COLUMN is_heat_treated BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add is_protected if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'is_protected') THEN
        ALTER TABLE products ADD COLUMN is_protected BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add sort_order if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'sort_order') THEN
        ALTER TABLE products ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add updated_at if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'updated_at') THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- =============================================
-- STEP 4: MIGRATE EXISTING DATA
-- Copy 'category' values to 'category_id' for existing products
-- =============================================
UPDATE products 
SET category_id = category 
WHERE category_id IS NULL AND category IS NOT NULL;

-- Set is_heat_treated based on name containing 'HT' or 'Heat Treated'
UPDATE products 
SET is_heat_treated = true 
WHERE (name ILIKE '%HT%' OR name ILIKE '%heat treated%') 
  AND is_heat_treated = false;

-- Mark custom pallet as protected
UPDATE products 
SET is_protected = true 
WHERE category = 'custom' OR name ILIKE '%custom%';

-- =============================================
-- STEP 5: UPDATE RLS POLICIES FOR PRODUCTS
-- =============================================

-- Drop and recreate policies for products (safe, won't affect data)
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Public can read all products
CREATE POLICY "Anyone can read products"
    ON products FOR SELECT
    USING (true);

-- Admins can do everything
CREATE POLICY "Admins can manage products"
    ON products FOR ALL
    USING (public.is_admin());

-- =============================================
-- STEP 6: CREATE TRIGGER FOR updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- =============================================
-- VERIFICATION: Check what we have
-- =============================================
-- Run this separately to verify:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products';
-- SELECT * FROM categories;
-- SELECT id, name, category, category_id, is_heat_treated, is_protected FROM products;
