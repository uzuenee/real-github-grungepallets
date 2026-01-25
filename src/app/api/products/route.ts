import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WHOLESALE_PRODUCTS } from '@/lib/wholesale-products';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const inStock = searchParams.get('in_stock');

        // Fetch products without join (to avoid schema cache issues)
        let query = supabase.from('products').select('*');

        if (category && category !== 'all') {
            query = query.eq('category_id', category);
        }

        if (inStock === 'true') {
            query = query.eq('in_stock', true);
        }

        const { data: products, error } = await query.order('sort_order', { ascending: true });

        if (error) {
            console.error('Error fetching products:', error);
            // Fallback to static products with mapped structure
            let fallbackProducts = WHOLESALE_PRODUCTS.map((p, index) => ({
                id: p.id,
                name: p.name,
                category_id: p.category,
                size: p.size,
                dimensions: p.dimensions,
                price: p.price,
                in_stock: p.inStock,
                is_heat_treated: p.isHeatTreated,
                is_protected: p.id === 'custom-pallet',
                sort_order: index,
            }));

            // Apply filters to fallback data
            if (category && category !== 'all') {
                fallbackProducts = fallbackProducts.filter(p => p.category_id === category);
            }
            if (inStock === 'true') {
                fallbackProducts = fallbackProducts.filter(p => p.in_stock);
            }

            return NextResponse.json({ products: fallbackProducts, source: 'fallback' });
        }

        return NextResponse.json({ products, source: 'database' });
    } catch (error) {
        const isDynamicServerUsageError =
            typeof error === 'object' &&
            error !== null &&
            'digest' in error &&
            (error as { digest?: unknown }).digest === 'DYNAMIC_SERVER_USAGE';

        if (!isDynamicServerUsageError) {
            console.error('Products API error:', error);
        }
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}
