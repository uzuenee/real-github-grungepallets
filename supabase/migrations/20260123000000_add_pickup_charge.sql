-- Add pickup_charge field to pickups table
-- This fee is charged by the company for the pickup service
ALTER TABLE pickups ADD COLUMN IF NOT EXISTS pickup_charge DECIMAL(10,2) DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN pickups.pickup_charge IS 'Fee charged for the pickup service (set by admin)';
