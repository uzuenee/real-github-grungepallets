import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderStatusUpdateEmail } from '@/lib/email';

// Admin-only endpoint to update order status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();

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

        // Get user email for notification
        if (order && status) {
            const { data: orderUser } = await supabase.auth.admin.getUserById(order.user_id);
            const customerEmail = orderUser?.user?.email;

            if (customerEmail) {
                const customerName = order.profiles?.contact_name || order.profiles?.company_name || 'Customer';

                // Send status update email
                sendOrderStatusUpdateEmail({
                    customerEmail,
                    customerName,
                    orderId: order.id,
                    status,
                    deliveryDate: order.delivery_date,
                }).catch(console.error);
            }
        }

        // Trigger n8n webhook for status update notification
        const webhookUrl = process.env.N8N_STATUS_WEBHOOK;
        if (webhookUrl && order) {
            fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: order.id,
                    new_status: status,
                    delivery_date,
                    customer: order.profiles,
                }),
            }).catch(console.error);
        }

        return NextResponse.json({ order, success: true });
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
