import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RiShoppingBag3Line, RiUserHeartLine, RiStockLine, RiTrophyLine, 
  RiPulseLine, RiArrowRightUpLine, RiEyeLine, RiAddLine, 
  RiHandCoinLine, RiBox3Line, RiTruckLine, RiSearchLine, 
  RiNotification3Line, RiLoader4Line, RiHistoryLine, 
  RiStore2Line, RiMoneyDollarCircleLine, RiQuestionAnswerLine
} from 'react-icons/ri';
import { 
  AreaChart, Card, CardHeader, CardTitle, CardDescription, 
  DataTable, Badge, Button, formatCurrency 
} from '../../../core';
import { useAuthContext } from '../../../core/context/AuthContext';
import api from '../../../core/api';

export default function RetailerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [greeting, setGreeting] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getGreeting = () => {
       const hour = new Date().getHours();
       if (hour < 12) return "Good Morning";
       if (hour < 17) return "Good Afternoon";
       if (hour < 21) return "Good Evening";
       return "Good Night";
    };
    setGreeting(getGreeting());
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/retailer/dashboard-stats');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-primary">
        <RiLoader4Line className="w-8 h-8 text-brand-teal animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-surface-primary">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <RiPulseLine className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-gray-800 mb-2">Oops! Something went wrong</h3>
        <Button onClick={fetchStats}>Try Again</Button>
      </div>
    );
  }

  const displayName = user?.name?.split(' ')[0] || "Store Manager";

  const statCards = [
    { label: 'Revenue', val: formatCurrency(data.kpis.dailySales), icon: RiHandCoinLine, color: 'text-brand-teal', bg: 'bg-brand-teal/10', path: '/retailer/sales/history' },
    { label: 'Customers', val: data.kpis.totalCustomers, icon: RiUserHeartLine, color: 'text-brand-pink', bg: 'bg-brand-pink/10', path: '/retailer/customers' },
    { label: 'Stock Value', val: formatCurrency(data.kpis.stockValue), icon: RiBox3Line, color: 'text-brand-purple', bg: 'bg-brand-purple/10', path: '/retailer/stock' },
    { label: 'Points', val: data.kpis.loyaltyPoints, icon: RiTrophyLine, color: 'text-amber-500', bg: 'bg-amber-500/10', path: '/retailer/rewards' },
    { label: 'Pending', val: data.kpis.pendingRestock, icon: RiTruckLine, color: 'text-brand-teal', bg: 'bg-brand-teal/10', path: '/retailer/stock/restock' }
  ];

  const quickServices = [
    { label: 'Checkout', icon: RiAddLine, color: 'bg-brand-teal', path: '/retailer/sales/new' },
    { label: 'History', icon: RiHistoryLine, color: 'bg-brand-pink', path: '/retailer/sales/history' },
    { label: 'Market', icon: RiStore2Line, color: 'bg-brand-purple', path: '/retailer/marketplace' },
    { label: 'Expert', icon: RiArrowRightUpLine, color: 'bg-surface-elevated', path: '#', locked: true }
  ];

  return (
    <div className="p-3 space-y-5 bg-surface-primary min-h-screen pb-24">
      {/* Premium Dashboard Header */}
      <section className="flex justify-between items-center px-1 pt-2">
         <div>
            <h2 className="text-xl font-black text-content-primary tracking-tighter uppercase leading-none">Dashboard</h2>
            <div className="flex items-center gap-1.5 mt-1.5">
               <span className="text-[9px] text-brand-pink font-black uppercase tracking-widest leading-none">{greeting},</span>
               <span className="text-[9px] text-content-tertiary font-black uppercase tracking-widest leading-none">{displayName}</span>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <div className="relative cursor-pointer w-10 h-10 bg-white border border-border flex items-center justify-center active:scale-90 transition-all group rounded-2xl">
               <RiNotification3Line className="text-gray-400 w-5 h-5 group-hover:text-brand-pink transition-colors" />
               <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-pink rounded-full border border-white"></span>
            </div>
         </div>
      </section>


      {/* Modern Search Bar */}
      <div className="relative group">
         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-teal transition-all">
            <RiSearchLine className="w-4 h-4" />
         </div>
         <input
            type="text"
            placeholder="Search transactions, stock..."
            className="w-full h-11 pl-11 pr-4 bg-white border border-border shadow-sm outline-none focus:border-brand-teal/30 transition-all text-[10px] font-bold text-gray-700 placeholder:text-gray-300"
         />
      </div>

      {/* KPI Stats Grid - Styled exactly like the screenshot */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => navigate(stat.path)}
            className={`p-4 bg-white border border-border shadow-sm flex flex-col gap-3 relative overflow-hidden group hover:shadow-md transition-all active:scale-95 cursor-pointer rounded-[24px] ${i === 4 ? 'col-span-2 flex-row items-center gap-4 py-3' : ''}`}
          >
            <div className={`w-10 h-10 rounded-2xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`${stat.color} w-5 h-5`} />
            </div>
            <div>
              <p className="text-[9px] font-black text-content-tertiary uppercase tracking-widest leading-none mb-1.5 opacity-60">{stat.label}</p>
              <h4 className="text-xl font-black text-content-primary tracking-tighter">
                {stat.val}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Services Section - Styled exactly like the screenshot */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-content-primary uppercase tracking-widest px-1 opacity-80">Quick Services</h3>
        <div className="grid grid-cols-4 gap-2">
           {quickServices.map((service, i) => (
              <div 
                key={i} 
                onClick={() => !service.locked && navigate(service.path)} 
                className={`flex flex-col items-center gap-2 group cursor-pointer active:scale-90 transition-all ${service.locked ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
              >
                 <div className={`w-14 h-14 ${service.color} rounded-2xl shadow-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform`}>
                    <service.icon className="text-white w-7 h-7" />
                 </div>
                 <span className="text-[9px] font-black text-content-primary uppercase tracking-tighter">{service.label}</span>
              </div>
           ))}
        </div>
      </section>

      {/* Analytics & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white border border-border p-6 rounded-[24px]">
            <h3 className="text-xs font-black text-content-primary uppercase tracking-widest mb-6">Revenue Trend</h3>
            <AreaChart 
               data={data.chartData} 
               dataKey="sales" 
               xKey="day" 
               name="Revenue" 
               height={320} 
            />
         </div>
         <Card className="rounded-[24px]">
            <CardHeader>
               <CardTitle>Top Sellers</CardTitle>
               <CardDescription>Hot moving inventory</CardDescription>
            </CardHeader>
            <div className="p-4 space-y-3">
               {data.topProducts.map((prod, idx) => (
                 <div key={idx} className="flex items-center justify-between p-3 bg-surface-secondary border border-border/50 group hover:border-brand-teal transition-colors">
                    <div className="flex-1 mr-4">
                       <p className="text-[11px] font-black text-content-primary truncate">{prod.name}</p>
                       <p className="text-[8px] text-content-tertiary font-black uppercase mt-0.5">{prod.sales} sold</p>
                    </div>
                    <Badge variant={prod.stock < 5 ? 'danger' : 'teal'} size="xs">{prod.stock} in stock</Badge>
                 </div>
               ))}
               <Button className="w-full mt-2 h-10 uppercase tracking-widest text-[10px] font-black" variant="secondary" onClick={() => navigate('/retailer/stock')}>Inventory Hub</Button>
            </div>
         </Card>
      </div>

      <Card className="rounded-[24px] overflow-hidden">
        <CardHeader>
           <div className="flex items-center justify-between w-full">
              <div>
                 <CardTitle>Counter Sales</CardTitle>
                 <CardDescription>Latest point-of-sale entries</CardDescription>
              </div>
              <Button size="sm" variant="ghost" className="text-[9px] font-black uppercase" icon={RiArrowRightUpLine} onClick={() => navigate('/retailer/sales/history')}>All Ledger</Button>
           </div>
        </CardHeader>
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead className="bg-surface-secondary">
                 <tr>
                    <th className="px-4 py-3 text-[9px] font-black text-content-tertiary uppercase">ID</th>
                    <th className="px-4 py-3 text-[9px] font-black text-content-tertiary uppercase">Customer</th>
                    <th className="px-4 py-3 text-[9px] font-black text-content-tertiary uppercase text-right">Amount</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-border">
                 {data.recentSales.map((sale, i) => (
                    <tr key={i} className="active:bg-surface-secondary transition-colors">
                       <td className="px-4 py-3 text-[10px] font-black text-content-primary">#{sale.id}</td>
                       <td className="px-4 py-3 text-[10px] font-bold text-content-secondary">{sale.customer}</td>
                       <td className="px-4 py-3 text-[11px] font-black text-brand-teal text-right">{formatCurrency(sale.amount)}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </Card>
    </div>
  );
}
