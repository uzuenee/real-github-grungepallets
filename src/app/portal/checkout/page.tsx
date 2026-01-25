'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PortalLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { CartProvider, useCart } from '@/lib/contexts/CartContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ShoppingBag, FileText } from 'lucide-react';

function CheckoutContent() {
    const router = useRouter();
    const { items, getTotal, clearCart } = useCart();
    const { profile } = useAuth();
    const { subtotal, total } = getTotal();

    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (items.length === 0) {
        return (
            <PortalLayout>
                <div className="text-center py-16">
                    <ShoppingBag size={64} className="text-secondary-200 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-secondary mb-2">Your cart is empty</h1>
                    <p className="text-secondary-400 mb-8">Add items to your cart before checking out.</p>
                    <Link href="/portal/shop">
                        <Button variant="primary" size="lg">Shop Now</Button>
                    </Link>
                </div>
            </PortalLayout>
        );
    }

    const handleSubmitOrder = async () => {
        if (!acceptTerms) {
            setError('Please accept the terms and conditions');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map(item => ({
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                        price: item.price,
                        isCustom: item.isCustom,
                        customSpecs: item.customSpecs,
                    })),
                    total,
                    delivery_notes: deliveryNotes,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to submit order');
            }

            clearCart();
            router.push('/portal/order-confirmation');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit order');
            setIsSubmitting(false);
        }
    };

    return (
        <PortalLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-secondary">Checkout</h1>
                <p className="text-secondary-400 mt-1">
                    Complete your order
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Delivery Address */}
                    <Card padding="lg">
                        <h2 className="text-xl font-bold text-secondary mb-4">Delivery Address</h2>
                        <div className="bg-secondary-50 rounded-lg p-4">
                            <p className="font-semibold text-secondary">{profile?.company_name || 'Company Name'}</p>
                            <p className="text-secondary-500">{profile?.contact_name || 'Contact Name'}</p>
                            <p className="text-secondary-500">{profile?.address || 'Address'}</p>
                            <p className="text-secondary-500">{profile?.city || 'City'}, {profile?.state || 'State'} {profile?.zip || 'ZIP'}</p>
                            <p className="text-secondary-500 mt-2">{profile?.phone || 'Phone'}</p>
                        </div>
                        <Link href="/portal/settings" className="text-primary text-sm font-medium mt-3 inline-block hover:text-primary-600">
                            Edit address →
                        </Link>
                    </Card>

                    {/* Delivery Notes */}
                    <Card padding="lg">
                        <h2 className="text-xl font-bold text-secondary mb-4">Delivery Notes</h2>
                        <textarea
                            value={deliveryNotes}
                            onChange={(e) => setDeliveryNotes(e.target.value)}
                            placeholder="Special instructions for delivery (e.g., dock hours, gate codes, contact person)"
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-secondary-300 text-secondary-500"
                        />
                    </Card>

                    {/* Payment Method */}
                    <Card padding="lg">
                        <h2 className="text-xl font-bold text-secondary mb-4">Payment Method</h2>
                        <div className="flex items-center gap-4 p-4 rounded-lg border-2 border-primary bg-primary/5">
                            <FileText size={24} className="text-primary" />
                            <div className="flex-1">
                                <p className="font-semibold text-secondary">Pay by Invoice (Net 30)</p>
                                <p className="text-sm text-secondary-400">Receive invoice after delivery</p>
                            </div>
                        </div>
                    </Card>

                    {/* Terms */}
                    <Card padding="lg">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={acceptTerms}
                                onChange={(e) => {
                                    setAcceptTerms(e.target.checked);
                                    if (e.target.checked) setError('');
                                }}
                                className="w-5 h-5 mt-0.5 rounded border-secondary-300 text-primary focus:ring-primary"
                            />
                            <span className="text-secondary-500">
                                I agree to the{' '}
                                <Link href="/terms" className="text-primary hover:text-primary-600">Terms of Service</Link>
                                {' '}and{' '}
                                <Link href="/privacy" className="text-primary hover:text-primary-600">Privacy Policy</Link>.
                                I understand that orders are subject to availability and pricing confirmation.
                            </span>
                        </label>
                        {error && (
                            <p className="text-red-500 text-sm mt-2">{error}</p>
                        )}
                    </Card>
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                    <Card padding="lg" className="sticky top-24">
                        <h2 className="text-xl font-bold text-secondary mb-4">Order Summary</h2>

                        {/* Order Items */}
                        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                            {items.map((item) => (
                                <div key={item.productId} className="text-sm">
                                    <div className="flex justify-between">
                                        <div className="flex-1">
                                            <p className="text-secondary">{item.productName}</p>
                                            {item.isCustom ? (
                                                <p className="text-amber-600">Qty: {item.quantity} × Quote Required</p>
                                            ) : (
                                                <p className="text-secondary-400">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                            )}
                                        </div>
                                        <p className={`font-medium ${item.isCustom ? 'text-amber-600' : 'text-secondary'}`}>
                                            {item.isCustom ? 'TBD' : `$${(item.price * item.quantity).toFixed(2)}`}
                                        </p>
                                    </div>
                                    {item.isCustom && item.customSpecs && (
                                        <div className="mt-1 p-2 bg-amber-50 rounded text-xs text-amber-700">
                                            <span className="font-medium">Dimensions:</span> {item.customSpecs.length}&quot; × {item.customSpecs.width}&quot;
                                            {item.customSpecs.height && ` × ${item.customSpecs.height}"`}
                                            {item.customSpecs.notes && (
                                                <p className="mt-1"><span className="font-medium">Notes:</span> {item.customSpecs.notes}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Custom Items Notice */}
                        {items.some(item => item.isCustom) && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-amber-700 font-medium">⚠️ Order contains custom items</p>
                                <p className="text-xs text-amber-600 mt-1">Final pricing will be confirmed by our team after order review.</p>
                            </div>
                        )}

                        <div className="border-t border-secondary-100 pt-4 space-y-3 mb-6">
                            <div className="flex justify-between text-secondary-500">
                                <span>Subtotal</span>
                                <span className="font-medium text-secondary">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-secondary-500">
                                <span>Delivery</span>
                                <span className="font-medium text-amber-600">TBD</span>
                            </div>
                            <p className="text-xs text-secondary-400 italic">
                                Delivery price confirmed after order review
                            </p>
                        </div>

                        <div className="border-t border-secondary-100 pt-4 mb-6">
                            <div className="flex justify-between">
                                <span className="text-lg font-bold text-secondary">Estimated Total</span>
                                <span className="text-lg font-bold text-primary">${total.toFixed(2)}+</span>
                            </div>
                            <p className="text-xs text-secondary-400 mt-1">
                                Final total includes delivery (set after order review)
                            </p>
                        </div>

                        <Button variant="primary" size="lg" className="w-full" onClick={handleSubmitOrder} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting Order...' : 'Submit Order'}
                        </Button>

                        <Link href="/portal/cart" className="block text-center text-primary text-sm font-medium mt-4 hover:text-primary-600">
                            ← Back to Cart
                        </Link>
                    </Card>
                </div>
            </div>
        </PortalLayout>
    );
}

export default function CheckoutPage() {
    return (
        <CartProvider>
            <CheckoutContent />
        </CartProvider>
    );
}
