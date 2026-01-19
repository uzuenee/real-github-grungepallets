'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PortalLayout } from '@/components/layout';
import { Card, Button, Badge } from '@/components/ui';
import { ShoppingBag, ClipboardList, Phone } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Order } from '@/lib/supabase/types';

interface OrderWithItems extends Order {
    order_items: {
        id: string;
        product_name: string;
        quantity: number;
        unit_price: number;
    }[];
}

export default function PortalDashboardPage() {
    const { profile } = useAuth();
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [loading, setLoading] = useState(true);

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

    // Calculate stats from real orders
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const lastOrderDate = orders.length > 0
        ? new Date(orders[0].created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
        : 'No orders yet';
    const recentOrders = orders.slice(0, 3);

    return (
        <PortalLayout>
            {/* Welcome */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-secondary">
                    Welcome back, {profile?.company_name || 'Customer'}!
                </h1>
                <p className="text-secondary-400 mt-1">
                    Here&apos;s an overview of your account activity.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <Card padding="md" className="text-center">
                    <p className="text-4xl font-bold text-primary mb-1">{totalOrders}</p>
                    <p className="text-secondary-400">Total Orders</p>
                </Card>
                <Card padding="md" className="text-center">
                    <p className="text-4xl font-bold text-primary mb-1">{pendingOrders}</p>
                    <p className="text-secondary-400">Pending Orders</p>
                </Card>
                <Card padding="md" className="text-center">
                    <p className="text-sm font-bold text-secondary mb-1">{lastOrderDate}</p>
                    <p className="text-secondary-400">Last Order Date</p>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card padding="lg" className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <ShoppingBag size={28} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-secondary mb-1">Need more pallets?</h3>
                        <p className="text-secondary-400 text-sm mb-3">Browse our catalog and place an order.</p>
                        <Link href="/portal/shop">
                            <Button variant="primary" size="sm">Shop Now</Button>
                        </Link>
                    </div>
                </Card>

                <Card padding="lg" className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <ClipboardList size={28} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-secondary mb-1">Track your orders</h3>
                        <p className="text-secondary-400 text-sm mb-3">View order status and history.</p>
                        <Link href="/portal/orders">
                            <Button variant="outline" size="sm">View Orders</Button>
                        </Link>
                    </div>
                </Card>
            </div>

            {/* Recent Orders */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-secondary">Recent Orders</h2>
                    <Link href="/portal/orders" className="text-primary hover:text-primary-600 text-sm font-medium">
                        View All →
                    </Link>
                </div>

                <Card padding="none" className="overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="text-secondary-400 mt-4">Loading orders...</p>
                        </div>
                    ) : recentOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-secondary-50">
                                    <tr>
                                        <th className="text-left text-sm font-semibold text-secondary px-6 py-3">Order ID</th>
                                        <th className="text-left text-sm font-semibold text-secondary px-6 py-3">Date</th>
                                        <th className="text-left text-sm font-semibold text-secondary px-6 py-3">Status</th>
                                        <th className="text-right text-sm font-semibold text-secondary px-6 py-3">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary-100">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-secondary-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link href={`/portal/orders/${order.id}`} className="font-medium text-primary hover:text-primary-600">
                                                    {order.id.slice(0, 8)}...
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-secondary-400">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={getStatusColor(order.status) as 'success' | 'warning' | 'info'}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-secondary">${order.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <ClipboardList size={48} className="text-secondary-200 mx-auto mb-4" />
                            <p className="text-secondary-400">No orders yet. Place your first order!</p>
                            <Link href="/portal/shop" className="inline-block mt-4">
                                <Button variant="primary" size="sm">Shop Now</Button>
                            </Link>
                        </div>
                    )}
                </Card>
            </div>

            {/* Contact Team - simple footer */}
            <div className="text-center pb-4">
                <Link href="/contact">
                    <Button variant="primary" size="sm">Contact Team</Button>
                </Link>
            </div>
        </PortalLayout>
    );
}
