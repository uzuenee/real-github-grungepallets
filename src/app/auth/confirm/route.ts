import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { safeRedirectPath } from '@/lib/security/safeRedirect';
import { sendAdminNewUserNotification } from '@/lib/email';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const defaultNext = type === 'signup' ? '/pending-approval' : '/';
    const next = safeRedirectPath(searchParams.get('next') ?? defaultNext, defaultNext);

    if (token_hash && type) {
        const supabase = await createClient();

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        });

        if (!error) {
            // For password recovery, redirect to reset password page
            if (type === 'recovery') {
                return NextResponse.redirect(`${origin}/reset-password?recovery=1`);
            }

            // For signup confirmation, notify admin that a new user is awaiting approval
            if (type === 'signup') {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const userMetadata = (user.user_metadata || {}) as Record<string, unknown>;

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('approved, contact_name, company_name')
                        .eq('id', user.id)
                        .single();

                    if (profile && !profile.approved) {
                        const fallbackName = typeof userMetadata.contact_name === 'string' ? userMetadata.contact_name : '';
                        const fallbackCompany = typeof userMetadata.company_name === 'string' ? userMetadata.company_name : '';

                        sendAdminNewUserNotification({
                            userName: profile.contact_name || fallbackName || 'New User',
                            userEmail: user.email || '',
                            companyName: profile.company_name || fallbackCompany || 'Unknown Company',
                        }).catch(err => console.error('[Auth Confirm] Admin notification error:', err));
                    }
                }
            }

            // For email confirmation, redirect to the next page or portal
            return NextResponse.redirect(`${origin}${next}`);
        }

        console.error('[Auth Confirm] OTP verification failed:', error.message);
    }

    // If something went wrong, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=verification_failed`);
}
