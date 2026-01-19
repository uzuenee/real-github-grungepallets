import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmation, sendAdminNewOrderNotification } from '@/lib/email';

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

        // Send email notifications (don't block on this)
        // Note: email is NOT in profiles table, it's in auth.users (available via user.email)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('contact_name, company_name')
            .eq('id', user.id)
            .single();

        console.log('[Orders API] Profile fetch result:', { profile, profileError, userEmail: user.email });

        if (profile) {
            // Use the email from the auth user, not from profiles
            const customerEmail = user.email || '';
            console.log('[Orders API] Sending order confirmation to:', customerEmail);

            // Send order confirmation to customer
            sendOrderConfirmation({
                userId: user.id,
                customerEmail: customerEmail,
                customerName: profile.contact_name || 'Customer',
                orderId: order.id,
                orderTotal: total,
                items: orderItems.map(item => ({
                    product_name: item.product_name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                })),
            }).then(result => {
                console.log('[Orders API] Order confirmation email result:', result);
            }).catch(err => console.error('[Orders API] Email error:', err));

            // Send admin notification
            sendAdminNewOrderNotification({
                orderId: order.id,
                customerName: profile.contact_name || 'Customer',
                companyName: profile.company_name || 'Unknown',
                orderTotal: total,
                items: orderItems.map(item => ({
                    product_name: item.product_name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                })),
            }).then(result => {
                console.log('[Orders API] Admin notification result:', result);
            }).catch(err => console.error('[Orders API] Admin email error:', err));
        } else {
            console.warn('[Orders API] No profile found, skipping email notifications');
        }

        return NextResponse.json({ order, success: true });
    } catch (err) {
        console.error('[Orders API] Unexpected error:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}

