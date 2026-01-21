import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get all pickups with user profiles (admin only)
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Fetch all pickups with user profiles
        const { data: pickups, error } = await supabase
            .from('pickups')
            .select(`
                *,
                profiles:user_id (
                    company_name,
                    contact_name,
                    phone,
                    address,
                    city,
                    state,
                    zip
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching admin pickups:', error);
            return NextResponse.json({ error: 'Failed to fetch pickups' }, { status: 500 });
        }

        return NextResponse.json({ pickups });
    } catch (error) {
        console.error('Admin pickups API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
