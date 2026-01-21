-- Add delivery_price column to orders table
-- This migration allows admins to set delivery price during order confirmation
-- instead of using a fixed $75 (free over $500) calculation

-- Add the delivery_price column (nullable to support existing orders)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_price NUMERIC(10,2) DEFAULT NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN orders.delivery_price IS 'Admin-set delivery price. NULL means TBD (to be determined by admin).';
