import { RiShoppingBag3Line, RiPulseLine, RiBarChartLine, RiPieChartLine, RiTimeLine, RiFilterLine, RiDownloadLine, RiUserHeartLine, RiMoneyDollarBoxLine, RiBox3Line, RiInformationLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, MetricCard, AreaChart, BarChart, PieChart, formatCurrency, Button } from '../../../core';

export default function RetailerAnalyticsPage() {
  return (
    <div className="page-container">
      <PageHeader 
        title="Store Analytics" 
        subtitle="Detailed insights into daily sales velocity, inventory turnover, and customer retention"
      >
        <Button icon={RiDownloadLine} variant="secondary">Daily POS Reconciliation</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
        <MetricCard title="Daily Growth" value="8.4%" icon={RiPulseLine} change={2.1} />
        <MetricCard title="Footfall Velocity" value="2.5/hr" icon={RiUserHeartLine} change={0.8} />
        <MetricCard title="Avg Check Size" value="₹12,450" icon={RiMoneyDollarBoxLine} change={-2.5} changeLabel="decreased" />
        <MetricCard title="Stock-out Rate" value="0.5%" icon={RiBox3Line} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
         <div className="glass-card p-6">
            <h3 className="section-title mb-6">Localized Hourly Sales Velocity</h3>
            <AreaChart 
               data={[
                  { month: '10 AM', sales: 4500 },
                  { month: '12 PM', sales: 12400 },
                  { month: '2 PM', sales: 18500 },
                  { month: '4 PM', sales: 15600 },
                  { month: '6 PM', sales: 24500 },
                  { month: '8 PM', sales: 21000 }
               ]} 
               dataKey="sales" 
               xKey="month" 
               name="Sales" 
               height={320} 
            />
         </div>
         <div className="glass-card p-6">
            <h3 className="section-title mb-6">Payment Method Distribution</h3>
            <PieChart 
              data={[
                { name: 'UPI / QR', value: 450000 },
                { name: 'Cash', value: 120000 },
                { name: 'Credit Cards', value: 320000 },
                { name: 'Offline Wallets', value: 45000 }
              ]} 
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
               data={[
                 { name: 'Mixers', val: 560000 },
                 { name: 'Induction', val: 1250000 },
                 { name: 'Chimneys', val: 480000 },
                 { name: 'Water Purifier', val: 1850000 },
                 { name: 'Air Fryers', val: 420000 }
               ]} 
               dataKey="val" 
               xKey="name" 
               height={320} 
               name="Volume" 
             />
         </div>
         <div className="space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Customer Retention</CardTitle>
               </CardHeader>
               <div className="p-6 space-y-6">
                  {[
                    { label: 'Repeat Rate', val: '42%', icon: RiUserHeartLine },
                    { label: 'Avg Basket Size', val: '2.5 Units', icon: RiShoppingBag3Line },
                    { label: 'NPS (Store)', val: '9.2', icon: RiPulseLine }
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
                  <p className="text-sm font-bold text-content-primary">Predictive Low Stock</p>
                  <p className="text-xs text-content-secondary mt-1">TurboMix Pro likely to stock-out in 48 hours based on sales velocity. Restock now.</p>
                  <Button variant="secondary" className="w-full mt-4 h-9 text-xs">Pusher Restock</Button>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
