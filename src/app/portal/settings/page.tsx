'use client';

import { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/layout';
import { Card, Button, Input } from '@/components/ui';
import { User, Building, MapPin, Bell, Lock } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function PortalSettingsPage() {
    const { profile, user, refreshProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const [profileData, setProfileData] = useState({
        contact_name: '',
        phone: '',
    });

    const [companyData, setCompanyData] = useState({
        company_name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
    });

    // Initialize form data from profile
    useEffect(() => {
        if (profile) {
            setProfileData({
                contact_name: profile.contact_name || '',
                phone: profile.phone || '',
            });
            setCompanyData({
                company_name: profile.company_name || '',
                address: profile.address || '',
                city: profile.city || '',
                state: profile.state || '',
                zip: profile.zip || '',
            });
        }
    }, [profile]);

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        setSaved(false);

        try {
            const updates = activeTab === 'profile' || activeTab === 'company' || activeTab === 'address'
                ? { ...profileData, ...companyData }
                : {};

            if (Object.keys(updates).length > 0) {
                const response = await fetch('/api/profile', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to save changes');
                }

                // Refresh the profile in context
                await refreshProfile();
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'company', label: 'Company', icon: Building },
        { id: 'address', label: 'Delivery Address', icon: MapPin },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
    ];

    return (
        <PortalLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-secondary">Account Settings</h1>
                <p className="text-secondary-400 mt-1">
                    Manage your account preferences and information.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1">
                    <Card padding="sm">
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left
                    ${activeTab === tab.id
                                            ? 'bg-primary text-white'
                                            : 'text-secondary-500 hover:bg-secondary-50'
                                        }
                  `}
                                >
                                    <tab.icon size={18} />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </Card>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <Card padding="lg">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div>
                                <h2 className="text-xl font-bold text-secondary mb-6">Profile Information</h2>
                                <div className="space-y-4 max-w-md">
                                    <Input
                                        label="Contact Name"
                                        value={profileData.contact_name}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, contact_name: e.target.value }))}
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="bg-secondary-50"
                                    />
                                    <Input
                                        label="Phone"
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Company Tab */}
                        {activeTab === 'company' && (
                            <div>
                                <h2 className="text-xl font-bold text-secondary mb-6">Company Information</h2>
                                <div className="space-y-4 max-w-md">
                                    <Input
                                        label="Company Name"
                                        value={companyData.company_name}
                                        onChange={(e) => setCompanyData(prev => ({ ...prev, company_name: e.target.value }))}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Address Tab */}
                        {activeTab === 'address' && (
                            <div>
                                <h2 className="text-xl font-bold text-secondary mb-6">Delivery Address</h2>
                                <div className="space-y-4 max-w-md">
                                    <Input
                                        label="Street Address"
                                        value={companyData.address}
                                        onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="City"
                                            value={companyData.city}
                                            onChange={(e) => setCompanyData(prev => ({ ...prev, city: e.target.value }))}
                                        />
                                        <Input
                                            label="State"
                                            value={companyData.state}
                                            onChange={(e) => setCompanyData(prev => ({ ...prev, state: e.target.value }))}
                                        />
                                    </div>
                                    <Input
                                        label="ZIP Code"
                                        value={companyData.zip}
                                        onChange={(e) => setCompanyData(prev => ({ ...prev, zip: e.target.value }))}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div>
                                <h2 className="text-xl font-bold text-secondary mb-6">Notification Preferences</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Order confirmations', desc: 'Receive email when an order is placed', checked: true },
                                        { label: 'Shipping updates', desc: 'Get notified when orders ship', checked: true },
                                        { label: 'Delivery notifications', desc: 'Receive email on delivery', checked: true },
                                        { label: 'Promotional emails', desc: 'Special offers and discounts', checked: false },
                                    ].map((pref, idx) => (
                                        <label key={idx} className="flex items-start gap-4 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                defaultChecked={pref.checked}
                                                className="w-5 h-5 rounded border-secondary-300 text-primary focus:ring-primary mt-0.5"
                                            />
                                            <div>
                                                <p className="font-medium text-secondary">{pref.label}</p>
                                                <p className="text-sm text-secondary-400">{pref.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div>
                                <h2 className="text-xl font-bold text-secondary mb-6">Security Settings</h2>
                                <div className="space-y-4 max-w-md">
                                    <Input
                                        label="Current Password"
                                        type="password"
                                        placeholder="••••••••"
                                    />
                                    <Input
                                        label="New Password"
                                        type="password"
                                        placeholder="••••••••"
                                    />
                                    <Input
                                        label="Confirm New Password"
                                        type="password"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="mt-8 pt-6 border-t border-secondary-100 flex items-center gap-4">
                            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            {saved && (
                                <span className="text-green-600 font-medium">✓ Changes saved!</span>
                            )}
                            {error && (
                                <span className="text-red-500 font-medium">{error}</span>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </PortalLayout>
    );
}
