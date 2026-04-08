import { RiTruckLine, RiStore2Line, RiMoneyDollarBoxLine, RiStockLine, RiTrophyLine, RiPulseLine, RiArrowRightUpLine, RiEyeLine } from 'react-icons/ri';
import { PageHeader, MetricCard, AreaChart, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, formatCurrency } from '../../../core';
import stats from '../../../data/distributor_stats.json';

export default function DistributorDashboardPage() {
  const columns = [
    { key: 'id', label: 'Order ID', render: (val) => <span className="font-bold text-content-primary">#{val}</span> },
    { key: 'retailer', label: 'Retailer Store' },
    { key: 'amount', label: 'Value', align: 'right', render: (val) => <span className="font-black text-brand-teal">{formatCurrency(val)}</span> },
    { key: 'status', label: 'Status', render: (val) => <Badge status={val.toLowerCase()}>{val}</Badge> },
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
      <Button variant="icon">
        <RiEyeLine className="w-4 h-4" />
      </Button>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Distributor Hub" 
        subtitle="Manage your regional supply chain and retailer network performance"
      >
        <Button icon={RiTruckLine}>Ship New Order</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="Retailer Network" value={stats.kpis.totalRetailers} icon={RiStore2Line} />
        <MetricCard title="Active Requests" value={stats.kpis.pendingOrders} icon={RiTruckLine} change={2} />
        <MetricCard title="Monthly Sales" value={stats.kpis.monthlySales} format="currency" icon={RiMoneyDollarBoxLine} change={12.4} />
        <MetricCard title="Stock Inventory" value={8520} icon={RiStockLine} />
        <MetricCard title="Loyalty Points" value={stats.kpis.rewardsPoints} icon={RiTrophyLine} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
         <div className="lg:col-span-2 glass-card p-6">
            <h3 className="section-title mb-6">Regional Sales Performance</h3>
            <AreaChart data={stats.salesTrend} dataKey="sales" xKey="month" name="Sales" height={320} />
         </div>
         <Card>
            <CardHeader>
               <CardTitle>Market Insights</CardTitle>
               <CardDescription>Top trending products in your region</CardDescription>
            </CardHeader>
            <div className="p-4 space-y-4">
               {[
                 { name: 'TurboMix Pro 750W', growth: '+15%', sold: 1240 },
                 { name: 'SmartCook Induction', growth: '+8%', sold: 850 },
                 { name: 'QuickMix 500W', growth: '-2%', sold: 720 }
               ].map((prod, idx) => (
                 <div key={idx} className="flex items-center justify-between p-3 rounded-none bg-surface-input/50">
                    <div>
                       <p className="text-sm font-semibold text-content-primary">{prod.name}</p>
                       <p className="text-[10px] text-content-tertiary font-bold uppercase">{prod.sold} Units Sold</p>
                    </div>
                    <Badge variant={prod.growth.startsWith('+') ? 'success' : 'danger'}>{prod.growth}</Badge>
                 </div>
               ))}
               <Button className="w-full mt-2" variant="secondary" icon={RiPulseLine}>View Full Analytics</Button>
            </div>
         </Card>
      </div>

      <Card>
        <CardHeader>
           <div className="flex items-center justify-between w-full">
              <div>
                 <CardTitle>Recent Incoming Requests</CardTitle>
                 <CardDescription>Latest orders from your assigned retailer network</CardDescription>
              </div>
              <Button size="sm" variant="ghost" icon={RiArrowRightUpLine}>View Dispatch Board</Button>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={stats.recentOrders} />
      </Card>
    </div>
  );
}
