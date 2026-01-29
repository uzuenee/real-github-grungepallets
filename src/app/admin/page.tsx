'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, Button } from '@/components/ui';
import { Package, ShoppingCart, TrendingUp, LogOut, RefreshCw, Users, Shield, CheckCircle, XCircle, Trash2, X, Copy, Check, User, MapPin, Calendar, FileText, Truck } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { CustomSpecs } from '@/lib/contexts/CartContext';
import { Order, OrderStatus, Profile } from '@/lib/supabase/types';

const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

interface OrderWithProfile extends Order {
    profiles?: {
        company_name: string;
        contact_name: string;
    };
    order_items?: OrderItem[];
}

interface OrderItem {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    is_custom?: boolean;
    custom_specs?: string; // JSON string
}

interface CustomerProfile {
    id: string;
    company_name: string;
    contact_name: string;
    email?: string | null;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
}

interface OrderDetails extends Order {
    profiles: CustomerProfile;
    order_items: OrderItem[];
}

type AdminTab = 'orders' | 'users' | 'pickups';

// Pickup types for admin
interface PickupWithProfile {
    id: string;
    user_id: string;
    status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
    pallet_condition: string;
    estimated_quantity: number;
    actual_quantity?: number;
    pickup_address: string;
    preferred_date?: string;
    scheduled_date?: string;
    notes?: string;
    admin_notes?: string;
    price_per_pallet?: number;
    total_payout?: number;
    created_at: string;
    profiles?: {
        company_name: string;
        contact_name: string;
        phone: string;
    };
}

const pickupStatusOptions = ['pending', 'scheduled', 'completed', 'cancelled'] as const;

function getPendingReadiness(order: OrderWithProfile) {
    const deliveryPriceSet = order.delivery_price != null;
    const deliveryDateSet = Boolean(order.delivery_date);
    const customItems = order.order_items?.filter(i => i.is_custom) || [];
    const customPricesSet = customItems.every(i => typeof i.unit_price === 'number' && i.unit_price > 0);

    return {
        ok: deliveryPriceSet && deliveryDateSet && customPricesSet,
        deliveryPriceSet,
        deliveryDateSet,
        customPricesSet,
    };
}

export default function AdminPage() {
    const { signOut, profile, user: authUser } = useAuth();
    const router = useRouter();
    const currentUserId = authUser?.id || profile?.id;
    const [activeTab, setActiveTab] = useState<AdminTab>('orders');

    // Orders state
    const [orders, setOrders] = useState<OrderWithProfile[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

    // Order detail panel state
    const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [copiedId, setCopiedId] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editingPrice, setEditingPrice] = useState<string>('');
    const [savingPrice, setSavingPrice] = useState(false);

    // Delivery price editing state
    const [editingDeliveryPrice, setEditingDeliveryPrice] = useState(false);
    const [deliveryPriceInput, setDeliveryPriceInput] = useState<string>('');
    const [savingDeliveryPrice, setSavingDeliveryPrice] = useState(false);

    // Users state
    const [users, setUsers] = useState<Array<Profile & { email?: string | null; email_verified?: boolean }>>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [updatingUser, setUpdatingUser] = useState<string | null>(null);

    // Pickups state
    const [pickups, setPickups] = useState<PickupWithProfile[]>([]);
    const [pickupsLoading, setPickupsLoading] = useState(true);
    const [updatingPickup, setUpdatingPickup] = useState<string | null>(null);

    // Fetch orders
    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const url = statusFilter === 'all'
                ? '/api/admin/orders'
                : `/api/admin/orders?status=${statusFilter}`;

            const response = await fetch(url);
            const result = await response.json();

            if (response.ok && result.orders) {
                setOrders(result.orders);
            }
        } catch (err) {
            console.error('Fetch orders error:', err);
        } finally {
            setOrdersLoading(false);
        }
    };

    // Fetch users
    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const response = await fetch('/api/admin/users');
            const result = await response.json();

            if (response.ok && result.users) {
                setUsers(result.users);
            }
        } catch (err) {
            console.error('Fetch users error:', err);
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
        if (activeTab === 'pickups') {
            fetchPickups();
        }
    }, [activeTab]);

    // Fetch pickups
    const fetchPickups = async () => {
        setPickupsLoading(true);
        try {
            const response = await fetch('/api/admin/pickups');
            const result = await response.json();
            if (response.ok && result.pickups) {
                setPickups(result.pickups);
            }
        } catch (err) {
            console.error('Fetch pickups error:', err);
        } finally {
            setPickupsLoading(false);
        }
    };

    // Handle pickup status change
    const handlePickupStatusChange = async (pickupId: string, newStatus: string) => {
        setUpdatingPickup(pickupId);
        try {
            const response = await fetch(`/api/pickups/${pickupId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (response.ok) {
                setPickups(prev => prev.map(p =>
                    p.id === pickupId ? { ...p, status: newStatus as PickupWithProfile['status'] } : p
                ));
            }
        } catch (err) {
            console.error('Update pickup error:', err);
        } finally {
            setUpdatingPickup(null);
        }
    };

    // Handle pickup scheduled date change
    const handlePickupDateChange = async (pickupId: string, date: string) => {
        try {
            await fetch(`/api/pickups/${pickupId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scheduled_date: date, status: 'scheduled' }),
            });
            setPickups(prev => prev.map(p =>
                p.id === pickupId ? { ...p, scheduled_date: date, status: 'scheduled' } : p
            ));
        } catch (err) {
            console.error('Update pickup date error:', err);
        }
    };

    // Handle pickup delete
    const handleDeletePickup = async (pickupId: string) => {
        if (!confirm('Are you sure you want to delete this pickup request?')) return;
        setUpdatingPickup(pickupId);
        try {
            const response = await fetch(`/api/pickups/${pickupId}`, { method: 'DELETE' });
            if (response.ok) {
                setPickups(prev => prev.filter(p => p.id !== pickupId));
            }
        } catch (err) {
            console.error('Delete pickup error:', err);
        } finally {
            setUpdatingPickup(null);
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        setUpdatingOrder(orderId);
        try {
            const current = orders.find(o => o.id === orderId);
            if (current && current.status === 'pending' && newStatus !== 'pending' && newStatus !== 'cancelled') {
                const readiness = getPendingReadiness(current);
                if (!readiness.ok) {
                    const missing: string[] = [];
                    if (!readiness.deliveryPriceSet) missing.push('delivery price');
                    if (!readiness.deliveryDateSet) missing.push('delivery date');
                    if (!readiness.customPricesSet) missing.push('custom item prices');
                    alert(`Before confirming, set: ${missing.join(', ')}.`);
                    return;
                }
            }

            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setOrders(prev => prev.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update status');
            }
        } catch (err) {
            console.error('Update status error:', err);
            alert('Failed to update status');
        } finally {
            setUpdatingOrder(null);
        }
    };

    const handleDeliveryDateChange = async (orderId: string, date: string) => {
        await fetch(`/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ delivery_date: date }),
        });

        setOrders(prev => prev.map(order =>
            order.id === orderId ? { ...order, delivery_date: date } : order
        ));

        setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, delivery_date: date } : prev));
    };

    type AdminUserUpdateResponse = {
        approvalEmail?: {
            success?: boolean;
            error?: string;
        };
        error?: string;
    };

    const handleUserUpdate = async (userId: string, field: 'approved' | 'is_admin', value: boolean) => {
        // Prevent editing your own user
        if (userId === currentUserId) {
            return;
        }

        setUpdatingUser(userId);

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value }),
            });

            let payload: AdminUserUpdateResponse | null = null;
            try {
                const json = (await response.json()) as unknown;
                payload = (json && typeof json === 'object') ? (json as AdminUserUpdateResponse) : null;
            } catch {
                payload = null;
            }

            if (response.ok) {
                setUsers(prev => prev.map(user =>
                    user.id === userId ? { ...user, [field]: value } : user
                ));

                if (field === 'approved' && value === true && payload?.approvalEmail?.success === false) {
                    alert(payload?.approvalEmail?.error || 'User approved, but approval email failed to send');
                }
            } else {
                alert(payload?.error || 'Failed to update user');
            }
        } catch (err) {
            console.error('Update user error:', err);
        } finally {
            setUpdatingUser(null);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            return;
        }

        setUpdatingOrder(orderId);
        try {
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setOrders(prev => prev.filter(order => order.id !== orderId));
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to delete order');
            }
        } catch (err) {
            console.error('Delete order error:', err);
        } finally {
            setUpdatingOrder(null);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This will also delete all their orders. This action cannot be undone.')) {
            return;
        }

        setUpdatingUser(userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setUsers(prev => prev.filter(user => user.id !== userId));
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to delete user');
            }
        } catch (err) {
            console.error('Delete user error:', err);
        } finally {
            setUpdatingUser(null);
        }
    };

    // Save custom item price
    const handleSaveCustomPrice = async (itemId: string) => {
        const price = parseFloat(editingPrice);
        if (isNaN(price) || price < 0) {
            alert('Please enter a valid price');
            return;
        }

        setSavingPrice(true);
        try {
            const response = await fetch(`/api/admin/order-items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ unit_price: price }),
            });

            if (response.ok) {
                // Update the selected order with new price
                if (selectedOrder) {
                    const updatedItems = selectedOrder.order_items.map(item =>
                        item.id === itemId ? { ...item, unit_price: price } : item
                    );
                    const subtotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
                    const newTotal = subtotal + (selectedOrder.delivery_price ?? 0);
                    setSelectedOrder({
                        ...selectedOrder,
                        order_items: updatedItems,
                        total: newTotal,
                    });
                    // Also update in orders list
                    setOrders(prev => prev.map(o =>
                        o.id === selectedOrder.id
                            ? {
                                ...o,
                                total: newTotal,
                                order_items: o.order_items?.map((item) =>
                                    item.id === itemId ? { ...item, unit_price: price } : item
                                ),
                            }
                            : o
                    ));
                }
                setEditingItemId(null);
                setEditingPrice('');
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update price');
            }
        } catch (err) {
            console.error('Save price error:', err);
            alert('Failed to save price');
        } finally {
            setSavingPrice(false);
        }
    };

    // Save delivery price
    const handleSaveDeliveryPrice = async () => {
        if (!selectedOrder) return;

        const price = parseFloat(deliveryPriceInput);
        if (isNaN(price) || price < 0) {
            alert('Please enter a valid delivery price');
            return;
        }

        setSavingDeliveryPrice(true);
        try {
            const response = await fetch(`/api/orders/${selectedOrder.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ delivery_price: price }),
            });

            if (response.ok) {
                const result = await response.json();
                // Update selected order with new delivery price and total
                setSelectedOrder({
                    ...selectedOrder,
                    delivery_price: price,
                    total: result.order?.total || selectedOrder.total,
                });
                // Update in orders list
                setOrders(prev => prev.map(o =>
                    o.id === selectedOrder.id ? { ...o, delivery_price: price, total: result.order?.total || o.total } : o
                ));
                setEditingDeliveryPrice(false);
                setDeliveryPriceInput('');
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update delivery price');
            }
        } catch (err) {
            console.error('Save delivery price error:', err);
            alert('Failed to save delivery price');
        } finally {
            setSavingDeliveryPrice(false);
        }
    };

    // Calculate stats
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const processingCount = orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length;
    const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
    const pendingApprovalCount = users.filter(u => !u.approved).length;

    // Open order detail panel
    const openOrderPanel = async (orderId: string) => {
        setLoadingDetails(true);
        setPanelOpen(true);
        setSelectedOrder(null);
        try {
            console.log('Fetching order:', orderId);
            const response = await fetch(`/api/admin/orders/${orderId}`);
            console.log('Response status:', response.status);
            const result = await response.json();
            console.log('Response data:', result);
            if (response.ok && result.order) {
                setSelectedOrder(result.order);
            } else {
                console.error('API error:', result.error || 'Unknown error');
            }
        } catch (err) {
            console.error('Failed to fetch order details:', err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closePanel = () => {
        setPanelOpen(false);
        setTimeout(() => setSelectedOrder(null), 300);
    };

    const copyOrderId = () => {
        if (selectedOrder) {
            navigator.clipboard.writeText(selectedOrder.id);
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
        }
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

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-secondary-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center">
                                <Image src="/logo.jpg" alt="Grunge Pallets" width={140} height={40} className="h-10 w-auto" />
                            </Link>
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
                                ADMIN
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-secondary-500">
                                {profile?.contact_name}
                            </span>
                            <Button variant="outline" size="sm" onClick={() => {
                                window.location.href = '/login';
                                signOut();
                            }}>
                                <LogOut size={16} className="mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'orders'
                            ? 'bg-primary text-white'
                            : 'bg-white text-secondary-500 hover:bg-secondary-100'
                            }`}
                    >
                        <ShoppingCart size={20} />
                        Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'users'
                            ? 'bg-primary text-white'
                            : 'bg-white text-secondary-500 hover:bg-secondary-100'
                            }`}
                    >
                        <Users size={20} />
                        Users
                        {pendingApprovalCount > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                {pendingApprovalCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('pickups')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'pickups'
                            ? 'bg-primary text-white'
                            : 'bg-white text-secondary-500 hover:bg-secondary-100'
                            }`}
                    >
                        <Truck size={20} />
                        Pickups
                    </button>
                    <Link
                        href="/admin/products"
                        className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors bg-white text-secondary-500 hover:bg-secondary-100"
                    >
                        <Package size={20} />
                        Products
                    </Link>
                </div>

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <>
                        <h1 className="text-2xl font-bold text-secondary mb-8">Order Management</h1>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card padding="md">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <ShoppingCart size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-secondary">{orders.length}</p>
                                        <p className="text-sm text-secondary-400">Total Orders</p>
                                    </div>
                                </div>
                            </Card>
                            <Card padding="md">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <Package size={24} className="text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-secondary">{pendingCount}</p>
                                        <p className="text-sm text-secondary-400">Pending</p>
                                    </div>
                                </div>
                            </Card>
                            <Card padding="md">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <RefreshCw size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-secondary">{processingCount}</p>
                                        <p className="text-sm text-secondary-400">In Progress</p>
                                    </div>
                                </div>
                            </Card>
                            <Card padding="md">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <TrendingUp size={24} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-secondary">${totalRevenue.toFixed(2)}</p>
                                        <p className="text-sm text-secondary-400">Total Revenue</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Filters */}
                        <Card padding="md" className="mb-6">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === 'all' ? 'bg-primary text-white' : 'bg-secondary-100 text-secondary-500 hover:bg-secondary-200'
                                        }`}
                                >
                                    All Orders
                                </button>
                                {statusOptions.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${statusFilter === status ? 'bg-primary text-white' : 'bg-secondary-100 text-secondary-500 hover:bg-secondary-200'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Orders Table */}
                        <Card padding="none" className="overflow-hidden">
                            {ordersLoading ? (
                                <div className="text-center py-16">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    <p className="text-secondary-400 mt-4">Loading orders...</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-16">
                                    <Package size={48} className="text-secondary-200 mx-auto mb-4" />
                                    <p className="text-secondary-400">No orders found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-secondary-50">
                                            <tr>
                                                <th className="text-left text-sm font-semibold text-secondary px-6 py-4">Order</th>
                                                <th className="text-left text-sm font-semibold text-secondary px-4 py-4">Customer</th>
                                                <th className="text-left text-sm font-semibold text-secondary px-4 py-4">Date</th>
                                                <th className="text-right text-sm font-semibold text-secondary px-4 py-4">Total</th>
                                                <th className="text-center text-sm font-semibold text-secondary px-4 py-4">Status</th>
                                                <th className="text-center text-sm font-semibold text-secondary px-4 py-4">Delivery Date</th>
                                                <th className="text-center text-sm font-semibold text-secondary px-4 py-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-secondary-100">
                                            {orders.map((order) => (
                                                <tr
                                                    key={order.id}
                                                    className="hover:bg-primary/5 transition-colors cursor-pointer"
                                                    onClick={() => openOrderPanel(order.id)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <p className="font-semibold text-secondary">
                                                            {order.id.slice(0, 8)}...
                                                        </p>
                                                        <p className="text-xs text-secondary-400">{order.order_items?.length || 0} items</p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="font-medium text-secondary">{order.profiles?.company_name || 'N/A'}</p>
                                                        <p className="text-sm text-secondary-400">{order.profiles?.contact_name}</p>
                                                    </td>
                                                    <td className="px-4 py-4 text-secondary-500">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-semibold text-secondary">
                                                        ${order.total.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                                            disabled={updatingOrder === order.id}
                                                            className={`block w-full px-3 py-1.5 text-sm font-medium border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer ${order.status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                                                order.status === 'confirmed' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                                                    order.status === 'processing' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                                                        order.status === 'shipped' ? 'bg-cyan-50 border-cyan-200 text-cyan-700' :
                                                                            order.status === 'delivered' ? 'bg-green-50 border-green-200 text-green-700' :
                                                                                order.status === 'cancelled' ? 'bg-red-50 border-red-200 text-red-700' :
                                                                                    'bg-secondary-50 border-secondary-200 text-secondary-700'
                                                                }`}
                                                        >
                                                            {statusOptions.map((status) => {
                                                                const readiness = getPendingReadiness(order);
                                                                const disabled = order.status === 'pending' && status !== 'pending' && status !== 'cancelled' && !readiness.ok;
                                                                return (
                                                                    <option key={status} value={status} disabled={disabled}>
                                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="date"
                                                            value={order.delivery_date || ''}
                                                            onChange={(e) => handleDeliveryDateChange(order.id, e.target.value)}
                                                            className="block w-full px-3 py-1.5 text-sm border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }}
                                                            disabled={updatingOrder === order.id}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                                                            title="Delete order"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>
                    </>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <>
                        <h1 className="text-2xl font-bold text-secondary mb-8">User Management</h1>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card padding="md">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <Users size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-secondary">{users.length}</p>
                                        <p className="text-sm text-secondary-400">Total Users</p>
                                    </div>
                                </div>
                            </Card>
                            <Card padding="md">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <XCircle size={24} className="text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-secondary">{pendingApprovalCount}</p>
                                        <p className="text-sm text-secondary-400">Pending Approval</p>
                                    </div>
                                </div>
                            </Card>
                            <Card padding="md">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <CheckCircle size={24} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-secondary">{users.filter(u => u.approved).length}</p>
                                        <p className="text-sm text-secondary-400">Approved</p>
                                    </div>
                                </div>
                            </Card>
                            <Card padding="md">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <Shield size={24} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-secondary">{users.filter(u => u.is_admin).length}</p>
                                        <p className="text-sm text-secondary-400">Admins</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Users Table */}
                        <Card padding="none" className="overflow-hidden">
                            {usersLoading ? (
                                <div className="text-center py-16">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    <p className="text-secondary-400 mt-4">Loading users...</p>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-16">
                                    <Users size={48} className="text-secondary-200 mx-auto mb-4" />
                                    <p className="text-secondary-400">No users found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-secondary-50">
                                            <tr>
                                                <th className="text-left text-sm font-semibold text-secondary px-6 py-4">Company</th>
                                                <th className="text-left text-sm font-semibold text-secondary px-4 py-4">Contact</th>
                                                <th className="text-left text-sm font-semibold text-secondary px-4 py-4">Location</th>
                                                <th className="text-left text-sm font-semibold text-secondary px-4 py-4">Joined</th>
                                                <th className="text-center text-sm font-semibold text-secondary px-4 py-4">Status</th>
                                                <th className="text-center text-sm font-semibold text-secondary px-4 py-4">Role</th>
                                                <th className="text-center text-sm font-semibold text-secondary px-4 py-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-secondary-100">
                                            {users.map((user) => {
                                                const emailVerified = Boolean(user.email_verified);

                                                return (
                                                    <tr key={user.id} className={`hover:bg-secondary-50/50 transition-colors ${!user.approved ? 'bg-yellow-50/50' : ''} ${user.id === currentUserId ? 'bg-primary/5' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div>
                                                                <p className="font-semibold text-secondary">{user.company_name || 'N/A'}</p>
                                                                {user.email && (
                                                                    <a
                                                                        href={`mailto:${user.email}`}
                                                                        className="block text-xs text-secondary-400 hover:text-primary transition-colors break-all"
                                                                    >
                                                                        {user.email}
                                                                    </a>
                                                                )}
                                                                <p className="text-xs text-secondary-400">{user.phone}</p>
                                                            </div>
                                                            {user.id === currentUserId && (
                                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">You</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="font-medium text-secondary">{user.contact_name || 'N/A'}</p>
                                                    </td>
                                                    <td className="px-4 py-4 text-secondary-500">
                                                        {user.city && user.state ? `${user.city}, ${user.state}` : 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4 text-secondary-500">
                                                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {user.id === currentUserId ? (
                                                            <span className="block w-full px-3 py-1.5 text-sm font-medium border-2 rounded-lg bg-secondary-100 border-secondary-200 text-secondary-400">
                                                                {user.approved ? 'Approved' : 'Pending'}
                                                            </span>
                                                        ) : !emailVerified ? (
                                                            <div title="Email not verified">
                                                                <select
                                                                    value={user.approved ? 'approved' : 'pending'}
                                                                    disabled
                                                                    className="block w-full px-3 py-1.5 text-sm font-medium border-2 rounded-lg bg-secondary-100 border-secondary-200 text-secondary-400 opacity-60 cursor-not-allowed"
                                                                >
                                                                    <option value="approved">Approved</option>
                                                                    <option value="pending">Pending</option>
                                                                </select>
                                                            </div>
                                                        ) : (
                                                            <select
                                                                value={user.approved ? 'approved' : 'pending'}
                                                                onChange={(e) => handleUserUpdate(user.id, 'approved', e.target.value === 'approved')}
                                                                disabled={updatingUser === user.id}
                                                                className={`block w-full px-3 py-1.5 text-sm font-medium border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer ${user.approved
                                                                    ? 'bg-green-50 border-green-200 text-green-700'
                                                                    : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                                                                    } ${updatingUser === user.id ? 'opacity-50' : ''}`}
                                                            >
                                                                <option value="approved">Approved</option>
                                                                <option value="pending">Pending</option>
                                                            </select>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {user.id === currentUserId ? (
                                                            <span className="block w-full px-3 py-1.5 text-sm font-medium border-2 rounded-lg bg-secondary-100 border-secondary-200 text-secondary-400">
                                                                {user.is_admin ? 'Admin' : 'User'}
                                                            </span>
                                                        ) : !emailVerified ? (
                                                            <div title="Email not verified">
                                                                <select
                                                                    value={user.is_admin ? 'admin' : 'user'}
                                                                    disabled
                                                                    className="block w-full px-3 py-1.5 text-sm font-medium border-2 rounded-lg bg-secondary-100 border-secondary-200 text-secondary-400 opacity-60 cursor-not-allowed"
                                                                >
                                                                    <option value="admin">Admin</option>
                                                                    <option value="user">User</option>
                                                                </select>
                                                            </div>
                                                        ) : (
                                                            <select
                                                                value={user.is_admin ? 'admin' : 'user'}
                                                                onChange={(e) => handleUserUpdate(user.id, 'is_admin', e.target.value === 'admin')}
                                                                disabled={updatingUser === user.id}
                                                                className={`block w-full px-3 py-1.5 text-sm font-medium border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer ${user.is_admin
                                                                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                                                                    : 'bg-secondary-50 border-secondary-200 text-secondary-700'
                                                                    } ${updatingUser === user.id ? 'opacity-50' : ''}`}
                                                            >
                                                                <option value="admin">Admin</option>
                                                                <option value="user">User</option>
                                                            </select>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        {user.id === currentUserId ? (
                                                            <span className="text-secondary-300">—</span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                disabled={updatingUser === user.id}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                                                                title="Delete user"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>
                    </>
                )}

                {/* Pickups Tab */}
                {activeTab === 'pickups' && (
                    <>
                        <h1 className="text-2xl font-bold text-secondary mb-8">Pickup Management</h1>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card padding="md">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <Truck size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-secondary">{pickups.length}</p>
                                        <p className="text-sm text-secondary-400">Total Pickups</p>
                                    </div>
                                </div>
                            </Card>
                            <Card padding="md">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <Package size={24} className="text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-secondary">{pickups.filter(p => p.status === 'pending').length}</p>
                                        <p className="text-sm text-secondary-400">Pending</p>
                                    </div>
                                </div>
                            </Card>
                            <Card padding="md">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Calendar size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-secondary">{pickups.filter(p => p.status === 'scheduled').length}</p>
                                        <p className="text-sm text-secondary-400">Scheduled</p>
                                    </div>
                                </div>
                            </Card>
                            <Card padding="md">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <TrendingUp size={24} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-secondary">
                                            ${pickups.filter(p => p.total_payout).reduce((sum, p) => sum + (p.total_payout || 0), 0).toFixed(2)}
                                        </p>
                                        <p className="text-sm text-secondary-400">Total Paid Out</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Pickups Table */}
                        <Card padding="none" className="overflow-hidden">
                            {pickupsLoading ? (
                                <div className="text-center py-16">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    <p className="text-secondary-400 mt-4">Loading pickups...</p>
                                </div>
                            ) : pickups.length === 0 ? (
                                <div className="text-center py-16">
                                    <Truck size={48} className="text-secondary-200 mx-auto mb-4" />
                                    <p className="text-secondary-400">No pickup requests yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-secondary-50">
                                            <tr>
                                                <th className="text-left text-sm font-semibold text-secondary px-6 py-4">Date</th>
                                                <th className="text-left text-sm font-semibold text-secondary px-4 py-4">Company</th>
                                                <th className="text-left text-sm font-semibold text-secondary px-4 py-4">Condition</th>
                                                <th className="text-right text-sm font-semibold text-secondary px-4 py-4">Quantity</th>
                                                <th className="text-center text-sm font-semibold text-secondary px-4 py-4">Status</th>
                                                <th className="text-center text-sm font-semibold text-secondary px-4 py-4">Scheduled</th>
                                                <th className="text-right text-sm font-semibold text-secondary px-4 py-4">Payout</th>
                                                <th className="text-center text-sm font-semibold text-secondary px-4 py-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-secondary-100">
                                            {pickups.map((pickup) => (
                                                <tr
                                                    key={pickup.id}
                                                    className="hover:bg-primary/5 transition-colors cursor-pointer"
                                                    onClick={() => router.push(`/admin/pickups/${pickup.id}`)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <p className="font-medium text-secondary">
                                                            {new Date(pickup.created_at).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-xs text-secondary-400">
                                                            {pickup.preferred_date && `Preferred: ${new Date(pickup.preferred_date).toLocaleDateString()}`}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="font-medium text-secondary">{pickup.profiles?.company_name}</p>
                                                        <p className="text-sm text-secondary-400">{pickup.profiles?.contact_name}</p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${pickup.pallet_condition === 'grade-a' ? 'bg-green-100 text-green-700' :
                                                            pickup.pallet_condition === 'grade-b' ? 'bg-blue-100 text-blue-700' :
                                                                pickup.pallet_condition === 'mixed' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-red-100 text-red-700'
                                                            }`}>
                                                            {pickup.pallet_condition.replace('-', ' ').toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <span className="font-semibold text-secondary">
                                                            {pickup.actual_quantity || pickup.estimated_quantity}
                                                        </span>
                                                        {pickup.actual_quantity && pickup.actual_quantity !== pickup.estimated_quantity && (
                                                            <span className="text-xs text-secondary-400 ml-1">
                                                                (est. {pickup.estimated_quantity})
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                                        <select
                                                            value={pickup.status}
                                                            onChange={(e) => handlePickupStatusChange(pickup.id, e.target.value)}
                                                            disabled={updatingPickup === pickup.id}
                                                            className={`block w-full px-3 py-1.5 text-sm font-medium border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer ${pickup.status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                                                pickup.status === 'scheduled' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                                                    pickup.status === 'completed' ? 'bg-green-50 border-green-200 text-green-700' :
                                                                        'bg-red-50 border-red-200 text-red-700'
                                                                } ${updatingPickup === pickup.id ? 'opacity-50' : ''}`}
                                                        >
                                                            {pickupStatusOptions.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="date"
                                                            value={pickup.scheduled_date || ''}
                                                            onChange={(e) => handlePickupDateChange(pickup.id, e.target.value)}
                                                            className="block w-full px-3 py-1.5 text-sm border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        {pickup.total_payout ? (
                                                            <span className="font-semibold text-green-600">${pickup.total_payout.toFixed(2)}</span>
                                                        ) : pickup.price_per_pallet ? (
                                                            <span className="text-secondary-400">${pickup.price_per_pallet}/ea</span>
                                                        ) : (
                                                            <span className="text-secondary-300">TBD</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => handleDeletePickup(pickup.id)}
                                                            disabled={updatingPickup === pickup.id}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                                                            title="Delete pickup"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>
                    </>
                )}
            </main>

            {/* Order Details Slide Panel */}
            {panelOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                        onClick={closePanel}
                    />

                    {/* Panel */}
                    <div className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ${panelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        {/* Panel Header */}
                        <div className="sticky top-0 bg-white border-b border-secondary-100 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-xl font-bold text-secondary">Order Details</h2>
                            <button
                                onClick={closePanel}
                                className="p-2 hover:bg-secondary-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {loadingDetails ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : selectedOrder ? (
                            <div className="p-6 space-y-6">
                                {/* Order ID */}
                                <div className="bg-secondary-50 rounded-lg p-4">
                                    <p className="text-sm text-secondary-400 mb-1">Order ID</p>
                                    <div className="flex items-center gap-2">
                                        <code className="text-sm font-mono text-secondary bg-white px-2 py-1 rounded border border-secondary-200 flex-1 break-all">
                                            {selectedOrder.id}
                                        </code>
                                        <button
                                            onClick={copyOrderId}
                                            className="p-2 text-secondary-400 hover:text-primary hover:bg-white rounded transition-colors"
                                        >
                                            {copiedId ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                        </span>
                                        <span className="text-sm text-secondary-500">
                                            {new Date(selectedOrder.created_at).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Package size={18} className="text-secondary-400" />
                                        <h3 className="font-semibold text-secondary">Order Items ({selectedOrder.order_items.length})</h3>
                                    </div>
                                    <div className="border border-secondary-200 rounded-lg overflow-hidden">
                                        {selectedOrder.order_items.map((item, index) => {
                                            const isCustomItem = item.is_custom || item.product_id.includes('custom-pallet') || item.product_name.toLowerCase().startsWith('custom');
                                            let customSpecs: CustomSpecs | null = null;
                                            if (item.custom_specs) {
                                                try {
                                                    customSpecs = JSON.parse(item.custom_specs);
                                                } catch (e) {
                                                    console.error('Failed to parse custom specs:', e);
                                                }
                                            }

                                            return (
                                                <div key={item.id} className={`p-4 ${index > 0 ? 'border-t border-secondary-100' : ''} ${isCustomItem ? 'bg-amber-50' : ''}`}>
                                                    <div className="flex items-start gap-4">
                                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isCustomItem ? 'bg-amber-100' : 'bg-secondary-100'}`}>
                                                            <Package size={20} className={isCustomItem ? 'text-amber-600' : 'text-secondary-400'} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium text-secondary truncate">{item.product_name}</p>
                                                                {isCustomItem && (
                                                                    <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-medium rounded">Custom</span>
                                                                )}
                                                            </div>
                                                            {customSpecs && (
                                                                <div className="mt-1 text-xs text-amber-700 bg-amber-100 rounded px-2 py-1 space-y-1">
                                                                    {customSpecs.gradeLabel && (
                                                                        <p><span className="font-medium">Grade:</span> {customSpecs.gradeLabel}</p>
                                                                    )}
                                                                    <p>
                                                                        <span className="font-medium">Dimensions:</span> {customSpecs.length}&quot; × {customSpecs.width}&quot;
                                                                        {customSpecs.height && ` × ${customSpecs.height}"`}
                                                                    </p>
                                                                    {customSpecs.notes && (
                                                                        <p><span className="font-medium">Notes:</span> {customSpecs.notes}</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {!isCustomItem && (
                                                                <p className="text-sm text-secondary-400">ID: {item.product_id}</p>
                                                            )}
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            {/* Show editing UI if this item is being edited */}
                                                            {editingItemId === item.id ? (
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.01"
                                                                        value={editingPrice}
                                                                        onChange={(e) => setEditingPrice(e.target.value)}
                                                                        placeholder="0.00"
                                                                        className="w-20 px-2 py-1 text-sm border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                                        disabled={savingPrice}
                                                                    />
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleSaveCustomPrice(item.id); }}
                                                                        disabled={savingPrice}
                                                                        className="px-2 py-1 bg-amber-500 text-white text-xs rounded hover:bg-amber-600 disabled:opacity-50"
                                                                    >
                                                                        {savingPrice ? '...' : 'Save'}
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setEditingItemId(null); setEditingPrice(''); }}
                                                                        className="px-2 py-1 bg-secondary-200 text-secondary-600 text-xs rounded hover:bg-secondary-300"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ) : isCustomItem && (!item.unit_price || item.unit_price === 0) ? (
                                                                /* Custom item with no price - show Set Price button */
                                                                <div>
                                                                    <p className="text-xs text-amber-600 mb-1">Qty: {item.quantity} × TBD</p>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setEditingItemId(item.id);
                                                                            setEditingPrice('');
                                                                        }}
                                                                        className="px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded hover:bg-amber-600"
                                                                    >
                                                                        Set Price
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                /* Regular item or custom item with existing price */
                                                                <>
                                                                    <p className="text-sm text-secondary-500">{item.quantity} × ${item.unit_price.toFixed(2)}</p>
                                                                    <p className="font-semibold text-secondary">${(item.quantity * item.unit_price).toFixed(2)}</p>
                                                                    {isCustomItem && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setEditingItemId(item.id);
                                                                                setEditingPrice(item.unit_price.toString());
                                                                            }}
                                                                            className="text-xs text-amber-600 hover:underline mt-1"
                                                                        >
                                                                            Edit Price
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div className="p-4 bg-secondary-50 border-t border-secondary-200">
                                            {selectedOrder.order_items.some(item => item.is_custom && item.unit_price === 0) && (
                                                <p className="text-xs text-amber-600 mb-2">* Excludes custom items needing pricing</p>
                                            )}
                                            <div className="flex justify-between text-sm text-secondary-500 mb-1">
                                                <span>Subtotal</span>
                                                <span>${selectedOrder.order_items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-secondary-500 mb-2">
                                                <span>Delivery</span>
                                                {editingDeliveryPrice ? (
                                                    <div className="flex items-center gap-2">
                                                        <span>$</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={deliveryPriceInput}
                                                            onChange={(e) => setDeliveryPriceInput(e.target.value)}
                                                            placeholder="0.00"
                                                            className="w-20 px-2 py-1 text-sm border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                                            disabled={savingDeliveryPrice}
                                                        />
                                                        <button
                                                            onClick={handleSaveDeliveryPrice}
                                                            disabled={savingDeliveryPrice}
                                                            className="px-2 py-1 bg-primary text-white text-xs rounded hover:bg-primary-600 disabled:opacity-50"
                                                        >
                                                            {savingDeliveryPrice ? '...' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={() => { setEditingDeliveryPrice(false); setDeliveryPriceInput(''); }}
                                                            className="px-2 py-1 bg-secondary-200 text-secondary-600 text-xs rounded hover:bg-secondary-300"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ) : selectedOrder.delivery_price != null ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-green-600 font-medium">${selectedOrder.delivery_price.toFixed(2)}</span>
                                                        <button
                                                            onClick={() => {
                                                                setEditingDeliveryPrice(true);
                                                                setDeliveryPriceInput(selectedOrder.delivery_price?.toString() || '');
                                                            }}
                                                            className="text-xs text-primary hover:underline"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-amber-600">TBD</span>
                                                        <button
                                                            onClick={() => {
                                                                setEditingDeliveryPrice(true);
                                                                setDeliveryPriceInput('');
                                                            }}
                                                            className="px-2 py-1 bg-primary text-white text-xs font-medium rounded hover:bg-primary-600"
                                                        >
                                                            Set Price
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between border-t border-secondary-200 pt-2">
                                                <span className="font-semibold text-secondary">Total</span>
                                                <span className="font-bold text-primary text-lg">${selectedOrder.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Notes */}
                                {selectedOrder.delivery_notes && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText size={18} className="text-secondary-400" />
                                            <h3 className="font-semibold text-secondary">Delivery Notes</h3>
                                        </div>
                                        <div className="border border-secondary-200 rounded-lg p-4">
                                            <p className="text-secondary-600 whitespace-pre-wrap">{selectedOrder.delivery_notes}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Customer Info */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <User size={18} className="text-secondary-400" />
                                        <h3 className="font-semibold text-secondary">Customer Information</h3>
                                    </div>
                                    <div className="border border-secondary-200 rounded-lg p-4 space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Company</p>
                                                <p className="font-medium text-secondary">{selectedOrder.profiles?.company_name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Contact</p>
                                                <p className="font-medium text-secondary">{selectedOrder.profiles?.contact_name || 'N/A'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Phone</p>
                                                <a href={`tel:${selectedOrder.profiles?.phone}`} className="text-primary hover:underline text-sm">
                                                    {selectedOrder.profiles?.phone || 'N/A'}
                                                </a>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Email</p>
                                                {selectedOrder.profiles?.email ? (
                                                    <a href={`mailto:${selectedOrder.profiles.email}`} className="text-primary hover:underline text-sm break-all">
                                                        {selectedOrder.profiles.email}
                                                    </a>
                                                ) : (
                                                    <p className="text-secondary-600 text-sm">N/A</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPin size={18} className="text-secondary-400" />
                                        <h3 className="font-semibold text-secondary">Delivery Address</h3>
                                    </div>
                                    <div className="border border-secondary-200 rounded-lg p-4">
                                        <p className="text-secondary">{selectedOrder.profiles?.address || 'No address'}</p>
                                        <p className="text-secondary">
                                            {selectedOrder.profiles?.city}{selectedOrder.profiles?.city && selectedOrder.profiles?.state ? ', ' : ''}
                                            {selectedOrder.profiles?.state} {selectedOrder.profiles?.zip}
                                        </p>
                                    </div>
                                </div>

                                {/* Delivery Date */}
                                {selectedOrder.delivery_date && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Calendar size={18} className="text-secondary-400" />
                                            <h3 className="font-semibold text-secondary">Scheduled Delivery</h3>
                                        </div>
                                        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                                            <p className="text-green-700 font-medium">
                                                {new Date(selectedOrder.delivery_date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-16">
                                <p className="text-secondary-400">Order not found</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
