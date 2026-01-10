import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: order, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (*)
        `)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();

    if (error || !order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
}
