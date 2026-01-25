import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

// GET - Get single pickup with user profile (admin only)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: pickupId } = await params;

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Fetch pickup
        const { data: pickup, error } = await supabase
            .from('pickups')
            .select('*')
            .eq('id', pickupId)
            .single();

        if (error || !pickup) {
            return NextResponse.json({ error: 'Pickup not found' }, { status: 404 });
        }

        // Fetch profile
        const { data: customerProfile } = await supabase
            .from('profiles')
            .select('id, company_name, contact_name, phone, address, city, state, zip')
            .eq('id', pickup.user_id)
            .single();

        // Get user email from auth.users via the user_id (requires service role key)
        let userEmail: string | null = null;
        try {
            const adminSupabase = createAdminClient();
            const { data } = await adminSupabase.auth.admin.getUserById(pickup.user_id);
            userEmail = data.user?.email ?? null;
        } catch (err) {
            console.error('Failed to fetch user email via admin API:', err);
        }

        const pickupWithProfile = {
            ...pickup,
            profiles: customerProfile ? {
                ...customerProfile,
                email: userEmail
            } : null
        };

        return NextResponse.json({ pickup: pickupWithProfile });
    } catch (error) {
        console.error('Admin pickup detail API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH - Update pickup (admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: pickupId } = await params;

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const updates: Record<string, unknown> = {};

        // Allow updating specific fields
        if (body.status !== undefined) updates.status = body.status;
        if (body.scheduled_date !== undefined) updates.scheduled_date = body.scheduled_date || null;
        if (body.actual_quantity !== undefined) updates.actual_quantity = body.actual_quantity;
        if (body.price_per_pallet !== undefined) updates.price_per_pallet = body.price_per_pallet;
        if (body.pickup_charge !== undefined) updates.pickup_charge = body.pickup_charge;
        if (body.total_payout !== undefined) updates.total_payout = body.total_payout;
        if (body.admin_notes !== undefined) updates.admin_notes = body.admin_notes;

        updates.updated_at = new Date().toISOString();

        const { data: pickup, error } = await supabase
            .from('pickups')
            .update(updates)
            .eq('id', pickupId)
            .select()
            .single();

        if (error) {
            console.error('Error updating pickup:', error);
            return NextResponse.json({ error: 'Failed to update pickup' }, { status: 500 });
        }

        return NextResponse.json({ pickup });
    } catch (error) {
        console.error('Update pickup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete pickup (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: pickupId } = await params;

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { error } = await supabase
            .from('pickups')
            .delete()
            .eq('id', pickupId);

        if (error) {
            console.error('Error deleting pickup:', error);
            return NextResponse.json({ error: 'Failed to delete pickup' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete pickup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
