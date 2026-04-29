import { useState, useEffect, useMemo } from 'react';
import { 
  RiSettings4Line, RiShieldKeyholeLine, RiNotification3Line, 
  RiPaletteLine, RiGlobalLine, RiSmartphoneLine, 
  RiDatabaseLine, RiInformationLine, RiArrowRightSLine, 
  RiLogoutBoxRLine, RiUserLine, RiStore2Line, RiMapPinLine, 
  RiPhoneLine, RiPrinterLine, RiMoneyDollarBoxLine, RiCouponLine,
  RiHistoryLine, RiRefreshLine, RiCompass3Fill, RiAddLine, RiTrophyLine,
  RiBarChartLine, RiTableLine, RiArrowLeftLine, RiSearchLine, RiHandCoinLine
} from 'react-icons/ri';

import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  Badge, Avatar, Input, Select, Tabs, DataTable, formatCurrency, formatDateTime
} from '../../../core';
import Button from '../../../core/components/ui/Button';
import { useAuthContext } from '../../../core/context/AuthContext';
import retailerService from '../../../core/services/retailerService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Import financial components to embed
import RetailerLedgerPage from './RetailerLedgerPage';
import RetailerAnalyticsPage from './RetailerAnalyticsPage';

export default function RetailerSettingsPage() {
  const { user, logout, updatePreferences } = useAuthContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hubSearch, setHubSearch] = useState('');

  // Local state for preferences
  const [localPrefs, setLocalPrefs] = useState({
    theme: user?.preferences?.theme || 'light',
    compactMode: user?.preferences?.compactMode || false,
    notifications: {
      email: user?.preferences?.notifications?.email ?? true,
      sms: user?.preferences?.notifications?.sms ?? true,
      push: user?.preferences?.notifications?.push ?? true
    }
  });

  const sections = [
    {
      title: 'Store Configuration',
      items: [
        { icon: RiStore2Line, label: 'Store Profile', desc: 'Identity & Location', color: '#3FAFB0' },
        { icon: RiPrinterLine, label: 'POS Receipt', desc: 'Printer & Templates', color: '#64748B' },
        { icon: RiMoneyDollarBoxLine, label: 'Pricing logic', desc: 'Margins & Discounts', color: '#8B5CF6' }
      ]
    },
    {
      title: 'Financials & Records',
      items: [
        { icon: RiTableLine, label: 'Account Ledger', desc: 'Credits & Debits', color: '#10B981' },
        { icon: RiBarChartLine, label: 'Financial Insights', desc: 'Analytics & Trends', color: '#3B82F6' },
        { icon: RiHistoryLine, label: 'Sales History', desc: 'POS Order Logs', color: '#EC4899' }
      ]
    },
    {
      title: 'Activity & Growth',
      items: [
        { icon: RiCompass3Fill, label: 'Explore Reels', path: '/retailer/social', desc: 'Brand Videos', color: '#6366F1' },
        { icon: RiTrophyLine, label: 'Rewards & Loyalty', desc: 'Points & Rankings', color: '#F59E0B' },
        { icon: RiPaletteLine, label: 'Visual Experience', desc: 'Theme & Modes', color: '#8B5CF6' },
        { icon: RiNotification3Line, label: 'Alerts', desc: 'System Notifications', color: '#F59E0B' }
      ]
    }
  ];

  const [rewardData, setRewardData] = useState(null);
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState(500);

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

  const fetchRewardData = async () => {
    try {
      setLoadingRewards(true);
      const res = await retailerService.getRewardData();
      setRewardData(res.data);
    } catch (error) {
      toast.error('Failed to fetch rewards');
    } finally {
      setLoadingRewards(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Sales History') fetchHistory();
    if (activeTab === 'Rewards & Loyalty') fetchRewardData();
    if (activeTab === 'Alerts' || activeTab === 'Visual Experience') {
      setLocalPrefs({
        theme: user?.preferences?.theme || 'light',
        compactMode: user?.preferences?.compactMode || false,
        notifications: {
          email: user?.preferences?.notifications?.email ?? true,
          sms: user?.preferences?.notifications?.sms ?? true,
          push: user?.preferences?.notifications?.push ?? true
        }
      });
    }
  }, [activeTab]);

  const handleRedeem = async () => {
     if (redeemAmount > (rewardData?.balance || 0)) {
        return toast.error('Insufficient points balance');
     }
     try {
        setIsRedeeming(true);
        await retailerService.requestRedemption({ points: redeemAmount, bankDetails: 'UPI: ' + (user?.phone || 'N/A') });
        toast.success('Redemption request submitted!');
        fetchRewardData();
     } catch (error) {
        toast.error('Redemption failed');
     } finally {
        setIsRedeeming(false);
     }
  };

  const historyColumns = [
    { key: 'saleId', label: 'ID', render: (val) => <span className="font-bold">#{val}</span> },
    { key: 'createdAt', label: 'Date', render: (val) => <span className="text-[10px]">{formatDateTime(val)}</span> },
    { key: 'customer', label: 'Customer', render: (val) => <span className="text-sm font-medium">{val?.name}</span> },
    { key: 'totalAmount', label: 'Amount', align: 'right', render: (val) => <span className="font-bold text-brand-teal">{formatCurrency(val)}</span> }
  ];

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
          </div>
        );
      case 'Account Ledger':
        return <RetailerLedgerPage />;
      case 'Financial Insights':
        return <RetailerAnalyticsPage />;
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
            <DataTable columns={historyColumns} data={salesHistory} loading={loadingHistory} />
          </Card>
        );
      case 'Rewards & Loyalty':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-brand-teal via-brand-teal-dark to-brand-purple p-8 text-white relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="flex items-center gap-2 opacity-80 mb-2">
                     <RiTrophyLine className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em]">Current Balance</span>
                  </div>
                  <h2 className="text-5xl font-black tracking-tight mb-6">
                    {rewardData?.balance?.toLocaleString() || 0} <span className="text-xl opacity-60">Pts</span>
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                     <div className="flex-1 space-y-2">
                        <Input 
                           placeholder="Enter points to redeem" 
                           type="number" 
                           className="!bg-white/10 !border-white/20 !text-white !placeholder:text-white/40 h-11"
                           value={redeemAmount}
                           onChange={(e) => setRedeemAmount(parseInt(e.target.value) || 0)}
                        />
                     </div>
                     <Button 
                        className="h-11 px-8 !bg-white !text-brand-teal font-black shadow-xl"
                        onClick={handleRedeem}
                        loading={isRedeeming}
                        disabled={!rewardData?.balance || rewardData.balance < 500}
                     >
                        Redeem Cash
                     </Button>
                  </div>
               </div>
            </div>
          </div>
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
            </div>
          </Card>
        );
      case 'Visual Experience':
        return (
          <Card>
            <CardHeader>
              <CardTitle>App Appearance</CardTitle>
              <CardDescription>Customize how OGUN looks on this device</CardDescription>
            </CardHeader>
            <div className="p-6 space-y-8">
              <div>
                <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-4">Color Palette</p>
                <div className="grid grid-cols-3 gap-3">
                  {['light', 'dark', 'system'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setLocalPrefs(prev => ({ ...prev, theme: t }))}
                      className={`py-4 rounded-2xl border-2 transition-all capitalize font-bold text-xs ${localPrefs.theme === t ? 'border-brand-teal bg-brand-teal/5 text-brand-teal' : 'border-border bg-surface-primary text-content-tertiary'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-5 bg-surface-secondary rounded-[24px]">
                <div>
                   <p className="text-sm font-bold text-content-primary">Compact View</p>
                   <p className="text-[10px] text-content-tertiary uppercase font-medium">Maximize data density</p>
                </div>
                <input 
                   type="checkbox" 
                   checked={localPrefs.compactMode}
                   onChange={(e) => setLocalPrefs(prev => ({ ...prev, compactMode: e.target.checked }))}
                   className="w-12 h-7 rounded-full bg-border appearance-none cursor-pointer checked:bg-brand-teal relative transition-colors before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:left-6 before:transition-all shadow-inner"
                />
              </div>
            </div>
          </Card>
        );
      case 'Alerts':
        return (
          <Card>
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
              <CardDescription>Control how you receive order and stock alerts</CardDescription>
            </CardHeader>
            <div className="p-6 space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Summaries of daily sales & stock' },
                { key: 'sms', label: 'SMS Service', desc: 'Immediate security & order alerts' },
                { key: 'push', label: 'Push Messaging', desc: 'Real-time dashboard updates' }
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between p-5 bg-surface-secondary rounded-[24px]">
                  <div>
                     <p className="text-sm font-bold text-content-primary">{n.label}</p>
                     <p className="text-[10px] text-content-tertiary uppercase font-medium">{n.desc}</p>
                  </div>
                  <input 
                     type="checkbox" 
                     checked={localPrefs.notifications[n.key]}
                     onChange={(e) => setLocalPrefs(prev => ({ 
                        ...prev, 
                        notifications: { ...prev.notifications, [n.key]: e.target.checked }
                     }))}
                     className="w-12 h-7 rounded-full bg-border appearance-none cursor-pointer checked:bg-brand-teal relative transition-colors before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:left-6 before:transition-all shadow-inner"
                  />
                </div>
              ))}
            </div>
          </Card>
        );
      default:
        return (
          <Card>
            <div className="p-12 text-center">
              <h3 className="text-lg font-bold">{activeTab} Configuration</h3>
            </div>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="max-w-2xl mx-auto min-h-screen bg-surface-card shadow-xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {!activeTab ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
              {/* User Profile Summary */}
              <div className="px-8 py-10 flex flex-col items-center text-center bg-surface-primary/50 border-b border-border mb-6">
                 <Avatar name={user?.shopName || user?.name} size="xl" className="rounded-full border-4 border-white shadow-lg mb-4" />
                 <h2 className="text-xl font-black text-content-primary">{user?.shopName || user?.name}</h2>
                 <p className="text-xs font-bold text-content-tertiary uppercase tracking-widest mt-1">{user?.location || "Main Outlet"}</p>
              </div>

              {sections.map((section, sIdx) => (
                <div key={section.title} className="mb-10 px-4">
                  <h3 className="px-4 text-[10px] font-black text-brand-teal uppercase tracking-[0.2em] mb-4">{section.title}</h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          if (item.path) navigate(item.path);
                          else setActiveTab(item.label);
                        }}
                        className="w-full flex items-center gap-5 px-5 py-4 hover:bg-surface-secondary transition-all group active:scale-[0.98]"
                      >
                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-primary group-hover:bg-white shadow-sm group-hover:shadow-md transition-all">
                           <item.icon className="w-6 h-6 text-content-secondary group-hover:text-brand-teal" />
                        </div>
                        <div className="flex-1 text-left">
                           <p className="text-base font-bold text-content-primary group-hover:text-brand-teal transition-colors">{item.label}</p>
                           <p className="text-[10px] text-content-tertiary font-medium uppercase tracking-wider">{item.desc}</p>
                        </div>
                        <RiArrowRightSLine className="w-6 h-6 text-content-tertiary group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="px-8 pt-6">
                <button 
                  onClick={logout}
                  className="w-full py-4 flex items-center justify-center gap-3 border-2 border-rose-100 text-rose-500 font-black text-xs uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95"
                >
                  <RiLogoutBoxRLine className="w-5 h-5" /> Logout Session
                </button>
                <p className="text-center text-[10px] text-content-tertiary font-bold mt-10 uppercase tracking-widest opacity-40">Ogun OS v2.4.1 (Retailer Edition)</p>
              </div>
            </div>
          ) : (
            <div className="p-6 animate-in fade-in slide-in-from-right-4 duration-500">
               {renderContent()}

               {!['Account Ledger', 'Financial Insights', 'Sales History', 'Rewards & Loyalty'].includes(activeTab) && (
                  <div className="mt-12 space-y-3">
                    <button 
                       onClick={['Alerts', 'Visual Experience'].includes(activeTab) ? async () => {
                          setIsSaving(true);
                          const id = toast.loading('Syncing preferences...');
                          try {
                             const res = await updatePreferences(localPrefs);
                             toast.dismiss(id);
                             if (res.success) {
                                toast.success('Settings Synced');
                                setActiveTab(null);
                             } else {
                                toast.error(res.message);
                             }
                          } catch (err) {
                             toast.dismiss(id);
                             toast.error('Failed to sync settings');
                          } finally {
                             setIsSaving(false);
                          }
                       } : () => {
                          setIsSaving(true);
                          setTimeout(() => {
                             toast.success('Settings Synced');
                             setIsSaving(false);
                             setActiveTab(null);
                          }, 1200);
                       }}
                       disabled={isSaving}
                       className="w-full py-5 bg-brand-teal text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-teal/20 hover:shadow-brand-teal/40 transition-all active:scale-95 disabled:opacity-50"
                    >
                       {isSaving ? "Saving..." : "Save Preferences"}
                    </button>
                    <button 
                       onClick={() => setActiveTab(null)}
                       className="w-full py-5 text-[10px] font-black uppercase tracking-widest text-content-tertiary hover:bg-surface-secondary transition-all"
                    >
                       Cancel
                    </button>
                  </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
