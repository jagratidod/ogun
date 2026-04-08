import { RiStockLine, RiPulseLine, RiBarChartLine, RiPieChartLine, RiTimeLine, RiFilterLine, RiDownloadLine, RiStore2Line, RiTruckLine, RiInformationLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, MetricCard, AreaChart, BarChart, PieChart, formatCurrency } from '../../../core';
import Button from '../../../core/components/ui/Button';

const monthlySalesTrend = [
  { "month": "Jan", "sales": 3200000 },
  { "month": "Feb", "sales": 3800000 },
  { "month": "Mar", "sales": 4400000 },
  { "month": "Apr", "sales": 4560000 }
];

export default function DistAnalyticsPage() {
  return (
    <div className="page-container">
      <PageHeader 
        title="Distributor Analytics" 
        subtitle="Detailed insights into regional sales, stock throughput, and retailer growth"
      >
        <Button icon={RiDownloadLine} variant="secondary">Quarterly Summary</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
        <MetricCard title="Sales Growth" value="12.4%" icon={RiPulseLine} change={2.1} />
        <MetricCard title="Stock Turnover" value="4.2x" icon={RiStockLine} change={0.5} />
        <MetricCard title="Avg Lead Time" value="3.2D" icon={RiTimeLine} change={-15} changeLabel="improved" />
        <MetricCard title="Net Profit Margin" value="8.5%" icon={RiBarChartLine} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
         <div className="glass-card p-6">
            <h3 className="section-title mb-6">Regional Monthly Sales Trend</h3>
            <AreaChart data={monthlySalesTrend} dataKey="sales" xKey="month" name="Sales" height={320} />
         </div>
         <div className="glass-card p-6">
            <h3 className="section-title mb-6">Retailer Contribution Breakdown</h3>
            <PieChart 
              data={[
                { name: 'Priya Kitchen', value: 450000 },
                { name: 'Smart Kitchen', value: 320000 },
                { name: 'HomeChef Apple', value: 150000 },
                { name: 'Kitchen Express', value: 210000 },
                { name: 'Royal Home', value: 85000 }
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
                  <h3 className="section-title">Sales by SKU Category</h3>
                  <p className="text-xs text-content-tertiary">Top Performing Categories in North Region</p>
                </div>
                <RiFilterLine className="w-5 h-5 text-content-tertiary" />
             </div>
             <BarChart 
               data={[
                 { name: 'Mixer Grinders', val: 560000 },
                 { name: 'Induction Cooktops', val: 1250000 },
                 { name: 'Chimneys', val: 480000 },
                 { name: 'Water Purifiers', val: 1850000 },
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
                  <CardTitle>Logistics Efficiency</CardTitle>
               </CardHeader>
               <div className="p-6 space-y-6">
                  {[
                    { label: 'Carrier Speed', val: '94%', icon: RiTruckLine },
                    { label: 'Damage Rate', val: '0.2%', icon: RiStockLine },
                    { label: 'Return Volume', val: '₹14K', icon: RiStore2Line }
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
            <Card className="bg-surface-elevated border-border text-center">
               <div className="p-6">
                  <RiInformationLine className="w-10 h-10 text-brand-teal mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-bold text-content-primary">Predictive Forecast</p>
                  <p className="text-xs text-content-secondary mt-1">Based on trends, expect a 15% increase in Induction Cooktop demand next month.</p>
                  <Button variant="ghost" size="sm" className="mt-4 underline">Learn More</Button>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
