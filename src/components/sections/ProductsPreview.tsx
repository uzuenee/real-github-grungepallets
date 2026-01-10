import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { PRODUCTS_PREVIEW } from '@/lib/constants';

export function ProductsPreview() {
    return (
        <section id="products" className="py-20 bg-light scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
                        Popular Products
                    </h2>
                    <p className="text-lg text-secondary-300 max-w-2xl mx-auto">
                        Grade A and B pallets ready for immediate delivery
                    </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PRODUCTS_PREVIEW.map((product) => (
                        <Card key={product.id} padding="none" className="overflow-hidden">
                            {/* Placeholder Image */}
                            <div className="aspect-square bg-secondary-50 flex flex-col items-center justify-center relative">
                                <Package size={48} className="text-secondary-200 mb-2" strokeWidth={1} />
                                <span className="text-secondary-300 text-sm">{product.dimensions}</span>
                                {product.isHeatTreated && (
                                    <div className="absolute top-3 right-3">
                                        <Badge variant="success">HT</Badge>
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-secondary mb-2">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-secondary-400 mb-4">
                                    {product.size} | {product.entryType}
                                </p>
                                <Link to={`/quote?product=${product.id}`}>
                                    <Button variant="outline" size="sm" className="w-full">
                                        Request Quote
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* View All Link */}
                <div className="text-center mt-12">
                    <Link to="/products">
                        <Button variant="secondary" size="lg">
                            View All Products
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}