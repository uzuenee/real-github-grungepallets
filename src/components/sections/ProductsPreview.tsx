'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Loader2 } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';

interface Product {
    id: string;
    name: string;
    size: string;
    dimensions: string;
    is_heat_treated: boolean;
    image_url?: string;
}

export function ProductsPreview() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products?in_stock=true');
                if (response.ok) {
                    const data = await response.json();
                    // Sort A-Z and get first 4 products for preview
                    const sorted = (data.products || []).sort((a: Product, b: Product) => a.name.localeCompare(b.name));
                    setProducts(sorted.slice(0, 4));
                }
            } catch (err) {
                console.error('Failed to fetch products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

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

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                )}

                {/* Products Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Card key={product.id} padding="none" className="overflow-hidden">
                                {/* Product Image */}
                                <div className="aspect-square bg-secondary-50 flex flex-col items-center justify-center relative">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <>
                                            <Package size={48} className="text-secondary-200 mb-2" strokeWidth={1} />
                                            <span className="text-secondary-300 text-sm">{product.dimensions}</span>
                                        </>
                                    )}
                                    {product.is_heat_treated && (
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
                                        {product.size} | {product.dimensions}
                                    </p>
                                    <Link href={`/quote?product=${product.id}`}>
                                        <Button variant="outline" size="sm" className="w-full">
                                            Request Quote
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* View All Link */}
                <div className="text-center mt-12">
                    <Link href="/quote">
                        <Button variant="secondary" size="lg">
                            View All Products
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}