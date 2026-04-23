import { useState, useEffect } from 'react';
import { RiUserAddLine, RiShoppingCartLine, RiTimeLine, RiTrophyLine, RiArrowRightUpLine, RiStore2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import executiveService from '../../../core/services/executiveService';
import { PageHeader, Card, Button, Badge, formatCurrency } from '../../../core';

export default function SalesDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Retailers Onboarded', val: stats?.totalRetailers || 0, icon: RiStore2Line, color: 'text-brand-teal', bg: 'bg-brand-teal/5' },
    { label: 'Points Earned', val: stats?.rewardPoints || 0, icon: RiTrophyLine, color: 'text-brand-magenta', bg: 'bg-brand-magenta/5' },
    { label: 'Total Sales', val: formatCurrency(stats?.totalSalesValue || 0), icon: RiShoppingCartLine, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
    { label: 'Pending Orders', val: stats?.pendingOrders || 0, icon: RiTimeLine, color: 'text-state-warning', bg: 'bg-state-warning/5' }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <section>
        <h2 className="text-xl font-black text-content-primary">Dashboard</h2>
        <p className="text-xs text-content-tertiary font-bold uppercase tracking-widest mt-1">Field Performance Overview</p>
      </section>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, i) => (
          <div key={i} className={`p-4 border border-border bg-surface-primary flex flex-col gap-2`}>
            <div className={`w-8 h-8 rounded-full ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={stat.color} />
            </div>
            <div>
              <p className="text-[9px] font-black text-content-tertiary uppercase tracking-widest leading-tight">{stat.label}</p>
              <h4 className="text-lg font-black text-content-primary mt-1">{stat.val}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest px-1">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-2">
          <Button 
            className="h-14 justify-between" 
            icon={RiUserAddLine} 
            onClick={() => navigate('/sales/retailers')}
            variant="primary"
          >
            <span>Onboard New Retailer</span>
            <RiArrowRightUpLine />
          </Button>
          <Button 
            className="h-14 justify-between" 
            icon={RiShoppingCartLine} 
            onClick={() => navigate('/sales/terminal')}
            variant="secondary"
          >
            <span>Create New Sale</span>
            <RiArrowRightUpLine />
          </Button>
        </div>
      </section>

      {/* Recent Activity / Targets Placeholder */}
      <Card className="p-4 border-dashed">
        <div className="flex items-center justify-between mb-4">
           <h4 className="text-xs font-black text-content-primary uppercase tracking-widest">Target Progress</h4>
           <Badge variant="teal" size="xs">April 2026</Badge>
        </div>
        <div className="space-y-4">
           <div>
              <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                 <span className="text-content-tertiary">Sales Target</span>
                 <span className="text-brand-teal">₹85,000 / ₹1,00,000</span>
              </div>
              <div className="h-1.5 bg-surface-elevated w-full rounded-full overflow-hidden">
                 <div className="h-full bg-brand-teal w-[85%] transition-all duration-1000" />
              </div>
           </div>
           <div>
              <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                 <span className="text-content-tertiary">Retailer Acquisition</span>
                 <span className="text-brand-magenta">12 / 20 Shops</span>
              </div>
              <div className="h-1.5 bg-surface-elevated w-full rounded-full overflow-hidden">
                 <div className="h-full bg-brand-magenta w-[60%] transition-all duration-1000" />
              </div>
           </div>
        </div>
      </Card>
    </div>
  );
}
