import { useState, useEffect } from 'react';
import { 
  RiCalendarEventLine, RiTimeLine, RiMapPinUserLine, 
  RiPulseLine, RiArrowRightSLine, RiHistoryLine, 
  RiTimerFlashLine, RiMapPin2Line 
} from 'react-icons/ri';
import { PageHeader, Card, DataTable, Badge, Button, Avatar, Input, Select, formatCurrency, Modal, EmptyState } from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function AttendanceDashboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({ totalActive: 0, totalHours: 0, totalVisits: 0 });

  const [selectedRep, setSelectedRep] = useState(null);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/attendance/daily?date=${selectedDate}`);
      const attendance = res.data.data || [];
      setData(attendance);

      // Aggregate stats
      const activeCount = attendance.filter(a => a.status !== 'No Data').length;
      const totalSecs = attendance.reduce((acc, curr) => acc + (curr.appActiveTime || 0) + (curr.shopVisitTime || 0), 0);
      const visitCount = attendance.reduce((acc, curr) => acc + (curr.visitCount || 0), 0);

      setStats({
        totalActive: activeCount,
        totalHours: Math.round(totalSecs / 3600),
        totalVisits: visitCount
      });
    } catch (err) {
      toast.error('Failed to load attendance report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const formatSeconds = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getDisplayName = (row) => {
    if (row.name && row.name.toLowerCase() !== 'executive') return row.name;
    return row.email.split('@')[0].split(/[._]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  };

  const columns = [
    {
      key: 'name', label: 'Sales Representative',
      render: (val, row) => {
        const displayName = getDisplayName(row);
        return (
          <div className="flex items-center gap-3">
            <Avatar name={displayName} size="sm" className="ring-2 ring-brand-teal/20" />
            <div>
              <p className="font-bold text-content-primary text-sm">{displayName}</p>
              <div className="flex flex-col">
                <p className="text-[10px] text-content-tertiary uppercase tracking-tighter font-black">{row.assignedArea}</p>
                <p className="text-[10px] text-brand-teal/70 font-bold">{row.email}</p>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'appActiveTime', label: 'App Usage',
      render: (val) => (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                <div className="h-full bg-brand-magenta" style={{ width: `${Math.min(100, (val / 28800) * 100)}%` }} />
            </div>
            <span className="text-xs font-bold text-content-secondary">{formatSeconds(val)}</span>
        </div>
      )
    },
    {
      key: 'shopVisitTime', label: 'Field Time',
      render: (val) => (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                <div className="h-full bg-brand-teal" style={{ width: `${Math.min(100, (val / 14400) * 100)}%` }} />
            </div>
            <span className="text-xs font-bold text-content-secondary">{formatSeconds(val)}</span>
        </div>
      )
    },
    {
      key: 'visitCount', label: 'Visits',
      render: (val) => (
        <Badge variant="outline" className="font-black">
            {val} SHOPS
        </Badge>
      )
    },
    {
        key: 'status', label: 'Status',
        render: (val) => <Badge status={val === 'Finalized' ? 'active' : val === 'Active' ? 'warning' : 'inactive'}>{val}</Badge>
    },
    {
        key: 'lastHeartbeat', label: 'Last Active',
        render: (val) => val ? (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-content-tertiary">
                <RiPulseLine className="text-state-success animate-pulse" />
                {new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        ) : '—'
    },
    {
      key: 'actions', label: '', align: 'right',
      render: (_v, row) => (
        <Button size="xs" variant="ghost" icon={RiArrowRightSLine} onClick={() => setSelectedRep(row)}>
            View Timeline
        </Button>
      )
    }
  ];

  return (
    <div className="page-container space-y-6">
      <PageHeader 
        title="Field Attendance" 
        subtitle="Real-time monitoring of sales representatives' app usage and shop visits"
      >
        <div className="flex gap-2">
            <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
                icon={RiCalendarEventLine}
            />
            <Button variant="secondary" icon={RiHistoryLine}>Full Reports</Button>
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-brand-teal to-brand-teal/80 border-none p-5 relative overflow-hidden group">
            <div className="relative z-10">
                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Active Personnel</p>
                <h2 className="text-3xl font-black text-white">{stats.totalActive}</h2>
                <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-white/90">
                    <RiMapPinUserLine /> Current on Field
                </div>
            </div>
            <RiMapPinUserLine className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
        </Card>

        <Card className="bg-gradient-to-br from-brand-magenta to-brand-magenta/80 border-none p-5 relative overflow-hidden group">
            <div className="relative z-10">
                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Total Productivity</p>
                <h2 className="text-3xl font-black text-white">{stats.totalHours}h</h2>
                <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-white/90">
                    <RiTimeLine /> Combined Active Time
                </div>
            </div>
            <RiTimeLine className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
        </Card>

        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-500 border-none p-5 relative overflow-hidden group">
            <div className="relative z-10">
                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Retailer Interactions</p>
                <h2 className="text-3xl font-black text-white">{stats.totalVisits}</h2>
                <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-white/90">
                    <RiMapPin2Line /> Total Shop Visits
                </div>
            </div>
            <RiMapPin2Line className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
        </Card>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage="No attendance data found for this date."
        />
      </Card>

      {/* Quick Legend */}
      <div className="flex justify-center gap-6 py-2 border-t border-border/50">
        <div className="flex items-center gap-2 text-[10px] font-black text-content-tertiary uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-brand-magenta" /> App Usage (Active App)
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-content-tertiary uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-brand-teal" /> Field Time (At Shop)
        </div>
      </div>

      {/* Timeline Modal */}
      <Modal 
        isOpen={!!selectedRep} 
        onClose={() => setSelectedRep(null)} 
        title={`Visit Timeline — ${selectedRep ? getDisplayName(selectedRep) : ''}`}
        size="md"
      >
        {selectedRep && (
            <div className="space-y-6">
                {/* Day Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-surface-secondary rounded-xl border border-border/50">
                        <p className="text-[10px] font-black text-content-tertiary uppercase mb-1">Total App Usage</p>
                        <p className="text-xl font-black text-brand-magenta">{formatSeconds(selectedRep.appActiveTime)}</p>
                    </div>
                    <div className="p-3 bg-surface-secondary rounded-xl border border-border/50">
                        <p className="text-[10px] font-black text-content-tertiary uppercase mb-1">Total Field Time</p>
                        <p className="text-xl font-black text-brand-teal">{formatSeconds(selectedRep.shopVisitTime)}</p>
                    </div>
                </div>

                {/* Timeline List */}
                <div>
                    <h4 className="text-xs font-black text-content-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                        <RiHistoryLine className="text-brand-teal" /> Activity sequence
                    </h4>
                    
                    {selectedRep.visits && selectedRep.visits.length > 0 ? (
                        <div className="space-y-0 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border/50">
                            {selectedRep.visits.map((visit, idx) => (
                                <div key={idx} className="relative pl-8 pb-6 last:pb-0">
                                    {/* Timeline Node */}
                                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface-primary border-2 border-brand-teal flex items-center justify-center z-10">
                                        <RiMapPin2Line className="w-3 h-3 text-brand-teal" />
                                    </div>
                                    
                                    <div className="p-3 bg-surface-elevated rounded-xl border border-border/30 hover:border-brand-teal/30 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-bold text-sm text-content-primary">{visit.retailerName}</p>
                                            <Badge variant="ghost" size="xs" className="bg-brand-teal/10 text-brand-teal">
                                                {formatSeconds(visit.duration)}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-content-tertiary uppercase">
                                            <span className="flex items-center gap-1"><RiTimeLine /> {new Date(visit.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span>—</span>
                                            <span className="flex items-center gap-1"><RiTimeLine /> {new Date(visit.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState 
                            title="No shop visits recorded" 
                            description="This representative has not checked into any retailer locations yet today."
                            icon={RiMapPin2Line}
                        />
                    )}
                </div>

                <div className="pt-4 border-t border-border/50 flex justify-end">
                    <Button variant="secondary" onClick={() => setSelectedRep(null)}>Close Timeline</Button>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
}
