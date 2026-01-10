'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui';
import { useCart } from '@/lib/contexts/CartContext';

export function CartPreview() {
    const { items, itemCount, subtotal } = useCart();

    if (itemCount === 0) return null;

    return (
        <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-40">
            <div className="bg-white rounded-xl shadow-2xl border border-secondary-100 p-4 w-72">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={20} className="text-primary" />
                        <span className="font-semibold text-secondary">Your Cart</span>
                    </div>
                    <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                        {itemCount}
                    </span>
                </div>

                {/* Items Preview */}
                <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                    {items.slice(0, 3).map((item) => (
                        <div key={item.productId} className="text-sm">
                            <div className="flex justify-between">
                                <span className="text-secondary-400 truncate flex-1 mr-2">
                                    {item.productName} × {item.quantity}
                                </span>
                                <span className={`font-medium ${item.isCustom ? 'text-amber-600' : 'text-secondary'}`}>
                                    {item.isCustom ? 'TBD' : `$${(item.price * item.quantity).toFixed(2)}`}
                                </span>
                            </div>
                            {item.isCustom && item.customSpecs && (
                                <p className="text-xs text-amber-500 mt-0.5">
                                    {item.customSpecs.length}&quot; × {item.customSpecs.width}&quot;
                                    {item.customSpecs.height && ` × ${item.customSpecs.height}"`}
                                </p>
                            )}
                        </div>
                    ))}
                    {items.length > 3 && (
                        <p className="text-xs text-secondary-400">
                            + {items.length - 3} more item{items.length - 3 !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* Subtotal */}
                <div className="border-t border-secondary-100 pt-3 mb-4">
                    <div className="flex justify-between">
                        <span className="text-secondary-400">Subtotal:</span>
                        <span className="font-bold text-secondary">${subtotal.toFixed(2)}</span>
                    </div>
                    {subtotal < 500 && (
                        <p className="text-xs text-primary mt-1">
                            Add ${(500 - subtotal).toFixed(2)} for free delivery!
                        </p>
                    )}
                </div>

                {/* View Cart Button */}
                <Link href="/portal/cart">
                    <Button variant="primary" className="w-full">
                        View Cart
                    </Button>
                </Link>
            </div>
        </div>
    );
}
