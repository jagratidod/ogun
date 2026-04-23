import { useNavigate } from 'react-router-dom';
import { RiShoppingBag3Line, RiUserHeartLine, RiStockLine, RiTrophyLine, RiPulseLine, RiArrowRightUpLine, RiEyeLine, RiAddLine, RiHandCoinLine, RiBox3Line, RiTruckLine } from 'react-icons/ri';
import { PageHeader, MetricCard, AreaChart, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, formatCurrency } from '../../../core';
import stats from '../../../data/retailer_stats.json';

export default function RetailerDashboardPage() {
  const navigate = useNavigate();
  const columns = [
    { key: 'id', label: 'Sale ID', render: (val) => <span className="font-bold text-content-primary">#{val}</span> },
    { key: 'customer', label: 'Customer' },
    { key: 'amount', label: 'Amount', align: 'right', render: (val) => <span className="font-black text-brand-teal">{formatCurrency(val)}</span> },
    { key: 'date', label: 'Time' },
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
      <Button variant="icon" title="View Details">
        <RiEyeLine className="w-4 h-4 text-brand-teal" />
      </Button>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Store Overview" 
        subtitle="Managing your retail point-of-sale, customer network, and stock replenishment"
      >
        <Button icon={RiAddLine} onClick={() => navigate('/retailer/sales/new')}>New Checkout</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="cursor-pointer" onClick={() => navigate('/retailer/sales/history')}>
          <MetricCard title="Daily Revenue" value={stats.kpis.dailySales} format="currency" icon={RiHandCoinLine} change={8.4} />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/retailer/customers')}>
          <MetricCard title="Store Network" value={stats.kpis.totalCustomers} icon={RiUserHeartLine} />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/retailer/stock')}>
          <MetricCard title="Inventory Value" value={stats.kpis.stockValue} format="currency" icon={RiBox3Line} />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/retailer/rewards')}>
          <MetricCard title="Points Balance" value={stats.kpis.loyaltyPoints} icon={RiTrophyLine} />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/retailer/stock/restock')}>
          <MetricCard title="Pending Restock" value={stats.kpis.pendingRestock} icon={RiTruckLine} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
         <div className="lg:col-span-2 glass-card p-6">
            <h3 className="section-title mb-6">Sales History (Last 7 Days)</h3>
            <AreaChart 
               data={[
                  { month: 'Mon', sales: 12400 },
                  { month: 'Tue', sales: 18500 },
                  { month: 'Wed', sales: 15600 },
                  { month: 'Thu', sales: 24500 },
                  { month: 'Fri', sales: 28900 },
                  { month: 'Sat', sales: 42000 },
                  { month: 'Sun', sales: 45600 }
               ]} 
               dataKey="sales" 
               xKey="month" 
               name="Revenue" 
               height={320} 
            />
         </div>
         <Card>
            <CardHeader>
               <CardTitle>Top Moving Products</CardTitle>
               <CardDescription>Fastest-selling appliances at your counter</CardDescription>
            </CardHeader>
            <div className="p-4 space-y-4">
               {[
                 { name: 'Mixer Grinder', stock: 12, sales: 85 },
                 { name: 'Induction Cooktop', stock: 5, sales: 62 },
                 { name: 'Quick Blender', stock: 0, sales: 48, status: 'out' }
               ].map((prod, idx) => (
                 <div key={idx} className="flex items-center justify-between p-3 rounded-none bg-surface-input/50">
                    <div>
                       <p className="text-sm font-semibold text-content-primary">{prod.name}</p>
                       <p className="text-[10px] text-content-tertiary font-bold uppercase">{prod.sales} Sold This Month</p>
                    </div>
                    {prod.status === 'out' ? <Badge variant="danger">Out</Badge> : <span className="text-xs font-bold text-brand-teal">{prod.stock} left</span>}
                 </div>
               ))}
               <Button className="w-full mt-2" variant="secondary" icon={RiStockLine} onClick={() => navigate('/retailer/stock')}>Manage Inventory</Button>
            </div>
         </Card>
      </div>

      <Card>
        <CardHeader>
           <div className="flex items-center justify-between w-full">
              <div>
                 <CardTitle>Recent Footfall Transactions</CardTitle>
                 <CardDescription>Latest point-of-sale entries at your store</CardDescription>
              </div>
              <Button size="sm" variant="ghost" icon={RiArrowRightUpLine} onClick={() => navigate('/retailer/sales/history')}>Sales History</Button>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={stats.recentSales} />
      </Card>
    </div>
  );
}
