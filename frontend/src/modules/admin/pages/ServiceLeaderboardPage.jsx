import { useState, useEffect } from 'react';
import {
  RiMedalLine, RiAwardLine, RiMapPinLine, RiFilterLine,
  RiArrowUpSLine, RiArrowDownSLine
} from 'react-icons/ri';
import {
  PageHeader, Card, CardHeader, CardTitle, DataTable,
  Badge, Button, Select, MetricCard
} from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';
import { SERVICE_REGIONS } from '../../../core/utils/constants';

export default function ServiceLeaderboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [region, setRegion] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, [period, region]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/service-team/leaderboard?period=${period}&region=${region}`);
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const topThree = data.slice(0, 3);
  const others = data.slice(3);

  const columns = [
    { key: 'rank', label: 'Rank', render: (_, __, index) => (
      <span className="font-bold text-content-tertiary">#{index + 4}</span>
    )},
    { key: 'assignedTo', label: 'Engineer', render: (val) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold text-xs">
          {val?.name?.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-content-primary">{val?.name}</p>
          <p className="text-[10px] text-content-tertiary uppercase">{val?.serviceArea}</p>
        </div>
      </div>
    )},
    { key: 'compositeScore', label: 'Perf. Score', align: 'center', render: (val) => (
      <div className="flex flex-col items-center">
        <span className="font-black text-brand-teal text-lg">{val}</span>
        <div className="w-16 h-1.5 bg-surface-muted rounded-full overflow-hidden">
          <div className="h-full bg-brand-teal" style={{ width: `${val}%` }} />
        </div>
      </div>
    )},
    { key: 'actuals', label: 'Stats', render: (val) => (
      <div className="flex gap-4 text-[10px] font-bold">
        <div className="flex flex-col">
          <span className="text-content-tertiary uppercase">CSAT</span>
          <span className="text-content-primary">{val.csat?.toFixed(1)}%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-content-tertiary uppercase">TAT</span>
          <span className="text-content-primary">{val.tat?.toFixed(1)}h</span>
        </div>
        <div className="flex flex-col">
          <span className="text-content-tertiary uppercase">Revenue</span>
          <span className="text-content-primary">₹{val.revenue?.toLocaleString()}</span>
        </div>
      </div>
    )},
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Service Leaderboard" 
        subtitle="Celebrating top performers across technical efficiency and customer excellence"
      >
        <div className="flex gap-2">
          <input 
            type="month" 
            className="input h-9 w-40 text-xs" 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
          <Select 
            value={region}
            onChange={setRegion}
            options={[{label: 'All Regions', value: ''}, ...SERVICE_REGIONS.map(r => ({label: r, value: r}))]}
            className="w-32"
          />
        </div>
      </PageHeader>

      {/* Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
        {/* Silver */}
        {topThree[1] && (
          <Card className="order-2 md:order-1 border-b-4 border-slate-300">
            <div className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 mx-auto">
                  {topThree[1].assignedTo?.name?.charAt(0)}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-white font-bold">2</div>
              </div>
              <h3 className="font-bold text-content-primary truncate">{topThree[1].assignedTo?.name}</h3>
              <p className="text-xs text-content-tertiary mb-3">{topThree[1].assignedTo?.serviceRegion} Region</p>
              <div className="text-2xl font-black text-slate-400">{topThree[1].compositeScore}</div>
            </div>
          </Card>
        )}

        {/* Gold */}
        {topThree[0] && (
          <Card className="order-1 md:order-2 border-b-4 border-brand-teal scale-105 shadow-xl bg-gradient-to-b from-brand-teal/5 to-transparent">
            <div className="p-8 text-center">
              <RiMedalLine className="w-10 h-10 text-brand-teal mx-auto mb-2" />
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full bg-brand-teal/10 flex items-center justify-center text-4xl font-bold text-brand-teal mx-auto border-4 border-white shadow-md">
                  {topThree[0].assignedTo?.name?.charAt(0)}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-brand-teal flex items-center justify-center text-white font-bold text-lg shadow-lg">1</div>
              </div>
              <h3 className="text-lg font-black text-content-primary truncate">{topThree[0].assignedTo?.name}</h3>
              <p className="text-sm text-content-tertiary mb-4">{topThree[0].assignedTo?.serviceArea}</p>
              <div className="text-4xl font-black text-brand-teal">{topThree[0].compositeScore}</div>
              <p className="text-[10px] text-content-tertiary uppercase tracking-widest mt-1 font-bold">Composite Performance</p>
            </div>
          </Card>
        )}

        {/* Bronze */}
        {topThree[2] && (
          <Card className="order-3 border-b-4 border-orange-300">
            <div className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-3xl font-bold text-orange-400 mx-auto">
                  {topThree[2].assignedTo?.name?.charAt(0)}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-300 flex items-center justify-center text-white font-bold">3</div>
              </div>
              <h3 className="font-bold text-content-primary truncate">{topThree[2].assignedTo?.name}</h3>
              <p className="text-xs text-content-tertiary mb-3">{topThree[2].assignedTo?.serviceRegion} Region</p>
              <div className="text-2xl font-black text-orange-400">{topThree[2].compositeScore}</div>
            </div>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RiAwardLine className="w-5 h-5 text-brand-teal" />
            <CardTitle>Global Rankings</CardTitle>
          </div>
        </CardHeader>
        <DataTable columns={columns} data={others} loading={loading} />
      </Card>
    </div>
  );
}
