import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  RiUserAddFill, RiShoppingCartFill, RiTimeFill, RiTrophyFill, 
  RiArrowRightUpLine, RiStore2Fill, RiCustomerService2Fill, RiPlayFill 
} from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import executiveService from '../../../core/services/executiveService';
import { PageHeader, Card, Button, Badge, formatCurrency } from '../../../core';

// Current month in YYYY-MM format
const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function SalesDashboardPage() {
  const [stats, setStats] = useState(null);
  const [targets, setTargets] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const hasFetched = useRef(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await executiveService.getStats();
      const data = res.data;
      setStats(data);
      const month = currentMonth();
      setTargets(data?.targets?.find(t => t.month === month) || null);
    } catch (err) {
      console.error('[Dashboard] stats error:', err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchStats();
    }
  }, [fetchStats]);

  const statCards = [
    { label: 'Retailers', val: stats?.totalRetailers ?? 0, icon: RiStore2Fill, color: 'text-brand-teal', bg: 'bg-brand-teal/10', path: '/sales/retailers' },
    { label: 'Points', val: stats?.rewardPoints ?? 0, icon: RiTrophyFill, color: 'text-brand-pink', bg: 'bg-brand-pink/10', path: '/sales/rewards' },
    { label: 'Sales', val: formatCurrency(stats?.totalSalesValue ?? 0), icon: RiShoppingCartFill, color: 'text-brand-purple', bg: 'bg-brand-purple/10', path: '/sales/terminal' },
    { label: 'Pending', val: stats?.pendingOrders ?? 0, icon: RiTimeFill, color: 'text-state-warning', bg: 'bg-state-warning/10', path: '/sales/terminal' },
    { label: 'Tasks', val: stats?.pendingTickets ?? 0, icon: RiCustomerService2Fill, color: 'text-brand-teal', bg: 'bg-brand-teal/10', path: '/sales/service' }
  ];

  const monthLabel = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });

  return (
    <div className="p-3 space-y-5 bg-surface-primary min-h-screen pb-24">
      <section className="flex justify-between items-center px-1 pt-2">
         <div>
            <h2 className="text-xl font-black text-content-primary tracking-tighter">My Dashboard</h2>
            <p className="text-[9px] text-content-tertiary font-black uppercase tracking-widest opacity-70">Field Ops Overview</p>
         </div>
         <Badge variant="teal" className="font-black text-[9px] px-2 py-0.5">{monthLabel}</Badge>
      </section>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => navigate(stat.path)}
            className={`p-3.5 rounded-[20px] border border-border bg-white shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-all active:scale-95 cursor-pointer ${i === 4 ? 'col-span-2 py-3 flex-row items-center gap-4' : ''}`}
          >
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`${stat.color} w-5 h-5`} />
            </div>
            <div>
              <p className="text-[9px] font-black text-content-tertiary uppercase tracking-tight leading-none mb-1">{stat.label}</p>
              <h4 className="text-lg font-black text-content-primary tracking-tight">
                {loading ? '—' : stat.val}
              </h4>
            </div>
            {/* Subtle background glow */}
            <div className={`absolute -right-4 -bottom-4 w-12 h-12 rounded-full ${stat.bg} blur-2xl opacity-40 group-hover:scale-150 transition-transform`} />
          </div>
        ))}
      </div>

      {/* Colorful Quick Actions */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
           <h3 className="text-[10px] font-black text-content-primary uppercase tracking-widest opacity-80">Quick Services</h3>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
           <div onClick={() => navigate('/sales/retailers/add')} className="flex flex-col items-center gap-2 group cursor-pointer active:scale-90 transition-all">
              <div className="w-12 h-12 bg-brand-teal rounded-2xl shadow-lg shadow-brand-teal/20 flex items-center justify-center">
                 <RiUserAddFill className="text-white w-6 h-6" />
              </div>
              <span className="text-[9px] font-black text-content-primary uppercase">Onboard</span>
           </div>

           <div onClick={() => navigate('/sales/terminal')} className="flex flex-col items-center gap-2 group cursor-pointer active:scale-90 transition-all">
              <div className="w-12 h-12 bg-brand-pink rounded-2xl shadow-lg shadow-brand-pink/20 flex items-center justify-center">
                 <RiShoppingCartFill className="text-white w-6 h-6" />
              </div>
              <span className="text-[9px] font-black text-content-primary uppercase">Terminal</span>
           </div>

           <div onClick={() => navigate('/sales/service')} className="flex flex-col items-center gap-2 group cursor-pointer active:scale-90 transition-all">
              <div className="w-12 h-12 bg-brand-purple rounded-2xl shadow-lg shadow-brand-purple/20 flex items-center justify-center">
                 <RiCustomerService2Fill className="text-white w-6 h-6" />
              </div>
              <span className="text-[9px] font-black text-content-primary uppercase">Tickets</span>
           </div>

           <div className="flex flex-col items-center gap-2 opacity-40 grayscale group cursor-not-allowed">
              <div className="w-12 h-12 bg-surface-elevated rounded-2xl flex items-center justify-center">
                 <RiPlayFill className="text-content-tertiary w-6 h-6" />
              </div>
              <span className="text-[9px] font-black text-content-tertiary uppercase">Expert</span>
           </div>
        </div>
      </section>

      {/* Target Progress */}
      <Card className="p-4 rounded-[24px] border-none bg-white shadow-lg shadow-gray-200/40">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] font-black text-content-primary uppercase tracking-widest opacity-80">Performance Goals</h4>
          <RiTrophyFill className="text-brand-teal w-3.5 h-3.5" />
        </div>

        {!targets ? (
          <p className="text-[10px] text-content-tertiary text-center py-2 italic font-medium">No active targets found.</p>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-[9px] font-black text-content-tertiary uppercase tracking-tighter">Gross Sales</span>
                <span className="text-xs font-black text-brand-teal">₹{(targets.achievedSales || 0).toLocaleString()}</span>
              </div>
              <div className="h-2 bg-surface-input w-full rounded-full overflow-hidden">
                <div className="h-full bg-brand-teal rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (targets.achievedSales / targets.salesTarget) * 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-[9px] font-black text-content-tertiary uppercase tracking-tighter">New Shops</span>
                <span className="text-xs font-black text-brand-pink">{stats?.totalRetailers || 0} / {targets.retailersTarget}</span>
              </div>
              <div className="h-2 bg-surface-input w-full rounded-full overflow-hidden">
                <div className="h-full bg-brand-pink rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, ((stats?.totalRetailers || 0) / targets.retailersTarget) * 100)}%` }} />
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
