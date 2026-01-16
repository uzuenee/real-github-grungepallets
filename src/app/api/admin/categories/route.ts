import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// GET all categories (admin view, includes inactive)
export async function GET() {
    try {
        const supabase = await createClient();

        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use admin client to bypass RLS for profile check
        const adminClient = createAdminClient();
        const { data: profile } = await adminClient
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Admin categories GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new category
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use admin client to bypass RLS for profile check
        const adminClient = createAdminClient();
        const { data: profile } = await adminClient
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { id, label, description, color_class, sort_order, is_active } = body;

        if (!id || !label) {
            return NextResponse.json({ error: 'ID and label are required' }, { status: 400 });
        }

        const { data: category, error } = await supabase
            .from('categories')
            .insert({
                id,
                label,
                description: description || null,
                color_class: color_class || 'bg-secondary-100 text-secondary-700 border-secondary-200',
                sort_order: sort_order || 0,
                is_active: is_active !== false,
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Category ID already exists' }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ category }, { status: 201 });
    } catch (error) {
        console.error('Admin categories POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
