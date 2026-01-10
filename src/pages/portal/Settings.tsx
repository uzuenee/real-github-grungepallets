import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PortalLayout } from '@/components/layout';
import { Card, Button, Input } from '@/components/ui';
import { User, Building, MapPin, Bell, Lock } from 'lucide-react';
import { MOCK_USER } from '@/lib/portal-data';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileData, setProfileData] = useState({ contactName: MOCK_USER.contactName, email: MOCK_USER.email, phone: MOCK_USER.phone });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [{ id: 'profile', label: 'Profile', icon: User }, { id: 'company', label: 'Company', icon: Building }, { id: 'address', label: 'Address', icon: MapPin }, { id: 'notifications', label: 'Notifications', icon: Bell }, { id: 'security', label: 'Security', icon: Lock }];

  return (
    <>
      <Helmet><title>Settings | Grunge Pallets Portal</title></Helmet>
      <PortalLayout>
        <div className="mb-8"><h1 className="text-2xl sm:text-3xl font-bold text-secondary">Account Settings</h1></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card padding="sm">
              <nav className="space-y-1">
                {tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${activeTab === tab.id ? 'bg-primary text-white' : 'text-secondary-500 hover:bg-secondary-50'}`}><tab.icon size={18} /><span className="font-medium">{tab.label}</span></button>))}
              </nav>
            </Card>
          </div>
          <div className="lg:col-span-3">
            <Card padding="lg">
              {activeTab === 'profile' && (
                <div><h2 className="text-xl font-bold text-secondary mb-6">Profile Information</h2>
                  <div className="space-y-4 max-w-md">
                    <Input label="Contact Name" value={profileData.contactName} onChange={(e) => setProfileData(prev => ({ ...prev, contactName: e.target.value }))} />
                    <Input label="Email" type="email" value={profileData.email} onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))} />
                    <Input label="Phone" type="tel" value={profileData.phone} onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))} />
                  </div>
                </div>
              )}
              {activeTab === 'security' && (
                <div><h2 className="text-xl font-bold text-secondary mb-6">Security Settings</h2>
                  <div className="space-y-4 max-w-md">
                    <Input label="Current Password" type="password" placeholder="••••••••" />
                    <Input label="New Password" type="password" placeholder="••••••••" />
                    <Input label="Confirm Password" type="password" placeholder="••••••••" />
                  </div>
                </div>
              )}
              {(activeTab !== 'profile' && activeTab !== 'security') && (<div className="text-secondary-400">Settings for {activeTab} coming soon.</div>)}
              <div className="mt-8 pt-6 border-t border-secondary-100 flex items-center gap-4">
                <Button variant="primary" onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                {saved && <span className="text-green-600 font-medium">✓ Changes saved!</span>}
              </div>
            </Card>
          </div>
        </div>
      </PortalLayout>
    </>
  );
}
