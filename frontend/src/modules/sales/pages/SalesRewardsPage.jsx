import { useState, useEffect } from 'react';
import { 
  RiTrophyLine, RiHistoryLine, RiAddLine, 
  RiNotification3Line, RiBankLine, RiArrowLeftSLine,
  RiStore2Line, RiShoppingCartLine, RiCustomerService2Line
} from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { 
  Card, CardHeader, CardTitle, CardDescription, 
  Badge, Button, Input, formatCurrency 
} from '../../../core';
import executiveService from '../../../core/services/executiveService';
import { useAuthContext } from '../../../core/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function SalesRewardsPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [rewardData, setRewardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState(500);

  const fetchRewardData = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getRewardData();
      setRewardData(res.data);
    } catch (error) {
      toast.error('Failed to fetch rewards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewardData();
  }, []);

  const handleRedeem = async () => {
     if (redeemAmount > (rewardData?.balance || 0)) {
        return toast.error('Insufficient points balance');
     }
     try {
        setIsRedeeming(true);
        await executiveService.requestRedemption({ 
          points: redeemAmount, 
          bankDetails: 'Field Agent ID: ' + (user?.name || 'SE') 
        });
        toast.success('Redemption request submitted!');
        fetchRewardData();
     } catch (error) {
        toast.error('Redemption failed');
     } finally {
        setIsRedeeming(false);
     }
  };

  const earningIcons = {
    perRetailerOnboarded: RiStore2Line,
    perOrderPlaced: RiShoppingCartLine,
    perServiceResolved: RiCustomerService2Line,
    monthlySalesTargetBonus: RiTrophyLine
  };

  if (loading && !rewardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-primary">
        <div className="text-[10px] font-black text-brand-teal animate-pulse uppercase tracking-[0.3em]">Syncing Rewards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center bg-surface-secondary">
          <RiArrowLeftSLine size={20} />
        </button>
        <div>
          <h1 className="text-sm font-black text-content-primary uppercase tracking-tight">Reward Wallet</h1>
          <p className="text-[8px] text-brand-teal font-black uppercase tracking-widest leading-none mt-1">Field Performance Benefits</p>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-brand-purple via-brand-magenta to-brand-pink p-6 text-white relative overflow-hidden group shadow-xl">
           <div className="relative z-10">
              <div className="flex items-center gap-2 opacity-80 mb-1">
                 <RiTrophyLine className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Incentive Points</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight mb-6">
                {rewardData?.balance?.toLocaleString() || 0} <span className="text-base opacity-60 font-medium">Pts</span>
              </h2>
              <div className="flex flex-col gap-3">
                 <div className="flex-1 space-y-1.5">
                    <Input 
                       placeholder="Redemption amount" 
                       type="number" 
                       className="!bg-white/10 !border-white/20 !text-white !placeholder:text-white/40 h-10 text-sm"
                       value={redeemAmount}
                       onChange={(e) => setRedeemAmount(parseInt(e.target.value) || 0)}
                    />
                    <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Equiv. Value: ₹{(redeemAmount * (rewardData?.systemConfig?.pointToRupeeRatio || 1)).toLocaleString()}</p>
                 </div>
                 <Button 
                    className="h-10 w-full !bg-white !text-brand-magenta font-black shadow-lg uppercase text-[11px] tracking-widest"
                    onClick={handleRedeem}
                    loading={isRedeeming}
                    disabled={!rewardData?.balance || rewardData.balance < 500}
                 >
                    Cash Out Now
                 </Button>
              </div>
           </div>
           <RiTrophyLine className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12 group-hover:rotate-0 transition-all duration-1000" />
        </div>

        {/* Earning Rules */}
        <section className="space-y-3">
           <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black text-content-primary uppercase tracking-widest">Earning Guide</h3>
              <Badge variant="teal">Multiplier Active</Badge>
           </div>
           <div className="grid grid-cols-1 gap-2">
              {rewardData?.earningRules && Object.entries(rewardData.earningRules).map(([key, rule]) => {
                const Icon = earningIcons[key] || RiAddLine;
                return (
                  <div key={key} className="flex items-center gap-3 p-3 bg-white border border-border">
                     <div className="w-10 h-10 bg-surface-secondary flex items-center justify-center text-brand-purple">
                        <Icon className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase text-content-tertiary tracking-widest leading-none mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-xs font-black text-content-primary">{rule.points} Pts <span className="text-[9px] font-medium opacity-50 lowercase italic">per success</span></p>
                     </div>
                  </div>
                );
              })}
           </div>
        </section>

        {/* Points History */}
        <section className="space-y-3">
           <h3 className="text-[10px] font-black text-content-primary uppercase tracking-widest px-1">Recent Activity</h3>
           <Card className="p-0 overflow-hidden">
              <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                 {rewardData?.history?.length > 0 ? (
                    rewardData.history.map((item, i) => (
                       <div key={i} className="px-4 py-3 flex items-center justify-between active:bg-surface-secondary transition-colors">
                          <div className="flex-1 pr-4">
                             <p className="text-xs font-black text-content-primary leading-tight line-clamp-1">{item.reason}</p>
                             <p className="text-[9px] text-content-tertiary uppercase font-bold mt-1">{new Date(item.timestamp).toLocaleDateString()} • {item.type.toUpperCase()}</p>
                          </div>
                          <span className={`text-sm font-black ${item.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                             {item.type === 'credit' ? '+' : '-'}{item.amount}
                          </span>
                       </div>
                    ))
                 ) : (
                    <div className="p-12 text-center opacity-30">
                       <RiHistoryLine className="w-10 h-10 mx-auto mb-2" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No transactions</p>
                    </div>
                 )}
              </div>
           </Card>
        </section>

        {/* Redemption Requests */}
        {rewardData?.redemptions?.length > 0 && (
           <section className="space-y-3">
              <h3 className="text-[10px] font-black text-content-primary uppercase tracking-widest px-1">Redemption Status</h3>
              <div className="space-y-2">
                 {rewardData.redemptions.map((r, i) => (
                    <div key={i} className="bg-white border border-border p-3 flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 flex items-center justify-center ${r.status === 'approved' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                             <RiBankLine size={16} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-content-primary uppercase">₹{r.cashValue.toLocaleString()}</p>
                             <p className="text-[8px] text-content-tertiary font-bold uppercase tracking-widest mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <Badge variant={r.status === 'approved' ? 'success' : r.status === 'pending' ? 'warning' : 'danger'}>
                          {r.status}
                       </Badge>
                    </div>
                 ))}
              </div>
           </section>
        )}
      </div>

      {/* Floating Info */}
      <div className="px-4 pt-4">
         <div className="p-4 bg-brand-teal/5 border border-brand-teal/10 flex items-start gap-3">
            <RiNotification3Line className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-brand-teal leading-relaxed uppercase tracking-tighter">
               PRO TIP: High-resolution service images grant a +10 bonus multiplier on points!
            </p>
         </div>
      </div>
    </div>
  );
}
