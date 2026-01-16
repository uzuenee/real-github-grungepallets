'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PortalLayout } from '@/components/layout';
import { Card, Button, Badge, ToastProvider, useToast } from '@/components/ui';
import { RefreshCw, Filter, ChevronDown, Package, Truck } from 'lucide-react';
import { CartProvider, useCart } from '@/lib/contexts/CartContext';
import { Order, OrderStatus } from '@/lib/supabase/types';

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

type StatusFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered';

const statusOptions = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
];

function OrdersContent() {
    const router = useRouter();
    const { addToCart } = useCart();
    const { showToast } = useToast();

    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [displayCount, setDisplayCount] = useState(10);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('/api/orders');
                const result = await response.json();
                if (response.ok && result.orders) {
                    setOrders(result.orders);
                }
            } catch (err) {
                console.error('Failed to fetch orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        let filtered = [...orders];
        if (statusFilter !== 'all') {
            filtered = filtered.filter(o => o.status === statusFilter);
        }
        return filtered;
    }, [orders, statusFilter]);

    const displayedOrders = filteredOrders.slice(0, displayCount);
    const hasMore = displayCount < filteredOrders.length;

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

    const handleReorder = (order: OrderWithItems) => {
        // Add all items from order to cart
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

        // Redirect to cart after brief delay
        setTimeout(() => {
            router.push('/portal/cart');
        }, 500);
    };

    return (
        <PortalLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-secondary">Order History</h1>
                    <p className="text-secondary-400 mt-1">
                        View and reorder from your past orders
                    </p>
                </div>
                <Link href="/portal/shop">
                    <Button variant="primary">Place New Order</Button>
                </Link>
            </div>

            {/* Filters */}
            <Card padding="md" className="mb-6">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 text-secondary font-medium w-full sm:w-auto"
                >
                    <Filter size={18} />
                    Filter Orders
                    <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-secondary-100">
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setStatusFilter(opt.id as StatusFilter)}
                                    className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${statusFilter === opt.id
                                            ? 'bg-primary text-white'
                                            : 'bg-secondary-50 text-secondary-500 hover:bg-secondary-100'
                                        }
                  `}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            {/* Orders Table */}
            <Card padding="none" className="overflow-hidden">
                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-secondary-400 mt-4">Loading orders...</p>
                    </div>
                ) : displayedOrders.length > 0 ? (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-secondary-50">
                                    <tr>
                                        <th className="text-left text-sm font-semibold text-secondary px-6 py-4">Order #</th>
                                        <th className="text-left text-sm font-semibold text-secondary px-4 py-4">Date</th>
                                        <th className="text-left text-sm font-semibold text-secondary px-4 py-4">Delivery Date</th>
                                        <th className="text-center text-sm font-semibold text-secondary px-4 py-4">Items</th>
                                        <th className="text-right text-sm font-semibold text-secondary px-4 py-4">Total</th>
                                        <th className="text-center text-sm font-semibold text-secondary px-4 py-4">Status</th>
                                        <th className="text-right text-sm font-semibold text-secondary px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary-100">
                                    {displayedOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-secondary-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link href={`/portal/orders/${order.id}`} className="font-semibold text-primary hover:text-primary-600">
                                                    {order.id.slice(0, 8)}...
                                                </Link>
                                            </td>
                                            <td className="px-4 py-4 text-secondary-500">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-4 text-secondary-500">
                                                {order.delivery_date ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <Truck size={14} className="text-primary" />
                                                        {new Date(order.delivery_date).toLocaleDateString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-secondary-300">TBD</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center text-secondary-500">
                                                {order.order_items?.length || 0}
                                            </td>
                                            <td className="px-4 py-4 text-right font-semibold text-secondary">
                                                ${order.total.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <Badge variant={getStatusColor(order.status) as 'success' | 'warning' | 'info'}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleReorder(order)}>
                                                    <RefreshCw size={14} className="mr-1" />
                                                    Reorder
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-secondary-100">
                            {displayedOrders.map((order) => (
                                <div key={order.id} className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <Link href={`/portal/orders/${order.id}`} className="font-semibold text-primary hover:text-primary-600">
                                                {order.id.slice(0, 8)}...
                                            </Link>
                                            <p className="text-sm text-secondary-400">
                                                Ordered: {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                            {order.delivery_date && (
                                                <p className="text-sm text-secondary-400 flex items-center gap-1">
                                                    <Truck size={12} className="text-primary" />
                                                    Delivery: {new Date(order.delivery_date).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant={getStatusColor(order.status) as 'success' | 'warning' | 'info'}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-secondary-500">
                                            {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''} • <span className="font-semibold text-secondary">${order.total.toFixed(2)}</span>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => handleReorder(order)}>
                                            <RefreshCw size={14} className="mr-1" />
                                            Reorder
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16">
                        <Package size={48} className="text-secondary-200 mx-auto mb-4" />
                        <p className="text-secondary-400">
                            {orders.length === 0
                                ? 'No orders yet. Place your first order!'
                                : 'No orders found matching your filters.'}
                        </p>
                        {orders.length === 0 && (
                            <Link href="/portal/shop" className="inline-block mt-4">
                                <Button variant="primary">Shop Now</Button>
                            </Link>
                        )}
                    </div>
                )}
            </Card>

            {/* Load More */}
            {hasMore && (
                <div className="text-center mt-6">
                    <Button variant="outline" onClick={() => setDisplayCount(prev => prev + 10)}>
                        Load More Orders
                    </Button>
                </div>
            )}

            {/* Summary */}
            {!loading && filteredOrders.length > 0 && (
                <p className="text-sm text-secondary-400 text-center mt-4">
                    Showing {displayedOrders.length} of {filteredOrders.length} orders
                </p>
            )}
        </PortalLayout>
    );
}

export default function PortalOrdersPage() {
    return (
        <CartProvider>
            <ToastProvider>
                <OrdersContent />
            </ToastProvider>
        </CartProvider>
    );
}
