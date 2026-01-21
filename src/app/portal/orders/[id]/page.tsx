'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PortalLayout } from '@/components/layout';
import { Card, Button, Badge, ToastProvider, useToast } from '@/components/ui';
import { ArrowLeft, RefreshCw, Package } from 'lucide-react';
import { CartProvider, useCart } from '@/lib/contexts/CartContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Order } from '@/lib/supabase/types';

interface OrderItem {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
}

interface OrderWithItems extends Order {
    order_items: OrderItem[];
}

function OrderDetailContent() {
    const params = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const { profile } = useAuth();

    const orderId = params.id as string;
    const [order, setOrder] = useState<OrderWithItems | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`/api/orders/${orderId}`);
                if (response.ok) {
                    const result = await response.json();
                    setOrder(result.order);
                } else if (response.status === 404) {
                    setNotFound(true);
                }
            } catch (err) {
                console.error('Failed to fetch order:', err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

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

        order.order_items.forEach(item => {
            addToCart(
                {
                    productId: item.product_id,
                    productName: item.product_name,
                    price: item.unit_price,
                },
                item.quantity
            );
        });

        showToast(`${order.order_items.length} item(s) added to cart`, 'success');

        setTimeout(() => {
            router.push('/portal/cart');
        }, 500);
    };

    if (loading) {
        return (
            <PortalLayout>
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-secondary-400 mt-4">Loading order details...</p>
                </div>
            </PortalLayout>
        );
    }

    if (notFound || !order) {
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
    const subtotal = order.order_items.reduce((sum, item) => {
        return sum + item.unit_price * item.quantity;
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
                    <h1 className="text-2xl sm:text-3xl font-bold text-secondary">
                        Order #{order.id.slice(0, 8)}...
                    </h1>
                    <p className="text-secondary-400 mt-1">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </p>
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
                            {order.order_items.map((item) => (
                                <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                                    {/* Product Icon */}
                                    <div className="flex-shrink-0 w-16 h-16 bg-secondary-50 rounded-lg flex items-center justify-center">
                                        <Package size={28} className="text-secondary-300" />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-secondary">{item.product_name}</h3>
                                        <p className="text-sm text-secondary-400">SKU: {item.product_id.toUpperCase()}</p>
                                    </div>

                                    {/* Quantity & Price */}
                                    <div className="text-right">
                                        <p className="text-secondary-500">
                                            {item.quantity} × ${item.unit_price.toFixed(2)}
                                        </p>
                                        <p className="font-bold text-secondary">
                                            ${(item.unit_price * item.quantity).toFixed(2)}
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
                                <span className={`font-medium ${order.delivery_price != null ? 'text-green-600' : 'text-amber-600'}`}>
                                    {order.delivery_price != null ? `$${order.delivery_price.toFixed(2)}` : 'TBD'}
                                </span>
                            </div>
                            {order.delivery_price == null && (
                                <p className="text-xs text-amber-600 italic">
                                    Delivery price will be set after order review
                                </p>
                            )}
                        </div>
                        <div className="border-t border-secondary-100 pt-4 mt-4">
                            <div className="flex justify-between">
                                <span className="font-bold text-secondary">Total</span>
                                <span className="font-bold text-primary">${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Delivery Address */}
                    <Card padding="lg">
                        <h2 className="font-bold text-secondary mb-4">Delivery Address</h2>
                        <div className="text-secondary-500 text-sm space-y-1">
                            <p className="font-medium text-secondary">{profile?.company_name || 'Company'}</p>
                            <p>{profile?.contact_name || 'Contact'}</p>
                            <p>{profile?.address || 'Address'}</p>
                            <p>{profile?.city || 'City'}, {profile?.state || 'State'} {profile?.zip || 'ZIP'}</p>
                        </div>
                    </Card>

                    {/* Delivery Status */}
                    {order.status === 'delivered' && order.delivery_date && (
                        <Card padding="lg" className="bg-green-50 border-green-200">
                            <p className="text-green-700 font-medium">
                                ✓ Delivered on {new Date(order.delivery_date).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
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
