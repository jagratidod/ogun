import { useState, useEffect } from 'react';
import { RiTrophyLine, RiHistoryLine, RiVipCrownFill, RiGiftLine, RiCheckDoubleLine, RiTruckFill, RiInformationLine, RiLoader4Line } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, DataTable, Badge, Button, Modal, useModal } from '../../../core';
import { toast } from 'react-hot-toast';
import api from '../../../core/api';

export default function DistRewardsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, open, close, data: selectedReward } = useModal();

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const res = await api.get('/rewards/my-rewards');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch rewards:', err);
      toast.error('Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = () => {
    toast.success(`Redemption request submitted! Our team will contact you.`);
    close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-10 h-10 text-brand-purple animate-spin" />
      </div>
    );
  }

  const balance = data?.balance || 0;
  const history = data?.history || [];
  const targets = data?.targets || [];

  const columns = [
    { key: 'timestamp', label: 'Date', render: (val) => <span className="text-[10px] text-content-tertiary font-bold uppercase">{new Date(val).toLocaleDateString()}</span> },
    { key: 'reason', label: 'Description', flex: 1 },
    { key: 'amount', label: 'Points', align: 'center', render: (val, row) => (
       <div className={`flex items-center justify-center gap-1 ${row.type === 'credit' ? 'text-brand-purple' : 'text-state-danger'}`}>
          <RiTrophyLine className="w-4 h-4" />
          <span className="font-black">{row.type === 'credit' ? '+' : '-'}{val.toLocaleString()}</span>
       </div>
    )}
  ];

  return (
    <div className="page-container max-w-5xl mx-auto">
      <PageHeader 
        title="Distributor Loyalty Hub" 
        subtitle="Manage your reward points, supply targets and high-value redemptions"
      >
        <Button icon={RiTrophyLine} onClick={() => open({ mode: 'catalog' })}>Redeem Points</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-2">
          <Card className="p-6 bg-brand-purple/5 border-brand-purple/10 relative overflow-hidden group">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Total Balance</p>
              <h4 className="text-4xl font-black text-brand-purple leading-tight">{balance.toLocaleString()}</h4>
              <Badge variant="purple" className="mt-2">LOYALTY MEMBER</Badge>
              <RiVipCrownFill className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 text-brand-purple group-hover:rotate-12 transition-transform" />
          </Card>
          
          <Card className="p-6">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Earning Rules</p>
              <div className="mt-2 space-y-2">
                 <div className="flex justify-between text-xs">
                    <span className="text-content-secondary">Per Order Fulfilled:</span>
                    <span className="font-bold text-brand-purple">+{data?.earningRules?.perOrderDispatched || 0} Pts</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-content-secondary">Bulk Supply:</span>
                    <span className="font-bold text-brand-purple">+{data?.earningRules?.bulkSupplyBonus || 0} Pts</span>
                 </div>
              </div>
          </Card>

          <Card className="p-6">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Redemptions</p>
              <h4 className="text-2xl font-black text-brand-pink">0</h4>
              <p className="text-[9px] text-content-tertiary mt-1 font-bold">Points used till date</p>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
         <div className="lg:col-span-2 space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Active Performance Targets</CardTitle>
               </CardHeader>
               <div className="p-4 space-y-4">
                  {targets.length === 0 ? (
                    <p className="text-center py-8 text-content-tertiary text-sm">No active targets at the moment.</p>
                  ) : (
                    targets.map(tgt => (
                      <div key={tgt._id} className="p-4 border border-border bg-surface-input/50 relative overflow-hidden group">
                         <div className="flex justify-between items-start mb-2">
                            <div>
                               <p className="text-sm font-bold text-content-primary">{tgt.name}</p>
                               <p className="text-[10px] text-content-tertiary font-bold uppercase">Target: {tgt.targetValue.toLocaleString()} {tgt.metric === 'rev' ? 'INR' : 'Units'}</p>
                            </div>
                            <Badge variant="purple">+{tgt.awardPoints} Pts</Badge>
                         </div>
                         <div className="flex justify-between items-center text-[10px] font-black mt-4">
                            <span className="text-content-tertiary uppercase">Ends: {new Date(tgt.deadline).toLocaleDateString()}</span>
                            <span className="text-brand-purple uppercase">IN PROGRESS</span>
                         </div>
                         <RiTruckFill className="absolute -bottom-2 -right-2 w-12 h-12 opacity-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))
                  )}
               </div>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Points History</CardTitle>
               </CardHeader>
               <DataTable columns={columns} data={history} />
            </Card>
         </div>

         <div className="space-y-6">
            <Card className="bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 border-brand-purple/30 text-center p-6">
                <div className="w-12 h-12 bg-surface-primary mx-auto mb-4 flex items-center justify-center shadow-glow rounded-none">
                    <RiVipCrownFill className="text-brand-purple w-6 h-6" />
                </div>
                <h4 className="text-xs font-black text-content-primary uppercase tracking-widest mb-1">Platinum Council Meet</h4>
                <p className="text-[10px] text-content-secondary font-bold leading-tight">Elite partners are invited for the Regional Strategy Meet. Keep earning points to qualify!</p>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Quick Redemption</CardTitle>
               </CardHeader>
               <div className="p-4 space-y-3">
                  {[
                    { label: '₹1,000 Amazon Voucher', cost: 1000 },
                    { label: 'Ogun Premium T-Shirt', cost: 500 },
                    { label: '₹5,000 Cash Credit', cost: 5000 },
                  ].map(rw => (
                    <div key={rw.label} className="p-3 border border-border flex justify-between items-center bg-surface-elevated hover:border-brand-purple cursor-pointer transition-all group" onClick={() => open({ label: rw.label, pointsCost: rw.cost })}>
                       <span className="text-[10px] font-black text-content-primary uppercase">{rw.label}</span>
                       <span className="text-[10px] font-black text-brand-purple">{rw.cost} PTS</span>
                    </div>
                  ))}
               </div>
            </Card>
         </div>
      </div>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={selectedReward?.label ? `Redeem Points` : 'Rewards Catalog'}
      >
        {selectedReward?.label && (
           <div className="space-y-6 text-center">
              <div className="p-8 bg-brand-purple/5 border border-brand-purple/20">
                 <RiGiftLine className="w-12 h-12 text-brand-purple mx-auto mb-4" />
                 <h4 className="text-lg font-black text-content-primary uppercase tracking-tighter">{selectedReward.label}</h4>
                 <p className="text-xs text-content-tertiary mt-1">Cost: {selectedReward.pointsCost} Points</p>
              </div>
              <div className="p-4 bg-surface-elevated border border-border flex items-start gap-3">
                 <RiInformationLine className="w-5 h-5 text-content-tertiary flex-shrink-0" />
                 <p className="text-[10px] text-content-secondary font-bold uppercase tracking-tight text-left">
                    Your current balance is {balance.toLocaleString()} points. 
                    {balance < selectedReward.pointsCost ? ' You need more points to redeem this reward.' : ' Proceed to redeem this reward?'}
                 </p>
              </div>
              <div className="flex gap-3 pt-4 border-t border-border">
                 <Button variant="secondary" className="flex-1" onClick={close}>Cancel</Button>
                 <Button className="flex-1" disabled={balance < selectedReward.pointsCost} onClick={handleRedeem}>Confirm Redemption</Button>
              </div>
           </div>
        )}
      </Modal>
    </div>
  );
}
