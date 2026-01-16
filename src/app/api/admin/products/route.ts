import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// GET all products (admin view)
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

        // Fetch products without join to avoid schema cache issues
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Admin products GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new product
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
        const {
            name,
            category_id,
            size,
            dimensions,
            price,
            in_stock,
            is_heat_treated,
            is_protected,
            sort_order,
            image_url
        } = body;

        if (!name || !category_id || !size || !dimensions) {
            return NextResponse.json(
                { error: 'Name, category, size, and dimensions are required' },
                { status: 400 }
            );
        }

        // Let Supabase auto-generate the UUID
        const { data: product, error } = await supabase
            .from('products')
            .insert({
                name,
                category: category_id,  // Original column (NOT NULL)
                category_id,            // New column for FK relationship
                size,
                dimensions,
                price: price || 0,
                in_stock: in_stock !== false,
                is_heat_treated: is_heat_treated || false,
                is_protected: is_protected || false,
                sort_order: sort_order || 0,
                image_url: image_url || null,
            })
            .select('*')
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Product ID already exists' }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ product }, { status: 201 });
    } catch (error) {
        console.error('Admin products POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
