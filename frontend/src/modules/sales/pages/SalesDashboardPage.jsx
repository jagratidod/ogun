import { useState, useEffect, useCallback, useRef } from 'react';
import { RiUserAddLine, RiShoppingCartLine, RiTimeLine, RiTrophyLine, RiArrowRightUpLine, RiStore2Line } from 'react-icons/ri';
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
    { label: 'Retailers Onboarded', val: stats?.totalRetailers ?? 0, icon: RiStore2Line, color: 'text-brand-teal', bg: 'bg-brand-teal/5' },
    { label: 'Points Earned', val: stats?.rewardPoints ?? 0, icon: RiTrophyLine, color: 'text-brand-magenta', bg: 'bg-brand-magenta/5' },
    { label: 'Total Sales', val: formatCurrency(stats?.totalSalesValue ?? 0), icon: RiShoppingCartLine, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
    { label: 'Pending Orders', val: stats?.pendingOrders ?? 0, icon: RiTimeLine, color: 'text-state-warning', bg: 'bg-state-warning/5' }
  ];

  const salesPct = targets ? Math.min(100, Math.round((targets.achievedSales / targets.salesTarget) * 100)) : 0;
  const retailerPct = targets ? Math.min(100, Math.round(((stats?.totalRetailers || 0) / targets.retailersTarget) * 100)) : 0;

  const monthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="p-4 space-y-6">
      <section>
        <h2 className="text-xl font-black text-content-primary">Dashboard</h2>
        <p className="text-xs text-content-tertiary font-bold uppercase tracking-widest mt-1">Field Performance Overview</p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, i) => (
          <div key={i} className="p-4 border border-border bg-surface-primary flex flex-col gap-2">
            <div className={`w-8 h-8 rounded-full ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={stat.color} />
            </div>
            <div>
              <p className="text-[9px] font-black text-content-tertiary uppercase tracking-widest leading-tight">{stat.label}</p>
              <h4 className="text-lg font-black text-content-primary mt-1">
                {loading ? '—' : stat.val}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest px-1">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-2">
          <Button className="h-14 justify-between" icon={RiUserAddLine} onClick={() => navigate('/sales/retailers/add')} variant="primary">
            <span>Onboard New Retailer</span>
            <RiArrowRightUpLine />
          </Button>
          <Button className="h-14 justify-between" icon={RiShoppingCartLine} onClick={() => navigate('/sales/terminal')} variant="secondary">
            <span>Create New Sale</span>
            <RiArrowRightUpLine />
          </Button>
        </div>
      </section>

      {/* Target Progress */}
      <Card className="p-4 border-dashed">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-black text-content-primary uppercase tracking-widest">Target Progress</h4>
          <Badge variant="teal" size="xs">{monthLabel}</Badge>
        </div>

        {!targets ? (
          <p className="text-xs text-content-tertiary text-center py-2">No target set for this month.</p>
        ) : (
          <div className="space-y-5">
            {/* Sales Target */}
            <div>
              <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                <span className="text-content-tertiary">Sales Target</span>
                <span className="text-brand-teal">
                  ₹{(targets.achievedSales || 0).toLocaleString()} / ₹{targets.salesTarget.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-surface-elevated w-full rounded-full overflow-hidden">
                <div className="h-full bg-brand-teal rounded-full transition-all duration-1000" style={{ width: `${salesPct}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-brand-teal font-bold">Done: ₹{(targets.achievedSales || 0).toLocaleString()}</span>
                <span className="text-[9px] text-state-warning font-bold">
                  Left: ₹{Math.max(0, targets.salesTarget - (targets.achievedSales || 0)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Retailer Target */}
            <div>
              <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                <span className="text-content-tertiary">Retailer Acquisition</span>
                <span className="text-brand-magenta">
                  {stats?.totalRetailers || 0} / {targets.retailersTarget} Shops
                </span>
              </div>
              <div className="h-2 bg-surface-elevated w-full rounded-full overflow-hidden">
                <div className="h-full bg-brand-magenta rounded-full transition-all duration-1000" style={{ width: `${retailerPct}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-brand-magenta font-bold">Done: {stats?.totalRetailers || 0} shops</span>
                <span className="text-[9px] text-state-warning font-bold">
                  Left: {Math.max(0, targets.retailersTarget - (stats?.totalRetailers || 0))} shops
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
