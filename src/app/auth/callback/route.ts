import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Check if user is approved
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('approved, is_admin')
                    .eq('id', user.id)
                    .single();

                // If approved, redirect to portal; otherwise to pending-approval
                if (profile?.approved) {
                    return NextResponse.redirect(`${origin}/portal`);
                } else {
                    return NextResponse.redirect(`${origin}/pending-approval`);
                }
            }
        }
    }

    // If something went wrong, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
