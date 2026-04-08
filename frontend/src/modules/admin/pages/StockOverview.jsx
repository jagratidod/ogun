import { RiStockLine, RiAlertLine, RiSearchLine, RiInformationLine, RiPulseLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, AreaChart, BarChart, PieChart, MetricCard, formatCurrency } from '../../../core';
import productsData from '../../../data/products.json';

const stockTrend = [
  { "month": "Jan", "stock": 1200 },
  { "month": "Feb", "stock": 1350 },
  { "month": "Mar", "stock": 980 },
  { "month": "Apr", "stock": 1420 },
  { "month": "May", "stock": 1250 },
  { "month": "Jun", "stock": 1100 }
];

const categoryDistribution = [
  { "name": "Mixer Grinder", "value": 450 },
  { "name": "Induction Cooktop", "value": 320 },
  { "name": "Chimney", "value": 150 },
  { "name": "Water Purifier", "value": 210 },
  { "name": "Air Fryer", "value": 85 }
];

export default function StockOverviewPage() {
  const lowStockCount = productsData.filter(p => p.stock <= p.minStock).length;
  const totalStock = productsData.reduce((acc, curr) => acc + curr.stock, 0);

  return (
    <div className="page-container">
      <PageHeader 
        title="Stock Overview" 
        subtitle="Global inventory health and movement analytics"
      >
        <Button variant="secondary" icon={RiPulseLine}>Movement Log</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Units" value={totalStock} icon={RiStockLine} />
        <MetricCard title="Low Stock Skus" value={lowStockCount} icon={RiAlertLine} change={15} changeLabel="vs prev week" />
        <MetricCard title="Inventory Value" value={1450000} format="currency" icon={RiPulseLine} />
        <MetricCard title="Active Categories" value={categoryDistribution.length} icon={RiInformationLine} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
           <h3 className="section-title mb-4">Stock Movement Trend</h3>
           <AreaChart data={stockTrend} dataKey="stock" xKey="month" name="Units" height={300} />
        </div>
        <div className="glass-card p-5">
           <h3 className="section-title mb-4">Stock by Category</h3>
           <PieChart data={categoryDistribution} height={280} innerRadius={60} outerRadius={95} />
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="section-title">Stock Levels by Distributor</h3>
            <p className="text-sm text-content-secondary mt-0.5">Distribution of units across our transit network</p>
          </div>
          <Select options={[
            { label: 'All Regions', value: 'all' },
            { label: 'North India', value: 'north' },
            { label: 'South India', value: 'south' }
          ]} className="w-48" />
        </div>
        <BarChart 
          data={[
            { name: 'Arjun Patel', value: 342 },
            { name: 'Suresh Reddy', value: 298 },
            { name: 'Kiran Shah', value: 256 },
            { name: 'Manoj Singh', value: 215 },
            { name: 'Ravi Kumar', value: 189 }
          ]} 
          dataKey="value" 
          xKey="name" 
          height={300} 
          name="Units" 
        />
      </div>
    </div>
  );
}
