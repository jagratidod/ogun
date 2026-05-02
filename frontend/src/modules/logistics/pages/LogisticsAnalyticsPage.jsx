import { useState, useEffect } from 'react';
import { 
  RiBarChartBoxLine, RiArrowUpLine, RiArrowDownLine, RiTimeLine,
  RiTruckLine, RiMapPinLine, RiDashboardLine, RiFilter2Line, RiLoader4Line
} from 'react-icons/ri';
import { PageHeader, Card, Button, Select, Badge } from '../../../core';
import logisticsService from '../../../core/services/logisticsService';
import { toast } from 'react-hot-toast';

export default function LogisticsAnalyticsPage() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const fetchAnalytics = async () => {
        try {
           setLoading(true);
           const res = await logisticsService.getAnalytics();
           if (res.success) setData(res.data);
        } catch (error) {
           toast.error('Failed to load analytics');
        } finally {
           setLoading(false);
        }
     };
     fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin mb-4" />
        <p className="text-content-tertiary font-bold uppercase tracking-widest animate-pulse">Analyzing Network Intelligence...</p>
      </div>
    );
  }

  const statusTotal = data?.statusDistribution?.reduce((a, b) => a + b.count, 0) || 1;

  return (
    <div className="page-container">
      <PageHeader
        title="Supply Chain Intelligence"
        subtitle="Operational performance metrics and transit efficiency analytics"
      >
        <div className="flex gap-2">
           <Select 
            value={range} 
            onChange={(e) => setRange(e.target.value)}
            options={[
              { label: 'Last 7 Days', value: '7d' },
              { label: 'Last 30 Days', value: '30d' },
              { label: 'Last 90 Days', value: '90d' },
              { label: 'Fiscal Year', value: 'year' },
            ]}
           />
           <Button variant="secondary" icon={RiFilter2Line}>Deep Dive</Button>
        </div>
      </PageHeader>

      {/* High Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         <Card className="p-6 relative overflow-hidden group">
            <RiTruckLine className="absolute -right-4 -bottom-4 w-20 h-20 text-brand-teal/5 group-hover:scale-110 transition-transform duration-500" />
            <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-1">On-Time Delivery</p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-3xl font-black text-content-primary">94.2%</h3>
               <span className="text-xs font-bold text-success flex items-center"><RiArrowUpLine /> 2.1%</span>
            </div>
         </Card>
         <Card className="p-6 relative overflow-hidden group">
            <RiTimeLine className="absolute -right-4 -bottom-4 w-20 h-20 text-warning/5 group-hover:scale-110 transition-transform duration-500" />
            <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-1">Avg. Transit Time</p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-3xl font-black text-content-primary">{data?.avgTransitTime?.toFixed(1) || '0'} hrs</h3>
               <span className="text-xs font-bold text-success flex items-center"><RiArrowDownLine /> 4 hrs</span>
            </div>
         </Card>
         <Card className="p-6 relative overflow-hidden group">
            <RiMapPinLine className="absolute -right-4 -bottom-4 w-20 h-20 text-info/5 group-hover:scale-110 transition-transform duration-500" />
            <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-1">Route Efficiency</p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-3xl font-black text-content-primary">{data?.routeEfficiency?.toFixed(1) || '0'}%</h3>
               <span className="text-xs font-bold text-success flex items-center"><RiArrowUpLine /> 1.2%</span>
            </div>
         </Card>
         <Card className="p-6 relative overflow-hidden group">
            <RiDashboardLine className="absolute -right-4 -bottom-4 w-20 h-20 text-brand-teal/5 group-hover:scale-110 transition-transform duration-500" />
            <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-1">Fleet Utilization</p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-3xl font-black text-content-primary">{data?.fleetUtilization?.toFixed(1) || '0'}%</h3>
               <span className="text-xs font-bold text-success flex items-center"><RiArrowUpLine /> 5.8%</span>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Live Chart Area 1 */}
        <Card className="p-6">
           <div className="flex items-center justify-between mb-8">
              <h4 className="text-sm font-black text-content-primary uppercase tracking-widest">Monthly Shipment Volume</h4>
              <Badge variant="teal">Total Units</Badge>
           </div>
           <div className="h-[300px] bg-surface-secondary/50 border border-border flex items-end justify-around p-4 gap-2">
              {data?.monthlyVolume?.length > 0 ? data.monthlyVolume.map((m, i) => (
                <div key={i} className="bg-brand-teal w-full transition-all hover:bg-brand-teal-dark group relative" style={{ height: `${(m.count / Math.max(...data.monthlyVolume.map(v => v.count), 1)) * 100}%` }}>
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-content-primary text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      Month {m._id}: {m.count} Units
                   </div>
                </div>
              )) : (
                <div className="w-full h-full flex items-center justify-center italic text-content-tertiary text-xs">No volume data for selected range</div>
              )}
           </div>
           <div className="flex justify-between mt-4 text-[10px] font-bold text-content-tertiary uppercase tracking-tighter">
              <span>Jan</span>
              <span>Mar</span>
              <span>Jun</span>
              <span>Sep</span>
              <span>Nov</span>
              <span>Dec</span>
           </div>
        </Card>

        {/* Live Chart Area 2 */}
        <Card className="p-6">
           <div className="flex items-center justify-between mb-8">
              <h4 className="text-sm font-black text-content-primary uppercase tracking-widest">Network Status Distribution</h4>
              <Badge variant="info">Real-time Stats</Badge>
           </div>
           <div className="space-y-6">
              {data?.statusDistribution?.length > 0 ? data.statusDistribution.map((s, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-content-secondary uppercase tracking-wider">{s._id}</span>
                    <span className="text-content-primary">{s.count} Shipments</span>
                  </div>
                  <div className="h-2 w-full bg-surface-secondary">
                    <div className="h-full bg-brand-teal transition-all duration-1000" style={{ width: `${(s.count / statusTotal) * 100}%` }}></div>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center italic text-content-tertiary text-xs">No shipment distribution data available</div>
              )}
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-6 lg:col-span-1">
           <h4 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-border pb-2 mb-6 text-center">Top Logistics Nodes</h4>
           <div className="space-y-4">
              {[
                { name: 'Central Distribution Center', qty: 'Active' },
                { name: 'Mumbai Regional Hub', qty: 'Stable' },
                { name: 'Nagpur Warehouse', qty: 'Warning' },
                { name: 'Pune Transit Point', qty: 'Active' },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-surface-secondary border-l-4 border-brand-teal">
                  <span className="text-xs font-bold text-content-primary">{n.name}</span>
                  <Badge variant={n.qty === 'Warning' ? 'danger' : 'success'} className="text-[8px]">{n.qty}</Badge>
                </div>
              ))}
           </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
           <h4 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-border pb-2 mb-6">Regional Delivery Heatmap</h4>
           <div className="grid grid-cols-12 gap-2">
              {Array.from({ length: 36 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`aspect-square border border-border/50 ${
                    i % 9 === 0 ? 'bg-danger/20 border-danger/30' : 
                    i % 4 === 0 ? 'bg-warning/20 border-warning/30' : 
                    'bg-brand-teal/10 border-brand-teal/20'
                  } hover:scale-110 transition-all cursor-pointer`}
                  title={`Segment ${i + 1}: Healthy`}
                ></div>
              ))}
           </div>
           <div className="flex gap-4 mt-6">
             <div className="flex items-center gap-2 text-[10px] font-bold text-content-tertiary">
                <div className="w-3 h-3 bg-brand-teal/20 border border-brand-teal/30"></div> Optimal Flow
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-content-tertiary">
                <div className="w-3 h-3 bg-warning/20 border border-warning/30"></div> High Volume
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-content-tertiary">
                <div className="w-3 h-3 bg-danger/20 border border-danger/30"></div> Bottleneck
             </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
