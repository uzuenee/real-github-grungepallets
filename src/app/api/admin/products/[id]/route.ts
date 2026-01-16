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

// GET single product
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const adminCheck = await checkAdmin(supabase);
        if (adminCheck) {
            return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
        }

        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Admin product GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH - Update product
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

        if (body.name !== undefined) updates.name = body.name;
        if (body.category_id !== undefined) {
            updates.category_id = body.category_id;
            updates.category = body.category_id;  // Keep both columns in sync
        }
        if (body.size !== undefined) updates.size = body.size;
        if (body.dimensions !== undefined) updates.dimensions = body.dimensions;
        if (body.price !== undefined) updates.price = body.price;
        if (body.in_stock !== undefined) updates.in_stock = body.in_stock;
        if (body.is_heat_treated !== undefined) updates.is_heat_treated = body.is_heat_treated;
        if (body.is_protected !== undefined) updates.is_protected = body.is_protected;
        if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
        if (body.image_url !== undefined) updates.image_url = body.image_url;

        const { data: product, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Admin product PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const adminCheck = await checkAdmin(supabase);
        if (adminCheck) {
            return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
        }

        // Check if product is protected
        const { data: product } = await supabase
            .from('products')
            .select('is_protected, name')
            .eq('id', id)
            .single();

        if (product?.is_protected) {
            return NextResponse.json(
                { error: `Cannot delete protected product: ${product.name}` },
                { status: 400 }
            );
        }

        // Check if product has been used in orders
        const { count } = await supabase
            .from('order_items')
            .select('id', { count: 'exact', head: true })
            .eq('product_id', id);

        if (count && count > 0) {
            return NextResponse.json(
                { error: `Cannot delete product: it has been used in ${count} order(s). Consider marking it out of stock instead.` },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin product DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
