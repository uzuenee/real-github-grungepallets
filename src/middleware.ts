import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
    const { response, user, supabase } = await updateSession(request);

    const pathname = request.nextUrl.pathname;

    // Pending approval page - allow authenticated but unapproved users
    if (pathname === '/pending-approval') {
        if (!user) {
            return Response.redirect(new URL('/login', request.url));
        }
        // Let them access the page - the page itself will redirect if approved
        return response;
    }

    // Protected routes - require authentication AND approval
    if (pathname.startsWith('/portal')) {
        if (!user) {
            return Response.redirect(new URL('/login', request.url));
        }

        // Check if user is approved
        const { data: profile } = await supabase
            .from('profiles')
            .select('approved, is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.approved) {
            return Response.redirect(new URL('/pending-approval', request.url));
        }
    }

    // Admin routes - require admin role (admins are also approved by default)
    if (pathname.startsWith('/admin')) {
        if (!user) {
            return Response.redirect(new URL('/login', request.url));
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin, approved')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            // If approved but not admin, go to portal
            if (profile?.approved) {
                return Response.redirect(new URL('/portal', request.url));
            }
            // If not approved, go to pending
            return Response.redirect(new URL('/pending-approval', request.url));
        }
    }

    // Redirect logged-in users away from auth pages
    if (pathname === '/login' || pathname === '/signup') {
        if (user) {
            // Check if user is approved before redirecting to portal
            const { data: profile } = await supabase
                .from('profiles')
                .select('approved')
                .eq('id', user.id)
                .single();

            if (profile?.approved) {
                return Response.redirect(new URL('/portal', request.url));
            } else {
                return Response.redirect(new URL('/pending-approval', request.url));
            }
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/portal/:path*',
        '/admin/:path*',
        '/login',
        '/signup',
        '/pending-approval',
    ],
};
