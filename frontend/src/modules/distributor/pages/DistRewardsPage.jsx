import { RiTrophyLine, RiTrophyFill, RiMedalLine, RiHandHeartLine, RiGroupLine, RiHistoryLine, RiSettings4Line, RiSearchLine, RiArrowRightUpLine, RiInformationLine, RiCheckboxCircleLine, RiNodeTree, RiTruckFill, RiTimerLine, RiVipCrownFill, RiGiftLine, RiCheckDoubleLine, RiShoppingBag3Line, RiMoneyDollarCircleLine, RiTicketLine, RiCouponLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, MetricCard, BarChart, useModal, Modal } from '../../../core';
import rewardsData from '../../../data/rewards.json';
import { toast } from 'react-hot-toast';
import { useDistributorStore } from '../store/useDistributorStore';

export default function DistRewardsPage() {
  const { pointsHistory, entities, tiers, milestones, redemptionCatalog, targets } = rewardsData;
  const { user } = useDistributorStore();
  const entityName = user?.name || 'Distributor';
  const myData = entities.find(e => e.name === entityName) || {
    name: entityName,
    totalPoints: 0,
    thisMonth: 0,
    redeemed: 0,
    tier: 'Bronze',
  };
  const myHistory = pointsHistory.filter(h => h.entity === entityName);
  const { isOpen, open, close, data: selectedReward } = useModal();

  const handleRedeem = () => {
    toast.success(`Redemption request successful! Your regional manager will contact you.`);
    close();
  };

  const nextTier = tiers.find(t => t.minPoints > myData.totalPoints) || tiers[tiers.length - 1];
  const progressPercent = nextTier?.minPoints ? Math.min((myData.totalPoints / nextTier.minPoints) * 100, 100) : 0;

  const columns = [
    { key: 'date', label: 'Award Date', render: (val) => <span className="text-xs text-content-tertiary font-bold uppercase">{val}</span> },
    { key: 'reason', label: 'Reason for Pts', flex: 1 },
    { key: 'points', label: 'Pts Awarded', align: 'center', render: (val) => (
       <div className="flex items-center justify-center gap-1 text-brand-purple">
          <RiTrophyLine className="w-4 h-4" />
          <span className="font-black">+{val.toLocaleString()}</span>
       </div>
    )}
  ];

  return (
    <div className="page-container max-w-5xl mx-auto">
      <PageHeader 
        title="Distributor Loyalty Hub" 
        subtitle="Manage your regional reward points, supply targets and high-value redemptions"
      >
        <Button icon={RiTrophyLine} onClick={() => open({ mode: 'catalog' })}>Redeem Points</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 mt-2">
          <Card className="p-5 bg-brand-purple/5 border-brand-purple/10 relative overflow-hidden group">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Regional Points</p>
              <h4 className="text-4xl font-black text-brand-purple leading-tight">{myData.totalPoints.toLocaleString()}</h4>
              <Badge variant="purple" className="mt-2">RANK #5 NORTH</Badge>
              <RiVipCrownFill className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 text-brand-purple group-hover:rotate-12 transition-transform" />
          </Card>
          
          <Card className="p-5">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Order Bonuses</p>
              <h4 className="text-2xl font-black text-content-primary">+{myData.thisMonth.toLocaleString()}</h4>
              <p className="text-[10px] text-brand-teal mt-1 font-black uppercase tracking-tight">+5% vs last month</p>
          </Card>

          <Card className="p-5">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Redeemed</p>
              <h4 className="text-2xl font-black text-brand-pink">{myData.redeemed.toLocaleString()}</h4>
              <p className="text-[9px] text-content-tertiary mt-1 font-bold">Total Benefits Claimed</p>
          </Card>

          <Card className="p-5 border-l-4 border-state-warning">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Points Expiry</p>
              <h4 className="text-2xl font-black text-state-warning">1,000</h4>
              <p className="text-[10px] text-content-tertiary mt-1 font-black uppercase">Expires Oct 01</p>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
         <div className="lg:col-span-2 space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>North Region Milestone Progress</CardTitle>
               </CardHeader>
               <div className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="relative w-32 h-32">
                          <svg className="w-full h-full -rotate-90">
                              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-input" />
                              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.42} strokeDashoffset={364.42 - (364.42 * progressPercent) / 100} className="text-brand-purple transition-all duration-1000" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-black text-brand-purple tracking-tighter">{Math.round(progressPercent)}%</span>
                              <span className="text-[8px] font-black uppercase text-content-tertiary">Unlocked</span>
                          </div>
                      </div>
                      <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                              <Badge variant="purple">{myData.tier} LEVEL DISTRIBUTOR</Badge>
                              <span className="text-[10px] font-black text-content-tertiary uppercase tracking-widest">Target: {nextTier.name} Status</span>
                          </div>
                          <p className="text-xs text-content-secondary leading-relaxed font-medium">
                              Your current regional standing is <strong>{myData.tier}</strong>. Cumulative orders of <strong>{nextTier.minPoints.toLocaleString()} points</strong> will unlock <strong>{nextTier.perks}</strong>.
                          </p>
                          <div className="w-full h-2 bg-surface-input rounded-full overflow-hidden">
                              <div className="h-full bg-brand-purple" style={{ width: `${progressPercent}%` }} />
                          </div>
                      </div>
                  </div>
               </div>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Regional Points Accrual</CardTitle>
               </CardHeader>
               <DataTable columns={columns} data={myHistory} />
            </Card>
         </div>

         <div className="space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>System Targets</CardTitle>
               </CardHeader>
               <div className="p-4 space-y-4">
                  {targets.filter(t => t.type === 'Distributor').map(tgt => (
                    <div key={tgt.id} className="p-3 border border-border bg-surface-input/50 relative overflow-hidden group">
                       <div className="flex justify-between items-start mb-2">
                          <p className="text-xs font-bold text-content-primary">{tgt.name}</p>
                          <Badge size="xs" variant="purple">+{tgt.points} Pts</Badge>
                       </div>
                       <div className="w-full h-1 bg-surface-elevated rounded-full overflow-hidden">
                          <div className="h-full bg-brand-purple" style={{ width: `${(tgt.current / tgt.value) * 100}%` }} />
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-black mt-2">
                          <span className="text-content-tertiary uppercase">Fulfillment: {((tgt.current / tgt.value) * 100).toFixed(0)}%</span>
                          <span className="text-brand-purple uppercase">REACHED</span>
                       </div>
                       <RiTruckFill className="absolute -bottom-2 -right-2 w-12 h-12 opacity-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))}
               </div>
            </Card>

            <Card className="bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 border-brand-purple/30 text-center p-6">
                <div className="w-12 h-12 bg-surface-primary mx-auto mb-4 flex items-center justify-center shadow-glow">
                    <RiVipCrownFill className="text-brand-purple w-6 h-6" />
                </div>
                <h4 className="text-xs font-black text-content-primary uppercase tracking-widest mb-1">Platinum Council Meet</h4>
                <p className="text-[10px] text-content-secondary font-bold leading-tight">Elite distributors in Gold/Platinum tiers invited for the Regional Strategy Meet in Delhi.</p>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Unlocked Badges</CardTitle>
               </CardHeader>
               <div className="p-4 grid grid-cols-2 gap-3">
                  {milestones.slice(0, 4).map(ms => {
                    const active = myData.totalPoints >= ms.points;
                    return (
                      <div key={ms.id} className={`p-3 border flex flex-col items-center justify-center transition-all ${active ? 'border-brand-purple bg-brand-purple/5 shadow-glow' : 'border-border bg-surface-input opacity-40 grayscale'}`}>
                         <span className="text-2xl mb-1">{ms.badge}</span>
                         <span className="text-[9px] font-black text-content-primary uppercase text-center leading-none">{ms.label}</span>
                         {active && <RiCheckDoubleLine className="absolute top-1 right-1 text-brand-purple w-3 h-3" />}
                      </div>
                    );
                  })}
               </div>
            </Card>
         </div>
      </div>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={selectedReward?.label ? `Submit Redemption: ${selectedReward.label}` : 'Enterprise Rewards Catalog'}
        footer={selectedReward?.label ? (
           <div className="flex gap-3">
              <Button variant="secondary" onClick={() => open({ mode: 'catalog' })}>View Catalog</Button>
              <Button onClick={handleRedeem}>Confirm Order</Button>
           </div>
        ) : null}
      >
        {!selectedReward?.label ? (
           <div className="grid grid-cols-2 gap-4">
              {redemptionCatalog.map(rw => (
                <div key={rw.id} className="p-4 border border-border bg-surface-elevated hover:border-brand-purple group cursor-pointer transition-all" onClick={() => open(rw)}>
                  <RiGiftLine className="w-6 h-6 text-brand-purple mb-3 group-hover:scale-110 transition-transform" />
                  <h5 className="text-xs font-black text-content-primary uppercase tracking-tight leading-tight">{rw.label}</h5>
                  <p className="text-[10px] text-brand-purple font-black mt-2 uppercase">{rw.pointsCost} Points</p>
                </div>
              ))}
           </div>
        ) : (
           <div className="space-y-6">
              <div className="p-6 bg-brand-purple/5 border-2 border-dashed border-brand-purple/20 text-center">
                 <RiGiftLine className="w-12 h-12 text-brand-purple mx-auto mb-4" />
                 <h4 className="text-lg font-black text-content-primary uppercase tracking-tighter">{selectedReward.label}</h4>
                 <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-purple text-white text-[11px] font-black uppercase tracking-widest mt-4">
                    COST: {selectedReward.pointsCost} PTS
                 </div>
              </div>
              <div className="p-4 bg-surface-elevated border border-border flex items-start gap-3">
                 <RiInformationLine className="w-5 h-5 text-content-tertiary flex-shrink-0" />
                 <p className="text-xs text-content-secondary leading-relaxed font-bold uppercase tracking-tight text-left">
                    Orders for physical rewards or cash incentives will be processed during the next billing cycle by the regional logistics lead.
                 </p>
              </div>
           </div>
        )}
      </Modal>
    </div>
  );
}
