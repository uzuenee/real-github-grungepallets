'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, Badge, Input } from '@/components/ui';
import { ArrowLeft, Truck, User, MapPin, Calendar, Copy, Check, DollarSign } from 'lucide-react';

type PickupStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';
const statusOptions: PickupStatus[] = ['pending', 'scheduled', 'completed', 'cancelled'];

const conditionLabels: Record<string, string> = {
    'grade-a': 'Grade A (Like new)',
    'grade-b': 'Grade B (Good condition)',
    'mixed': 'Mixed conditions',
    'damaged': 'Damaged/Broken',
};

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

interface Pickup {
    id: string;
    user_id: string;
    status: PickupStatus;
    pallet_condition: string;
    estimated_quantity: number;
    actual_quantity: number | null;
    pickup_address: string;
    pickup_city: string;
    pickup_state: string;
    pickup_zip: string;
    preferred_date: string | null;
    scheduled_date: string | null;
    notes: string | null;
    admin_notes: string | null;
    price_per_pallet: number | null;
    total_payout: number | null;
    created_at: string;
    updated_at: string;
    profiles: CustomerProfile | null;
}

export default function AdminPickupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const pickupId = params.id as string;

    const [pickup, setPickup] = useState<Pickup | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [copiedId, setCopiedId] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Editable fields
    const [pricePerPallet, setPricePerPallet] = useState('');
    const [actualQuantity, setActualQuantity] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        const fetchPickup = async () => {
            try {
                const response = await fetch(`/api/admin/pickups/${pickupId}`);
                if (response.ok) {
                    const result = await response.json();
                    setPickup(result.pickup);
                    // Initialize editable fields
                    setPricePerPallet(result.pickup.price_per_pallet?.toString() || '');
                    setActualQuantity(result.pickup.actual_quantity?.toString() || '');
                    setAdminNotes(result.pickup.admin_notes || '');
                } else if (response.status === 404) {
                    setNotFound(true);
                }
            } catch (err) {
                console.error('Failed to fetch pickup:', err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        if (pickupId) {
            fetchPickup();
        }
    }, [pickupId]);

    const handleStatusChange = async (newStatus: PickupStatus) => {
        if (!pickup) return;
        setUpdating(true);

        try {
            const response = await fetch(`/api/admin/pickups/${pickupId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setPickup(prev => prev ? { ...prev, status: newStatus } : null);
                setSaveMessage('Status updated!');
                setTimeout(() => setSaveMessage(''), 2000);
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setUpdating(false);
        }
    };

    const handleScheduledDateChange = async (date: string) => {
        if (!pickup) return;

        try {
            await fetch(`/api/admin/pickups/${pickupId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scheduled_date: date }),
            });

            setPickup(prev => prev ? { ...prev, scheduled_date: date } : null);
        } catch (err) {
            console.error('Failed to update scheduled date:', err);
        }
    };

    const handleSavePricing = async () => {
        if (!pickup) return;
        setUpdating(true);

        const price = parseFloat(pricePerPallet) || 0;
        const quantity = parseInt(actualQuantity) || pickup.estimated_quantity;
        const total = price * quantity;

        try {
            const response = await fetch(`/api/admin/pickups/${pickupId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    price_per_pallet: price,
                    actual_quantity: quantity,
                    total_payout: total,
                    admin_notes: adminNotes,
                }),
            });

            if (response.ok) {
                setPickup(prev => prev ? {
                    ...prev,
                    price_per_pallet: price,
                    actual_quantity: quantity,
                    total_payout: total,
                    admin_notes: adminNotes,
                } : null);
                setSaveMessage('Pricing saved!');
                setTimeout(() => setSaveMessage(''), 2000);
            }
        } catch (err) {
            console.error('Failed to save pricing:', err);
        } finally {
            setUpdating(false);
        }
    };

    const copyPickupId = () => {
        navigator.clipboard.writeText(pickupId);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
            case 'scheduled': return 'bg-blue-50 border-blue-200 text-blue-700';
            case 'completed': return 'bg-green-50 border-green-200 text-green-700';
            case 'cancelled': return 'bg-red-50 border-red-200 text-red-700';
            default: return 'bg-secondary-50 border-secondary-200 text-secondary-700';
        }
    };

    // Calculate payout preview
    const previewPayout = () => {
        const price = parseFloat(pricePerPallet) || 0;
        const quantity = parseInt(actualQuantity) || pickup?.estimated_quantity || 0;
        return (price * quantity).toFixed(2);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-secondary-400 mt-4">Loading pickup details...</p>
                </div>
            </div>
        );
    }

    if (notFound || !pickup) {
        return (
            <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                <div className="text-center">
                    <Truck size={64} className="text-secondary-200 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-secondary mb-2">Pickup Not Found</h1>
                    <p className="text-secondary-400 mb-8">We couldn&apos;t find a pickup with that ID.</p>
                    <Link href="/admin">
                        <Button variant="primary">Back to Admin</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const fullAddress = [pickup.pickup_address, pickup.pickup_city, pickup.pickup_state, pickup.pickup_zip]
        .filter(Boolean)
        .join(', ');

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-secondary-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center">
                                <img src="/logo.jpg" alt="Grunge Pallets" className="h-10 w-auto" />
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
                    Back to Pickup Management
                </Link>

                {/* Pickup Header */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-secondary">
                                Pickup Request Details
                            </h1>
                            <Badge variant={pickup.status === 'completed' ? 'success' : pickup.status === 'cancelled' ? 'warning' : 'info'}>
                                {pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="text-sm text-secondary-500 bg-secondary-100 px-2 py-1 rounded font-mono">
                                {pickupId}
                            </code>
                            <button
                                onClick={copyPickupId}
                                className="p-1 text-secondary-400 hover:text-primary transition-colors"
                                title="Copy Pickup ID"
                            >
                                {copiedId ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                        </div>
                        <p className="text-secondary-400 mt-2">
                            Requested on {new Date(pickup.created_at).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    {saveMessage && (
                        <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium">
                            ✓ {saveMessage}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Pickup Details */}
                        <Card padding="none" className="overflow-hidden">
                            <div className="bg-secondary-50 px-6 py-4 flex items-center gap-2">
                                <Truck size={20} className="text-secondary-400" />
                                <h2 className="font-bold text-secondary">Pickup Details</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-secondary-400 uppercase tracking-wider mb-2">Pallet Condition</h3>
                                        <p className="font-medium text-secondary">{conditionLabels[pickup.pallet_condition] || pickup.pallet_condition}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-secondary-400 uppercase tracking-wider mb-2">Estimated Quantity</h3>
                                        <p className="font-medium text-secondary">{pickup.estimated_quantity} pallets</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-secondary-400 uppercase tracking-wider mb-2">Preferred Date</h3>
                                        <p className="font-medium text-secondary">
                                            {pickup.preferred_date
                                                ? new Date(pickup.preferred_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                                                : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-secondary-400 uppercase tracking-wider mb-2">Scheduled Date</h3>
                                        <p className="font-medium text-secondary">
                                            {pickup.scheduled_date
                                                ? new Date(pickup.scheduled_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                                                : 'Not scheduled'}
                                        </p>
                                    </div>
                                </div>
                                {pickup.notes && (
                                    <div className="mt-6 pt-6 border-t border-secondary-100">
                                        <h3 className="text-sm font-semibold text-secondary-400 uppercase tracking-wider mb-2">Customer Notes</h3>
                                        <p className="text-secondary-600 bg-secondary-50 p-4 rounded-lg">{pickup.notes}</p>
                                    </div>
                                )}
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
                                        <p className="font-semibold text-secondary text-lg">{pickup.profiles?.company_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-secondary-400 uppercase tracking-wider mb-2">Contact Name</h3>
                                        <p className="font-medium text-secondary">{pickup.profiles?.contact_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-secondary-400 uppercase tracking-wider mb-2">Email</h3>
                                        {pickup.profiles?.email ? (
                                            <a href={`mailto:${pickup.profiles.email}`} className="text-primary hover:underline">
                                                {pickup.profiles.email}
                                            </a>
                                        ) : (
                                            <span className="text-secondary-400">N/A</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-secondary-400 uppercase tracking-wider mb-2">Phone</h3>
                                        {pickup.profiles?.phone ? (
                                            <a href={`tel:${pickup.profiles.phone}`} className="text-primary hover:underline">
                                                {pickup.profiles.phone}
                                            </a>
                                        ) : (
                                            <span className="text-secondary-400">N/A</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Pickup Address */}
                        <Card padding="none" className="overflow-hidden">
                            <div className="bg-secondary-50 px-6 py-4 flex items-center gap-2">
                                <MapPin size={20} className="text-secondary-400" />
                                <h2 className="font-bold text-secondary">Pickup Address</h2>
                            </div>
                            <div className="p-6">
                                <div className="text-secondary-600 space-y-1">
                                    <p className="font-medium text-secondary">{pickup.profiles?.company_name || 'Customer'}</p>
                                    <p>{fullAddress || 'No address provided'}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Management */}
                        <Card padding="lg">
                            <h2 className="font-bold text-secondary mb-4">Manage Request</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-500 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={pickup.status}
                                        onChange={(e) => handleStatusChange(e.target.value as PickupStatus)}
                                        disabled={updating}
                                        className={`block w-full px-4 py-3 text-sm font-medium border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer ${getStatusColor(pickup.status)} ${updating ? 'opacity-50' : ''}`}
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
                                        Scheduled Pickup Date
                                    </label>
                                    <input
                                        type="date"
                                        value={pickup.scheduled_date || ''}
                                        onChange={(e) => handleScheduledDateChange(e.target.value)}
                                        className="block w-full px-4 py-3 text-sm border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Pricing Section */}
                        <Card padding="lg" className="border-2 border-primary/20">
                            <div className="flex items-center gap-2 mb-4">
                                <DollarSign size={20} className="text-primary" />
                                <h2 className="font-bold text-secondary">Pricing & Payout</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-500 mb-2">
                                        Actual Quantity
                                    </label>
                                    <Input
                                        type="number"
                                        value={actualQuantity}
                                        onChange={(e) => setActualQuantity(e.target.value)}
                                        placeholder={pickup.estimated_quantity.toString()}
                                    />
                                    <p className="text-xs text-secondary-400 mt-1">
                                        Estimated: {pickup.estimated_quantity} pallets
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-500 mb-2">
                                        Price Per Pallet ($)
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={pricePerPallet}
                                        onChange={(e) => setPricePerPallet(e.target.value)}
                                        placeholder="e.g. 3.00"
                                    />
                                </div>
                                <div className="border-t border-secondary-100 pt-4">
                                    <div className="flex justify-between text-lg">
                                        <span className="font-bold text-secondary">Total Payout:</span>
                                        <span className="font-bold text-green-600">${previewPayout()}</span>
                                    </div>
                                    {pickup.total_payout && (
                                        <p className="text-xs text-secondary-400 mt-1">
                                            Previously saved: ${pickup.total_payout.toFixed(2)}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-500 mb-2">
                                        Admin Notes
                                    </label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Internal notes..."
                                        rows={3}
                                        className="block w-full px-4 py-3 text-sm border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    />
                                </div>
                                <Button
                                    variant="primary"
                                    className="w-full"
                                    onClick={handleSavePricing}
                                    disabled={updating}
                                >
                                    {updating ? 'Saving...' : 'Save Pricing'}
                                </Button>
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card padding="lg" className="bg-secondary-50">
                            <h2 className="font-bold text-secondary mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <Button variant="outline" className="w-full" onClick={() => router.push('/admin')}>
                                    Back to All Pickups
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
