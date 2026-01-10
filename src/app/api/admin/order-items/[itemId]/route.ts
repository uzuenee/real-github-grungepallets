import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// PATCH - Update order item price (for custom items)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { itemId: string } }
) {
    const supabase = await createClient();
    const itemId = params.itemId;

    console.log('Updating order item price for:', itemId);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!adminProfile?.is_admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { unit_price } = body;

        console.log('Price to set:', unit_price);

        if (typeof unit_price !== 'number' || unit_price < 0) {
            return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
        }

        // First get the order_id and item details for this item
        const { data: existingItem, error: fetchError } = await supabase
            .from('order_items')
            .select('id, order_id, product_name, quantity, is_custom')
            .eq('id', itemId)
            .single();

        if (fetchError || !existingItem) {
            console.error('Fetch error:', fetchError);
            return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
        }

        // Update the order item price (without .single() to avoid RLS issues)
        const { error: updateError } = await supabase
            .from('order_items')
            .update({ unit_price })
            .eq('id', itemId);

        if (updateError) {
            console.error('Update error:', updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Recalculate order total
        const { data: orderItems } = await supabase
            .from('order_items')
            .select('quantity, unit_price')
            .eq('order_id', existingItem.order_id);

        let newTotal = 0;
        if (orderItems) {
            newTotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
            console.log('New order total:', newTotal);

            await supabase
                .from('orders')
                .update({ total: newTotal })
                .eq('id', existingItem.order_id);
        }

        return NextResponse.json({ success: true, item: { ...existingItem, unit_price } });
    } catch (err) {
        console.error('Catch error:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
