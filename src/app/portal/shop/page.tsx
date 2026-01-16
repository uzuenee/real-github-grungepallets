'use client';

import { useState, useEffect, useMemo } from 'react';
import { PortalLayout } from '@/components/layout';
import { PortalProductCard, CartPreview } from '@/components/portal';
import { SlidersHorizontal, Search, Loader2 } from 'lucide-react';
import { CartProvider } from '@/lib/contexts/CartContext';
import {
    ShopFilterProvider,
    useShopFilter,
    sortOptions,
    SortOption,
} from '@/lib/contexts/ShopFilterContext';
import { Product, Category } from '@/lib/supabase/types';

// Transform database product to card-compatible format
interface CardProduct {
    id: string;
    name: string;
    size: string;
    dimensions: string;
    price: number;
    inStock: boolean;
    isHeatTreated: boolean;
    category: string;
    categoryLabel?: string;
    categoryColor?: string;
    imageUrl?: string;
}

function transformProduct(p: Product, categories: Category[]): CardProduct {
    const cat = categories.find(c => c.id === p.category_id);
    return {
        id: p.id,
        name: p.name,
        size: p.size,
        dimensions: p.dimensions,
        price: Number(p.price),
        inStock: p.in_stock,
        isHeatTreated: p.is_heat_treated,
        category: p.category_id,
        categoryLabel: cat?.label,
        categoryColor: cat?.color_class,
        imageUrl: p.image_url,
    };
}

function ShopContent() {
    const { search, setSearch, category, setCategory, sort, setSort, heatTreatedOnly } = useShopFilter();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch products and categories from API
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

                setProducts(productsData.products || []);
                setCategories(categoriesData.categories || []);
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Build category filter options from database
    const categoryOptions = useMemo(() => {
        return [
            { id: 'all', label: 'All Products' },
            ...categories.map(c => ({ id: c.id, label: c.label })),
        ];
    }, [categories]);

    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchLower) ||
                p.size.toLowerCase().includes(searchLower)
            );
        }

        // Category filter
        if (category !== 'all') {
            result = result.filter(p => p.category_id === category);
        }

        // Heat treated filter
        if (heatTreatedOnly) {
            result = result.filter(p => p.is_heat_treated);
        }

        // Sort
        switch (sort) {
            case 'category':
                result.sort((a, b) => a.category_id.localeCompare(b.category_id));
                break;
            case 'price-asc':
                result.sort((a, b) => Number(a.price) - Number(b.price));
                break;
            case 'price-desc':
                result.sort((a, b) => Number(b.price) - Number(a.price));
                break;
            case 'name':
            default:
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        return result;
    }, [products, search, category, sort, heatTreatedOnly]);

    if (loading) {
        return (
            <PortalLayout>
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
                        <p className="text-secondary-400">Loading products...</p>
                    </div>
                </div>
            </PortalLayout>
        );
    }

    if (error) {
        return (
            <PortalLayout>
                <div className="text-center py-20">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-primary hover:underline"
                    >
                        Try again
                    </button>
                </div>
            </PortalLayout>
        );
    }

    return (
        <PortalLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-secondary">Shop Catalog</h1>
                <p className="text-secondary-400 mt-1">
                    Browse our wholesale pallet inventory
                </p>
            </div>

            {/* Mobile Filters */}
            <div className="lg:hidden mb-6">
                <details className="group">
                    <summary className="flex items-center gap-2 text-secondary-500 font-medium cursor-pointer list-none">
                        <SlidersHorizontal size={18} />
                        <span>Filters & Sort</span>
                        <span className="ml-auto text-xs text-secondary-400 group-open:hidden">Tap to expand</span>
                    </summary>

                    <div className="mt-4 p-4 bg-white rounded-lg border border-secondary-100 space-y-4">
                        {/* Mobile Search */}
                        <div>
                            <label className="text-sm font-medium text-secondary-500 mb-2 block">Search</label>
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-300" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                />
                            </div>
                        </div>

                        {/* Mobile Category Pills */}
                        <div>
                            <label className="text-sm font-medium text-secondary-500 mb-2 block">Category</label>
                            <div className="flex flex-wrap gap-2">
                                {categoryOptions.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(cat.id as typeof category)}
                                        className={`
                                            px-3 py-1.5 rounded-full text-sm transition-colors
                                            ${category === cat.id
                                                ? 'bg-primary text-white'
                                                : 'bg-secondary-50 text-secondary-500'
                                            }
                                        `}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Sort */}
                        <div>
                            <label className="text-sm font-medium text-secondary-500 mb-2 block">Sort By</label>
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value as SortOption)}
                                className="w-full px-3 py-2 rounded-lg border border-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                {sortOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </details>
            </div>

            {/* Products Grid */}
            <div>
                {/* Results Count */}
                <p className="text-secondary-400 mb-6">
                    <span className="font-semibold text-secondary">{filteredProducts.length}</span> products available
                </p>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                            <PortalProductCard key={product.id} product={transformProduct(product, categories)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-secondary-400">No products found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Floating Cart Preview */}
            <CartPreview />
        </PortalLayout>
    );
}

export default function PortalShopPage() {
    return (
        <CartProvider>
            <ShopFilterProvider>
                <ShopContent />
            </ShopFilterProvider>
        </CartProvider>
    );
}
