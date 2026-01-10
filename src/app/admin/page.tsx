'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { Package, ShoppingCart, TrendingUp, LogOut, RefreshCw, Users, Shield, CheckCircle, XCircle, Trash2, X, Copy, Check, User, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Order, OrderStatus, Profile } from '@/lib/supabase/types';

const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

interface OrderWithProfile extends Order {
    profiles?: {
        company_name: string;
        contact_name: string;
    };
    order_items?: OrderItem[];
}

interface CustomSpecs {
    length: string;
    width: string;
    height?: string;
    notes?: string;
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

type AdminTab = 'orders' | 'users';

export default function AdminPage() {
    const { signOut, profile, user: authUser, loading: authLoading } = useAuth();
    const currentUserId = authUser?.id || profile?.id;
    const [activeTab, setActiveTab] = useState<AdminTab>('orders');

    // Debug log to check currentUserId
    console.log('Auth Debug:', { authUserId: authUser?.id, profileId: profile?.id, currentUserId, authLoading });

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

    // Users state
    const [users, setUsers] = useState<Profile[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [updatingUser, setUpdatingUser] = useState<string | null>(null);

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
    }, [activeTab]);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        setUpdatingOrder(orderId);

        const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        }

        setUpdatingOrder(null);
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

            if (response.ok) {
                setUsers(prev => prev.map(user =>
                    user.id === userId ? { ...user, [field]: value } : user
                ));
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update user');
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
                    const newTotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
                    setSelectedOrder({
                        ...selectedOrder,
                        order_items: updatedItems,
                        total: newTotal,
                    });
                    // Also update in orders list
                    setOrders(prev => prev.map(o =>
                        o.id === selectedOrder.id ? { ...o, total: newTotal } : o
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
                            <Link href="/" className="text-xl font-black text-secondary">
                                GRUNGE <span className="text-primary">PALLETS</span>
                            </Link>
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
                                ADMIN
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-secondary-500">
                                {profile?.contact_name}
                            </span>
                            <Button variant="outline" size="sm" onClick={signOut}>
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
                                                            {statusOptions.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                </option>
                                                            ))}
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
                                            {users.map((user) => (
                                                <tr key={user.id} className={`hover:bg-secondary-50/50 transition-colors ${!user.approved ? 'bg-yellow-50/50' : ''} ${user.id === currentUserId ? 'bg-primary/5' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div>
                                                                <p className="font-semibold text-secondary">{user.company_name || 'N/A'}</p>
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
                                            const isCustomItem = item.is_custom || item.product_id.includes('custom-pallet');
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
                                                                <div className="mt-1 text-xs text-amber-700 bg-amber-100 rounded px-2 py-1 inline-block">
                                                                    <span className="font-medium">Dimensions:</span> {customSpecs.length}&quot; × {customSpecs.width}&quot;
                                                                    {customSpecs.height && ` × ${customSpecs.height}"`}
                                                                    {customSpecs.notes && (
                                                                        <p className="mt-1"><span className="font-medium">Notes:</span> {customSpecs.notes}</p>
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
                                        <div className="p-4 bg-secondary-50 border-t border-secondary-200 flex justify-between">
                                            <span className="font-semibold text-secondary">Total</span>
                                            <div className="text-right">
                                                {selectedOrder.order_items.some(item => item.is_custom && item.unit_price === 0) && (
                                                    <p className="text-xs text-amber-600 mb-1">* Excludes custom items needing pricing</p>
                                                )}
                                                <span className="font-bold text-primary text-lg">${selectedOrder.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

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
