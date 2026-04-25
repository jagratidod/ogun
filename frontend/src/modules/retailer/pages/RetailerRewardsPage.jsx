import { useState, useEffect } from 'react';
import { RiTrophyLine, RiVipCrownFill, RiGiftLine, RiTruckFill, RiInformationLine, RiLoader4Line } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, DataTable, Badge, Button, Modal, useModal } from '../../../core';
import { toast } from 'react-hot-toast';
import api from '../../../core/api';

export default function RetailerRewardsPage() {
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
    toast.success(`Redemption request submitted! Points will be deducted after approval.`);
    close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
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
       <div className={`flex items-center justify-center gap-1 ${row.type === 'credit' ? 'text-brand-teal' : 'text-state-danger'}`}>
          <RiTrophyLine className="w-4 h-4" />
          <span className="font-black">{row.type === 'credit' ? '+' : '-'}{val.toLocaleString()}</span>
       </div>
    )}
  ];

  return (
    <div className="page-container max-w-5xl mx-auto">
      <PageHeader 
        title="Retailer Rewards" 
        subtitle="Earn points on every sale and unlock exclusive brand benefits"
      >
        <Button icon={RiTrophyLine} onClick={() => open({ mode: 'catalog' })}>Redeem Now</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-2">
          <Card className="p-6 bg-brand-teal/5 border-brand-teal/10 relative overflow-hidden group">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Your Balance</p>
              <h4 className="text-4xl font-black text-brand-teal leading-tight">{balance.toLocaleString()}</h4>
              <Badge variant="teal" className="mt-2">CERTIFIED PARTNER</Badge>
              <RiVipCrownFill className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 text-brand-teal group-hover:rotate-12 transition-transform" />
          </Card>
          
          <Card className="p-6">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Earning Points</p>
              <div className="mt-2 space-y-2">
                 <div className="flex justify-between text-xs">
                    <span className="text-content-secondary">Per Product Sold:</span>
                    <span className="font-bold text-brand-teal">+{data?.earningRules?.perProductSale || 0} Pts</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-content-secondary">Monthly Bonus:</span>
                    <span className="font-bold text-brand-teal">+{data?.earningRules?.monthlyTargetBonus || 0} Pts</span>
                 </div>
              </div>
          </Card>

          <Card className="p-6">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Rank</p>
              <h4 className="text-2xl font-black text-content-primary">SILVER</h4>
              <p className="text-[9px] text-content-tertiary mt-1 font-bold uppercase">Top 10% in your city</p>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
         <div className="lg:col-span-2 space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Active Challenges</CardTitle>
               </CardHeader>
               <div className="p-4 space-y-4">
                  {targets.length === 0 ? (
                    <p className="text-center py-8 text-content-tertiary text-sm">No active challenges. Stay tuned!</p>
                  ) : (
                    targets.map(tgt => (
                      <div key={tgt._id} className="p-4 border border-border bg-surface-input/50 relative overflow-hidden group">
                         <div className="flex justify-between items-start mb-2">
                            <div>
                               <p className="text-sm font-bold text-content-primary">{tgt.name}</p>
                               <p className="text-[10px] text-content-tertiary font-bold uppercase">Goal: {tgt.targetValue.toLocaleString()} {tgt.metric === 'rev' ? 'INR' : 'Units'}</p>
                            </div>
                            <Badge variant="teal">+{tgt.awardPoints} Pts</Badge>
                         </div>
                         <div className="flex justify-between items-center text-[10px] font-black mt-4">
                            <span className="text-content-tertiary uppercase">Deadline: {new Date(tgt.deadline).toLocaleDateString()}</span>
                            <span className="text-brand-teal uppercase">LIVE</span>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Earnings History</CardTitle>
               </CardHeader>
               <DataTable columns={columns} data={history} />
            </Card>
         </div>

         <div className="space-y-6">
            <Card className="bg-gradient-to-br from-brand-teal/20 to-brand-purple/20 border-brand-teal/30 text-center p-6">
                <div className="w-12 h-12 bg-surface-primary mx-auto mb-4 flex items-center justify-center shadow-glow rounded-none">
                    <RiVipCrownFill className="text-brand-teal w-6 h-6" />
                </div>
                <h4 className="text-xs font-black text-content-primary uppercase tracking-widest mb-1">Annual Retailer Meet</h4>
                <p className="text-[10px] text-content-secondary font-bold leading-tight">Top performing retailers win an all-expenses paid trip to the annual brand meet.</p>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Redeem Points</CardTitle>
               </CardHeader>
               <div className="p-4 space-y-3">
                  {[
                    { label: 'Ogun Brand Signage', cost: 2000 },
                    { label: 'Store Display Shelf', cost: 5000 },
                    { label: '₹2,000 Paytm Cash', cost: 2000 },
                  ].map(rw => (
                    <div key={rw.label} className="p-3 border border-border flex justify-between items-center bg-surface-elevated hover:border-brand-teal cursor-pointer transition-all group" onClick={() => open({ label: rw.label, pointsCost: rw.cost })}>
                       <span className="text-[10px] font-black text-content-primary uppercase">{rw.label}</span>
                       <span className="text-[10px] font-black text-brand-teal">{rw.cost} PTS</span>
                    </div>
                  ))}
               </div>
            </Card>
         </div>
      </div>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={selectedReward?.label ? `Submit Request` : 'Catalog'}
      >
        {selectedReward?.label && (
           <div className="space-y-6 text-center">
              <div className="p-8 bg-brand-teal/5 border border-brand-teal/20">
                 <RiGiftLine className="w-12 h-12 text-brand-teal mx-auto mb-4" />
                 <h4 className="text-lg font-black text-content-primary uppercase tracking-tighter">{selectedReward.label}</h4>
                 <p className="text-xs text-content-tertiary mt-1">Required Points: {selectedReward.pointsCost}</p>
              </div>
              <div className="p-4 bg-surface-elevated border border-border flex items-start gap-3">
                 <RiInformationLine className="w-5 h-5 text-content-tertiary flex-shrink-0" />
                 <p className="text-[10px] text-content-secondary font-bold uppercase tracking-tight text-left">
                    Your balance: {balance.toLocaleString()} Pts. 
                    {balance < selectedReward.pointsCost ? ' Insufficient points.' : ' Confirm your request?'}
                 </p>
              </div>
              <div className="flex gap-3 pt-4 border-t border-border">
                 <Button variant="secondary" className="flex-1" onClick={close}>Cancel</Button>
                 <Button className="flex-1" disabled={balance < selectedReward.pointsCost} onClick={handleRedeem}>Confirm</Button>
              </div>
           </div>
        )}
      </Modal>
    </div>
  );
}
