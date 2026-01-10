import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's orders with items
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
    console.log('[Orders API] POST request received');

    let supabase;
    try {
        supabase = await createClient();
        console.log('[Orders API] Supabase client created');
    } catch (err) {
        console.error('[Orders API] Failed to create Supabase client:', err);
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('[Orders API] User:', user?.id, 'Auth error:', authError);

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { items, total, delivery_notes } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'No items provided' }, { status: 400 });
        }

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                status: 'pending',
                total,
                delivery_notes: delivery_notes || '',
            })
            .select()
            .single();

        if (orderError) {
            console.error('[Orders API] Order creation error:', orderError);
            return NextResponse.json({ error: orderError.message }, { status: 500 });
        }

        // Create order items
        const orderItems = items.map((item: {
            productId: string;
            productName: string;
            quantity: number;
            price: number;
            isCustom?: boolean;
            customSpecs?: { length: string; width: string; height?: string; notes?: string };
        }) => ({
            order_id: order.id,
            product_id: item.productId,
            product_name: item.productName,
            quantity: item.quantity,
            unit_price: item.price,
            is_custom: item.isCustom || false,
            custom_specs: item.customSpecs ? JSON.stringify(item.customSpecs) : null,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            // Rollback order if items fail
            await supabase.from('orders').delete().eq('id', order.id);
            console.error('[Orders API] Order items error:', itemsError);
            return NextResponse.json({ error: itemsError.message }, { status: 500 });
        }

        console.log('[Orders API] Order created successfully:', order.id);
        return NextResponse.json({ order, success: true });
    } catch (err) {
        console.error('[Orders API] Unexpected error:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
