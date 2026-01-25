import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderStatusUpdate } from '@/lib/email';

// GET single order with full details for admin
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();
    const orderId = params.id;

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

    // First get the order with items
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                id,
                product_id,
                product_name,
                quantity,
                unit_price,
                is_custom,
                custom_specs
            )
        `)
        .eq('id', orderId)
        .single();

    if (orderError) {
        console.error('Order fetch error:', orderError);
        return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get the customer profile separately
    const { data: customerProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, company_name, contact_name, phone, address, city, state, zip')
        .eq('id', order.user_id)
        .single();

    if (profileError) {
        console.error('Profile fetch error:', profileError);
        return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Get customer email from auth.users (not stored in profiles)
    const { data: authUser } = await adminClient.auth.admin.getUserById(order.user_id);
    const customerEmail = authUser?.user?.email || null;

    // Combine order with profiles
    const orderWithProfile = {
        ...order,
        profiles: {
            ...(customerProfile || {}),
            email: customerEmail,
        }
    };

    return NextResponse.json({ order: orderWithProfile });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();

    // Get current user
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

    // Delete order (cascade will delete order_items)
    const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', params.id);

    if (error) {
        console.error('Order delete error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

// PATCH - Update order status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();
    const orderId = params.id;

    // Get current user
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
        const { status, delivery_date } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        // Valid statuses
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Enforce required fields before moving out of pending (except cancellation)
        const { data: currentOrder, error: currentOrderError } = await adminClient
            .from('orders')
            .select('status, delivery_date, delivery_price, order_items(id, is_custom, unit_price)')
            .eq('id', orderId)
            .single();

        if (currentOrderError || !currentOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (currentOrder.status === 'pending' && status !== 'pending' && status !== 'cancelled') {
            const effectiveDeliveryDate = delivery_date || currentOrder.delivery_date;
            const deliveryPriceSet = currentOrder.delivery_price != null;

            const customItems = (currentOrder.order_items as Array<{ id: string; is_custom?: boolean; unit_price: number }> | null) || [];
            const customMissing = customItems
                .filter((item) => item.is_custom)
                .filter((item) => !(typeof item.unit_price === 'number' && item.unit_price > 0))
                .map((item) => item.id);

            if (!deliveryPriceSet || !effectiveDeliveryDate || customMissing.length > 0) {
                return NextResponse.json(
                    {
                        error: 'Set delivery price, delivery date, and custom item prices before confirming this order.',
                        missing: {
                            delivery_price: !deliveryPriceSet,
                            delivery_date: !effectiveDeliveryDate,
                            custom_item_ids_missing_price: customMissing,
                        },
                    },
                    { status: 400 }
                );
            }
        }

        // Update the order
        const updateData: { status: string; delivery_date?: string } = { status };
        if (delivery_date) {
            updateData.delivery_date = delivery_date;
        }

        const { data: updatedOrder, error: updateError } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)
            .select()
            .single();

        if (updateError) {
            console.error('Order status update error:', updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Email customer about status update with full pricing breakdown (don't block on this)
        const { data: profile } = await adminClient
            .from('profiles')
            .select('contact_name')
            .eq('id', updatedOrder.user_id)
            .single();

        const { data: authUser } = await adminClient.auth.admin.getUserById(updatedOrder.user_id);
        const customerEmail = authUser?.user?.email;

        if (customerEmail) {
            const { data: fullOrder } = await adminClient
                .from('orders')
                .select('id, user_id, status, total, delivery_price, delivery_date, order_items(product_name, quantity, unit_price)')
                .eq('id', orderId)
                .single();

            const orderItems = (fullOrder?.order_items as Array<{ product_name: string; quantity: number; unit_price: number }> | null) || [];

            sendOrderStatusUpdate({
                userId: updatedOrder.user_id,
                customerEmail,
                customerName: profile?.contact_name || 'Customer',
                orderId: orderId,
                newStatus: status,
                deliveryDate: delivery_date || fullOrder?.delivery_date || undefined,
                items: orderItems,
                orderTotal: fullOrder?.total ?? updatedOrder.total,
                deliveryPrice: fullOrder?.delivery_price ?? null,
            }).catch(err => console.error('[Admin Orders] Email error:', err));
        }

        return NextResponse.json({ order: updatedOrder, success: true });
    } catch (err) {
        console.error('Order status update error:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
