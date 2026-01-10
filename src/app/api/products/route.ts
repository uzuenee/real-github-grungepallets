import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = createClient();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const inStock = searchParams.get('in_stock');

    let query = supabase.from('products').select('*');

    if (category && category !== 'all') {
        query = query.eq('category', category);
    }

    if (inStock === 'true') {
        query = query.eq('in_stock', true);
    }

    const { data: products, error } = await query.order('name');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products });
}
