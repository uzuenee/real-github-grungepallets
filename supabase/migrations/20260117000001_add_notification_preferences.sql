-- Add notification_preferences column to profiles table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"order_confirmations": true, "shipping_updates": true, "delivery_notifications": true, "promotional_emails": false}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.notification_preferences IS 'User email notification preferences stored as JSON';
