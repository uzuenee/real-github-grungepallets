import { ProductCard } from '@/components/ui/ProductCard';

// Database product type
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

interface ProductGridProps {
    products: DbProduct[];
    filter: string;
}

export function ProductGrid({ products, filter }: ProductGridProps) {
    const filteredProducts = filter === 'all'
        ? products
        : filter === 'heat-treated'
            ? products.filter(p => p.is_heat_treated)
            : products.filter(p => p.category_id === filter);

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