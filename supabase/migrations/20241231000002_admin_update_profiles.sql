-- Add Admin Update Policy for Profiles
-- Run this in Supabase SQL Editor

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create policy allowing admins to update any profile
CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING (public.is_admin());
