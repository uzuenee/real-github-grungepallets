-- Supabase Database Setup for Grunge Pallets
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    company_name TEXT NOT NULL DEFAULT '',
    contact_name TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    city TEXT DEFAULT '',
    state TEXT DEFAULT '',
    zip TEXT DEFAULT '',
    is_admin BOOLEAN DEFAULT FALSE,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('grade-a', 'grade-b', 'heat-treated', 'custom')),
    size TEXT NOT NULL,
    dimensions TEXT DEFAULT '',
    price NUMERIC(10,2) NOT NULL,
    description TEXT DEFAULT '',
    in_stock BOOLEAN DEFAULT TRUE,
    image_url TEXT DEFAULT ''
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    total NUMERIC(10,2) NOT NULL,
    delivery_notes TEXT DEFAULT '',
    delivery_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Products policies (public read)
CREATE POLICY "Anyone can view products"
    ON products FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage products"
    ON products FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = TRUE
        )
    );

-- Orders policies
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = TRUE
        )
    );

CREATE POLICY "Admins can update all orders"
    ON orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = TRUE
        )
    );

-- Order items policies
CREATE POLICY "Users can view own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own order items"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = TRUE
        )
    );

-- Insert sample products
INSERT INTO products (name, category, size, dimensions, price, description, in_stock) VALUES
    ('GMA 48x40 Grade A', 'grade-a', '48x40', '48" x 40" x 6"', 8.50, 'Premium quality Grade A pallet, excellent condition', true),
    ('GMA 48x40 Grade B', 'grade-b', '48x40', '48" x 40" x 6"', 6.00, 'Good quality Grade B pallet, minor wear', true),
    ('48x40 Heat Treated', 'heat-treated', '48x40', '48" x 40" x 6"', 10.00, 'ISPM-15 certified heat treated pallet for export', true),
    ('42x42 Grade A', 'grade-a', '42x42', '42" x 42" x 6"', 9.00, 'Square pallet, ideal for drums and IBCs', true),
    ('48x48 Grade A', 'grade-a', '48x48', '48" x 48" x 6"', 9.50, 'Large square pallet for industrial use', true),
    ('Custom Pallet', 'custom', 'Custom', 'Custom dimensions', 12.00, 'Custom built to your specifications', true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
