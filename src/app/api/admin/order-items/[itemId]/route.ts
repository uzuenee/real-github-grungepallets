import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderDetailsUpdated } from '@/lib/email';

// PATCH - Update order item price (for custom items)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { itemId: string } }
) {
    const supabase = await createClient();
    const itemId = params.itemId;

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin using admin client to bypass RLS
    const adminClient = createAdminClient();
    const { data: adminProfile } = await adminClient
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

        if (typeof unit_price !== 'number' || unit_price < 0) {
            return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
        }

        // First get the order_id and item details for this item
        const { data: existingItem, error: fetchError } = await adminClient
            .from('order_items')
            .select('id, order_id, product_name, quantity, is_custom, unit_price')
            .eq('id', itemId)
            .single();

        if (fetchError || !existingItem) {
            console.error('Fetch error:', fetchError);
            return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
        }

        const previousUnitPrice = existingItem.unit_price as number;

        // Update the order item price
        const { error: updateError } = await adminClient
            .from('order_items')
            .update({ unit_price })
            .eq('id', itemId);

        if (updateError) {
            console.error('Update error:', updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Recalculate order total
        const { data: orderItems } = await adminClient
            .from('order_items')
            .select('product_name, quantity, unit_price')
            .eq('order_id', existingItem.order_id);

        let newTotal = 0;
        if (orderItems) {
            const subtotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

            const { data: currentOrder } = await adminClient
                .from('orders')
                .select('id, user_id, delivery_price, delivery_date')
                .eq('id', existingItem.order_id)
                .single();

            const deliveryPrice = currentOrder?.delivery_price ?? 0;
            newTotal = subtotal + deliveryPrice;

            await adminClient
                .from('orders')
                .update({ total: newTotal })
                .eq('id', existingItem.order_id);

            // Email customer about pricing update (don't block response)
            if (currentOrder?.user_id) {
                const { data: profile } = await adminClient
                    .from('profiles')
                    .select('contact_name')
                    .eq('id', currentOrder.user_id)
                    .single();

                const { data: authUser } = await adminClient.auth.admin.getUserById(currentOrder.user_id);
                const customerEmail = authUser?.user?.email;

                if (customerEmail) {
                    const updates = [
                        `Pricing updated for <strong>${existingItem.product_name}</strong>: $${previousUnitPrice.toFixed(2)} → $${unit_price.toFixed(2)}.`,
                    ];

                    sendOrderDetailsUpdated({
                        userId: currentOrder.user_id,
                        customerEmail,
                        customerName: profile?.contact_name || 'Customer',
                        orderId: existingItem.order_id,
                        updates,
                        deliveryDate: currentOrder.delivery_date || undefined,
                        items: orderItems.map((i) => ({
                            product_name: i.product_name,
                            quantity: i.quantity,
                            unit_price: i.unit_price,
                        })),
                        orderTotal: newTotal,
                        deliveryPrice: currentOrder.delivery_price ?? null,
                    }).catch((err) => console.error('[Order Item] Update email error:', err));
                }
            }
        }

        return NextResponse.json({ success: true, item: { ...existingItem, unit_price }, order_total: newTotal });
    } catch (err) {
        console.error('Catch error:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
