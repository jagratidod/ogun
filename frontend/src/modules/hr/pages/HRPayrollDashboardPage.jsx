import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiMoneyDollarBoxLine, RiTeamLine, RiTimeLine, RiCheckDoubleLine, RiLoader4Line, RiAddLine, RiSettings4Line, RiHistoryLine, RiArrowRightUpLine, RiCalendarLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, MetricCard, AreaChart, DataTable, Badge, Button, formatCurrency } from '../../../core';
import toast from 'react-hot-toast';
import api from '../../../core/api';

const STATUS_VARIANT = { draft: 'warning', approved: 'info', disbursed: 'success' };

export default function HRPayrollDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [runs, setRuns] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, runsRes] = await Promise.all([
        api.get('/hr/payroll/stats'),
        api.get('/hr/payroll/runs')
      ]);
      setStats(statsRes.data.data);
      setRuns(runsRes.data.data);
    } catch (err) {
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const runsColumns = [
    { key: 'monthLabel', label: 'Pay Period', render: (val) => (
      <div className="flex items-center gap-2">
        <RiCalendarLine className="text-brand-teal w-4 h-4" />
        <span className="font-semibold text-content-primary">{val}</span>
      </div>
    )},
    { key: 'employeeCount', label: 'Employees', align: 'center', render: (val) => (
      <Badge variant="info">{val}</Badge>
    )},
    { key: 'totalGross', label: 'Gross Payable', align: 'right', render: (val) => (
      <span className="font-bold text-content-primary">{formatCurrency(val)}</span>
    )},
    { key: 'totalDeductions', label: 'Deductions', align: 'right', render: (val) => (
      <span className="text-state-danger font-medium">- {formatCurrency(val)}</span>
    )},
    { key: 'totalNet', label: 'Net Payout', align: 'right', render: (val) => (
      <span className="font-bold text-brand-teal">{formatCurrency(val)}</span>
    )},
    { key: 'status', label: 'Status', render: (val) => (
      <Badge variant={STATUS_VARIANT[val]}>{val.toUpperCase()}</Badge>
    )},
    { key: '_id', label: '', align: 'right', render: (val) => (
      <Button variant="ghost" size="sm" icon={RiArrowRightUpLine} onClick={() => navigate(`/hr/payroll/history`)}>
        View
      </Button>
    )}
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
    </div>
  );

  return (
    <div className="page-container">
      <PageHeader
        title="Payroll Command Center"
        subtitle="Manage salary cycles, employee compensation and disbursements"
      >
        <div className="flex gap-3">
          <Button variant="secondary" icon={RiSettings4Line} onClick={() => navigate('/hr/payroll/setup')}>
            Salary Setup
          </Button>
          <Button icon={RiAddLine} onClick={() => navigate('/hr/payroll/run')}>
            Run Payroll
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Last Month Payout"
          value={stats?.lastRunTotal ? formatCurrency(stats.lastRunTotal) : '₹0'}
          icon={RiMoneyDollarBoxLine}
        />
        <MetricCard
          title="Employees On Payroll"
          value={stats?.employeesOnPayroll || 0}
          icon={RiTeamLine}
        />
        <MetricCard
          title="Last Run"
          value={stats?.lastRunMonth || '—'}
          icon={RiTimeLine}
        />
        <div className={`glass-card p-4 flex flex-col justify-between ${stats?.lastRunStatus === 'disbursed' ? 'border-l-4 border-state-success' : 'border-l-4 border-state-warning'}`}>
          <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest">Last Run Status</p>
          <Badge className="mt-2 self-start" variant={STATUS_VARIANT[stats?.lastRunStatus] || 'warning'}>
            {(stats?.lastRunStatus || 'none').toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="section-title mb-4">6-Month Payout Trend</h3>
          {stats?.trend?.length > 0 ? (
            <AreaChart
              data={stats.trend}
              dataKey="payout"
              xKey="month"
              name="Net Payout"
              height={280}
            />
          ) : (
            <div className="flex items-center justify-center h-[280px] text-content-tertiary text-sm">
              No payroll history yet. Run your first payroll to see trends.
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common payroll tasks</CardDescription>
          </CardHeader>
          <div className="p-4 space-y-3">
            {[
              { label: 'Setup Employee Salaries', desc: 'Set base salary & bank details', icon: RiSettings4Line, path: '/hr/payroll/setup' },
              { label: 'Run Monthly Payroll', desc: 'Preview & process salary cycle', icon: RiAddLine, path: '/hr/payroll/run' },
              { label: 'Payroll History', desc: 'Browse & approve past runs', icon: RiHistoryLine, path: '/hr/payroll/history' }
            ].map(action => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center gap-3 p-3 text-left border border-border bg-surface-input/30 hover:border-brand-teal hover:bg-brand-teal/5 transition-all group"
              >
                <div className="w-9 h-9 rounded-none bg-surface-elevated flex items-center justify-center flex-shrink-0">
                  <action.icon className="w-4 h-4 text-brand-teal" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-content-primary group-hover:text-brand-teal transition-colors">{action.label}</p>
                  <p className="text-[10px] text-content-tertiary font-bold uppercase">{action.desc}</p>
                </div>
                <RiArrowRightUpLine className="w-4 h-4 text-content-tertiary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Recent Payroll Runs</CardTitle>
              <CardDescription>All historical salary disbursement cycles</CardDescription>
            </div>
            <Button variant="ghost" size="sm" icon={RiHistoryLine} onClick={() => navigate('/hr/payroll/history')}>
              Full History
            </Button>
          </div>
        </CardHeader>
        {runs.length === 0 ? (
          <div className="p-12 text-center text-content-tertiary">
            <RiMoneyDollarBoxLine className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold uppercase tracking-widest">No payroll runs yet</p>
            <p className="text-xs mt-1">Click "Run Payroll" to create your first cycle</p>
          </div>
        ) : (
          <DataTable columns={runsColumns} data={runs} />
        )}
      </Card>
    </div>
  );
}
