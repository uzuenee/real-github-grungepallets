import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderDetailsUpdated, sendOrderStatusUpdate } from '@/lib/email';

const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

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
        const { status, delivery_date, delivery_price } = body as {
            status?: unknown;
            delivery_date?: unknown;
            delivery_price?: unknown;
        };

        if (status !== undefined) {
            if (typeof status !== 'string' || !(validStatuses as readonly string[]).includes(status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            }
        }

        if (delivery_date !== undefined && typeof delivery_date !== 'string') {
            return NextResponse.json({ error: 'Invalid delivery date' }, { status: 400 });
        }

        let parsedDeliveryPrice: number | undefined;
        if (delivery_price !== undefined) {
            if (typeof delivery_price === 'number') {
                parsedDeliveryPrice = delivery_price;
            } else if (typeof delivery_price === 'string') {
                const parsed = parseFloat(delivery_price);
                if (!Number.isNaN(parsed)) parsedDeliveryPrice = parsed;
            }

            if (parsedDeliveryPrice === undefined || parsedDeliveryPrice < 0) {
                return NextResponse.json({ error: 'Invalid delivery price' }, { status: 400 });
            }
        }

        const { data: currentOrder, error: currentOrderError } = await adminClient
            .from('orders')
            .select('user_id, status, delivery_date, delivery_price, total, order_items(id, product_name, quantity, is_custom, unit_price)')
            .eq('id', params.id)
            .single();

        if (currentOrderError || !currentOrder) {
            console.error('[Order Status] Fetch error:', currentOrderError);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Enforce required fields before moving out of pending (except cancellation)
        if (status && currentOrder.status === 'pending' && status !== 'pending' && status !== 'cancelled') {
            const effectiveDeliveryPrice = parsedDeliveryPrice ?? currentOrder.delivery_price;
            const effectiveDeliveryDate = (delivery_date as string | undefined) ?? currentOrder.delivery_date;

            const missing: string[] = [];
            if (effectiveDeliveryPrice == null) missing.push('delivery price');
            if (!effectiveDeliveryDate) missing.push('delivery date');

            const customItems = (currentOrder.order_items as Array<{ id: string; is_custom?: boolean; unit_price: number }> | null) || [];
            const customMissing = customItems
                .filter((item) => item.is_custom)
                .filter((item) => !(typeof item.unit_price === 'number' && item.unit_price > 0))
                .map((item) => item.id);

            if (missing.length > 0 || customMissing.length > 0) {
                return NextResponse.json(
                    {
                        error: 'Set delivery price, delivery date, and custom item prices before confirming this order.',
                        missing: {
                            delivery_price: effectiveDeliveryPrice == null,
                            delivery_date: !effectiveDeliveryDate,
                            custom_item_ids_missing_price: customMissing,
                        },
                    },
                    { status: 400 }
                );
            }
        }

        const updateData: { status?: string; delivery_date?: string; delivery_price?: number; total?: number } = {};
        if (status) updateData.status = status;
        if (delivery_date !== undefined) updateData.delivery_date = delivery_date as string;
        if (parsedDeliveryPrice !== undefined) {
            updateData.delivery_price = parsedDeliveryPrice;
            const items = (currentOrder.order_items as Array<{ quantity: number; unit_price: number }> | null) || [];
            const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
            updateData.total = subtotal + parsedDeliveryPrice;
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

        // Send email notification for customer-visible updates (don't block)
        if (order.profiles) {
            const oldStatus = currentOrder.status as string;
            const oldDeliveryDate = currentOrder.delivery_date as string | null | undefined;
            const oldDeliveryPrice = currentOrder.delivery_price as number | null | undefined;

            const newStatus = (status ?? order.status) as string;
            const newDeliveryDate = (updateData.delivery_date ?? order.delivery_date) as string | null | undefined;
            const newDeliveryPrice = (parsedDeliveryPrice ?? order.delivery_price) as number | null | undefined;

            const statusChanged = status !== undefined && oldStatus !== newStatus;
            const deliveryDateChanged = delivery_date !== undefined && oldDeliveryDate !== newDeliveryDate;
            const deliveryPriceChanged = parsedDeliveryPrice !== undefined && oldDeliveryPrice !== newDeliveryPrice;

            if (statusChanged || deliveryDateChanged || deliveryPriceChanged) {
                // Get the customer's email from auth.users via admin API
                const { data: authUser } = await adminClient.auth.admin.getUserById(order.user_id);
                const customerEmail = authUser?.user?.email;

                if (customerEmail) {
                    const customerProfile = order.profiles as { company_name?: string; contact_name?: string };
                    const orderItems = order.order_items as Array<{ product_name: string; quantity: number; unit_price: number }> || [];

                    if (statusChanged) {
                        sendOrderStatusUpdate({
                            userId: order.user_id,
                            customerEmail,
                            customerName: customerProfile.contact_name || 'Customer',
                            orderId: order.id,
                            newStatus,
                            deliveryDate: newDeliveryDate || undefined,
                            items: orderItems,
                            orderTotal: order.total,
                            deliveryPrice: order.delivery_price,
                        }).catch(err => console.error('[Order Status] Email error:', err));
                    } else {
                        const updates: string[] = [];
                        if (deliveryPriceChanged && typeof newDeliveryPrice === 'number') {
                            updates.push(`Delivery fee updated to <strong>$${newDeliveryPrice.toFixed(2)}</strong>.`);
                        }
                        if (deliveryDateChanged && typeof newDeliveryDate === 'string' && newDeliveryDate) {
                            updates.push(`Delivery date updated to <strong>${new Date(newDeliveryDate).toLocaleDateString()}</strong>.`);
                        }

                        if (updates.length > 0) {
                            sendOrderDetailsUpdated({
                                userId: order.user_id,
                                customerEmail,
                                customerName: customerProfile.contact_name || 'Customer',
                                orderId: order.id,
                                updates,
                                deliveryDate: newDeliveryDate || undefined,
                                items: orderItems,
                                orderTotal: order.total,
                                deliveryPrice: order.delivery_price,
                            }).catch(err => console.error('[Order Status] Update email error:', err));
                        }
                    }
                } else {
                    console.warn('[Order Status] No email found for user:', order.user_id);
                }
            }
        }

        return NextResponse.json({ order, success: true });
    } catch (err) {
        console.error('[Order Status] Unexpected error:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}

