-- Create storage bucket for product images
-- Run this in Supabase SQL Editor

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view images (public bucket)
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated admins to upload images
CREATE POLICY IF NOT EXISTS "Admin Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
);

-- Allow authenticated admins to update images
CREATE POLICY IF NOT EXISTS "Admin Update Access"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
);

-- Allow authenticated admins to delete images
CREATE POLICY IF NOT EXISTS "Admin Delete Access"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
);
