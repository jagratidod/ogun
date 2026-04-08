import { RiTrophyLine, RiTrophyFill, RiMedalLine, RiHandHeartLine, RiGroupLine, RiHistoryLine, RiSettings4Line, RiSearchLine, RiArrowRightUpLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, MetricCard, BarChart, useSearch } from '../../../core';
import rewardsData from '../../../data/rewards.json';

export default function RewardsDashboardPage() {
  const { leaderboard, targets } = rewardsData;

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  const columns = [
    { key: 'rank', label: 'Rank', width: '80px', align: 'center', render: (val) => (
       <span className={`font-bold ${val <= 3 ? 'text-brand-teal' : 'text-content-tertiary'}`}>#{val}</span>
    )},
    { key: 'name', label: 'Entity Name', render: (val) => (
       <div className="flex items-center gap-2">
          <Avatar name={val} size="xs" />
          <span className="font-semibold text-content-primary">{val}</span>
       </div>
    )},
    { key: 'points', label: 'Points Balance', align: 'right', render: (val) => (
       <div className="flex items-center justify-end gap-2">
          <RiTrophyLine className="text-state-warning w-4 h-4" />
          <span className="font-bold text-content-primary">{val.toLocaleString()}</span>
       </div>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <Button variant="ghost" size="sm" icon={RiArrowRightUpLine}>Profile</Button>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Rewards Dashboard" 
        subtitle="Managing platform-wide retailer and distributor loyalty programs"
      >
        <Button icon={RiTrophyLine}>Disburse Rewards</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         {top3.map((entry, idx) => (
           <div key={entry.name} className={`glass-card p-6 border-t-4 ${idx === 0 ? 'border-state-warning' : idx === 1 ? 'border-content-tertiary' : 'border-brand-teal'} relative overflow-hidden transition-all hover:-translate-y-1`}>
              <div className="flex items-start justify-between relative z-10">
                 <div className="p-3 rounded-none bg-surface-elevated">
                    {idx === 0 ? <RiTrophyFill className="text-state-warning w-8 h-8" /> : idx === 1 ? <RiMedalLine className="text-content-tertiary w-8 h-8" /> : <RiMedalLine className="text-brand-teal w-8 h-8" />}
                 </div>
                 <Badge variant={idx === 0 ? 'warning' : 'info'}>RANK #{entry.rank}</Badge>
              </div>
              <div className="mt-4 relative z-10">
                 <h4 className="text-lg font-bold text-content-primary truncate">{entry.name}</h4>
                 <p className="text-xs text-content-tertiary font-bold uppercase tracking-widest mt-1">Total Points</p>
                 <h2 className="text-3xl font-black text-brand-teal mt-0.5">{entry.points.toLocaleString()}</h2>
              </div>
              <div className="absolute -bottom-4 -right-4 opacity-10">
                 <RiTrophyLine className="w-32 h-32" />
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Leaderboard Standings</CardTitle>
                  <CardDescription>Highest point accumulation across our registered entity network</CardDescription>
               </CardHeader>
               <DataTable columns={columns} data={leaderboard} />
            </Card>

            <div className="glass-card p-6">
               <h3 className="section-title mb-6">Regional Rewards Distribution</h3>
               <BarChart 
                 data={[
                   { name: 'Mumbai', val: 45600 },
                   { name: 'Delhi', val: 38200 },
                   { name: 'Bangalore', val: 41000 },
                   { name: 'Hyderabad', val: 29500 },
                   { name: 'Ahmedabad', val: 32400 }
                 ]} 
                 dataKey="val" 
                 xKey="name" 
                 height={280} 
                 name="Points" 
               />
            </div>
         </div>

         <div className="space-y-6">
            <Card>
               <CardHeader>
                  <div className="flex items-center justify-between w-full">
                     <CardTitle>Active Targets</CardTitle>
                     <Button variant="ghost" size="sm" icon={RiSettings4Line}>Manage</Button>
                  </div>
               </CardHeader>
               <div className="p-4 space-y-4">
                  {targets.map(tgt => (
                    <div key={tgt.id} className="p-3 rounded-none bg-surface-input/50 border border-border group hover:border-brand-teal transition-all">
                       <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-semibold text-content-primary group-hover:text-brand-teal transition-colors">{tgt.name}</p>
                          <Badge size="xs" variant="teal">{tgt.type}</Badge>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] text-content-tertiary font-bold">{tgt.points} POINTS</span>
                          <span className="text-[10px] text-content-tertiary">Due {tgt.deadline}</span>
                       </div>
                       <div className="w-full h-1 bg-surface-primary rounded-none mt-2.5 overflow-hidden">
                          <div className="h-full bg-brand-teal rounded-none" style={{ width: '65%' }} />
                       </div>
                    </div>
                  ))}
                  <Button className="w-full mt-2" variant="secondary" icon={RiTrophyLine}>View All Targets</Button>
               </div>
            </Card>

            <Card className="bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 border-brand-purple/30">
               <div className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-none bg-surface-primary/50 flex items-center justify-center mx-auto shadow-glow">
                     <RiHandHeartLine className="text-brand-pink w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-content-primary">Quarterly Reward Gala</h4>
                    <p className="text-xs text-content-secondary mt-1">Announcement for top performers coming soon in May 2026. Keep pushing targets!</p>
                  </div>
                  <Button className="w-full">System Broadcast</Button>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
