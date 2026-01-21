'use client';

import { useState, useEffect, useCallback } from 'react';
import { PortalLayout } from '@/components/layout';
import { Card, Button, Badge } from '@/components/ui';
import { Truck, Plus, Calendar, Package, Clock, X, MapPin, FileText, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Pickup } from '@/lib/supabase/types';

const conditionLabels: Record<string, string> = {
    'grade-a': 'Grade A',
    'grade-b': 'Grade B',
    'mixed': 'Mixed',
    'damaged': 'Damaged',
};

const palletConditions = [
    { id: 'grade-a', label: 'Grade A', description: 'Like new, no repairs needed' },
    { id: 'grade-b', label: 'Grade B', description: 'Good condition, minor repairs' },
    { id: 'mixed', label: 'Mixed', description: 'Variety of conditions' },
    { id: 'damaged', label: 'Damaged', description: 'Broken or heavily worn' },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'warning';
        case 'scheduled': return 'info';
        case 'completed': return 'success';
        case 'cancelled': return 'warning';
        default: return 'info';
    }
};

export default function PickupsPage() {
    const { profile } = useAuth();
    const [pickups, setPickups] = useState<Pickup[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        pallet_condition: '',
        estimated_quantity: '',
        pickup_address: '',
        pickup_city: '',
        pickup_state: '',
        pickup_zip: '',
        preferred_date: '',
        notes: '',
    });

    // Fetch pickups
    const fetchPickups = useCallback(async () => {
        setDataLoading(true);
        try {
            const response = await fetch('/api/pickups');
            const result = await response.json();
            if (response.ok && result.pickups) {
                setPickups(result.pickups);
            } else {
                setError(result.error || 'Failed to fetch pickups');
            }
        } catch (err) {
            console.error('Fetch pickups error:', err);
            setError('Failed to load pickups');
        } finally {
            setDataLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPickups();
    }, [fetchPickups]);

    // Stats
    const totalPickups = pickups.length;
    const pendingPickups = pickups.filter(p => p.status === 'pending' || p.status === 'scheduled').length;
    const totalPayout = pickups
        .filter(p => p.total_payout)
        .reduce((sum, p) => sum + (p.total_payout || 0), 0);

    // Get tomorrow's date as minimum for date picker
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/pickups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok && result.pickup) {
                setShowModal(false);
                // Reset form
                setFormData({
                    pallet_condition: '',
                    estimated_quantity: '',
                    pickup_address: profile?.address || '',
                    pickup_city: profile?.city || '',
                    pickup_state: profile?.state || '',
                    pickup_zip: profile?.zip || '',
                    preferred_date: '',
                    notes: '',
                });
                // Refresh pickups list
                fetchPickups();
            } else {
                setError(result.error || 'Failed to create pickup request');
            }
        } catch (err) {
            console.error('Create pickup error:', err);
            setError('Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    const openModal = () => {
        // Pre-fill address from profile
        setFormData(prev => ({
            ...prev,
            pickup_address: profile?.address || prev.pickup_address,
            pickup_city: profile?.city || prev.pickup_city,
            pickup_state: profile?.state || prev.pickup_state,
            pickup_zip: profile?.zip || prev.pickup_zip,
        }));
        setError(null);
        setShowModal(true);
    };

    return (
        <PortalLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-secondary">Pallet Pickups</h1>
                    <p className="text-secondary-400 mt-1">Schedule pickups for pallets you want to sell</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchPickups} disabled={dataLoading}>
                        <RefreshCw size={16} className={dataLoading ? 'animate-spin' : ''} />
                    </Button>
                    <Button variant="primary" className="flex items-center gap-2" onClick={openModal}>
                        <Plus size={18} />
                        Request Pickup
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <Card padding="md" className="text-center">
                    <p className="text-4xl font-bold text-primary mb-1">{totalPickups}</p>
                    <p className="text-secondary-400">Total Pickups</p>
                </Card>
                <Card padding="md" className="text-center">
                    <p className="text-4xl font-bold text-primary mb-1">{pendingPickups}</p>
                    <p className="text-secondary-400">Pending / Scheduled</p>
                </Card>
                <Card padding="md" className="text-center">
                    <p className="text-4xl font-bold text-green-600 mb-1">${totalPayout.toFixed(2)}</p>
                    <p className="text-secondary-400">Total Earned</p>
                </Card>
            </div>

            {/* Pickups List */}
            <Card padding="none" className="overflow-hidden">
                {dataLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-secondary-400 mt-4">Loading pickups...</p>
                    </div>
                ) : pickups.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary-50">
                                <tr>
                                    <th className="text-left text-sm font-semibold text-secondary px-6 py-3">Date</th>
                                    <th className="text-left text-sm font-semibold text-secondary px-6 py-3">Condition</th>
                                    <th className="text-left text-sm font-semibold text-secondary px-6 py-3">Quantity</th>
                                    <th className="text-left text-sm font-semibold text-secondary px-6 py-3">Status</th>
                                    <th className="text-right text-sm font-semibold text-secondary px-6 py-3">Payout</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-100">
                                {pickups.map((pickup) => (
                                    <tr key={pickup.id} className="hover:bg-secondary-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-secondary-400" />
                                                <span className="text-secondary">
                                                    {new Date(pickup.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {pickup.scheduled_date && (
                                                <span className="text-xs text-secondary-400 ml-6">
                                                    Scheduled: {new Date(pickup.scheduled_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-secondary">
                                                {conditionLabels[pickup.pallet_condition]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Package size={16} className="text-secondary-400" />
                                                <span className="text-secondary">
                                                    {pickup.actual_quantity || pickup.estimated_quantity} pallets
                                                </span>
                                                {pickup.actual_quantity && pickup.actual_quantity !== pickup.estimated_quantity && (
                                                    <span className="text-xs text-secondary-400">
                                                        (est. {pickup.estimated_quantity})
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusColor(pickup.status) as 'success' | 'warning' | 'info'}>
                                                {pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {pickup.total_payout ? (
                                                <span className="font-semibold text-green-600">
                                                    ${pickup.total_payout.toFixed(2)}
                                                </span>
                                            ) : pickup.price_per_pallet ? (
                                                <span className="text-secondary-400">
                                                    ${pickup.price_per_pallet}/pallet
                                                </span>
                                            ) : (
                                                <span className="text-secondary-300">TBD</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Truck size={48} className="text-secondary-200 mx-auto mb-4" />
                        <p className="text-secondary-400 mb-4">No pickup requests yet</p>
                        <Button variant="primary" size="sm" onClick={openModal}>Request Your First Pickup</Button>
                    </div>
                )}
            </Card>

            {/* Info Section */}
            <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
                <h3 className="font-bold text-secondary mb-2 flex items-center gap-2">
                    <Clock size={18} className="text-primary" />
                    How Pickups Work
                </h3>
                <ol className="text-secondary-400 text-sm space-y-1 list-decimal list-inside">
                    <li>Request a pickup with your pallet details and preferred date</li>
                    <li>We&apos;ll review and schedule your pickup</li>
                    <li>Our team arrives to collect and count pallets</li>
                    <li>Receive payment based on quantity and condition</li>
                </ol>
            </div>

            {/* Request Pickup Modal */}
            {showModal && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={() => setShowModal(false)}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-secondary-100">
                                <div>
                                    <h2 className="text-xl font-bold text-secondary">Request Pickup</h2>
                                    <p className="text-sm text-secondary-400">Tell us about your pallets</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-secondary-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-secondary-400" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Pallet Condition */}
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">
                                        <Package size={14} className="inline mr-1" />
                                        Pallet Condition *
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {palletConditions.map(condition => (
                                            <button
                                                key={condition.id}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, pallet_condition: condition.id }))}
                                                className={`p-3 rounded-lg border-2 text-left transition-colors ${formData.pallet_condition === condition.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-secondary-200 hover:border-secondary-300'
                                                    }`}
                                            >
                                                <p className="font-medium text-secondary text-sm">{condition.label}</p>
                                                <p className="text-xs text-secondary-400">{condition.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Estimated Quantity */}
                                <div>
                                    <label htmlFor="estimated_quantity" className="block text-sm font-medium text-secondary mb-2">
                                        <Truck size={14} className="inline mr-1" />
                                        Estimated Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        id="estimated_quantity"
                                        name="estimated_quantity"
                                        value={formData.estimated_quantity}
                                        onChange={handleChange}
                                        min="1"
                                        max="10000"
                                        required
                                        className="w-full px-4 py-2.5 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        placeholder="How many pallets?"
                                    />
                                </div>

                                {/* Pickup Address */}
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">
                                        <MapPin size={14} className="inline mr-1" />
                                        Pickup Address *
                                    </label>
                                    <input
                                        type="text"
                                        name="pickup_address"
                                        value={formData.pickup_address}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm mb-2"
                                        placeholder="Street address"
                                    />
                                    <div className="grid grid-cols-6 gap-2">
                                        <input
                                            type="text"
                                            name="pickup_city"
                                            value={formData.pickup_city}
                                            onChange={handleChange}
                                            required
                                            className="col-span-3 px-3 py-2.5 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                            placeholder="City"
                                        />
                                        <input
                                            type="text"
                                            name="pickup_state"
                                            value={formData.pickup_state}
                                            onChange={handleChange}
                                            required
                                            className="col-span-1 px-3 py-2.5 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                            placeholder="ST"
                                        />
                                        <input
                                            type="text"
                                            name="pickup_zip"
                                            value={formData.pickup_zip}
                                            onChange={handleChange}
                                            required
                                            className="col-span-2 px-3 py-2.5 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                            placeholder="ZIP"
                                        />
                                    </div>
                                </div>

                                {/* Preferred Date */}
                                <div>
                                    <label htmlFor="preferred_date" className="block text-sm font-medium text-secondary mb-2">
                                        <Calendar size={14} className="inline mr-1" />
                                        Preferred Date (optional)
                                    </label>
                                    <input
                                        type="date"
                                        id="preferred_date"
                                        name="preferred_date"
                                        value={formData.preferred_date}
                                        onChange={handleChange}
                                        min={minDate}
                                        className="w-full px-4 py-2.5 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                    />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-secondary mb-2">
                                        <FileText size={14} className="inline mr-1" />
                                        Notes (optional)
                                    </label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-4 py-2.5 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                                        placeholder="Gate codes, dock instructions, etc."
                                    />
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                {/* Submit */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="flex-1"
                                        type="submit"
                                        disabled={loading || !formData.pallet_condition || !formData.estimated_quantity}
                                    >
                                        {loading ? 'Submitting...' : 'Submit Request'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </PortalLayout>
    );
}
