import React, { useState, useEffect } from 'react';
import { 
  RiTruckLine, 
  RiPulseLine, 
  RiTimeLine, 
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiArrowRightLine,
  RiMapPinLine,
  RiUserLine,
  RiBarChartLine,
  RiNotificationLine
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  DataTable, Badge, Button, Input, Select, formatDateTime
} from '../../../core';
import logisticsService from '../../../core/services/logisticsService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ShipmentControlTowerPage() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active: 0,
    delayed: 0,
    deliveredToday: 0,
    failed: 0,
    avgTransit: '0 hrs'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shipmentsRes, statsRes] = await Promise.all([
        logisticsService.getAllShipments(),
        logisticsService.getStats()
      ]);
      
      if (shipmentsRes.success) setShipments(shipmentsRes.data);
      if (statsRes.success) {
        // Mocking some extended stats for control tower
        setStats({
          active: statsRes.data.inTransit || 0,
          delayed: Math.floor((statsRes.data.inTransit || 0) * 0.1),
          deliveredToday: statsRes.data.deliveredToday || 0,
          failed: statsRes.data.cancelled || 0,
          avgTransit: '24.5 hrs'
        });
      }
    } catch (error) {
      toast.error('Failed to load control tower data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'In-Transit Shipments', value: stats.active, icon: RiTruckLine, color: 'text-brand-teal', bg: 'bg-brand-teal/5' },
    { title: 'Critical Delays', value: stats.delayed, icon: RiTimeLine, color: 'text-danger', bg: 'bg-danger/5' },
    { title: 'Delivered (Last 24h)', value: stats.deliveredToday, icon: RiCheckboxCircleLine, color: 'text-success', bg: 'bg-success/5' },
    { title: 'Delivery Failures', value: stats.failed, icon: RiCloseCircleLine, color: 'text-warning', bg: 'bg-warning/5' },
  ];

  const columns = [
    { key: 'podNumber', label: 'POD / ID', render: (val, row) => (
      <div>
        <p className="text-xs font-bold text-content-primary">{val || 'N/A'}</p>
        <p className="text-[9px] text-content-tertiary font-mono">{row.shipmentId}</p>
      </div>
    )},
    { key: 'recipient', label: 'Network Route', render: (val, row) => (
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-[8px] py-0">{row.sender?.businessName || 'Admin'}</Badge>
          <RiArrowRightLine className="text-content-tertiary w-2" />
          <span className="text-xs font-bold text-content-primary">{val?.businessName || val?.name}</span>
        </div>
        <span className="text-[9px] text-content-tertiary flex items-center gap-1 mt-1">
          <RiMapPinLine className="w-2 h-2" /> {val?.location || 'Direct'}
        </span>
      </div>
    )},
    { key: 'carrier', label: 'Carrier Info', render: (val, row) => (
      <div>
        <p className="text-xs font-medium text-content-primary">{row.carrierId?.name || val || 'N/A'}</p>
        <p className="text-[9px] text-content-tertiary uppercase tracking-tighter">Billed: {row.billedWeight || 0}kg</p>
      </div>
    )},
    { key: 'status', label: 'Pipeline Status', render: (val) => {
      const colors = {
        'Pending': 'warning',
        'In Transit': 'info',
        'Out for Delivery': 'teal',
        'Delivered': 'success',
        'Cancelled': 'danger'
      };
      return <Badge variant={colors[val] || 'secondary'}>{val}</Badge>;
    }},
    { key: 'dispatchedAt', label: 'Timing', render: (val) => (
      <div className="flex flex-col">
        <span className="text-xs text-content-primary">{val ? formatDateTime(val).split(',')[0] : 'N/A'}</span>
        <span className="text-[9px] text-content-tertiary">ETA: 2 Days</span>
      </div>
    )},
    { key: 'actions', label: '', align: 'right', render: (_, row) => (
      <Button variant="ghost" size="xs" onClick={() => navigate(`/logistics/shipments/${row._id}`)}>View</Button>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Shipment Control Tower" 
        subtitle="Global logistics surveillance and delivery intelligence monitor"
      >
        <div className="flex gap-2">
          <Button variant="secondary" icon={RiBarChartLine}>Carrier Report</Button>
          <Button icon={RiNotificationLine}>Alert Config</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, idx) => (
          <div key={idx} className={`glass-card p-6 border-b-2 border-border group hover:border-brand-teal transition-all`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 ${card.bg} ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <RiPulseLine className="text-content-tertiary/20" />
            </div>
            <p className="text-xs font-bold text-content-tertiary uppercase tracking-widest">{card.title}</p>
            <h3 className="text-3xl font-black text-content-primary mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <CardTitle>Active Pipeline Intelligence</CardTitle>
              <div className="flex gap-2">
                <Select size="sm" options={[{ label: 'All Zones', value: 'all' }]} className="w-32" />
                <Input placeholder="Filter POD..." size="sm" className="w-48 h-8" />
              </div>
            </div>
          </CardHeader>
          <DataTable 
            columns={columns} 
            data={shipments} 
            loading={loading} 
          />
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Carrier Efficiency</CardTitle>
              <CardDescription>Performance by successful delivery %</CardDescription>
            </CardHeader>
            <div className="p-6 space-y-4">
              {[
                { name: 'Delhivery', rate: 98.4, color: 'bg-success' },
                { name: 'Safexpress', rate: 94.2, color: 'bg-brand-teal' },
                { name: 'Gati', rate: 89.7, color: 'bg-warning' },
                { name: 'DTDC', rate: 96.8, color: 'bg-info' }
              ].map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-content-primary">{c.name}</span>
                    <span className="font-mono text-content-secondary">{c.rate}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-secondary w-full">
                    <div className={`h-full ${c.color}`} style={{ width: `${c.rate}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Geographical Load</CardTitle>
              <CardDescription>Shipment volume by destination zone</CardDescription>
            </CardHeader>
            <div className="p-6">
              <div className="flex items-center justify-between p-3 bg-surface-secondary border-l-4 border-brand-teal mb-2">
                <span className="text-xs font-bold">North Zone</span>
                <span className="badge badge-teal">42 Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-secondary border-l-4 border-info mb-2">
                <span className="text-xs font-bold">West Zone</span>
                <span className="badge badge-info">28 Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-secondary border-l-4 border-warning">
                <span className="text-xs font-bold">South Zone</span>
                <span className="badge badge-warning">15 Active</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
