import React, { useState, useEffect } from 'react';
import { 
  RiTruckLine, 
  RiTimeLine, 
  RiCheckboxCircleLine, 
  RiCloseCircleLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiBox3Line
} from 'react-icons/ri';
import MetricCard from '../../../core/components/charts/MetricCard';
import logisticsService from '../../../core/services/logisticsService';
import { toast } from 'react-hot-toast';

export default function LogisticsDashboardPage() {
  const [stats, setStats] = useState({
    totalShipments: '0',
    inTransit: '0',
    deliveredToday: '0',
    cancelled: '0',
    restockRequests: '0'
  });
  const [recentShipments, setRecentShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, shipmentsRes] = await Promise.all([
          logisticsService.getStats(),
          logisticsService.getAllShipments({ limit: 5 })
        ]);
        
        if (statsRes.success) {
          setStats(statsRes.data);
        }
        if (shipmentsRes.success) {
          setRecentShipments(shipmentsRes.data);
        }
      } catch (error) {
        toast.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Shipments', value: stats.totalShipments, icon: RiTruckLine, color: 'text-brand-teal', trend: '+12%', isPositive: true },
    { title: 'In Transit', value: stats.inTransit, icon: RiTimeLine, color: 'text-warning', trend: '+5%', isPositive: true },
    { title: 'Delivered Today', value: stats.deliveredToday, icon: RiCheckboxCircleLine, color: 'text-success', trend: '-2%', isPositive: false },
    { title: 'Restock Requests', value: stats.restockRequests, icon: RiCloseCircleLine, color: 'text-danger', trend: '0%', isPositive: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Logistics Dashboard</h1>
        <p className="text-content-tertiary">Real-time overview of the supply chain and delivery operations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-none ${stat.color} bg-opacity-10`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center text-xs font-medium ${stat.isPositive ? 'text-success' : 'text-danger'}`}>
                {stat.isPositive ? <RiArrowUpLine className="mr-1" /> : <RiArrowDownLine className="mr-1" />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-content-tertiary">{stat.title}</p>
              <h3 className="text-2xl font-bold text-content-primary mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Shipments Placeholder */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-content-primary">Live Shipment Feed</h3>
            <button className="btn-secondary text-xs py-1 px-3">View All</button>
          </div>
          <div className="space-y-4">
            {recentShipments.length > 0 ? recentShipments.map((shipment) => (
              <div key={shipment._id} className="flex items-center justify-between p-4 border border-border bg-surface-secondary/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-none bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                    <RiTruckLine />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-content-primary">{shipment.shipmentId}</p>
                    <p className="text-xs text-content-tertiary">
                      {shipment.sender?.name || 'Admin'} → {shipment.recipient?.businessName || shipment.recipient?.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${shipment.status === 'In Transit' ? 'badge-warning' : 'badge-success'} text-[10px]`}>
                    {shipment.status}
                  </span>
                  <p className="text-[10px] text-content-tertiary mt-1">Updated just now</p>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center border border-dashed border-border">
                <p className="text-sm text-content-tertiary">No active shipments in pipeline.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Status Placeholder */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-content-primary mb-6">Pipeline Health</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-content-secondary">Order to Dispatch</span>
                <span className="text-success font-bold">2.4 hrs (Avg)</span>
              </div>
              <div className="h-2 bg-surface-secondary w-full">
                <div className="h-full bg-success w-[85%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-content-secondary">Transit Efficiency</span>
                <span className="text-brand-teal font-bold">94%</span>
              </div>
              <div className="h-2 bg-surface-secondary w-full">
                <div className="h-full bg-brand-teal w-[94%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-content-secondary">Delivery Success</span>
                <span className="text-info font-bold">98.2%</span>
              </div>
              <div className="h-2 bg-surface-secondary w-full">
                <div className="h-full bg-info w-[98%]"></div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-brand-teal/5 border border-brand-teal/20">
            <h4 className="text-sm font-bold text-brand-teal mb-3">Operational Hub</h4>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => window.location.href='/logistics/packaging'} 
                className="p-2 bg-white border border-brand-teal/20 text-[10px] font-bold text-brand-teal hover:bg-brand-teal hover:text-white transition-all flex flex-col items-center"
              >
                <RiBox3Line className="mb-1 text-base" />
                PACKAGING DESK
              </button>
              <button 
                onClick={() => window.location.href='/logistics/dispatch'} 
                className="p-2 bg-white border border-brand-teal/20 text-[10px] font-bold text-brand-teal hover:bg-brand-teal hover:text-white transition-all flex flex-col items-center"
              >
                <RiTruckLine className="mb-1 text-base" />
                DISPATCH QUEUE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

