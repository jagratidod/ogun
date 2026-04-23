import { useState } from 'react';
import { 
  RiSettings4Line, RiShieldKeyholeLine, RiNotification3Line, 
  RiPaletteLine, RiGlobalLine, RiSmartphoneLine, 
  RiDatabaseLine, RiInformationLine, RiArrowRightSLine, 
  RiLogoutBoxRLine, RiLockPasswordLine, RiTimeLine, RiUserLine 
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  Badge, Button, Avatar, Input, Select, Tabs 
} from '../../../core';
import { useAuthContext } from '../../../core/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { user, logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState('General');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { icon: RiGlobalLine, label: 'General' },
    { icon: RiShieldKeyholeLine, label: 'Security' },
    { icon: RiNotification3Line, label: 'Notifications' },
    { icon: RiPaletteLine, label: 'Appearance' },
    { icon: RiSmartphoneLine, label: 'Mobile PWA' },
    { icon: RiDatabaseLine, label: 'Backup & Sync' }
  ];

  const handleSave = () => {
    setIsSaving(true);
    const loadId = toast.loading('Saving global configurations...');
    
    setTimeout(() => {
       toast.dismiss(loadId);
       toast.success('Settings synchronized successfully.');
       setIsSaving(false);
    }, 1500);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'General':
        return (
          <div className="space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Organization Identity</CardTitle>
                  <CardDescription>Public branding and official company details</CardDescription>
               </CardHeader>
               <div className="p-6 space-y-4">
                  <div className="flex items-center gap-6 mb-6">
                     <div className="relative group">
                        <div className="w-24 h-24 rounded-none bg-surface-elevated flex items-center justify-center border border-border group-hover:border-brand-teal transition-all">
                           {user?.avatar ? (
                              <img src={user.avatar} className="w-20 h-20 object-contain transition-all" />
                            ) : (
                              <RiUserLine className="w-12 h-12 text-slate-300" />
                            )}
                        </div>
                        <button className="absolute -bottom-2 -left-2 p-1.5 rounded-none bg-surface-elevated border border-border shadow-xl hover:text-brand-teal transition-colors">
                           <RiPaletteLine className="w-3.5 h-3.5" />
                        </button>
                     </div>
                     <div className="flex-1">
                        <h4 className="text-lg font-bold text-content-primary">{user?.name || 'OGUN Admin'}</h4>
                        <p className="text-xs text-content-tertiary uppercase font-black tracking-widest mt-1">{user?.role?.replace('_', ' ') || 'HQ Distribution Hub'}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input label="Display Name" defaultValue={user?.name} />
                     <Input label="Login Email" defaultValue={user?.email} />
                     <Input label="Contact Number" defaultValue={user?.phone || '+91 22 4567 8901'} />
                     <Input label="Operating Region" defaultValue={user?.location || 'Pan India'} />
                  </div>
               </div>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Compliance & Taxation</CardTitle>
               </CardHeader>
               <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="GST Number" defaultValue="27XXXXX1234F1Z5" />
                  <Select label="Fiscal Currency" defaultValue="INR" options={[{ label: 'INR (₹)', value: 'INR' }, { label: 'USD ($)', value: 'USD' }]} />
               </div>
            </Card>
          </div>
        );
      case 'Security':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Security & Authentication</CardTitle>
              <CardDescription>Two-factor authentication and session management</CardDescription>
            </CardHeader>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-surface-elevated border border-border">
                <div className="flex items-center gap-3">
                  <RiLockPasswordLine className="w-5 h-5 text-brand-teal" />
                  <div>
                    <p className="text-sm font-bold text-content-primary">Two-Factor Authentication</p>
                    <p className="text-xs text-content-tertiary">Extra security for admin logins</p>
                  </div>
                </div>
                <Badge status="success">Enabled</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Session Timeout (Min)" type="number" defaultValue="30" />
                <Input label="Password Expiry (Days)" type="number" defaultValue="90" />
              </div>
            </div>
          </Card>
        );
      default:
        return (
          <Card>
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-none bg-surface-elevated flex items-center justify-center mb-4">
                <RiSettings4Line className="w-8 h-8 text-content-tertiary" />
              </div>
              <h3 className="text-lg font-bold text-content-primary">{activeTab} Settings</h3>
              <p className="text-sm text-content-secondary max-w-sm mt-2">
                Configurations for {activeTab.toLowerCase()} are currently being synchronized with the global policy engine.
              </p>
            </div>
          </Card>
        );
    }
  };

  return (
    <div className="page-container max-w-5xl mx-auto">
      <PageHeader 
        title="App Configuration" 
        subtitle="Manage global system settings, security protocols, and visual theme"
      >
        <Button icon={RiLogoutBoxRLine} variant="danger" onClick={() => {
           toast.loading('Logging out...');
           setTimeout(logout, 800);
        }}>Logout Session</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         <aside className="md:col-span-1 space-y-1">
            {tabs.map(item => (
               <button 
                  key={item.label} 
                  onClick={() => setActiveTab(item.label)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-none transition-all ${
                  activeTab === item.label ? 'bg-brand-teal text-white shadow-glow' : 'text-content-secondary hover:bg-surface-elevated'
               }`}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-semibold">{item.label}</span>
               </button>
            ))}
         </aside>

         <main className="md:col-span-3 space-y-6">
            {renderContent()}

            <Card className="bg-state-danger/5 border-state-danger/10">
               <CardHeader>
                  <CardTitle className="text-state-warning">System Maintenance</CardTitle>
                  <CardDescription>High-risk actions that cannot be undone</CardDescription>
               </CardHeader>
               <div className="p-6 flex items-center justify-between bg-surface-primary/30 border-t border-state-danger/10">
                  <div className="flex items-center gap-3">
                     <RiInformationLine className="text-state-warning w-5 h-5 flex-shrink-0" />
                     <div>
                        <p className="text-sm font-bold text-content-primary">Cache Purge</p>
                        <p className="text-xs text-content-tertiary underline cursor-pointer hover:text-state-danger transition-colors">Confirm password to proceed</p>
                     </div>
                  </div>
                  <Button variant="secondary" size="sm" className="text-state-danger border-state-danger/20">Execute Wipe</Button>
               </div>
            </Card>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
               <Button variant="secondary" disabled={isSaving}>Discard Changes</Button>
               <Button onClick={handleSave} loading={isSaving}>Save Configuration</Button>
            </div>
         </main>
      </div>
    </div>
  );
}
