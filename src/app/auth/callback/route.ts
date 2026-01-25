import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendAdminNewUserNotification } from '@/lib/email';
import { safeRedirectPath } from '@/lib/security/safeRedirect';

function getRecentConfirmationTimestamp(user: { email_confirmed_at?: string | null; confirmed_at?: string | null } | null): number | null {
    const value = user?.email_confirmed_at || user?.confirmed_at;
    if (!value) return null;

    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function wasRecentlyConfirmed(user: { email_confirmed_at?: string | null; confirmed_at?: string | null } | null, maxAgeMs = 15 * 60 * 1000): boolean {
    const confirmedAtMs = getRecentConfirmationTimestamp(user);
    if (!confirmedAtMs) return false;

    const ageMs = Date.now() - confirmedAtMs;
    return ageMs >= 0 && ageMs <= maxAgeMs;
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const rawNext = searchParams.get('next') || '/portal';
    const next = safeRedirectPath(rawNext, '/portal');

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // If there's a next parameter (like /reset-password), redirect there
            if (next && next !== '/portal') {
                return NextResponse.redirect(`${origin}${next}`);
            }

            // Check if user is approved
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const userMetadata = (user.user_metadata || {}) as Record<string, unknown>;
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('approved, is_admin, contact_name, company_name')
                    .eq('id', user.id)
                    .single();

                // If not yet approved (new user), send admin notification
                if (profile && !profile.approved && wasRecentlyConfirmed(user)) {
                    const fallbackName = typeof userMetadata.contact_name === 'string' ? userMetadata.contact_name : '';
                    const fallbackCompany = typeof userMetadata.company_name === 'string' ? userMetadata.company_name : '';

                    sendAdminNewUserNotification({
                        userName: profile.contact_name || fallbackName || 'New User',
                        userEmail: user.email || '',
                        companyName: profile.company_name || fallbackCompany || 'Unknown Company',
                    }).catch(err => console.error('[Auth Callback] Admin notification error:', err));
                }

                // If approved, redirect to portal; otherwise to pending-approval
                if (profile?.approved) {
                    return NextResponse.redirect(`${origin}/portal`);
                } else {
                    return NextResponse.redirect(`${origin}/pending-approval`);
                }
            }
        } else {
            console.error('[Auth Callback] Code exchange error:', error.message);
            // For password reset, redirect to forgot-password with error
            if (next === '/reset-password') {
                return NextResponse.redirect(`${origin}/forgot-password?error=link_expired`);
            }
        }
    }

    // If something went wrong, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
