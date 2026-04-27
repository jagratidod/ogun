import { useState, useEffect } from 'react';
import { RiStockLine, RiAlertLine, RiPulseLine, RiInformationLine, RiLoader4Line } from 'react-icons/ri';
import {
  PageHeader, Button, MetricCard, AreaChart, BarChart, PieChart, formatCurrency
} from '../../../core';
import { toast } from 'react-hot-toast';
import api from '../../../core/api';

export default function StockOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOverview(); }, []);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/inventory/overview');
      setData(res.data?.data);
    } catch {
      toast.error('Failed to fetch inventory overview');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="page-container">
      <PageHeader
        title="Stock Overview"
        subtitle="Global inventory health and movement analytics"
      >
        <Button variant="secondary" icon={RiPulseLine} onClick={fetchOverview}>Refresh Data</Button>
      </PageHeader>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Units"       value={data.totalUnits}                    icon={RiStockLine} />
        <MetricCard title="Low Stock SKUs"    value={data.lowStockCount}                 icon={RiAlertLine} variant={data.lowStockCount > 0 ? 'danger' : 'default'} />
        <MetricCard title="Inventory Value"   value={data.totalValue}  format="currency" icon={RiPulseLine} />
        <MetricCard title="Active Categories" value={data.categoryDistribution?.length ?? 0} icon={RiInformationLine} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Stock Movement Trend</h3>
          {data.stockTrend?.length > 0 ? (
            <AreaChart data={data.stockTrend} dataKey="stock" xKey="month" name="Units" height={300} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-content-tertiary italic text-sm">No trend data yet</div>
          )}
        </div>
        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Stock by Category</h3>
          {data.categoryDistribution?.length > 0 ? (
            <PieChart data={data.categoryDistribution} height={300} innerRadius={60} outerRadius={95} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-content-tertiary italic text-sm">No category data yet</div>
          )}
        </div>
      </div>

      {/* Distributor stock */}
      <div className="glass-card p-5">
        <div className="mb-4">
          <h3 className="section-title">Stock Levels by Distributor</h3>
          <p className="text-sm text-content-secondary mt-0.5">Distribution of units across our transit network</p>
        </div>
        {data.distributorStock?.length > 0 ? (
          <BarChart data={data.distributorStock} dataKey="value" xKey="name" height={300} name="Units" />
        ) : (
          <div className="h-[200px] flex items-center justify-center text-content-tertiary italic text-sm">
            No distributor stock data available yet
          </div>
        )}
      </div>
    </div>
  );
}
