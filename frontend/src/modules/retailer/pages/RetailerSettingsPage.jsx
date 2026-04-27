import { useState, useEffect, useMemo } from 'react';
import { 
  RiSettings4Line, RiShieldKeyholeLine, RiNotification3Line, 
  RiPaletteLine, RiGlobalLine, RiSmartphoneLine, 
  RiDatabaseLine, RiInformationLine, RiArrowRightSLine, 
  RiLogoutBoxRLine, RiUserLine, RiStore2Line, RiMapPinLine, 
  RiPhoneLine, RiPrinterLine, RiMoneyDollarBoxLine, RiCouponLine,
  RiHistoryLine, RiRefreshLine, RiCompass3Fill, RiAddLine, RiTrophyLine
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

export default function RetailerSettingsPage() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Store Profile');
  const [isSaving, setIsSaving] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const tabs = [
    { icon: RiStore2Line, label: 'Store Profile' },
    { icon: RiHistoryLine, label: 'Sales History' },
    { icon: RiAddLine, label: 'POS Terminal', path: '/retailer/sales/new' },
    { icon: RiCompass3Fill, label: 'Explore Reels', path: '/retailer/social' },
    { icon: RiTrophyLine, label: 'Rewards & Loyalty' },
    { icon: RiPrinterLine, label: 'POS Receipt' },
    { icon: RiMoneyDollarBoxLine, label: 'Pricing logic' },
    { icon: RiNotification3Line, label: 'Alerts' }
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
      case 'Rewards & Loyalty':
        return (
          <div className="space-y-6">
            {/* Balance Card */}
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
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Equivalent to ₹{(redeemAmount * (rewardData?.systemConfig?.pointToRupeeRatio || 1)).toLocaleString()}</p>
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
                  <p className="text-[9px] mt-4 opacity-50 font-medium">* Minimum 500 points required for cash-out.</p>
               </div>
               <RiTrophyLine className="absolute -right-12 -bottom-12 w-64 h-64 opacity-10 rotate-12 group-hover:rotate-0 transition-all duration-1000" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* History */}
               <Card className="flex flex-col">
                  <CardHeader>
                     <CardTitle>Points Ledger</CardTitle>
                     <CardDescription>History of credits and redemptions</CardDescription>
                  </CardHeader>
                  <div className="flex-1 p-0 overflow-y-auto max-h-[300px]">
                     {rewardData?.history?.length > 0 ? (
                        <div className="divide-y divide-border">
                           {rewardData.history.map((item, i) => (
                              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-surface-secondary transition-colors">
                                 <div>
                                    <p className="text-xs font-bold text-content-primary leading-tight">{item.reason}</p>
                                    <p className="text-[9px] text-content-tertiary uppercase font-bold mt-1">{new Date(item.timestamp).toLocaleDateString()} • {item.type.toUpperCase()}</p>
                                 </div>
                                 <span className={`text-sm font-black ${item.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {item.type === 'credit' ? '+' : '-'}{item.amount}
                                 </span>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="p-10 text-center opacity-40">
                           <RiHistoryLine className="w-8 h-8 mx-auto mb-2" />
                           <p className="text-[10px] font-black uppercase tracking-widest">No history yet</p>
                        </div>
                     )}
                  </div>
               </Card>

               {/* Earning Rules */}
               <Card>
                  <CardHeader>
                     <CardTitle>How to Earn</CardTitle>
                     <CardDescription>Points earning algorithm for your role</CardDescription>
                  </CardHeader>
                  <div className="p-5 space-y-4">
                     {rewardData?.earningRules ? (
                        Object.entries(rewardData.earningRules).map(([key, rule]) => (
                           <div key={key} className="flex items-center gap-4 p-3 bg-surface-secondary border border-border">
                              <div className="w-10 h-10 rounded-none bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                                 <RiAddLine className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black uppercase text-brand-teal tracking-widest leading-none mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                                 <p className="text-sm font-black text-content-primary">{rule.points} Pts <span className="text-[10px] font-medium opacity-50">per unit sold</span></p>
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="p-4 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium">
                           Contact Admin to enable point multipliers for your account.
                        </div>
                     )}
                     
                     <div className="p-4 bg-brand-pink/5 border border-brand-pink/10 flex items-start gap-3">
                        <RiNotification3Line className="w-4 h-4 text-brand-pink flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-brand-pink leading-relaxed">
                           EARLY BIRD BONUS: Get 2x points on all high-pressure cookers this festive season!
                        </p>
                     </div>
                  </div>
               </Card>
            </div>

            {/* Redemption Status */}
            <Card>
               <CardHeader>
                  <CardTitle>Redemption Status</CardTitle>
                  <CardDescription>Track your cash-out requests</CardDescription>
               </CardHeader>
               <div className="p-0">
                  {rewardData?.redemptions?.length > 0 ? (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="bg-surface-secondary">
                                 <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-content-tertiary">Request ID</th>
                                 <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-content-tertiary">Points</th>
                                 <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-content-tertiary">Value</th>
                                 <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-content-tertiary">Status</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-border">
                              {rewardData.redemptions.map((r, i) => (
                                 <tr key={i} className="hover:bg-surface-secondary transition-colors">
                                    <td className="px-5 py-4 text-xs font-bold font-mono">#{r._id.slice(-8).toUpperCase()}</td>
                                    <td className="px-5 py-4 text-sm font-black text-content-primary">{r.pointsRequested}</td>
                                    <td className="px-5 py-4 text-sm font-black text-brand-teal">₹{r.cashValue}</td>
                                    <td className="px-5 py-4">
                                       <Badge variant={r.status === 'approved' ? 'success' : r.status === 'pending' ? 'warning' : 'danger'}>
                                          {r.status}
                                       </Badge>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  ) : (
                     <div className="p-10 text-center opacity-40">
                        <p className="text-[10px] font-black uppercase tracking-widest">No redemptions yet</p>
                     </div>
                  )}
               </div>
            </Card>
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
    <div className="page-container max-w-5xl mx-auto pb-24">
      <div className="mb-6">
        <PageHeader 
          title="Store Configuration" 
          subtitle="Manage your localized profile, POS terminal setup, and receipt branding"
        >
          <Button icon={RiLogoutBoxRLine} variant="danger" className="max-sm:w-full" onClick={() => {
             toast.loading('Logging out...');
             setTimeout(logout, 800);
          }}>Logout Session</Button>
        </PageHeader>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 sm:gap-8">
         {/* Navigation - Horizontal Scroll on Mobile, Sidebar on Desktop */}
         <aside className="lg:col-span-1">
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-2 scrollbar-hide">
               {tabs.map(item => (
                  <button 
                     key={item.label} 
                     onClick={() => {
                        if (item.path) {
                           navigate(item.path);
                        } else {
                           setActiveTab(item.label);
                        }
                     }}
                     className={`flex items-center gap-3 whitespace-nowrap lg:w-full px-5 py-3.5 rounded-[16px] transition-all duration-300 flex-shrink-0 group ${
                     activeTab === item.label 
                        ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20 translate-x-1' 
                        : 'text-content-tertiary bg-white border border-border hover:bg-surface-secondary hover:border-brand-teal/20'
                  }`}>
                     <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform ${activeTab === item.label ? 'scale-110' : 'opacity-60 group-hover:scale-110 group-hover:opacity-100'}`} />
                     <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  </button>
               ))}
            </div>

         </aside>

         <main className="lg:col-span-3 space-y-6">
            {renderContent()}

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border">
               <Button variant="secondary" className="max-sm:order-2" disabled={isSaving}>Discard Edits</Button>
               <Button onClick={handleSave} loading={isSaving} className="max-sm:order-1">Save Store Config</Button>
            </div>
         </main>
      </div>
    </div>
  );
}
