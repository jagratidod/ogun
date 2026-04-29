import { useState, useEffect } from 'react';
import { RiShoppingBag3Line, RiPulseLine, RiBarChartLine, RiPieChartLine, RiTimeLine, RiFilterLine, RiDownloadLine, RiUserHeartLine, RiMoneyDollarBoxLine, RiBox3Line, RiInformationLine, RiLoader4Line, RiHistoryLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, MetricCard, AreaChart, BarChart, PieChart, formatCurrency, Button } from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function RetailerAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/retailer/analytics');
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
      </div>
    );
  }

  const { metrics, spendingTrends, categorySpending } = data;

  return (
    <div className="page-container">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
        <MetricCard title="Total Orders" value={metrics.totalOrders} icon={RiShoppingBag3Line} />
        <MetricCard title="Total Spent" value={metrics.totalSpent} format="currency" icon={RiMoneyDollarBoxLine} />
        <MetricCard title="Outstanding" value={metrics.outstanding} format="currency" icon={RiPulseLine} />
        <MetricCard title="Active Invoices" value={metrics.activeInvoices} icon={RiBox3Line} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
         <div className="glass-card p-6">
            <h3 className="section-title mb-6">Monthly Spending Velocity</h3>
            <AreaChart 
               data={spendingTrends} 
               dataKey="spent" 
               xKey="name" 
               name="Spent" 
               height={320} 
            />
         </div>
         <div className="glass-card p-6">
            <h3 className="section-title mb-6">Category Distribution</h3>
            <PieChart 
              data={categorySpending} 
              height={320} 
              innerRadius={70} 
              outerRadius={110} 
            />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
         <div className="lg:col-span-2 glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                 <div>
                   <h3 className="section-title">Sales by Appliance Category</h3>
                   <p className="text-xs text-content-tertiary">Performance at your retail counter</p>
                 </div>
                 <RiFilterLine className="w-5 h-5 text-content-tertiary" />
              </div>
              <BarChart 
                data={categorySpending} 
                dataKey="value" 
                xKey="name" 
                height={320} 
                name="Volume" 
              />
         </div>
         <div className="space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Business Health</CardTitle>
               </CardHeader>
               <div className="p-6 space-y-6">
                  {[
                    { label: 'Order Frequency', val: 'Regular', icon: RiUserHeartLine },
                    { label: 'Payment Health', val: metrics.outstanding > 0 ? 'Due' : 'Excellent', icon: RiPulseLine },
                    { label: 'Loyalty Level', val: 'Gold', icon: RiShoppingBag3Line }
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-none bg-surface-primary flex items-center justify-center text-brand-teal">
                          <stat.icon className="w-5 h-5" />
                       </div>
                       <div className="flex-1">
                          <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                          <h4 className="text-lg font-black text-content-primary leading-none">{stat.val}</h4>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
            <Card className="bg-brand-teal/5 border-brand-teal/10">
               <div className="p-6 text-center">
                  <RiInformationLine className="w-10 h-10 text-brand-teal mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-bold text-content-primary">System Notice</p>
                  <p className="text-xs text-content-secondary mt-1">Check your pending invoices to avoid supply chain disruptions. Maintain a good credit score.</p>
                  <Button variant="secondary" className="w-full mt-4 h-9 text-xs">View Invoices</Button>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
