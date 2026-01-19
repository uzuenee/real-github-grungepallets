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

    console.log('Admin order detail - fetching order:', orderId);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.log('Auth error:', authError);
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
        console.log('User is not admin');
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
                unit_price
            )
        `)
        .eq('id', orderId)
        .single();

    if (orderError) {
        console.error('Order fetch error:', orderError);
        return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    if (!order) {
        console.log('Order not found for id:', orderId);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get the customer profile separately
    console.log('Fetching profile for user_id:', order.user_id);
    const { data: customerProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, company_name, contact_name, phone, address, city, state, zip')
        .eq('id', order.user_id)
        .single();

    console.log('Profile query result:', customerProfile, 'Error:', profileError);

    // Combine order with profiles
    const orderWithProfile = {
        ...order,
        profiles: customerProfile || {}
    };

    console.log('Returning order:', orderWithProfile);
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

        // Get customer info for email notification
        // Note: email is NOT in profiles table, get from auth.users via admin API
        const { data: profile } = await adminClient
            .from('profiles')
            .select('contact_name')
            .eq('id', updatedOrder.user_id)
            .single();

        const { data: authUser } = await adminClient.auth.admin.getUserById(updatedOrder.user_id);
        const customerEmail = authUser?.user?.email;

        if (customerEmail) {
            // Send status update email (don't block on this)
            sendOrderStatusUpdate({
                userId: updatedOrder.user_id,
                customerEmail: customerEmail,
                customerName: profile?.contact_name || 'Customer',
                orderId: orderId,
                newStatus: status,
                deliveryDate: delivery_date,
            }).catch(err => console.error('[Admin Orders] Email error:', err));
        }

        console.log(`[Admin Orders] Order ${orderId} status updated to ${status}`);
        return NextResponse.json({ order: updatedOrder, success: true });
    } catch (err) {
        console.error('Order status update error:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
