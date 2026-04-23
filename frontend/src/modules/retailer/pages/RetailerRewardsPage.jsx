import { RiTrophyLine, RiTrophyFill, RiMedalLine, RiHandHeartLine, RiGroupLine, RiHistoryLine, RiSettings4Line, RiSearchLine, RiArrowRightUpLine, RiInformationLine, RiCheckboxCircleLine, RiNodeTree, RiGiftLine, RiCheckDoubleLine, RiShoppingBag3Line, RiCopperCoinFill, RiTimerLine, RiVipCrownFill, RiMoneyDollarCircleLine, RiTicketLine, RiCouponLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, MetricCard, BarChart, useModal, Modal } from '../../../core';
import rewardsData from '../../../data/rewards.json';
import { toast } from 'react-hot-toast';

export default function RetailerRewardsPage() {
  const { pointsHistory, entities, tiers, milestones, redemptionCatalog, targets } = rewardsData;
  const myData = entities.find(e => e.name === 'Priya Kitchen World');
  const myHistory = pointsHistory.filter(h => h.entity === 'Priya Kitchen World');
  const { isOpen, open, close, data: selectedReward } = useModal();

  const handleRedeem = () => {
    toast.success(`Redemption request for ${selectedReward.label} sent! Approval usually takes 6-12 hours.`);
    close();
  };

  const nextTier = tiers.find(t => t.minPoints > myData.totalPoints) || tiers[tiers.length - 1];
  const progressPercent = Math.min((myData.totalPoints / nextTier.minPoints) * 100, 100);

  const columns = [
    { key: 'date', label: 'Award Date', render: (val) => <span className="text-xs text-content-tertiary font-bold uppercase">{val}</span> },
    { key: 'reason', label: 'Reason for Pts', flex: 1 },
    { key: 'points', label: 'Pts Awarded', align: 'center', render: (val) => (
       <div className="flex items-center justify-center gap-1 text-brand-teal">
          <RiTrophyLine className="w-4 h-4" />
          <span className="font-black text-brand-teal">+{val.toLocaleString()}</span>
       </div>
    )}
  ];

  const getRedeemIcon = (type) => {
    switch (type) {
      case 'cash': return RiMoneyDollarCircleLine;
      case 'voucher': return RiGiftLine;
      case 'coupon': return RiCouponLine;
      case 'product': return RiShoppingBag3Line;
      case 'event': return RiTicketLine;
      default: return RiGiftLine;
    }
  };

  return (
    <div className="page-container max-w-5xl mx-auto">
      <PageHeader 
        title="Store Growth Rewards" 
        subtitle="Track your reward points, monthly targets and performance bonuses"
      >
        <Button icon={RiTrophyLine} onClick={() => open({ mode: 'catalog' })}>Redeem Points Hub</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 mt-2">
          <Card className="p-5 bg-brand-teal/5 border-brand-teal/10 relative overflow-hidden group">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Total Points</p>
              <h4 className="text-4xl font-black text-brand-teal leading-tight">{myData.totalPoints.toLocaleString()}</h4>
              <p className="text-[10px] text-state-success font-black mt-2 uppercase tracking-tighter italic">Rank #1 in Your Area</p>
              <RiTrophyFill className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 text-brand-teal group-hover:scale-110 transition-transform" />
          </Card>
          
          <Card className="p-5 flex flex-col justify-center">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Earned This Month</p>
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-black text-content-primary">+{myData.thisMonth.toLocaleString()}</h4>
                <div className="flex items-center gap-1 text-state-success">
                   <RiCopperCoinFill className="w-4 h-4" />
                   <span className="text-xs font-black">+12%</span>
                </div>
              </div>
          </Card>

          <Card className="p-5 flex flex-col justify-center">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Redeemed Points</p>
              <h4 className="text-2xl font-black text-brand-pink">{myData.redeemed.toLocaleString()}</h4>
              <p className="text-[9px] text-content-tertiary mt-1 font-bold">Total Rewards Claimed</p>
          </Card>

          <Card className="p-5 flex flex-col justify-center border-l-4 border-state-warning">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Expiring Soon</p>
              <div className="flex items-center gap-2">
                <h4 className="text-2xl font-black text-state-warning">500</h4>
                <div className="flex items-center gap-1 text-content-tertiary">
                   <RiTimerLine className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase">Oct 01</span>
                </div>
              </div>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
         <div className="lg:col-span-2 space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Milestone Progression</CardTitle>
               </CardHeader>
               <div className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="relative w-32 h-32 flex flex-col items-center justify-center">
                          <svg className="w-full h-full -rotate-90">
                              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-input" />
                              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.42} strokeDashoffset={364.42 - (364.42 * progressPercent) / 100} className="text-brand-teal transition-all duration-1000" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-black text-brand-teal tracking-tighter">{Math.round(progressPercent)}%</span>
                              <span className="text-[8px] font-black uppercase text-content-tertiary">Progress</span>
                          </div>
                      </div>
                      <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                  <Badge variant="teal">{myData.tier} CLUB MEMBER</Badge>
                                  <RiVipCrownFill className="text-state-warning w-5 h-5" />
                              </div>
                              <span className="text-xs font-black text-content-tertiary uppercase tracking-widest">Next: {nextTier.name} Tier</span>
                          </div>
                          <p className="text-xs text-content-secondary leading-relaxed font-medium">
                              You are currently in the <strong>{myData.tier}</strong> tier. Reach <strong>{nextTier.minPoints.toLocaleString()} points</strong> to unlock <strong>{nextTier.perks}</strong>.
                          </p>
                          <div className="w-full h-2 bg-surface-input rounded-full overflow-hidden">
                              <div className="h-full bg-brand-teal" style={{ width: `${progressPercent}%` }} />
                          </div>
                      </div>
                  </div>
               </div>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Points History Log</CardTitle>
               </CardHeader>
               <DataTable columns={columns} data={myHistory} />
            </Card>
         </div>

         <div className="space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Active Milestones</CardTitle>
               </CardHeader>
               <div className="p-5 grid grid-cols-2 gap-3">
                  {milestones.map(ms => {
                    const isUnlocked = myData.totalPoints >= ms.points;
                    return (
                      <div key={ms.id} className={`p-3 border flex flex-col items-center justify-center text-center transition-all ${isUnlocked ? 'border-brand-teal bg-brand-teal/5 shadow-glow' : 'border-border bg-surface-input opacity-60 grayscale'}`}>
                         <span className="text-2xl mb-1">{ms.badge}</span>
                         <p className="text-[9px] font-black text-content-primary leading-tight uppercase mb-1">{ms.label}</p>
                         <p className="text-[8px] font-bold text-brand-teal uppercase tracking-widest">{ms.points} Pts</p>
                         {isUnlocked && <RiCheckboxCircleLine className="absolute top-2 right-2 text-brand-teal w-3 h-3" />}
                      </div>
                    );
                  })}
               </div>
               <div className="px-5 pb-5">
                 <Button variant="secondary" className="w-full h-8 text-[10px]" icon={RiTrophyLine}>Browse Milestone Benefits</Button>
               </div>
            </Card>

            <Card className="bg-gradient-to-br from-brand-teal/20 to-brand-purple/20 border-brand-teal/30 relative overflow-hidden">
               <div className="p-6 text-center space-y-3 relative z-10">
                  <div className="w-12 h-12 rounded-none bg-surface-primary shadow-glow mx-auto flex items-center justify-center">
                     <RiHandHeartLine className="text-brand-pink w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-content-primary">Exclusive Partner Gala</h4>
                  <p className="text-[10px] text-content-secondary leading-relaxed font-bold uppercase tracking-tight">Invitations for the Annual HQ Gala will be sent to the top 10 Mumbai Partners in October.</p>
               </div>
               <div className="absolute -bottom-4 -left-4 opacity-5 rotate-12">
                   <RiVipCrownFill className="w-32 h-32" />
               </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Active Targets</CardTitle>
              </CardHeader>
              <div className="p-4 space-y-3">
                 {targets.filter(t => t.type === 'Retailer' || t.type === 'Staff').map(tgt => (
                    <div key={tgt.id} className="p-3 border border-border bg-surface-input/50">
                       <div className="flex justify-between items-start mb-1.5">
                          <p className="text-[11px] font-bold text-content-primary">{tgt.name}</p>
                          <span className="text-[10px] font-black text-brand-teal">+{tgt.points} Pts</span>
                       </div>
                       <div className="w-full h-1 bg-surface-elevated rounded-full overflow-hidden mb-1">
                          <div className="h-full bg-brand-teal" style={{ width: `${(tgt.current / tgt.value) * 100}%` }} />
                       </div>
                       <div className="flex justify-between items-center text-[9px] font-bold">
                          <span className="text-content-tertiary uppercase">Target: {tgt.value}</span>
                          <span className="text-brand-teal">{((tgt.current / tgt.value) * 100).toFixed(0)}% Done</span>
                       </div>
                    </div>
                 ))}
              </div>
            </Card>
         </div>
      </div>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={selectedReward?.label ? `Claim Reward: ${selectedReward.label}` : 'Redemption Catalog'}
        footer={selectedReward?.label ? (
           <div className="flex gap-3">
              <Button variant="secondary" onClick={() => open({ mode: 'catalog' })}>Back to List</Button>
              <Button icon={RiCheckDoubleLine} onClick={handleRedeem}>Confirm Redemption</Button>
           </div>
        ) : null}
      >
        {!selectedReward?.label ? (
           <div className="grid grid-cols-2 gap-4">
              {redemptionCatalog.map(rw => {
                const RewardIcon = getRedeemIcon(rw.type);
                return (
                  <div key={rw.id} className="p-4 border border-border bg-surface-elevated hover:border-brand-teal group cursor-pointer transition-all" onClick={() => open(rw)}>
                    <RewardIcon className="w-6 h-6 text-brand-teal mb-3 group-hover:scale-110 transition-transform" />
                    <h5 className="text-xs font-bold text-content-primary tracking-tight leading-tight">{rw.label}</h5>
                    <p className="text-[10px] text-brand-teal font-black mt-2 uppercase">{rw.pointsCost} Points</p>
                  </div>
                );
              })}
           </div>
        ) : (
           <div className="space-y-6">
              <div className="p-6 bg-brand-teal/5 border-2 border-dashed border-brand-teal/20 text-center">
                 <RiGiftLine className="w-12 h-12 text-brand-teal mx-auto mb-4" />
                 <h4 className="text-xl font-bold text-content-primary tracking-tight">{selectedReward.label}</h4>
                 <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-teal text-white text-[11px] font-black uppercase tracking-widest mt-4">
                    Cost: {selectedReward.pointsCost} Pts
                 </div>
              </div>
              <div className="p-4 bg-surface-elevated border border-border flex items-start gap-4">
                 <RiInformationLine className="w-5 h-5 text-content-tertiary flex-shrink-0" />
                 <p className="text-xs text-content-secondary leading-relaxed font-medium">
                    By confirming, <strong>{selectedReward.pointsCost} points</strong> will be frozen in your account while our regional manager approves the redemption. Standard processing time is 48 working hours.
                 </p>
              </div>
           </div>
        )}
      </Modal>
    </div>
  );
}
