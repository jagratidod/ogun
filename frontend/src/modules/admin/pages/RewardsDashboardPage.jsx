import { RiTrophyLine, RiTrophyFill, RiMedalLine, RiHandHeartLine, RiGroupLine, RiHistoryLine, RiSettings4Line, RiSearchLine, RiArrowRightUpLine, RiFlashlightLine, RiMoneyDollarCircleLine, RiTimeLine, RiCheckboxCircleLine, RiCloseCircleLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, MetricCard, BarChart, useSearch } from '../../../core';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../../core/api';

export default function RewardsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [pointsEnabled, setPointsEnabled] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, leaderboardRes] = await Promise.all([
        api.get('/rewards/stats'),
        api.get('/rewards/leaderboard')
      ]);
      
      setStats(statsRes.data.data);
      setLeaderboard(leaderboardRes.data.data);
      setPointsEnabled(statsRes.data.data.systemConfig?.pointsEnabled ?? true);
    } catch (error) {
      toast.error('Failed to fetch reward data');
    } finally {
      setLoading(false);
    }
  };

  const togglePointsSystem = async () => {
    try {
      await api.put('/admin/reward-config/rules/system', { pointsEnabled: !pointsEnabled });
      setPointsEnabled(!pointsEnabled);
      toast.success(`Points System ${!pointsEnabled ? 'Enabled' : 'Disabled'} Successfully`);
    } catch (error) {
      toast.error('Failed to update points system');
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-brand-teal border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { totalPoints, totalRupeeValue, activePartners, barChartData, targets, systemConfig } = stats;
  const top3 = leaderboard.slice(0, 3);

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
       <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
             <RiTrophyLine className="text-state-warning w-4 h-4" />
             <span className="font-bold text-content-primary">{val.toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-brand-teal font-black">₹{(val * systemConfig.pointToRupeeRatio).toLocaleString()}</span>
       </div>
    )},
    { key: 'tier', label: 'Tier', render: (val) => <Badge variant="teal">{val}</Badge> },
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <Button variant="ghost" size="sm" icon={RiArrowRightUpLine}>Audit</Button>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Rewards Dashboard" 
        subtitle="Managing platform-wide retailer and distributor loyalty programs"
      >
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${pointsEnabled ? 'bg-state-success/10 border-state-success/20 text-state-success' : 'bg-state-danger/10 border-state-danger/20 text-state-danger'}`}>
            <RiFlashlightLine className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">{pointsEnabled ? 'System Active' : 'System Paused'}</span>
          </div>
          <Button icon={pointsEnabled ? RiCloseCircleLine : RiCheckboxCircleLine} variant={pointsEnabled ? 'secondary' : 'primary'} onClick={togglePointsSystem}>
            {pointsEnabled ? 'Stop System' : 'Start System'}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 mt-2">
          <MetricCard title="Total Points Awarded" value={totalPoints.toLocaleString()} trend={+12} icon={RiTrophyLine} />
          <MetricCard title="Monetary Liability" value={`₹${totalRupeeValue.toLocaleString()}`} trend={+12} icon={RiMoneyDollarCircleLine} />
          <MetricCard title="Active Partners" value={activePartners.toLocaleString()} trend={+2} icon={RiGroupLine} />
          <MetricCard title="Expiring (30d)" value="1,250" trend={-5} icon={RiTimeLine} />
      </div>

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
                 <div className="flex items-center justify-between mt-1">
                    <div>
                      <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest leading-none">Total Points</p>
                      <h2 className="text-3xl font-black text-brand-teal mt-1">{entry.points.toLocaleString()}</h2>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest leading-none">Value</p>
                       <h4 className="text-xl font-black text-brand-teal mt-1 tracking-tighter">₹{(entry.points * systemConfig.pointToRupeeRatio).toLocaleString()}</h4>
                    </div>
                 </div>
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
                  <CardDescription>Highest point accumulation across our registered entity network (₹ view enabled)</CardDescription>
               </CardHeader>
               <DataTable columns={columns} data={leaderboard} />
            </Card>

            <div className="glass-card p-6">
               <h3 className="section-title mb-6">Regional Rewards Distribution (Total Points)</h3>
               <BarChart 
                 data={barChartData} 
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
                     <CardTitle>Active Programs</CardTitle>
                     <Button variant="ghost" size="sm" icon={RiSettings4Line}>Manage</Button>
                  </div>
               </CardHeader>
               <div className="p-4 space-y-4">
                  {targets.map(tgt => (
                    <div key={tgt._id} className="p-3 rounded-none bg-surface-input/50 border border-border group hover:border-brand-teal transition-all">
                       <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-semibold text-content-primary group-hover:text-brand-teal transition-colors">{tgt.name}</p>
                          <Badge size="xs" variant="teal">{tgt.type}</Badge>
                       </div>
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-content-tertiary font-bold">{tgt.awardPoints} POINTS (₹{(tgt.awardPoints * systemConfig.pointToRupeeRatio).toLocaleString()})</span>
                          <span className="text-[10px] text-content-tertiary">Due {tgt.deadline ? new Date(tgt.deadline).toLocaleDateString() : '—'}</span>
                       </div>
                    </div>
                  ))}
                  <Button className="w-full mt-2" variant="secondary" icon={RiTrophyLine}>View All Milestone Data</Button>
               </div>
            </Card>

            <Card className="bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 border-brand-purple/30">
               <div className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-none bg-surface-primary/50 flex items-center justify-center mx-auto shadow-glow">
                     <RiHandHeartLine className="text-brand-pink w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-content-primary">Pending Redemptions</h4>
                    <p className="text-xs text-content-secondary mt-1 tracking-tight">8 Retailers requested Cash Incentives in the last 24 hours. Approval needed.</p>
                  </div>
                  <Button className="w-full" variant="secondary" onClick={() => navigate('/admin/rewards/redemptions')}>Go to Redemption Queue</Button>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
