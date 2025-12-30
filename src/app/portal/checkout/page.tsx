'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PortalLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { CartProvider, useCart } from '@/lib/contexts/CartContext';
import { MOCK_USER } from '@/lib/portal-data';
import { ShoppingBag, CreditCard, FileText } from 'lucide-react';

function CheckoutContent() {
    const router = useRouter();
    const { items, getTotal, clearCart } = useCart();
    const { subtotal, delivery, total } = getTotal();

    const [paymentMethod, setPaymentMethod] = useState<'invoice' | 'card'>('invoice');
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

        // Simulate order submission
        console.log('Order submitted:', {
            items,
            total,
            paymentMethod,
            deliveryNotes,
            deliveryAddress: MOCK_USER,
        });

        await new Promise(resolve => setTimeout(resolve, 1500));

        // Clear cart and redirect
        clearCart();
        router.push('/portal/order-confirmation');
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
                            <p className="font-semibold text-secondary">{MOCK_USER.companyName}</p>
                            <p className="text-secondary-500">{MOCK_USER.contactName}</p>
                            <p className="text-secondary-500">{MOCK_USER.address}</p>
                            <p className="text-secondary-500">{MOCK_USER.city}, {MOCK_USER.state} {MOCK_USER.zip}</p>
                            <p className="text-secondary-500 mt-2">{MOCK_USER.phone}</p>
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
                        <div className="space-y-3">
                            <label
                                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === 'invoice'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-secondary-100 hover:border-secondary-200'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    value="invoice"
                                    checked={paymentMethod === 'invoice'}
                                    onChange={() => setPaymentMethod('invoice')}
                                    className="w-5 h-5 text-primary focus:ring-primary"
                                />
                                <FileText size={24} className={paymentMethod === 'invoice' ? 'text-primary' : 'text-secondary-400'} />
                                <div className="flex-1">
                                    <p className="font-semibold text-secondary">Pay by Invoice (Net 30)</p>
                                    <p className="text-sm text-secondary-400">Receive invoice after delivery</p>
                                </div>
                            </label>

                            <label
                                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === 'card'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-secondary-100 hover:border-secondary-200'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    value="card"
                                    checked={paymentMethod === 'card'}
                                    onChange={() => setPaymentMethod('card')}
                                    className="w-5 h-5 text-primary focus:ring-primary"
                                />
                                <CreditCard size={24} className={paymentMethod === 'card' ? 'text-primary' : 'text-secondary-400'} />
                                <div className="flex-1">
                                    <p className="font-semibold text-secondary">Credit Card</p>
                                    <p className="text-sm text-secondary-400">Pay now with card</p>
                                </div>
                            </label>

                            {paymentMethod === 'card' && (
                                <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                                    <p className="text-secondary-500 text-center">
                                        🚧 Credit card payment processing coming soon.
                                        Please select &quot;Pay by Invoice&quot; for now.
                                    </p>
                                </div>
                            )}
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
                                <div key={item.productId} className="flex justify-between text-sm">
                                    <div className="flex-1">
                                        <p className="text-secondary">{item.productName}</p>
                                        <p className="text-secondary-400">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                    </div>
                                    <p className="font-medium text-secondary">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-secondary-100 pt-4 space-y-3 mb-6">
                            <div className="flex justify-between text-secondary-500">
                                <span>Subtotal</span>
                                <span className="font-medium text-secondary">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-secondary-500">
                                <span>Delivery</span>
                                <span className={`font-medium ${delivery === 0 ? 'text-green-600' : 'text-secondary'}`}>
                                    {delivery === 0 ? 'FREE' : `$${delivery.toFixed(2)}`}
                                </span>
                            </div>
                            <p className="text-xs text-secondary-400 italic">
                                Taxes calculated at invoice
                            </p>
                        </div>

                        <div className="border-t border-secondary-100 pt-4 mb-6">
                            <div className="flex justify-between">
                                <span className="text-lg font-bold text-secondary">Total</span>
                                <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
                            </div>
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
