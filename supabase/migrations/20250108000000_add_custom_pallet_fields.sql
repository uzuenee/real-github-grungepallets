-- Add custom pallet fields to order_items table
-- Run this in Supabase SQL Editor

-- Add is_custom boolean column with default false
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;

-- Add custom_specs JSON column for storing custom pallet dimensions
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS custom_specs TEXT;

-- Note: custom_specs stores JSON like: {"length": "48", "width": "40", "height": "6", "notes": "..."}

-- IMPORTANT: Allow admins to update order items (required for setting custom prices)
-- Drop first in case it already exists
DROP POLICY IF EXISTS "Admins can update all order items" ON order_items;
CREATE POLICY "Admins can update all order items"
    ON order_items FOR UPDATE
    USING (public.is_admin());
