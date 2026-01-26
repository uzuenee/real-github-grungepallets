import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendPickupConfirmationEmail, sendAdminPickupNotification } from '@/lib/email';
import { enforceMaxContentLength } from '@/lib/security/requestGuards';
import { rateLimit } from '@/lib/security/rateLimit';

// GET - List pickups (users see their own, admins see all via /api/admin/pickups)
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: pickups, error } = await supabase
            .from('pickups')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching pickups:', error);
            return NextResponse.json({ error: 'Failed to fetch pickups' }, { status: 500 });
        }

        return NextResponse.json({ pickups });
    } catch (error) {
        console.error('Pickups API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new pickup request
export async function POST(request: NextRequest) {
    try {
        const tooLarge = enforceMaxContentLength(request, 96 * 1024);
        if (tooLarge) return tooLarge;

        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const limited = rateLimit(`pickups:create:${user.id}`, { limit: 10, windowMs: 60_000 });
        if (!limited.allowed) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: limited.headers });
        }

        const body = await request.json();
        const {
            pallet_condition,
            estimated_quantity,
            pickup_address,
            pickup_city,
            pickup_state,
            pickup_zip,
            preferred_date,
            notes,
        } = body;

        // Validate required fields
        if (!pallet_condition || !estimated_quantity || !pickup_address) {
            return NextResponse.json(
                { error: 'Missing required fields: pallet_condition, estimated_quantity, pickup_address' },
                { status: 400 }
            );
        }

        const qty = Number.parseInt(String(estimated_quantity), 10);
        if (!Number.isFinite(qty) || qty < 1 || qty > 100000) {
            return NextResponse.json({ error: 'Estimated quantity must be between 1 and 100,000' }, { status: 400 });
        }

        if (notes && String(notes).length > 2000) {
            return NextResponse.json({ error: 'Notes too long' }, { status: 400 });
        }

        if (pickup_address && String(pickup_address).length > 200) {
            return NextResponse.json({ error: 'Pickup address too long' }, { status: 400 });
        }

        // Get user profile for email content
        const { data: profile } = await supabase
            .from('profiles')
            .select('company_name, contact_name, phone')
            .eq('id', user.id)
            .single();

        // Create pickup
        const { data: pickup, error } = await supabase
            .from('pickups')
            .insert({
                user_id: user.id,
                pallet_condition,
                estimated_quantity: qty,
                pickup_address,
                pickup_city,
                pickup_state,
                pickup_zip,
                preferred_date: preferred_date || null,
                notes: notes || null,
                status: 'pending',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating pickup:', error);
            return NextResponse.json({ error: 'Failed to create pickup' }, { status: 500 });
        }

        // Build full address string
        const fullAddress = [pickup_address, pickup_city, pickup_state, pickup_zip]
            .filter(Boolean)
            .join(', ');

        const emailJobs = [
            {
                label: 'customer-confirmation',
                promise: sendPickupConfirmationEmail({
                    customerEmail: user.email || '',
                    customerName: profile?.contact_name || 'Customer',
                    pickupId: pickup.id,
                    palletCondition: pallet_condition,
                    estimatedQuantity: qty,
                    pickupAddress: fullAddress,
                    preferredDate: preferred_date,
                }),
            },
            {
                label: 'admin-new-pickup',
                promise: sendAdminPickupNotification({
                    customerName: profile?.contact_name || 'Customer',
                    customerEmail: user.email || '',
                    customerPhone: profile?.phone,
                    companyName: profile?.company_name,
                    pickupId: pickup.id,
                    palletCondition: pallet_condition,
                    estimatedQuantity: qty,
                    pickupAddress: fullAddress,
                    preferredDate: preferred_date,
                    notes,
                }),
            },
        ];

        const results = await Promise.allSettled(emailJobs.map((job) => job.promise));
        results.forEach((result, index) => {
            const label = emailJobs[index]?.label || `job-${index}`;

            if (result.status === 'rejected') {
                console.error('[Pickup] Email job threw:', label, result.reason);
                return;
            }

            if (!result.value.success) {
                console.error('[Pickup] Email send failed:', { label, error: result.value.error || '' });
            }
        });

        return NextResponse.json({ pickup }, { status: 201 });
    } catch (error) {
        console.error('Create pickup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
