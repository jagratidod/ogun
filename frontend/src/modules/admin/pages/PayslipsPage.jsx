import { useState, useEffect } from 'react';
import { RiFileLine, RiDownloadLine, RiSearchLine, RiFilterLine, RiUserLine, RiCalendarLine, RiLoader4Line, RiHistoryLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency } from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function PayslipsPage() {
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hr/payroll/runs');
      setRuns(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch payroll history');
    } finally {
      setLoading(false);
    }
  };

  // Flatten all records from all runs for the table
  const allPayslips = runs.flatMap(run => 
    run.records.map(record => ({
        ...record,
        runId: run.runId,
        monthLabel: run.monthLabel,
        status: run.status
    }))
  ).filter(p => 
    p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.runId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'employeeName', label: 'Employee', render: (val, row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-surface-hover flex items-center justify-center text-brand-teal font-bold border border-border">
          {val.charAt(0)}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-content-primary">{val}</span>
          <span className="text-[10px] text-content-tertiary uppercase font-bold tracking-tight">{row.employeeId}</span>
        </div>
      </div>
    )},
    { key: 'monthLabel', label: 'Period' },
    { key: 'baseSalary', label: 'Gross Pay', align: 'right', render: (val) => <span className="font-medium">{formatCurrency(val)}</span> },
    { key: 'deductions', label: 'Deductions', align: 'right', render: (val) => <span className="text-state-danger">{formatCurrency(val)}</span> },
    { key: 'netSalary', label: 'Net Pay', align: 'right', render: (val) => <span className="font-bold text-brand-teal">{formatCurrency(val)}</span> },
    { key: 'status', label: 'Status', render: (val) => <Badge status={val === 'disbursed' ? 'success' : 'warning'}>{val === 'disbursed' ? 'Released' : 'Processing'}</Badge> },
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
      <Button variant="icon" title="Download PDF">
        <RiDownloadLine className="w-4 h-4" />
      </Button>
    )}
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="Employee Payslips" 
        subtitle="Access and manage historical salary statements for all staff members"
      >
        <div className="flex gap-2">
            <Button variant="secondary" icon={RiHistoryLine} onClick={fetchRuns}>Refresh</Button>
            <Button icon={RiDownloadLine} variant="secondary">Bulk Export (PDF)</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest">Total Historical Records</p>
                <h4 className="text-xl font-black text-content-primary mt-1">{allPayslips.length}</h4>
              </div>
              <RiFileLine className="w-5 h-5 text-brand-teal opacity-50" />
            </div>
        </div>
        <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest">Total Disbursed</p>
                <h4 className="text-xl font-black text-content-primary mt-1">
                    {formatCurrency(allPayslips.reduce((acc, curr) => acc + curr.netSalary, 0))}
                </h4>
              </div>
              <RiCalendarLine className="w-5 h-5 text-brand-teal opacity-50" />
            </div>
        </div>
        <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest">Recent Cycles</p>
                <h4 className="text-xl font-black text-content-primary mt-1">{runs.length} Runs</h4>
              </div>
              <RiDownloadLine className="w-5 h-5 text-brand-teal opacity-50" />
            </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <Select options={[{ label: 'All Cycles', value: 'all' }]} className="w-48" />
            </div>
            <div className="flex items-center gap-2">
              <Input 
                icon={RiSearchLine} 
                placeholder="Search by name or run ID..." 
                className="w-64" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="secondary" icon={RiFilterLine}>Filters</Button>
            </div>
          </div>
        </CardHeader>
        <DataTable columns={columns} data={allPayslips} />
      </Card>
    </div>
  );
}
