import { RiTrophyLine, RiTrophyFill, RiMedalLine, RiHandHeartLine, RiGroupLine, RiHistoryLine, RiSettings4Line, RiSearchLine, RiArrowRightUpLine, RiInformationLine, RiCheckboxCircleLine, RiNodeTree, RiGiftLine, RiCheckDoubleLine, RiShoppingBag3Line } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, MetricCard, BarChart, useModal, Modal } from '../../../core';
import rewards from '../../../data/rewards.json';
import { toast } from 'react-hot-toast';

export default function RetailerRewardsPage() {
  const myHistory = rewards.pointsHistory.filter(h => h.entity === 'Priya Kitchen World');
  const { isOpen, open, close, data: selectedReward } = useModal();

  const handleRedeem = () => {
    toast.success(`Redemption request for ${selectedReward.label} sent! Approval usually takes 6-12 hours.`);
    close();
  };

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

  return (
    <div className="page-container max-w-5xl mx-auto">
      <PageHeader 
        title="Store Growth Rewards" 
        subtitle="Track your reward points, monthly targets and performance bonuses"
      >
        <Button icon={RiTrophyLine} onClick={() => open({ type: 'catalog' })}>Redeem Points Hub</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 mt-2">
         <Card className="bg-brand-teal/5 border-brand-teal/10 relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="p-6">
               <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Total Points</p>
               <h4 className="text-4xl font-black text-brand-teal leading-tight">12,450</h4>
               <p className="text-xs text-state-success font-bold mt-2 italic">Rank #1 in Mumbai North</p>
            </div>
            <RiTrophyFill className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 text-brand-teal" />
         </Card>
         <Card className="bg-state-warning/5 border-state-warning/10">
            <div className="p-6">
               <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Target for May</p>
               <h4 className="text-3xl font-black text-state-warning leading-tight">15,000 Pts</h4>
               <p className="text-xs text-content-tertiary mt-2">Bonus Cash Incentive unlocked</p>
               <div className="w-full h-1 bg-surface-primary rounded-none mt-3 overflow-hidden">
                  <div className="h-full bg-state-warning rounded-none" style={{ width: '82.5%' }} />
               </div>
            </div>
         </Card>
         <Card className="bg-surface-elevated border-border">
            <div className="p-6">
               <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Partner Tier</p>
               <h4 className="text-2xl font-black text-content-primary leading-tight">Elite Partner</h4>
               <p className="text-xs text-content-tertiary mt-2">Special AMC coverage active</p>
               <Badge className="mt-3" variant="teal">PLATINUM CLUB</Badge>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
            <Card>
               <CardHeader>
                  <CardTitle>Bonus Points History</CardTitle>
                  <CardDescription>Targets achieved and performance points logs</CardDescription>
               </CardHeader>
               <DataTable columns={columns} data={myHistory} />
            </Card>
         </div>
         <div className="space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Active Milestones</CardTitle>
               </CardHeader>
               <div className="p-5 space-y-4">
                  {[
                    { label: 'Induction Push Goal', value: 72, pts: '1.5K pts' },
                    { label: 'Customer NPS Goal', value: 98, pts: '1K pts' }
                  ].map((tgt, i) => (
                    <div key={i} className="p-3 rounded-none bg-surface-input border border-border">
                       <div className="flex justify-between items-center mb-1">
                          <p className="text-[11px] font-bold text-content-primary truncate">{tgt.label}</p>
                          <span className="text-[10px] font-black text-brand-teal">{tgt.pts}</span>
                       </div>
                       <div className="w-full h-1 bg-surface-primary rounded-none overflow-hidden mb-1">
                          <div className="h-full bg-brand-teal rounded-none" style={{ width: `${tgt.value}%` }} />
                       </div>
                       <p className="text-[9px] text-content-tertiary text-right">{tgt.value}% Reached</p>
                    </div>
                  ))}
               </div>
            </Card>
            <Card className="bg-gradient-to-br from-brand-pink/20 to-brand-purple/20 border-brand-pink/30">
               <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-none bg-surface-primary shadow-glow mx-auto flex items-center justify-center">
                     <RiHandHeartLine className="text-brand-pink w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-content-primary">Retailer Appreciation Gala</h4>
                  <p className="text-[10px] text-content-secondary leading-relaxed">Invitations sent for Mumbai chapter. Top performers collected tickets at counter.</p>
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
              <Button variant="secondary" onClick={() => open({ type: 'catalog' })}>Back to List</Button>
              <Button icon={RiCheckDoubleLine} onClick={handleRedeem}>Confirm Redemption</Button>
           </div>
        ) : null}
      >
        {!selectedReward?.label ? (
           <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Ogun Premium Gift Box', cost: 1500, icon: RiGiftLine },
                { label: 'Extra 5% Margin Voucher', cost: 5000, icon: RiHandHeartLine },
                { label: 'POS Hardware Upgrade', cost: 12000, icon: RiShoppingBag3Line },
                { label: 'Regional Meet Invite', cost: 500, icon: RiGroupLine }
              ].map(rw => (
                <div key={rw.label} className="p-4 border border-border bg-surface-elevated hover:border-brand-teal group cursor-pointer" onClick={() => open(rw)}>
                   <rw.icon className="w-6 h-6 text-brand-teal mb-3 group-hover:scale-110 transition-transform" />
                   <h5 className="text-xs font-bold text-content-primary">{rw.label}</h5>
                   <p className="text-[10px] text-brand-teal font-black mt-2 uppercase">{rw.cost} Points</p>
                </div>
              ))}
           </div>
        ) : (
           <div className="space-y-6">
              <div className="p-6 bg-brand-teal/5 border-2 border-dashed border-brand-teal/20 text-center">
                 <selectedReward.icon className="w-12 h-12 text-brand-teal mx-auto mb-4" />
                 <h4 className="text-xl font-bold text-content-primary">{selectedReward.label}</h4>
                 <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-teal text-white text-[10px] font-bold uppercase tracking-widest mt-4">
                    Cost: {selectedReward.cost} Pts
                 </div>
              </div>
              <div className="p-4 bg-surface-elevated border border-border flex items-start gap-4">
                 <RiInformationLine className="w-5 h-5 text-content-tertiary flex-shrink-0" />
                 <p className="text-xs text-content-secondary leading-relaxed">
                    By confirming, <strong>{selectedReward.cost} points</strong> will be frozen in your account while our regional manager approves the redemption. Standard processing time is 48 working hours.
                 </p>
              </div>
           </div>
        )}
      </Modal>
    </div>
  );
}
