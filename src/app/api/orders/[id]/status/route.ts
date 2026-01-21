import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderStatusUpdate } from '@/lib/email';

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

    try {
        const body = await request.json();
        const { status, delivery_date, delivery_price } = body;

        const updateData: { status?: string; delivery_date?: string; delivery_price?: number; total?: number } = {};
        if (status) updateData.status = status;
        if (delivery_date) updateData.delivery_date = delivery_date;
        if (delivery_price !== undefined) {
            updateData.delivery_price = delivery_price;
            // We need to recalculate total when delivery_price is set
            // First fetch current order to get subtotal
            const { data: currentOrder } = await adminClient
                .from('orders')
                .select('total, delivery_price, order_items(quantity, unit_price)')
                .eq('id', params.id)
                .single();

            if (currentOrder) {
                // Calculate subtotal from items
                const items = currentOrder.order_items as Array<{ quantity: number; unit_price: number }> || [];
                const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
                updateData.total = subtotal + delivery_price;
            }
        }

        // Use admin client for update to bypass RLS
        // Note: email is NOT in profiles table, it's in auth.users
        const { data: order, error } = await adminClient
            .from('orders')
            .update(updateData)
            .eq('id', params.id)
            .select(`
                *,
                profiles!orders_user_id_fkey (
                    company_name,
                    contact_name
                ),
                order_items (
                    product_name,
                    quantity,
                    unit_price
                )
            `)
            .single();

        if (error) {
            console.error('[Order Status] Update error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Send email notification for status update (don't block)
        if (status && order.profiles) {
            // Get the customer's email from auth.users via admin API
            const { data: authUser } = await adminClient.auth.admin.getUserById(order.user_id);
            const customerEmail = authUser?.user?.email;

            if (customerEmail) {
                const customerProfile = order.profiles as { company_name?: string; contact_name?: string };
                const orderItems = order.order_items as Array<{ product_name: string; quantity: number; unit_price: number }> || [];

                sendOrderStatusUpdate({
                    userId: order.user_id,
                    customerEmail: customerEmail,
                    customerName: customerProfile.contact_name || 'Customer',
                    orderId: order.id,
                    newStatus: status,
                    deliveryDate: delivery_date,
                    items: orderItems,
                    orderTotal: order.total,
                }).then(result => {
                    console.log('[Order Status] Email result:', result);
                }).catch(err => console.error('[Order Status] Email error:', err));
            } else {
                console.warn('[Order Status] No email found for user:', order.user_id);
            }
        }

        return NextResponse.json({ order, success: true });
    } catch (err) {
        console.error('[Order Status] Unexpected error:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}

