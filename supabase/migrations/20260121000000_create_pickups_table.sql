-- Create pickups table for pallet pickup requests
CREATE TABLE IF NOT EXISTS pickups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
    pallet_condition TEXT CHECK (pallet_condition IN ('grade-a', 'grade-b', 'mixed', 'damaged')),
    estimated_quantity INTEGER NOT NULL,
    actual_quantity INTEGER,
    pickup_address TEXT NOT NULL,
    pickup_city TEXT,
    pickup_state TEXT,
    pickup_zip TEXT,
    preferred_date DATE,
    scheduled_date DATE,
    notes TEXT,
    admin_notes TEXT,
    price_per_pallet DECIMAL(10,2),
    total_payout DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_pickups_user_id ON pickups(user_id);
CREATE INDEX IF NOT EXISTS idx_pickups_status ON pickups(status);
CREATE INDEX IF NOT EXISTS idx_pickups_created_at ON pickups(created_at DESC);

-- Enable RLS
ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;

-- Users can view their own pickups
CREATE POLICY "Users can view own pickups" ON pickups
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own pickups
CREATE POLICY "Users can create own pickups" ON pickups
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending pickups (cancel)
CREATE POLICY "Users can update own pending pickups" ON pickups
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all pickups
CREATE POLICY "Admins can view all pickups" ON pickups
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Admins can update all pickups
CREATE POLICY "Admins can update all pickups" ON pickups
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Admins can delete pickups
CREATE POLICY "Admins can delete pickups" ON pickups
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
