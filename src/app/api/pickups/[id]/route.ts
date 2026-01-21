import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get single pickup details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

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

        // Build query - admin can see all, users only their own
        let query = supabase.from('pickups').select('*').eq('id', id);

        if (!profile?.is_admin) {
            query = query.eq('user_id', user.id);
        }

        const { data: pickup, error } = await query.single();

        if (error || !pickup) {
            return NextResponse.json({ error: 'Pickup not found' }, { status: 404 });
        }

        return NextResponse.json({ pickup });
    } catch (error) {
        console.error('Get pickup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH - Update pickup (admin: all fields, users: only cancel)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Check if admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        const isAdmin = profile?.is_admin;

        // If not admin, user can only cancel their own pending pickups
        if (!isAdmin) {
            if (body.status !== 'cancelled') {
                return NextResponse.json(
                    { error: 'Users can only cancel pickups' },
                    { status: 403 }
                );
            }

            const { data: existing } = await supabase
                .from('pickups')
                .select('status, user_id')
                .eq('id', id)
                .single();

            if (!existing || existing.user_id !== user.id) {
                return NextResponse.json({ error: 'Pickup not found' }, { status: 404 });
            }

            if (existing.status !== 'pending') {
                return NextResponse.json(
                    { error: 'Can only cancel pending pickups' },
                    { status: 400 }
                );
            }
        }

        // Build update object
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        // Admin can update these fields
        if (isAdmin) {
            if (body.status) updateData.status = body.status;
            if (body.scheduled_date !== undefined) updateData.scheduled_date = body.scheduled_date;
            if (body.actual_quantity !== undefined) updateData.actual_quantity = body.actual_quantity;
            if (body.price_per_pallet !== undefined) updateData.price_per_pallet = body.price_per_pallet;
            if (body.total_payout !== undefined) updateData.total_payout = body.total_payout;
            if (body.admin_notes !== undefined) updateData.admin_notes = body.admin_notes;
        } else {
            // User can only cancel
            updateData.status = 'cancelled';
        }

        const { data: pickup, error } = await supabase
            .from('pickups')
            .update(updateData)
            .eq('id', id)
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
        const { id } = await params;
        const supabase = await createClient();

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
            .eq('id', id);

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
