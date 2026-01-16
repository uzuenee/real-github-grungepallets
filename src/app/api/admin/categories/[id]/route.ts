import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// Helper to check admin
async function checkAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized', status: 401 };

    // Use admin client to bypass RLS for profile check
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) return { error: 'Forbidden', status: 403 };
    return null;
}

// GET single category
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const adminCheck = await checkAdmin(supabase);
        if (adminCheck) {
            return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
        }

        const { data: category, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json({ category });
    } catch (error) {
        console.error('Admin category GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH - Update category
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const adminCheck = await checkAdmin(supabase);
        if (adminCheck) {
            return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
        }

        const body = await request.json();
        const updates: Record<string, unknown> = {};

        if (body.label !== undefined) updates.label = body.label;
        if (body.description !== undefined) updates.description = body.description;
        if (body.color_class !== undefined) updates.color_class = body.color_class;
        if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
        if (body.is_active !== undefined) updates.is_active = body.is_active;

        const { data: category, error } = await supabase
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ category });
    } catch (error) {
        console.error('Admin category PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE category
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const adminCheck = await checkAdmin(supabase);
        if (adminCheck) {
            return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
        }

        // Check if category has products
        const { count } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', id);

        if (count && count > 0) {
            return NextResponse.json(
                { error: `Cannot delete category: ${count} products are using this category` },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin category DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
