import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Admin-only endpoint to update order status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { status, delivery_date } = body;

        const updateData: { status?: string; delivery_date?: string } = {};
        if (status) updateData.status = status;
        if (delivery_date) updateData.delivery_date = delivery_date;

        const { data: order, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', params.id)
            .select(`
                *,
                profiles!orders_user_id_fkey (
                    company_name,
                    contact_name
                )
            `)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ order, success: true });
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
