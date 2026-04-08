import { useState } from 'react';
import { 
  RiSettings4Line, RiShieldKeyholeLine, RiNotification3Line, 
  RiPaletteLine, RiGlobalLine, RiSmartphoneLine, 
  RiDatabaseLine, RiInformationLine, RiArrowRightSLine, 
  RiLogoutBoxRLine, RiUserLine, RiStore2Line, RiMapPinLine, 
  RiPhoneLine, RiTruckLine, RiShieldLine, RiLockLine 
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  Badge, Avatar, Input, Select, Tabs 
} from '../../../core';
import Button from '../../../core/components/ui/Button';
import { useAuthContext } from '../../../core/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function DistSettingsPage() {
  const { logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState('Profile');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { icon: RiUserLine, label: 'Profile' },
    { icon: RiTruckLine, label: 'Logistics' },
    { icon: RiShieldKeyholeLine, label: 'Security' },
    { icon: RiNotification3Line, label: 'Notifications' },
    { icon: RiPaletteLine, label: 'Appearance' }
  ];

  const handleSave = () => {
    setIsSaving(true);
    const loadId = toast.loading('Syncing regional preferences...');
    
    setTimeout(() => {
       toast.dismiss(loadId);
       toast.success('Distributor profile updated successfully.');
       setIsSaving(false);
    }, 1500);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile':
        return (
          <div className="space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Distributor Profile</CardTitle>
                  <CardDescription>Public branding and official contact details</CardDescription>
               </CardHeader>
               <div className="p-6 space-y-6">
                  <div className="flex items-center gap-6">
                     <Avatar name="Arjun Patel" size="lg" className="rounded-none border border-border" />
                     <div className="flex-1">
                        <h4 className="text-lg font-bold text-content-primary">Arjun Patel</h4>
                        <p className="text-xs text-brand-teal font-black uppercase tracking-widest leading-none mt-1">North Region Distributor</p>
                        <p className="text-xs text-content-tertiary mt-1.5 underline cursor-pointer">Official ID: DS-001</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input label="Full Name / Legal" defaultValue="Arjun Patel (AP Logistics)" />
                     <Input label="Registered Email" defaultValue="dist.arjun@ogun.in" />
                     <Input label="Direct Phone" defaultValue="+91 98765-43210" />
                     <Input label="Office Address" defaultValue="Sector 18, Gurugram, Haryana, India" />
                  </div>
               </div>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Regional Operations</CardTitle>
               </CardHeader>
               <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select label="Primary Carrier" defaultValue="bt" options={[{ label: 'Bluedart Service', value: 'bt' }, { label: 'Local Express', value: 'le' }]} />
                  <Input label="Safety Stock Limit" type="number" defaultValue="15" />
                  <Input label="Default Tax Slab (%)" type="number" defaultValue="18" />
               </div>
            </Card>
          </div>
        );
      case 'Logistics':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Logistics & Dispatch Rules</CardTitle>
              <CardDescription>Automate your order fulfillment workflow</CardDescription>
            </CardHeader>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-surface-elevated border border-border">
                <div className="flex items-center gap-3">
                  <RiTruckLine className="w-5 h-5 text-brand-teal" />
                  <div>
                    <p className="text-sm font-bold text-content-primary">Auto-Dispatch System</p>
                    <p className="text-xs text-content-tertiary">Approve valid orders automatically</p>
                  </div>
                </div>
                <Badge status="warning">Inactive</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Batch Processing" defaultValue="daily" options={[{ label: 'Daily (EOD)', value: 'daily' }, { label: 'Real-time', value: 'realtime' }]} />
                <Select label="Inventory Mode" defaultValue="fifo" options={[{ label: 'First In First Out', value: 'fifo' }, { label: 'Last In First Out', value: 'lifo' }]} />
              </div>
            </div>
          </Card>
        );
      case 'Security':
         return (
           <Card>
             <CardHeader>
               <CardTitle>Account Security</CardTitle>
               <CardDescription>Update credentials and manage session visibility</CardDescription>
             </CardHeader>
             <div className="p-6 space-y-4">
                <Input label="Current Password" type="password" placeholder="••••••••" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Input label="New Password" type="password" placeholder="Min 8 chars" />
                   <Input label="Confirm New Password" type="password" placeholder="Min 8 chars" />
                </div>
                <div className="pt-4 flex justify-start">
                   <Button variant="secondary" size="sm">Update Password</Button>
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
              <h3 className="text-lg font-bold text-content-primary">{activeTab} Preferences</h3>
              <p className="text-sm text-content-secondary max-w-sm mt-2">
                Your {activeTab.toLowerCase()} synchronization logic is being processed by the regional server.
              </p>
            </div>
          </Card>
        );
    }
  };

  return (
    <div className="page-container max-w-5xl mx-auto">
      <PageHeader 
        title="Distributor Settings" 
        subtitle="Manage your regional profile, logistics configuration, and notification preferences"
      >
        <Button icon={RiLogoutBoxRLine} variant="danger" onClick={() => {
           toast.loading('Terminating session...');
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

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
               <Button variant="secondary" disabled={isSaving}>Discard Edits</Button>
               <Button onClick={handleSave} loading={isSaving}>Save Preferences</Button>
            </div>
         </main>
      </div>
    </div>
  );
}
