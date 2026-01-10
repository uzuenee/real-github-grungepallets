import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, sendNewOrderNotificationToAdmin } from '@/lib/email';

export async function GET() {
    const supabase = createClient();

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
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { items, total, delivery_notes } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'No items provided' }, { status: 400 });
        }

        // Get user profile for email
        const { data: profile } = await supabase
            .from('profiles')
            .select('company_name, contact_name')
            .eq('id', user.id)
            .single();

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
            return NextResponse.json({ error: itemsError.message }, { status: 500 });
        }

        // Check if order has custom items
        const hasCustomItems = items.some((item: { isCustom?: boolean }) => item.isCustom);

        // Send email notifications (non-blocking)
        const customerName = profile?.contact_name || profile?.company_name || 'Customer';
        const companyName = profile?.company_name || 'Customer';

        // Email to customer
        sendOrderConfirmationEmail({
            customerEmail: user.email || '',
            customerName,
            orderId: order.id,
            items: items.map((item: { productName: string; quantity: number; price: number; isCustom?: boolean }) => ({
                name: item.productName,
                quantity: item.quantity,
                price: item.price,
                isCustom: item.isCustom,
            })),
            total,
            hasCustomItems,
        }).catch(console.error);

        // Email to admin
        sendNewOrderNotificationToAdmin({
            orderId: order.id,
            companyName,
            customerEmail: user.email || '',
            total,
            itemCount: items.length,
            hasCustomItems,
        }).catch(console.error);

        // Trigger n8n webhook for new order notification (optional)
        const webhookUrl = process.env.N8N_ORDER_WEBHOOK;
        if (webhookUrl) {
            fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: order.id,
                    user_id: user.id,
                    total,
                    items: orderItems,
                }),
            }).catch(console.error);
        }

        return NextResponse.json({ order, success: true });
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
