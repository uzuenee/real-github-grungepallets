import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmation, sendAdminNewOrderNotification } from '@/lib/email';
import { enforceMaxContentLength } from '@/lib/security/requestGuards';
import { rateLimit } from '@/lib/security/rateLimit';

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
    let supabase;
    try {
        const tooLarge = enforceMaxContentLength(request, 128 * 1024);
        if (tooLarge) return tooLarge;

        supabase = await createClient();
    } catch (err) {
        console.error('[Orders API] Failed to create Supabase client:', err);
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const limited = rateLimit(`orders:create:${user.id}`, { limit: 10, windowMs: 60_000 });
        if (!limited.allowed) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: limited.headers });
        }

        const body = await request.json();
        const { items, total, delivery_notes } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'No items provided' }, { status: 400 });
        }

        if (items.length > 50) {
            return NextResponse.json({ error: 'Too many items' }, { status: 400 });
        }

        if (delivery_notes && String(delivery_notes).length > 2000) {
            return NextResponse.json({ error: 'Delivery notes too long' }, { status: 400 });
        }

        const parsedTotal = typeof total === 'number' ? total : Number.parseFloat(String(total));
        if (!Number.isFinite(parsedTotal) || parsedTotal < 0 || parsedTotal > 10_000_000) {
            return NextResponse.json({ error: 'Invalid total' }, { status: 400 });
        }

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                status: 'pending',
                total: parsedTotal,
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
        }) => {
            const productId = String(item.productId || '').trim();
            const productName = String(item.productName || '').trim();
            const quantity = Number(item.quantity);
            const unitPrice = Number(item.price);

            if (!productId || productId.length > 128) throw new Error('Invalid productId');
            if (!productName || productName.length > 200) throw new Error('Invalid productName');
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) throw new Error('Invalid quantity');
            if (!Number.isFinite(unitPrice) || unitPrice < 0 || unitPrice > 1_000_000) throw new Error('Invalid price');

            const isCustom = Boolean(item.isCustom);
            const customSpecs = item.customSpecs
                ? {
                    length: String(item.customSpecs.length || '').slice(0, 32),
                    width: String(item.customSpecs.width || '').slice(0, 32),
                    height: item.customSpecs.height ? String(item.customSpecs.height).slice(0, 32) : undefined,
                    notes: item.customSpecs.notes ? String(item.customSpecs.notes).slice(0, 1000) : undefined,
                }
                : null;

            return {
                order_id: order.id,
                product_id: productId,
                product_name: productName,
                quantity,
                unit_price: unitPrice,
                is_custom: isCustom,
                custom_specs: customSpecs ? JSON.stringify(customSpecs) : null,
            };
        });

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            // Rollback order if items fail
            await supabase.from('orders').delete().eq('id', order.id);
            console.error('[Orders API] Order items error:', itemsError);
            return NextResponse.json({ error: itemsError.message }, { status: 500 });
        }

        // Send email notifications (don't block on this)
        // Note: email is NOT in profiles table, it's in auth.users (available via user.email)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('contact_name, company_name')
            .eq('id', user.id)
            .single();

        if (profile && !profileError) {
            // Use the email from the auth user, not from profiles
            const customerEmail = user.email || '';

            // Send order confirmation to customer
            sendOrderConfirmation({
                userId: user.id,
                customerEmail: customerEmail,
                customerName: profile.contact_name || 'Customer',
                orderId: order.id,
                orderTotal: parsedTotal,
                items: orderItems.map(item => ({
                    product_name: item.product_name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                })),
            }).catch(err => console.error('[Orders API] Email error:', err));

            // Send admin notification
            sendAdminNewOrderNotification({
                orderId: order.id,
                customerName: profile.contact_name || 'Customer',
                companyName: profile.company_name || 'Unknown',
                orderTotal: parsedTotal,
                items: orderItems.map(item => ({
                    product_name: item.product_name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                })),
            }).catch(err => console.error('[Orders API] Admin email error:', err));
        } else {
            console.warn('[Orders API] No profile found, skipping email notifications', { profileError });
        }

        return NextResponse.json({ order, success: true });
    } catch (err) {
        console.error('[Orders API] Unexpected error:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}

