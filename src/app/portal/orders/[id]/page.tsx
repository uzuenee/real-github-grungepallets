'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PortalLayout } from '@/components/layout';
import { Card, Button, Badge, ToastProvider, useToast } from '@/components/ui';
import { ArrowLeft, RefreshCw, Package } from 'lucide-react';
import { CartProvider, useCart } from '@/lib/contexts/CartContext';
import { MOCK_ORDERS, MOCK_USER } from '@/lib/portal-data';

function OrderDetailContent() {
    const params = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const { showToast } = useToast();

    const orderId = params.id as string;
    const order = MOCK_ORDERS.find(o => o.id === orderId);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'processing': return 'info';
            case 'shipped': return 'info';
            case 'delivered': return 'success';
            case 'cancelled': return 'warning';
            default: return 'info';
        }
    };

    const handleReorderAll = () => {
        if (!order) return;

        order.items.forEach(item => {
            const price = parseFloat(item.price.replace('$', ''));
            addToCart(
                {
                    productId: item.productId,
                    productName: item.productName,
                    price,
                },
                item.quantity
            );
        });

        showToast(`${order.items.length} item(s) added to cart`, 'success');

        setTimeout(() => {
            router.push('/portal/cart');
        }, 500);
    };

    if (!order) {
        return (
            <PortalLayout>
                <div className="text-center py-16">
                    <Package size={64} className="text-secondary-200 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-secondary mb-2">Order Not Found</h1>
                    <p className="text-secondary-400 mb-8">We couldn&apos;t find an order with that ID.</p>
                    <Link href="/portal/orders">
                        <Button variant="primary">View All Orders</Button>
                    </Link>
                </div>
            </PortalLayout>
        );
    }

    // Calculate order subtotal
    const subtotal = order.items.reduce((sum, item) => {
        const price = parseFloat(item.price.replace('$', ''));
        return sum + price * item.quantity;
    }, 0);

    return (
        <PortalLayout>
            {/* Back Link */}
            <Link
                href="/portal/orders"
                className="inline-flex items-center text-secondary-400 hover:text-primary transition-colors mb-6"
            >
                <ArrowLeft size={18} className="mr-2" />
                Back to Order History
            </Link>

            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-secondary">{order.id}</h1>
                    <p className="text-secondary-400 mt-1">Placed on {order.date}</p>
                </div>
                <Badge variant={getStatusColor(order.status) as 'success' | 'warning' | 'info'} className="self-start sm:self-center">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Items */}
                <div className="lg:col-span-2">
                    <Card padding="none" className="overflow-hidden">
                        <div className="bg-secondary-50 px-6 py-4">
                            <h2 className="font-bold text-secondary">Order Items</h2>
                        </div>
                        <div className="divide-y divide-secondary-100">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                                    {/* Product Icon */}
                                    <div className="flex-shrink-0 w-16 h-16 bg-secondary-50 rounded-lg flex items-center justify-center">
                                        <Package size={28} className="text-secondary-300" />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-secondary">{item.productName}</h3>
                                        <p className="text-sm text-secondary-400">SKU: {item.productId.toUpperCase()}</p>
                                    </div>

                                    {/* Quantity & Price */}
                                    <div className="text-right">
                                        <p className="text-secondary-500">
                                            {item.quantity} × {item.price}
                                        </p>
                                        <p className="font-bold text-secondary">
                                            ${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Order Summary & Address */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Order Summary */}
                    <Card padding="lg">
                        <h2 className="font-bold text-secondary mb-4">Order Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-secondary-500">
                                <span>Subtotal</span>
                                <span className="font-medium text-secondary">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-secondary-500">
                                <span>Delivery</span>
                                <span className="font-medium text-secondary">
                                    {subtotal >= 500 ? 'FREE' : '$75.00'}
                                </span>
                            </div>
                            <p className="text-xs text-secondary-400 italic">
                                Taxes included in invoice
                            </p>
                        </div>
                        <div className="border-t border-secondary-100 pt-4 mt-4">
                            <div className="flex justify-between">
                                <span className="font-bold text-secondary">Total</span>
                                <span className="font-bold text-primary">{order.total}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Delivery Address */}
                    <Card padding="lg">
                        <h2 className="font-bold text-secondary mb-4">Delivery Address</h2>
                        <div className="text-secondary-500 text-sm space-y-1">
                            <p className="font-medium text-secondary">{MOCK_USER.companyName}</p>
                            <p>{MOCK_USER.contactName}</p>
                            <p>{MOCK_USER.address}</p>
                            <p>{MOCK_USER.city}, {MOCK_USER.state} {MOCK_USER.zip}</p>
                        </div>
                    </Card>

                    {/* Delivery Status */}
                    {order.deliveryDate && (
                        <Card padding="lg" className="bg-green-50 border-green-200">
                            <p className="text-green-700 font-medium">
                                ✓ Delivered on {order.deliveryDate}
                            </p>
                        </Card>
                    )}
                </div>
            </div>

            {/* Reorder Button */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary" size="lg" onClick={handleReorderAll}>
                    <RefreshCw size={18} className="mr-2" />
                    Reorder All Items
                </Button>
                <Link href="/portal/orders">
                    <Button variant="outline" size="lg">
                        Back to Orders
                    </Button>
                </Link>
            </div>
        </PortalLayout>
    );
}

export default function OrderDetailPage() {
    return (
        <CartProvider>
            <ToastProvider>
                <OrderDetailContent />
            </ToastProvider>
        </CartProvider>
    );
}
