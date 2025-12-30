'use client';

import { useState } from 'react';
import { Package, ShoppingCart, Check } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { useCart } from '@/lib/contexts/CartContext';

interface PortalProduct {
    id: string;
    name: string;
    size: string;
    dimensions: string;
    price: number;
    inStock: boolean;
    isHeatTreated?: boolean;
}

interface PortalProductCardProps {
    product: PortalProduct;
}

export function PortalProductCard({ product }: PortalProductCardProps) {
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart(
            {
                productId: product.id,
                productName: product.name,
                price: product.price,
            },
            quantity
        );
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
        setQuantity(1);
    };

    return (
        <div className="bg-white rounded-xl border border-secondary-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
            {/* Product Image */}
            <div className="aspect-[4/3] bg-secondary-50 flex flex-col items-center justify-center relative">
                <Package size={48} className="text-secondary-200" strokeWidth={1} />
                <span className="text-secondary-300 text-sm mt-2">{product.dimensions}</span>

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {product.isHeatTreated && (
                        <Badge variant="success">HT</Badge>
                    )}
                    <Badge variant={product.inStock ? 'success' : 'warning'}>
                        {product.inStock ? 'In Stock' : 'Made to Order'}
                    </Badge>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="font-bold text-secondary mb-1 group-hover:text-primary transition-colors">
                    {product.name}
                </h3>
                <p className="text-sm text-secondary-400 mb-3">{product.size}</p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-primary">
                        ${product.price.toFixed(2)}
                    </span>
                    <span className="text-secondary-400 text-sm">/ unit</span>
                </div>

                {/* Quantity Input */}
                <div className="flex items-center gap-3 mb-4">
                    <label className="text-sm text-secondary-400">Qty:</label>
                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-3 py-2 rounded-lg border border-secondary-100 text-center font-medium text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                </div>

                {/* Add to Order Button */}
                <Button
                    variant={isAdded ? 'secondary' : 'primary'}
                    className="w-full"
                    onClick={handleAddToCart}
                >
                    {isAdded ? (
                        <>
                            <Check size={18} className="mr-2" />
                            Added to Order
                        </>
                    ) : (
                        <>
                            <ShoppingCart size={18} className="mr-2" />
                            Add to Order
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
