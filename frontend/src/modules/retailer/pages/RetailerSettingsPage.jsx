import { useState, useEffect, useMemo } from 'react';
import { 
  RiSettings4Line, RiShieldKeyholeLine, RiNotification3Line, 
  RiPaletteLine, RiGlobalLine, RiSmartphoneLine, 
  RiDatabaseLine, RiInformationLine, RiArrowRightSLine, 
  RiLogoutBoxRLine, RiUserLine, RiStore2Line, RiMapPinLine, 
  RiPhoneLine, RiPrinterLine, RiMoneyDollarBoxLine, RiCouponLine,
  RiHistoryLine, RiRefreshLine
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  Badge, Avatar, Input, Select, Tabs, DataTable, formatCurrency, formatDateTime
} from '../../../core';
import Button from '../../../core/components/ui/Button';
import { useAuthContext } from '../../../core/context/AuthContext';
import retailerService from '../../../core/services/retailerService';
import { toast } from 'react-hot-toast';

export default function RetailerSettingsPage() {
  const { user, logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState('Store Profile');
  const [isSaving, setIsSaving] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const tabs = [
    { icon: RiStore2Line, label: 'Store Profile' },
    { icon: RiHistoryLine, label: 'Sales History' },
    { icon: RiPrinterLine, label: 'POS Receipt' },
    { icon: RiMoneyDollarBoxLine, label: 'Pricing logic' },
    { icon: RiNotification3Line, label: 'Alerts' }
  ];

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await retailerService.getSaleHistory();
      setSalesHistory(res.data || []);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Sales History') {
      fetchHistory();
    }
  }, [activeTab]);

  const historyColumns = [
    { key: 'saleId', label: 'ID', render: (val) => <span className="font-bold">#{val}</span> },
    { key: 'createdAt', label: 'Date', render: (val) => <span className="text-[10px]">{formatDateTime(val)}</span> },
    { key: 'customer', label: 'Customer', render: (val) => <span className="text-sm font-medium">{val?.name}</span> },
    { key: 'totalAmount', label: 'Amount', align: 'right', render: (val) => <span className="font-bold text-brand-teal">{formatCurrency(val)}</span> }
  ];

  const handleSave = () => {
    setIsSaving(true);
    const loadId = toast.loading('Updating local store configuration...');
    
    setTimeout(() => {
       toast.dismiss(loadId);
       toast.success('Store profile updated successfully.');
       setIsSaving(false);
    }, 1500);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Store Profile':
        return (
          <div className="space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Retailer Identity</CardTitle>
                  <CardDescription>Localized store name and official contact points</CardDescription>
               </CardHeader>
               <div className="p-6 space-y-6">
                  <div className="flex items-center gap-6">
                     <Avatar name={user?.name || 'Retailer'} size="lg" className="rounded-none border border-border" src={user?.avatar} />
                     <div className="flex-1">
                        <h4 className="text-lg font-bold text-content-primary">{user?.shopName || user?.name || 'Retailer Partner'}</h4>
                        <p className="text-xs text-brand-teal font-black uppercase tracking-widest leading-none mt-1">{user?.role?.toUpperCase()} PARTNER</p>
                        <p className="text-xs text-content-tertiary mt-1.5 underline cursor-pointer">Official ID: {user?._id?.toString().slice(-6).toUpperCase()}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input label="Store Display Name" defaultValue={user?.shopName || user?.name} />
                     <Input label="Official Contact" defaultValue={user?.email} />
                     <Input label="Counter Phone" defaultValue={user?.phone || '+91 91234-56789'} />
                     <Input label="Shop Address" defaultValue={user?.location || 'Sakinaka, Mumbai'} />
                  </div>
               </div>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>POS Terminal Options</CardTitle>
               </CardHeader>
               <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select label="Default Invoice Copy" defaultValue="2" options={[{ label: '1 Copy', value: '1' }, { label: '2 Copies', value: '2' }]} />
                  <Select label="Auto-Sync Invoices" defaultValue="y" options={[{ label: 'Real-time Sync', value: 'y' }, { label: 'Sync End-of-Day', value: 'n' }]} />
               </div>
            </Card>
          </div>
        );
      case 'Sales History':
        return (
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Customer Sales Log</CardTitle>
                <CardDescription>All historical transactions processed at this counter</CardDescription>
              </div>
              <Button size="sm" variant="secondary" icon={RiRefreshLine} onClick={fetchHistory} loading={loadingHistory} />
            </CardHeader>
            <DataTable 
              columns={historyColumns} 
              data={salesHistory} 
              loading={loadingHistory}
            />
          </Card>
        );
      case 'POS Receipt':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Receipt Branding</CardTitle>
              <CardDescription>Customize the printed GST slips for customers</CardDescription>
            </CardHeader>
            <div className="p-6 space-y-4">
               <Input label="Print Header Subtext" defaultValue="Priya Kitchen (N)" />
               <Input label="Footer Gratitude Note" defaultValue="Thank you for choosing OGUN Appliances!" />
               <div className="flex items-center justify-between p-4 bg-surface-elevated border border-border">
                  <div className="flex items-center gap-3">
                    <RiPrinterLine className="w-5 h-5 text-brand-teal" />
                    <div>
                      <p className="text-sm font-bold text-content-primary">Logo on Receipt</p>
                      <p className="text-xs text-content-tertiary text-[10px]">Print company logo on top</p>
                    </div>
                  </div>
                  <Badge status="success">Active</Badge>
               </div>
            </div>
          </Card>
        );
      case 'Pricing logic':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Localized Pricing Rules</CardTitle>
              <CardDescription>Manage discounts and price overrides for store sales</CardDescription>
            </CardHeader>
            <div className="p-6 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Max Counter Discount (%)" type="number" defaultValue="5" />
                  <Select label="Round-off Payouts" defaultValue="nearest" options={[{ label: 'Nearest ₹1', value: 'nearest' }, { label: 'Floor Value', value: 'floor' }]} />
               </div>
               <div className="flex items-center gap-3 p-4 bg-brand-teal/5 border border-brand-teal/10">
                  <RiCouponLine className="w-5 h-5 text-brand-teal" />
                  <p className="text-xs text-content-secondary">Stackable coupons are enabled. Customers can use points with seasonal codes.</p>
               </div>
            </div>
          </Card>
        );
      default:
        return (
          <Card>
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-none bg-surface-elevated flex items-center justify-center mb-4 text-content-tertiary">
                <RiSettings4Line className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-content-primary">{activeTab} Hub</h3>
              <p className="text-sm text-content-secondary max-w-sm mt-2">
                Configurations for {activeTab.toLowerCase()} are currently being synchronized with the store controller.
              </p>
            </div>
          </Card>
        );
    }
  };

  return (
    <div className="page-container max-w-5xl mx-auto">
      <PageHeader 
        title="Store Configuration" 
        subtitle="Manage your localized profile, POS terminal setup, and receipt branding"
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

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
               <Button variant="secondary" disabled={isSaving}>Discard Edits</Button>
               <Button onClick={handleSave} loading={isSaving}>Save Store Config</Button>
            </div>
         </main>
      </div>
    </div>
  );
}
