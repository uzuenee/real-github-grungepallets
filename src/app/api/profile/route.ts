import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { enforceMaxContentLength } from '@/lib/security/requestGuards';
import { rateLimit } from '@/lib/security/rateLimit';

export async function GET() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile });
}

export async function PATCH(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tooLarge = enforceMaxContentLength(request, 32 * 1024);
        if (tooLarge) return tooLarge;

        const limited = rateLimit(`profile:update:${user.id}`, { limit: 20, windowMs: 60_000 });
        if (!limited.allowed) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: limited.headers });
        }

        const body = await request.json();

        // Only allow updating specific fields
        const allowedFields = [
            'company_name',
            'contact_name',
            'phone',
            'address',
            'city',
            'state',
            'zip'
        ];

        const updates: Record<string, string> = {};
        for (const field of allowedFields) {
            if (field in body) {
                updates[field] = body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ profile, success: true });
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
