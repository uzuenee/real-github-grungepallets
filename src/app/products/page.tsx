'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout';
import { PageHero, ProductFilters, ProductGrid, CtaBanner } from '@/components/sections';
import { Loader2 } from 'lucide-react';

// Database types
interface DbProduct {
    id: string;
    name: string;
    category_id: string;
    size: string;
    dimensions: string;
    is_heat_treated: boolean;
    image_url?: string;
    category_label?: string;
}

interface Category {
    id: string;
    label: string;
}

export default function ProductsPage() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [products, setProducts] = useState<DbProduct[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/categories'),
                ]);

                const productsData = await productsRes.json();
                const categoriesData = await categoriesRes.json();

                const dbProducts: DbProduct[] = productsData.products || [];
                const dbCategories: Category[] = categoriesData.categories || [];

                // Add category label to each product
                const productsWithLabels = dbProducts.map(p => {
                    const cat = dbCategories.find(c => c.id === p.category_id);
                    return {
                        ...p,
                        category_label: cat?.label,
                    };
                });

                // Sort A-Z but keep "Custom" products at the end
                const sortedProducts = productsWithLabels.sort((a, b) => {
                    const aIsCustom = a.name.toLowerCase().includes('custom');
                    const bIsCustom = b.name.toLowerCase().includes('custom');

                    if (aIsCustom && !bIsCustom) return 1;
                    if (!aIsCustom && bIsCustom) return -1;
                    return a.name.localeCompare(b.name);
                });

                setProducts(sortedProducts);
                setCategories(dbCategories);
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <MainLayout>
                <PageHero
                    title="Our Products"
                    subtitle="Quality pallets for every application"
                />
                <div className="flex items-center justify-center py-20 bg-light">
                    <div className="text-center">
                        <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
                        <p className="text-secondary-400">Loading products...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <PageHero
                    title="Our Products"
                    subtitle="Quality pallets for every application"
                />
                <div className="text-center py-20 bg-light">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-primary hover:underline"
                    >
                        Try again
                    </button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <PageHero
                title="Our Products"
                subtitle="Quality pallets for every application"
            />
            <ProductFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                categories={categories}
            />
            <ProductGrid products={products} filter={activeFilter} />
            <CtaBanner />
        </MainLayout>
    );
}
