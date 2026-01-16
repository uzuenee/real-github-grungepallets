import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin using admin client to bypass RLS
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get status filter from URL
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    // Fetch all orders with profiles and items
    let query = supabase
        .from('orders')
        .select(`
            *,
            profiles:user_id (
                company_name,
                contact_name
            ),
            order_items (*)
        `)
        .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
    }

    const { data: orders, error } = await query;

    if (error) {
        console.error('Admin orders fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders });
}
