-- Fix Admin RLS Policies
-- This migration fixes the recursion issue by using a SECURITY DEFINER function
-- Run this in Supabase SQL Editor

-- Step 1: Create the is_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND is_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop existing admin policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

-- Step 3: Recreate policies using the is_admin() function

-- Profiles: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

-- Products: Admins can manage all products
CREATE POLICY "Admins can manage products"
    ON products FOR ALL
    USING (public.is_admin());

-- Orders: Admins can view all orders
CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (public.is_admin());

-- Orders: Admins can update all orders
CREATE POLICY "Admins can update all orders"
    ON orders FOR UPDATE
    USING (public.is_admin());

-- Order items: Admins can view all order items
CREATE POLICY "Admins can view all order items"
    ON order_items FOR SELECT
    USING (public.is_admin());
