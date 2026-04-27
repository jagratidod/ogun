import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiLoader4Line, RiMoneyDollarBoxLine, RiCheckDoubleLine, RiCalendarLine, RiAlertLine, RiArrowRightLine, RiTeamLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, formatCurrency } from '../../../core';
import toast from 'react-hot-toast';
import api from '../../../core/api';

export default function HRRunPayrollPage() {
  const navigate = useNavigate();
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [month, setMonth] = useState(defaultMonth);
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [running, setRunning] = useState(false);

  const [selectedDept, setSelectedDept] = useState('All');

  const handlePreview = async () => {
    setPreviewing(true);
    setPreview(null);
    setSelectedDept('All');
    try {
      const res = await api.get(`/hr/payroll/preview?month=${month}`);
      setPreview(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Preview failed');
    } finally {
      setPreviewing(false);
    }
  };

  // Derive unique departments from preview records
  const departments = preview ? ['All', ...new Set(preview.records.map(r => r.department || 'Unassigned'))].sort() : [];

  const filteredRecords = preview 
    ? (selectedDept === 'All' ? preview.records : preview.records.filter(r => (r.department || 'Unassigned') === selectedDept))
    : [];

  const handleRunPayroll = async () => {
    if (!preview) return;
    setRunning(true);
    try {
      await api.post('/hr/payroll/runs', { month });
      toast.success(`Payroll for ${preview.month} created successfully!`);
      navigate('/hr/payroll/history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to run payroll');
    } finally {
      setRunning(false);
    }
  };

  const columns = [
    { key: 'employeeName', label: 'Employee', render: (val, row) => (
      <div className="flex items-center gap-2">
        <Avatar name={val} size="xs" />
        <div>
          <p className="font-semibold text-sm text-content-primary">{val}</p>
          <p className="text-[10px] text-content-tertiary uppercase font-bold">{row.department}</p>
        </div>
      </div>
    )},
    { key: 'grossPay', label: 'Gross Pay', align: 'right', render: (val) => (
      <span className="font-medium text-content-primary">{formatCurrency(val)}</span>
    )},
    { key: 'leaveDays', label: 'Leave Days', align: 'center', render: (val, row) => (
      <div className="flex flex-col items-center">
        <span className={`font-bold text-sm ${val > row.freeLeaveAllowance ? 'text-state-danger' : 'text-state-success'}`}>{val} days</span>
        <span className="text-[9px] text-content-tertiary">{row.freeLeaveAllowance} free</span>
      </div>
    )},
    { key: 'leaveDeduction', label: 'Leave Deduction', align: 'right', render: (val) => (
      <span className={`font-medium ${val > 0 ? 'text-state-danger' : 'text-content-tertiary'}`}>
        {val > 0 ? `- ${formatCurrency(val)}` : '—'}
      </span>
    )},
    { key: 'netPay', label: 'Net Pay', align: 'right', render: (val) => (
      <span className="font-black text-brand-teal">{formatCurrency(val)}</span>
    )},
    { key: 'actions', label: 'Action', align: 'right', render: (_, row) => (
      <Button 
        variant="ghost" 
        size="xs" 
        className="h-7 text-[10px] font-black uppercase tracking-tight text-brand-teal hover:bg-brand-teal/10 border border-brand-teal/20"
        onClick={() => handlePayIndividualInPreview(row.employee)}
      >
        Pay
      </Button>
    )}
  ];

  const handlePayIndividualInPreview = async (employeeId) => {
    try {
      setRunning(true);
      // 1. Create the run first if it doesn't exist (it will return conflict if exists, which we handle)
      let runId;
      try {
        const createRes = await api.post('/hr/payroll/runs', { month });
        runId = createRes.data.data._id;
      } catch (err) {
        if (err.response?.status === 409) {
          // Conflict: Run already exists, fetch it to get the ID
          const historyRes = await api.get('/hr/payroll/runs');
          const existingRun = historyRes.data.data.find(r => r.month === month);
          runId = existingRun._id;
        } else {
          throw err;
        }
      }

      // 2. Fetch the full run details to find the recordId for this employee
      const detailRes = await api.get(`/hr/payroll/runs/${runId}`);
      const run = detailRes.data.data;
      const record = run.records.find(r => r.employee.toString() === employeeId.toString() || r.employee._id?.toString() === employeeId.toString());
      
      if (!record) {
        toast.error('Employee record not found in this payroll run');
        return;
      }

      if (record.status === 'paid') {
        toast.error('Employee already paid');
        return;
      }

      // 3. Mark as paid
      await api.patch(`/hr/payroll/runs/${runId}/records/${record._id}/pay`);
      toast.success('Payment successful!');
      
      // 4. Redirect to history to see the result (cleanest flow)
      navigate('/hr/payroll/history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setRunning(false);
    }
  };


  return (
    <div className="page-container max-w-5xl mx-auto">
      <PageHeader
        title="Run Monthly Payroll"
        subtitle="Preview computed payslips and confirm salary disbursement"
      />

      {/* Month Picker */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="flex-1">
              <label className="block text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-2">Select Pay Period</label>
              <input
                type="month"
                value={month}
                onChange={e => { setMonth(e.target.value); setPreview(null); }}
                className="h-10 px-3 bg-surface-input border border-border text-sm text-content-primary focus:outline-none focus:border-brand-teal"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-xs text-content-secondary p-3 bg-surface-elevated border border-border">
                <RiAlertLine className="text-state-warning w-4 h-4 flex-shrink-0" />
                <span>Employees with ≤2 leave days this month get no deduction</span>
              </div>
              <Button icon={RiCalendarLine} onClick={handlePreview} disabled={previewing}>
                {previewing ? (
                  <><RiLoader4Line className="animate-spin w-4 h-4 inline mr-1" /> Computing...</>
                ) : 'Preview Payroll'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Preview Results */}
      {preview && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-5 border-l-4 border-brand-teal">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Total Gross</p>
              <h3 className="text-xl font-black text-content-primary">{formatCurrency(preview.totalGross)}</h3>
            </div>
            <div className="glass-card p-5 border-l-4 border-state-danger">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Total Deductions</p>
              <h3 className="text-xl font-black text-state-danger">- {formatCurrency(preview.totalDeductions)}</h3>
            </div>
            <div className="glass-card p-5 border-l-4 border-state-success">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Total Net Payout</p>
              <h3 className="text-xl font-black text-state-success">{formatCurrency(preview.totalNet)}</h3>
            </div>
            <div className="glass-card p-5 border-l-4 border-brand-purple">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Employees</p>
              <div className="flex items-center gap-2 mt-1">
                <RiTeamLine className="text-brand-purple w-5 h-5" />
                <h3 className="text-xl font-black text-content-primary">{preview.employeeCount}</h3>
              </div>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                <div>
                  <CardTitle>Payroll Worksheet — {preview.month}</CardTitle>
                  <CardDescription>Review individual payslips before confirming disbursement</CardDescription>
                </div>
                {/* Dept Tabs */}
                <div className="flex bg-surface-secondary/50 p-1 rounded-none border border-border">
                  {departments.map(dept => (
                    <button
                      key={dept}
                      onClick={() => setSelectedDept(dept)}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                        selectedDept === dept ? 'bg-brand-teal text-white shadow-sm' : 'text-content-tertiary hover:text-content-primary'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <DataTable columns={columns} data={filteredRecords} />

            <div className="p-5 bg-surface-elevated border-t border-border flex items-center justify-between">
              <div className="text-sm text-content-secondary">
                <span className="font-bold">{preview.records.filter(r => r.leaveDeduction > 0).length}</span> employees have leave deductions this month
              </div>
              <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={() => setPreview(null)}>Reset</Button>
                <Button
                  icon={RiCheckDoubleLine}
                  onClick={handleRunPayroll}
                  disabled={running}
                >
                  {running ? (
                    <><RiLoader4Line className="animate-spin w-4 h-4 inline mr-1" /> Processing...</>
                  ) : `Confirm & Run Payroll`}
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {!preview && !previewing && (
        <div className="glass-card p-16 text-center text-content-tertiary">
          <RiMoneyDollarBoxLine className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-sm font-bold uppercase tracking-widest">Select a pay period and click "Preview Payroll"</p>
          <p className="text-xs mt-1">The system will calculate net pay after leave deductions for all active employees</p>
        </div>
      )}
    </div>
  );
}
