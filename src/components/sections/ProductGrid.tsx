'use client';

import { ProductCard } from '@/components/ui/ProductCard';
import { Product } from '@/lib/types';

interface ProductGridProps {
    products: Product[];
    filter: string;
}

export function ProductGrid({ products, filter }: ProductGridProps) {
    const filteredProducts = filter === 'all'
        ? products
        : filter === 'heat-treated'
            ? products.filter(p => p.isHeatTreated)
            : products.filter(p => p.category === filter);

    return (
        <section className="py-16 bg-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Results count */}
                <p className="text-secondary-400 mb-8">
                    Showing <span className="font-semibold text-secondary">{filteredProducts.length}</span> products
                </p>

                {/* Product Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-secondary-400 text-lg">No products found for this category.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
