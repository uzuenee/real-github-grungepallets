'use client';

import { useState } from 'react';
import { Package, ShoppingCart, Check } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { useCart, CustomSpecs } from '@/lib/contexts/CartContext';

interface PortalProduct {
    id: string;
    name: string;
    size: string;
    dimensions: string;
    price: number;
    inStock: boolean;
    isHeatTreated?: boolean;
    category?: 'grade-a' | 'grade-b' | 'heat-treated' | 'custom';
}

interface PortalProductCardProps {
    product: PortalProduct;
}

export function PortalProductCard({ product }: PortalProductCardProps) {
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const { addToCart } = useCart();

    const isCustom = product.category === 'custom' || product.id === 'custom-pallet';

    // Custom specs state
    const [customSpecs, setCustomSpecs] = useState<CustomSpecs>({
        length: '',
        width: '',
        height: '',
        notes: ''
    });
    const [customError, setCustomError] = useState('');

    const handleAddToCart = () => {
        // Validate custom specs if it's a custom product
        if (isCustom) {
            if (!customSpecs.length || !customSpecs.width) {
                setCustomError('Please enter length and width');
                return;
            }
            setCustomError('');
        }

        addToCart(
            {
                productId: product.id,
                productName: isCustom
                    ? `Custom Pallet (${customSpecs.length}" × ${customSpecs.width}"${customSpecs.height ? ` × ${customSpecs.height}"` : ''})`
                    : product.name,
                price: isCustom ? 0 : product.price, // TBD pricing for custom
                isCustom,
                customSpecs: isCustom ? customSpecs : undefined,
            },
            quantity
        );
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
        setQuantity(1);
        if (isCustom) {
            setCustomSpecs({ length: '', width: '', height: '', notes: '' });
        }
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

                {/* Price - show TBD for custom */}
                <div className="flex items-baseline gap-1 mb-4">
                    {isCustom ? (
                        <span className="text-lg font-bold text-amber-600">Quote Required</span>
                    ) : (
                        <>
                            <span className="text-2xl font-bold text-primary">
                                ${product.price.toFixed(2)}
                            </span>
                            <span className="text-secondary-400 text-sm">/ unit</span>
                        </>
                    )}
                </div>

                {/* Custom Dimensions Form - only for custom products */}
                {isCustom && (
                    <div className="space-y-3 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-xs font-medium text-amber-700 mb-2">Enter Custom Dimensions</p>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="text-xs text-secondary-500 block mb-1">Length&quot;</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="48"
                                    value={customSpecs.length}
                                    onChange={(e) => setCustomSpecs(prev => ({ ...prev, length: e.target.value }))}
                                    className="w-full px-2 py-1.5 text-sm rounded border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-secondary-500 block mb-1">Width&quot;</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="40"
                                    value={customSpecs.width}
                                    onChange={(e) => setCustomSpecs(prev => ({ ...prev, width: e.target.value }))}
                                    className="w-full px-2 py-1.5 text-sm rounded border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-secondary-500 block mb-1">Height&quot;</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="6"
                                    value={customSpecs.height}
                                    onChange={(e) => setCustomSpecs(prev => ({ ...prev, height: e.target.value }))}
                                    className="w-full px-2 py-1.5 text-sm rounded border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-secondary-500 block mb-1">Special Notes (optional)</label>
                            <textarea
                                placeholder="Any special requirements..."
                                value={customSpecs.notes}
                                onChange={(e) => setCustomSpecs(prev => ({ ...prev, notes: e.target.value }))}
                                rows={2}
                                className="w-full px-2 py-1.5 text-sm rounded border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                        </div>
                        {customError && (
                            <p className="text-xs text-red-500">{customError}</p>
                        )}
                    </div>
                )}

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
                            {isCustom ? 'Request Quote' : 'Add to Order'}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

