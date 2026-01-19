import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendAdminNewUserNotification } from '@/lib/email';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') || '/portal';

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
                // Note: email is NOT in profiles table, use user.email from auth
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('approved, is_admin, contact_name, company_name')
                    .eq('id', user.id)
                    .single();

                // If not yet approved (new user), send admin notification
                if (profile && !profile.approved) {
                    sendAdminNewUserNotification({
                        userName: profile.contact_name || 'New User',
                        userEmail: user.email || '',
                        companyName: profile.company_name || 'Unknown Company',
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
