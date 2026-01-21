'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, Badge } from '@/components/ui';
import { ArrowLeft, Package, User, MapPin, Calendar, Copy, Check } from 'lucide-react';
import { Order, OrderStatus } from '@/lib/supabase/types';

const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

interface OrderItem {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
}

interface CustomerProfile {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
}

interface OrderWithDetails extends Order {
    profiles: CustomerProfile;
    order_items: OrderItem[];
}

export default function AdminOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<OrderWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [copiedId, setCopiedId] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`/api/admin/orders/${orderId}`);
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

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (!order) return;
        setUpdatingStatus(true);

        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setOrder(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleDeliveryDateChange = async (date: string) => {
        if (!order) return;

        try {
            await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ delivery_date: date }),
            });

            setOrder(prev => prev ? { ...prev, delivery_date: date } : null);
        } catch (err) {
            console.error('Failed to update delivery date:', err);
        }
    };

    const copyOrderId = () => {
        navigator.clipboard.writeText(orderId);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
            case 'confirmed': return 'bg-blue-50 border-blue-200 text-blue-700';
            case 'processing': return 'bg-purple-50 border-purple-200 text-purple-700';
            case 'shipped': return 'bg-cyan-50 border-cyan-200 text-cyan-700';
            case 'delivered': return 'bg-green-50 border-green-200 text-green-700';
            case 'cancelled': return 'bg-red-50 border-red-200 text-red-700';
            default: return 'bg-secondary-50 border-secondary-200 text-secondary-700';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-secondary-400 mt-4">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (notFound || !order) {
        return (
            <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                <div className="text-center">
                    <Package size={64} className="text-secondary-200 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-secondary mb-2">Order Not Found</h1>
                    <p className="text-secondary-400 mb-8">We couldn&apos;t find an order with that ID.</p>
                    <Link href="/admin">
                        <Button variant="primary">Back to Admin</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const subtotal = order.order_items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-secondary-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-xl font-black text-secondary">
                                GRUNGE <span className="text-primary">PALLETS</span>
                            </Link>
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
                                ADMIN
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Link */}
                <Link
                    href="/admin"
                    className="inline-flex items-center text-secondary-400 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Order Management
                </Link>

                {/* Order Header */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-secondary">
                                Order Details
                            </h1>
                            <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'warning' : 'info'}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="text-sm text-secondary-500 bg-secondary-100 px-2 py-1 rounded font-mono">
                                {orderId}
                            </code>
                            <button
                                onClick={copyOrderId}
                                className="p-1 text-secondary-400 hover:text-primary transition-colors"
                                title="Copy Order ID"
                            >
                                {copiedId ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                        </div>
                        <p className="text-secondary-400 mt-2">
                            Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <Card padding="none" className="overflow-hidden">
                            <div className="bg-secondary-50 px-6 py-4 flex items-center gap-2">
                                <Package size={20} className="text-secondary-400" />
                                <h2 className="font-bold text-secondary">Order Items ({order.order_items.length})</h2>
                            </div>
                            <div className="divide-y divide-secondary-100">
                                {order.order_items.map((item) => (
                                    <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="flex-shrink-0 w-16 h-16 bg-secondary-50 rounded-lg flex items-center justify-center">
                                            <Package size={28} className="text-secondary-300" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-secondary">{item.product_name}</h3>
                                            <p className="text-sm text-secondary-400">Product ID: {item.product_id}</p>
                                        </div>
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

                        {/* Customer Information */}
                        <Card padding="none" className="overflow-hidden">
                            <div className="bg-secondary-50 px-6 py-4 flex items-center gap-2">
                                <User size={20} className="text-secondary-400" />
                                <h2 className="font-bold text-secondary">Customer Information</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-secondary-400 uppercase tracking-wider mb-2">Company</h3>
                                        <p className="font-semibold text-secondary text-lg">{order.profiles.company_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-secondary-400 uppercase tracking-wider mb-2">Contact Name</h3>
                                        <p className="font-medium text-secondary">{order.profiles.contact_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-secondary-400 uppercase tracking-wider mb-2">Email</h3>
                                        <a href={`mailto:${order.profiles.email}`} className="text-primary hover:underline">
                                            {order.profiles.email || 'N/A'}
                                        </a>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-secondary-400 uppercase tracking-wider mb-2">Phone</h3>
                                        <a href={`tel:${order.profiles.phone}`} className="text-primary hover:underline">
                                            {order.profiles.phone || 'N/A'}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Delivery Address */}
                        <Card padding="none" className="overflow-hidden">
                            <div className="bg-secondary-50 px-6 py-4 flex items-center gap-2">
                                <MapPin size={20} className="text-secondary-400" />
                                <h2 className="font-bold text-secondary">Delivery Address</h2>
                            </div>
                            <div className="p-6">
                                <div className="text-secondary-600 space-y-1">
                                    <p className="font-medium text-secondary">{order.profiles.company_name}</p>
                                    <p>{order.profiles.address || 'No address provided'}</p>
                                    <p>{order.profiles.city}{order.profiles.city && order.profiles.state ? ', ' : ''}{order.profiles.state} {order.profiles.zip}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
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
                            </div>
                            <div className="border-t border-secondary-100 pt-4 mt-4">
                                <div className="flex justify-between">
                                    <span className="font-bold text-secondary text-lg">Total</span>
                                    <span className="font-bold text-primary text-lg">${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Order Status Management */}
                        <Card padding="lg">
                            <h2 className="font-bold text-secondary mb-4">Manage Order</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-500 mb-2">
                                        Order Status
                                    </label>
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                                        disabled={updatingStatus}
                                        className={`block w-full px-4 py-3 text-sm font-medium border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer ${getStatusColor(order.status)} ${updatingStatus ? 'opacity-50' : ''}`}
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-500 mb-2">
                                        <Calendar size={14} className="inline mr-1" />
                                        Delivery Date
                                    </label>
                                    <input
                                        type="date"
                                        value={order.delivery_date || ''}
                                        onChange={(e) => handleDeliveryDateChange(e.target.value)}
                                        className="block w-full px-4 py-3 text-sm border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card padding="lg" className="bg-secondary-50">
                            <h2 className="font-bold text-secondary mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <Button variant="outline" className="w-full" onClick={() => router.push('/admin')}>
                                    Back to All Orders
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
