import { RiTrophyLine, RiTrophyFill, RiMedalLine, RiHandHeartLine, RiGroupLine, RiHistoryLine, RiSettings4Line, RiSearchLine, RiArrowRightUpLine, RiInformationLine, RiCheckboxCircleLine, RiNodeTree } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, MetricCard, BarChart } from '../../../core';
import rewards from '../../../data/rewards.json';

export default function DistRewardsPage() {
  const myHistory = rewards.pointsHistory.filter(h => h.entity === 'Arjun Patel');

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
        title="Distributor Loyalty" 
        subtitle="Track your reward points, regional targets and redemption eligibility"
      >
        <Button icon={RiTrophyLine}>Redeem Points</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 mt-2">
         <Card className="bg-brand-teal/5 border-brand-teal/10 relative overflow-hidden">
            <div className="p-6">
               <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Total Earned</p>
               <h4 className="text-4xl font-black text-brand-teal leading-tight">18,500</h4>
               <p className="text-xs text-state-success font-bold mt-2 italic">Rank #5 in North Region</p>
            </div>
            <RiTrophyFill className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 text-brand-teal" />
         </Card>
         <Card className="bg-state-warning/5 border-state-warning/10">
            <div className="p-6">
               <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Upcoming Milestone</p>
               <h4 className="text-3xl font-black text-state-warning leading-tight">20,000 Pts</h4>
               <p className="text-xs text-content-tertiary mt-2">Get 5% Margin Bonus on goal</p>
               <div className="w-full h-1 bg-surface-primary rounded-none mt-3 overflow-hidden">
                  <div className="h-full bg-state-warning rounded-none" style={{ width: '92.5%' }} />
               </div>
            </div>
         </Card>
         <Card className="bg-surface-elevated border-border">
            <div className="p-6">
               <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Eligibility Status</p>
               <h4 className="text-2xl font-black text-content-primary leading-tight">Verified Partner</h4>
               <p className="text-xs text-content-tertiary mt-2">KYC and GST compliance active</p>
               <Badge className="mt-3" variant="teal">GOLD TIER</Badge>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
            <Card>
               <CardHeader>
                  <CardTitle>Points Accrual Log</CardTitle>
                  <CardDescription>Historical record of reward points awarded based on regional targets</CardDescription>
               </CardHeader>
               <DataTable columns={columns} data={myHistory} />
            </Card>
         </div>
         <div className="space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Regional Targets</CardTitle>
               </CardHeader>
               <div className="p-5 space-y-4">
                  {[
                    { label: 'Q2 North Sales Goal', value: 85, pts: '5K pts' },
                    { label: 'Network Satisfaction', value: 94, pts: '2K pts' }
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
                  <Button variant="secondary" className="w-full h-9 text-xs" icon={RiNodeTree}>All Regional Goals</Button>
               </div>
            </Card>
            <Card className="bg-gradient-to-br from-brand-teal/20 to-brand-purple/20 border-brand-teal/30">
               <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-none bg-surface-primary shadow-glow mx-auto flex items-center justify-center">
                     <RiHandHeartLine className="text-brand-pink w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-content-primary">Quarterly Bonus Event</h4>
                  <p className="text-[10px] text-content-secondary leading-relaxed">Top 3 performers in North Region will get a trip to the Annual HQ Gala in Maldives.</p>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
