import { useState, useEffect } from 'react';
import { RiStockLine, RiAlertLine, RiSearchLine, RiInformationLine, RiPulseLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, AreaChart, BarChart, PieChart, MetricCard, formatCurrency, TableSkeleton } from '../../../core';
import inventoryService from '../../../core/services/inventoryService';
import { toast } from 'react-hot-toast';

export default function StockOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await inventoryService.getInventoryOverview();
      setData(res.data);
    } catch (error) {
      toast.error('Failed to fetch inventory overview');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return <div className="page-container"><TableSkeleton /></div>;

  return (
    <div className="page-container">
      <PageHeader 
        title="Stock Overview" 
        subtitle="Global inventory health and movement analytics"
      >
        <Button variant="secondary" icon={RiPulseLine} onClick={fetchOverview}>Refresh Data</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Units" value={data.totalUnits} icon={RiStockLine} />
        <MetricCard title="Low Stock Skus" value={data.lowStockCount} icon={RiAlertLine} />
        <MetricCard title="Inventory Value" value={data.totalValue} format="currency" icon={RiPulseLine} />
        <MetricCard title="Active Categories" value={data.categoryDistribution.length} icon={RiInformationLine} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
           <h3 className="section-title mb-4">Stock Movement Trend</h3>
           <AreaChart data={data.stockTrend} dataKey="stock" xKey="month" name="Units" height={300} />
        </div>
        <div className="glass-card p-5">
           <h3 className="section-title mb-4">Stock by Category</h3>
           <PieChart data={data.categoryDistribution} height={300} innerRadius={60} outerRadius={95} />
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="section-title">Stock Levels by Distributor</h3>
            <p className="text-sm text-content-secondary mt-0.5">Distribution of units across our transit network</p>
          </div>
        </div>
        {data.distributorStock.length > 0 ? (
          <BarChart 
            data={data.distributorStock} 
            dataKey="value" 
            xKey="name" 
            height={300} 
            name="Units" 
          />
        ) : (
          <div className="h-[300px] flex items-center justify-center text-content-tertiary italic">
            No distributor stock data available yet.
          </div>
        )}
      </div>
    </div>
  );
}
