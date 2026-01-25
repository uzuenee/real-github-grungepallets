import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { enforceMaxContentLength } from '@/lib/security/requestGuards';
import { rateLimit } from '@/lib/security/rateLimit';

// Change password endpoint
export async function POST(request: NextRequest) {
    const tooLarge = enforceMaxContentLength(request, 16 * 1024);
    if (tooLarge) return tooLarge;

    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const limited = rateLimit(`profile:password:${user.id}`, { limit: 5, windowMs: 60_000 });
        if (!limited.allowed) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: limited.headers });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Current password and new password are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'New password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Verify current password by attempting to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: currentPassword,
        });

        if (signInError) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 400 }
            );
        }

        // Update to new password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (updateError) {
            console.error('[Password Change] Error:', updateError);
            return NextResponse.json(
                { error: updateError.message || 'Failed to update password' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error('[Password Change] Unexpected error:', err);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
