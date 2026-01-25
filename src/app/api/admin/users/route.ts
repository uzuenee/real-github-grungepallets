import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin using admin client to bypass RLS
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all profiles (use admin client to bypass RLS)
    const { data: users, error } = await adminClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Admin users fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Attach auth.users emails (not stored in profiles)
    const emailByUserId = new Map<string, string | null>();
    const emailVerifiedByUserId = new Map<string, boolean>();
    const perPage = 1000;
    for (let page = 1; page <= 10; page++) {
        const { data, error: listError } = await adminClient.auth.admin.listUsers({ page, perPage });
        if (listError) {
            console.error('Admin users listUsers error:', listError);
            break;
        }
        for (const authUser of data.users) {
            emailByUserId.set(authUser.id, authUser.email ?? null);
            const confirmedAt = authUser.email_confirmed_at || authUser.confirmed_at;
            emailVerifiedByUserId.set(authUser.id, Boolean(confirmedAt));
        }
        if (data.users.length < perPage) break;
    }

    const usersWithEmail = (users || []).map((u) => ({
        ...u,
        email: emailByUserId.get(u.id) ?? null,
        email_verified: emailVerifiedByUserId.get(u.id) ?? false,
    }));

    return NextResponse.json({ users: usersWithEmail });
}
