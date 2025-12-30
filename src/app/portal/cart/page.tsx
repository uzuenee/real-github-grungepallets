'use client';

import Link from 'next/link';
import { PortalLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { Trash2, ShoppingBag } from 'lucide-react';
import { CartProvider, useCart } from '@/lib/contexts/CartContext';

function CartContent() {
    const { items, updateQuantity, removeItem, getTotal } = useCart();
    const { subtotal, delivery, total } = getTotal();

    if (items.length === 0) {
        return (
            <PortalLayout>
                <div className="text-center py-16">
                    <ShoppingBag size={64} className="text-secondary-200 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-secondary mb-2">Your cart is empty</h1>
                    <p className="text-secondary-400 mb-8">Browse our catalog to add pallets to your order.</p>
                    <Link href="/portal/shop">
                        <Button variant="primary" size="lg">Shop Now</Button>
                    </Link>
                </div>
            </PortalLayout>
        );
    }

    return (
        <PortalLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-secondary">Shopping Cart</h1>
                <p className="text-secondary-400 mt-1">
                    Review your items before checkout
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items Table */}
                <div className="lg:col-span-2">
                    <Card padding="none" className="overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-secondary-50">
                                    <tr>
                                        <th className="text-left text-sm font-semibold text-secondary px-6 py-4">Product</th>
                                        <th className="text-center text-sm font-semibold text-secondary px-4 py-4">Unit Price</th>
                                        <th className="text-center text-sm font-semibold text-secondary px-4 py-4">Quantity</th>
                                        <th className="text-right text-sm font-semibold text-secondary px-4 py-4">Line Total</th>
                                        <th className="px-4 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary-100">
                                    {items.map((item) => (
                                        <tr key={item.productId} className="hover:bg-secondary-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-secondary">{item.productName}</p>
                                                    <p className="text-xs text-secondary-400">SKU: {item.productId.toUpperCase()}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center text-secondary-500">
                                                ${item.price.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                                                        className="w-20 text-center px-2 py-1.5 border border-secondary-100 rounded-lg font-medium text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-semibold text-secondary">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <button
                                                    onClick={() => removeItem(item.productId)}
                                                    className="text-secondary-300 hover:text-red-500 transition-colors p-1"
                                                    title="Remove item"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-secondary-100">
                            {items.map((item) => (
                                <div key={item.productId} className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-semibold text-secondary">{item.productName}</p>
                                            <p className="text-xs text-secondary-400">SKU: {item.productId.toUpperCase()}</p>
                                            <p className="text-sm text-secondary-500 mt-1">${item.price.toFixed(2)} each</p>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.productId)}
                                            className="text-secondary-300 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                                            className="w-20 text-center px-2 py-1.5 border border-secondary-100 rounded-lg font-medium text-secondary"
                                        />
                                        <p className="font-bold text-secondary">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Link href="/portal/shop" className="inline-block mt-4 text-primary hover:text-primary-600 font-medium">
                        ← Continue Shopping
                    </Link>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card padding="lg" className="sticky top-24">
                        <h2 className="text-xl font-bold text-secondary mb-6">Order Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-secondary-500">
                                <span>Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} pallets)</span>
                                <span className="font-medium text-secondary">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-secondary-500">
                                <span>Delivery</span>
                                <span className={`font-medium ${delivery === 0 ? 'text-green-600' : 'text-secondary'}`}>
                                    {delivery === 0 ? 'FREE' : `$${delivery.toFixed(2)}`}
                                </span>
                            </div>
                            {delivery > 0 && subtotal > 0 && (
                                <p className="text-xs text-primary">
                                    Add ${(500 - subtotal).toFixed(2)} more for free delivery!
                                </p>
                            )}
                            <p className="text-xs text-secondary-400 italic">
                                Taxes calculated at invoice
                            </p>
                        </div>

                        <div className="border-t border-secondary-100 pt-4 mb-6">
                            <div className="flex justify-between">
                                <span className="text-lg font-bold text-secondary">Estimated Total</span>
                                <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <Link href="/portal/checkout">
                            <Button variant="primary" size="lg" className="w-full mb-3">
                                Proceed to Checkout
                            </Button>
                        </Link>

                        <p className="text-xs text-secondary-400 text-center">
                            Orders placed before 2 PM ship same day
                        </p>
                    </Card>
                </div>
            </div>
        </PortalLayout>
    );
}

export default function PortalCartPage() {
    return (
        <CartProvider>
            <CartContent />
        </CartProvider>
    );
}
