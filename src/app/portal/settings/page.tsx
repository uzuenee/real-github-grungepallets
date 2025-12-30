'use client';

import { useState } from 'react';
import { PortalLayout } from '@/components/layout';
import { Card, Button, Input } from '@/components/ui';
import { User, Building, MapPin, Bell, Lock } from 'lucide-react';
import { MOCK_USER } from '@/lib/portal-data';

export default function PortalSettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [profileData, setProfileData] = useState({
        contactName: MOCK_USER.contactName,
        email: MOCK_USER.email,
        phone: MOCK_USER.phone,
    });

    const [companyData, setCompanyData] = useState({
        companyName: MOCK_USER.companyName,
        address: MOCK_USER.address,
        city: MOCK_USER.city,
        state: MOCK_USER.state,
        zip: MOCK_USER.zip,
    });

    const handleSave = async () => {
        setIsSaving(true);
        console.log('Saving:', activeTab === 'profile' ? profileData : companyData);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
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
                                        value={profileData.contactName}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, contactName: e.target.value }))}
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
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
                                        value={companyData.companyName}
                                        onChange={(e) => setCompanyData(prev => ({ ...prev, companyName: e.target.value }))}
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
                        </div>
                    </Card>
                </div>
            </div>
        </PortalLayout>
    );
}
