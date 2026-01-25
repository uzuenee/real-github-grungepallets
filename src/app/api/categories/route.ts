import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Fetch categories from database
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error);
            // Fallback to static categories
            return NextResponse.json({
                categories: [
                    { id: 'grade-a', label: 'Grade A', color_class: 'bg-green-100 text-green-700 border-green-200', sort_order: 1 },
                    { id: 'grade-b', label: 'Grade B', color_class: 'bg-blue-100 text-blue-700 border-blue-200', sort_order: 2 },
                    { id: 'heat-treated', label: 'Heat Treated', color_class: 'bg-orange-100 text-orange-700 border-orange-200', sort_order: 3 },
                    { id: 'custom', label: 'Custom', color_class: 'bg-purple-100 text-purple-700 border-purple-200', sort_order: 4 },
                ],
                source: 'fallback'
            });
        }

        return NextResponse.json({ categories, source: 'database' });
    } catch (error) {
        const isDynamicServerUsageError =
            typeof error === 'object' &&
            error !== null &&
            'digest' in error &&
            (error as { digest?: unknown }).digest === 'DYNAMIC_SERVER_USAGE';

        if (!isDynamicServerUsageError) {
            console.error('Categories API error:', error);
        }
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}
