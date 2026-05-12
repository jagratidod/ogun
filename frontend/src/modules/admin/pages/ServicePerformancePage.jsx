import { useState, useEffect } from 'react';
import {
  RiBarChartBoxLine, RiLineChartLine, RiPieChartLine, RiMapPinLine,
  RiArrowLeftSLine, RiArrowRightSLine, RiFilterLine
} from 'react-icons/ri';
import {
  PageHeader, Card, CardHeader, CardTitle, DataTable,
  Badge, Button, Select, MetricCard, AreaChart, BarChart
} from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';
import { SERVICE_ROLES, SERVICE_ROLE_LABELS, SERVICE_REGIONS } from '../../../core/utils/constants';

export default function ServicePerformancePage() {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    period: new Date().toISOString().slice(0, 7),
    region: '',
    level: ''
  });

  useEffect(() => {
    fetchPerformance();
  }, [filters]);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await api.get(`/admin/service-team/performance?${query}`);
      setPerformanceData(res.data.data);
    } catch (err) {
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const stats = performanceData.reduce((acc, curr) => {
    acc.revenue += curr.actuals.revenue || 0;
    acc.tickets += curr.actuals.ticketVolume || 0;
    acc.csat += curr.actuals.csat || 0;
    acc.tat += curr.actuals.tat || 0;
    return acc;
  }, { revenue: 0, tickets: 0, csat: 0, tat: 0 });

  const avgCsat = performanceData.length ? (stats.csat / performanceData.length).toFixed(1) : 0;
  const avgTat = performanceData.length ? (stats.tat / performanceData.length).toFixed(1) : 0;

  const columns = [
    { key: 'assignedTo', label: 'Member', render: (val) => (
      <div className="flex flex-col">
        <span className="font-bold text-content-primary">{val?.name || 'Unknown'}</span>
        <span className="text-[10px] text-content-tertiary uppercase font-black">{val?.serviceArea || 'No Area'}</span>
      </div>
    )},
    { key: 'serviceRole', label: 'Role', render: (val) => (
      <Badge variant="ghost">{SERVICE_ROLE_LABELS[val] || val}</Badge>
    )},
    { key: 'actuals', label: 'Revenue', align: 'right', render: (val) => (
      <span className="font-bold text-brand-teal">₹{val.revenue?.toLocaleString()}</span>
    )},
    { key: 'actuals', label: 'CSAT', align: 'center', render: (val) => (
      <Badge variant={val.csat >= 80 ? 'success' : val.csat >= 60 ? 'warning' : 'danger'}>
        {val.csat?.toFixed(1)}%
      </Badge>
    )},
    { key: 'actuals', label: 'TAT (Hrs)', align: 'center', render: (val) => (
      <span className="text-sm font-medium">{val.tat?.toFixed(1)}h</span>
    )},
    { key: 'actuals', label: 'Tickets', align: 'center', render: (val) => (
      <span className="text-sm font-bold">{val.ticketVolume}</span>
    )},
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Service Intelligence Dashboard" 
        subtitle="Real-time performance tracking and KPI analytics for the entire service team"
      >
        <div className="flex gap-2">
          <input 
            type="month" 
            className="input h-9 w-40 text-xs" 
            value={filters.period}
            onChange={(e) => setFilters({...filters, period: e.target.value})}
          />
          <Select 
            value={filters.region}
            onChange={(val) => setFilters({...filters, region: val})}
            options={[{label: 'All Regions', value: ''}, ...SERVICE_REGIONS.map(r => ({label: r, value: r}))]}
            className="w-32"
          />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Revenue" value={stats.revenue} format="currency" icon={RiBarChartBoxLine} color="teal" />
        <MetricCard title="Avg CSAT" value={`${avgCsat}%`} icon={RiPieChartLine} color="purple" />
        <MetricCard title="Avg TAT" value={`${avgTat}h`} icon={RiLineChartLine} color="blue" />
        <MetricCard title="Total Tickets" value={stats.tickets} icon={RiFilterLine} color="pink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Regional Revenue Distribution</CardTitle>
          </CardHeader>
          <div className="p-4 h-[300px]">
            <BarChart 
              data={SERVICE_REGIONS.map(r => ({
                name: r,
                value: performanceData.filter(d => d.assignedTo?.serviceRegion === r).reduce((s, c) => s + (c.actuals.revenue || 0), 0)
              }))}
              dataKey="value"
              xKey="name"
              color="#328D8E"
            />
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Performance by Role</CardTitle>
          </CardHeader>
          <div className="p-4 h-[300px]">
            <BarChart 
              data={Object.entries(SERVICE_ROLE_LABELS).map(([key, label]) => ({
                name: label,
                csat: performanceData.filter(d => d.serviceRole === key).reduce((s, c, i, a) => s + (c.actuals.csat || 0) / a.length, 0)
              }))}
              dataKey="csat"
              xKey="name"
              color="#E0128A"
              name="Avg CSAT %"
            />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RiMapPinLine className="w-5 h-5 text-brand-teal" />
            <CardTitle>Detailed Breakdown</CardTitle>
          </div>
        </CardHeader>
        <DataTable columns={columns} data={performanceData} loading={loading} />
      </Card>
    </div>
  );
}
