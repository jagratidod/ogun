import { RiHistoryLine, RiTrophyLine, RiSearchLine, RiFilterLine, RiIdCardLine, RiQuestionLine, RiMoneyDollarCircleFill, RiTimerFill } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, Avatar } from '../../../core';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../../core/api';

export default function PointsHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalPoints: 0, topEarner: '—' });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/rewards/history');
      const data = res.data.data;
      setHistory(data);
      
      // Calculate basic stats from history
      const total = data.reduce((acc, h) => acc + (h.type === 'credit' ? h.amount : 0), 0);
      setStats({ totalPoints: total, topEarner: data[0]?.name || '—' });
    } catch (error) {
      toast.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'timestamp', label: 'Processing Date', sortable: true, render: (val) => (
       <div className="flex flex-col">
          <span className="text-sm font-medium text-content-primary">{new Date(val).toLocaleDateString()}</span>
          <span className="text-[10px] text-content-tertiary">{new Date(val).toLocaleTimeString()}</span>
       </div>
    )},
    { key: 'name', label: 'Entity Profile', sortable: true, render: (val, row) => (
      <div className="flex items-center gap-3">
         <Avatar name={val} size="xs" />
         <div>
            <p className="text-sm font-bold text-content-primary">{val}</p>
            <p className="text-[10px] text-content-tertiary uppercase font-black">{row.type === 'credit' ? 'EARNED' : 'REDEEMED'}</p>
         </div>
      </div>
    )},
    { key: 'amount', label: 'Pts Transaction', align: 'center', render: (val, row) => (
       <div className="flex flex-col items-center">
          <div className={`flex items-center gap-1.5 ${row.type === 'credit' ? 'text-brand-teal' : 'text-state-danger'}`}>
             <RiTrophyLine className="w-4 h-4" />
             <span className="font-black">{row.type === 'credit' ? '+' : '-'}{val.toLocaleString()}</span>
          </div>
       </div>
    )},
    { key: 'reason', label: 'Disbursement Reason', render: (val) => (
       <div className="flex items-center gap-2 max-w-xs">
          <RiIdCardLine className="w-4 h-4 text-content-tertiary" />
          <span className="text-sm text-content-secondary line-clamp-1">{val}</span>
       </div>
    )},
    { key: 'expiry', label: 'Valid Until', render: (val) => (
       <div className="flex items-center gap-1.5 text-state-warning">
          <RiTimerFill className="w-3.5 h-3.5" />
          <span className="text-[11px] font-black">{val}</span>
       </div>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <Button variant="ghost" size="sm" icon={RiQuestionLine}>Audit</Button>
    )}
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-brand-teal border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="Points Distribution Log" 
        subtitle="Auditable record of all reward disbursements across our business network"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
          <Card className="p-4 border-l-4 border-brand-teal">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Total Awarded</p>
              <div className="flex items-center gap-2">
                 <h4 className="text-xl font-bold text-content-primary">{stats.totalPoints.toLocaleString()}</h4>
                 <Badge variant="teal" size="xs">Pts</Badge>
              </div>
          </Card>
          <Card className="p-4 border-l-4 border-state-warning">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Last Transaction</p>
              <h4 className="text-xl font-bold text-content-primary truncate tracking-tight">{stats.topEarner}</h4>
          </Card>
          <Card className="p-4 border-l-4 border-brand-purple">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Log Entries</p>
              <h4 className="text-xl font-bold text-content-primary">{history.length} Entries</h4>
          </Card>
          <Card className="p-4 border-l-4 border-brand-pink">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Retention Expiry</p>
              <h4 className="text-xl font-bold text-content-primary">6 Months</h4>
          </Card>
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                 <Select options={[{ label: 'All History', value: 'all' }]} className="w-48" />
                 <Select options={[{ label: 'Last 30 Days', value: '30' }]} className="w-48" />
              </div>
              <Input icon={RiSearchLine} placeholder="Search entity name or reason..." className="w-full md:w-64 h-9" />
           </div>
        </CardHeader>
        <DataTable columns={columns} data={history} />
      </Card>
    </div>
  );
}
