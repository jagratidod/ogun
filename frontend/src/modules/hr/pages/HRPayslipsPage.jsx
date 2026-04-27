import { useState, useEffect } from 'react';
import { RiLoader4Line, RiHistoryLine, RiCheckDoubleLine, RiArrowRightSLine, RiMoneyDollarBoxLine, RiGroupLine, RiDownloadLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, formatCurrency, Modal, useModal } from '../../../core';
import toast from 'react-hot-toast';
import api from '../../../core/api';

const STATUS_VARIANT = { draft: 'warning', approved: 'info', disbursed: 'success' };

export default function HRPayslipsPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const { isOpen, open, close, data: selectedRun } = useModal();
  const [runDetail, setRunDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { fetchRuns(); }, []);

  const fetchRuns = async () => {
    try {
      const res = await api.get('/hr/payroll/runs');
      setRuns(res.data.data);
    } catch (err) {
      toast.error('Failed to load payroll history');
    } finally {
      setLoading(false);
    }
  };

  const [detailDept, setDetailDept] = useState('All');

  const openRunDetail = async (run) => {
    open(run);
    setDetailLoading(true);
    setRunDetail(null);
    setDetailDept('All');
    try {
      const res = await api.get(`/hr/payroll/runs/${run._id}`);
      setRunDetail(res.data.data);
    } catch (err) {
      toast.error('Failed to load run details');
    } finally {
      setDetailLoading(false);
    }
  };

  // Derive unique departments from runDetail records
  const detailDepartments = runDetail ? ['All', ...new Set(runDetail.records.map(r => r.department || 'Unassigned'))].sort() : [];

  const filteredDetailRecords = runDetail 
    ? (detailDept === 'All' ? runDetail.records : runDetail.records.filter(r => (r.department || 'Unassigned') === detailDept))
    : [];

  const approveRun = async (runId) => {
    setApproving(runId);
    try {
      await api.patch(`/hr/payroll/runs/${runId}/approve`);
      toast.success('Payroll approved and marked as disbursed!');
      fetchRuns();
      close();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setApproving(null);
    }
  };

  const columns = [
    { key: 'monthLabel', label: 'Pay Period', render: (val) => (
      <div className="flex items-center gap-2">
        <RiHistoryLine className="text-brand-teal w-4 h-4" />
        <span className="font-semibold text-content-primary">{val}</span>
      </div>
    )},
    { key: 'employeeCount', label: 'Employees', align: 'center', render: (val) => (
      <div className="flex items-center justify-center gap-1">
        <RiGroupLine className="w-3.5 h-3.5 text-content-tertiary" />
        <span className="font-medium">{val}</span>
      </div>
    )},
    { key: 'totalGross', label: 'Gross', align: 'right', render: (val) => (
      <span className="font-medium">{formatCurrency(val)}</span>
    )},
    { key: 'totalDeductions', label: 'Deductions', align: 'right', render: (val) => (
      <span className="text-state-danger text-sm">- {formatCurrency(val)}</span>
    )},
    { key: 'totalNet', label: 'Net Payout', align: 'right', render: (val) => (
      <span className="font-black text-brand-teal">{formatCurrency(val)}</span>
    )},
    { key: 'status', label: 'Status', render: (val) => (
      <Badge variant={STATUS_VARIANT[val]}>{val.toUpperCase()}</Badge>
    )},
    { key: 'actions', label: '', align: 'right', render: (_, row) => (
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" icon={RiArrowRightSLine} onClick={() => openRunDetail(row)}>
          Details
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-state-danger hover:bg-state-danger/10"
          onClick={async (e) => {
            e.stopPropagation();
            if (window.confirm('Are you sure you want to delete this payroll run? This cannot be undone.')) {
              try {
                await api.delete(`/hr/payroll/runs/${row._id}`);
                toast.success('Payroll run deleted');
                fetchRuns();
              } catch (err) {
                toast.error('Failed to delete payroll run');
              }
            }
          }}
        >
          Delete
        </Button>
      </div>
    )}


  ];

  const payslipColumns = [
    { key: 'employeeName', label: 'Employee', render: (val, row) => (
      <div className="flex items-center gap-2">
        <Avatar name={val} size="xs" />
        <div>
          <p className="text-sm font-semibold text-content-primary">{val}</p>
          <p className="text-[10px] text-content-tertiary uppercase font-bold">{row.department}</p>
        </div>
      </div>
    )},
    { key: 'grossPay', label: 'Gross', align: 'right', render: (val) => formatCurrency(val) },
    { key: 'leaveDays', label: 'Leaves', align: 'center', render: (val, row) => (
      <span className={val > row.freeLeaveAllowance ? 'text-state-danger font-bold' : 'text-content-tertiary'}>{val}d</span>
    )},
    { key: 'leaveDeduction', label: 'Deduction', align: 'right', render: (val) => (
      <span className={val > 0 ? 'text-state-danger' : 'text-content-tertiary'}>{val > 0 ? `- ${formatCurrency(val)}` : '—'}</span>
    )},
    { key: 'netPay', label: 'Net Pay', align: 'right', render: (val) => (
      <span className="font-black text-brand-teal">{formatCurrency(val)}</span>
    )},
    { key: 'status', label: 'Status', render: (val, row) => (
      <div className="flex items-center gap-3">
        <Badge variant={val === 'paid' ? 'success' : 'warning'}>{val.toUpperCase()}</Badge>
        {val !== 'paid' && (
          <Button 
            variant="ghost" 
            size="xs" 
            className="h-6 text-[10px] font-black uppercase tracking-tight text-brand-teal hover:bg-brand-teal/10 border border-brand-teal/20"
            onClick={() => handlePayIndividual(row._id)}
          >
            Pay
          </Button>
        )}
      </div>
    )}
  ];

  const handlePayIndividual = async (recordId) => {
    try {
      const res = await api.patch(`/hr/payroll/runs/${selectedRun._id}/records/${recordId}/pay`);
      toast.success('Employee marked as paid!');
      setRunDetail(res.data.data); // Update modal data
      fetchRuns(); // Update history list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    }
  };


  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
    </div>
  );

  return (
    <div className="page-container">
      <PageHeader
        title="Payroll History"
        subtitle="Browse all past payroll runs, review employee payslips and approve disbursements"
      />

      {runs.length === 0 ? (
        <div className="glass-card p-16 text-center text-content-tertiary">
          <RiHistoryLine className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-sm font-bold uppercase tracking-widest">No payroll runs found</p>
          <p className="text-xs mt-1">Run a payroll cycle first to see history here</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Payroll Cycles</CardTitle>
            <CardDescription>Click any row to view employee-level payslips</CardDescription>
          </CardHeader>
          <DataTable columns={columns} data={runs} />
        </Card>
      )}

      {/* Run Detail Modal */}
      <Modal
        isOpen={isOpen}
        onClose={close}
        title={selectedRun ? `Payroll — ${selectedRun.monthLabel}` : 'Payroll Details'}
        size="xl"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <RiLoader4Line className="w-8 h-8 text-brand-teal animate-spin" />
          </div>
        ) : runDetail ? (
          <div className="space-y-4">
            {/* Summary Banner */}
            <div className="flex items-center justify-between p-4 bg-surface-elevated border border-border">
              <div className="flex gap-8">
                <div>
                  <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Total Net</p>
                  <p className="text-lg font-black text-brand-teal">{formatCurrency(runDetail.totalNet)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Deductions</p>
                  <p className="text-lg font-black text-state-danger">- {formatCurrency(runDetail.totalDeductions)}</p>
                </div>
              </div>
              <Badge variant={STATUS_VARIANT[runDetail.status]} className="text-sm">
                {runDetail.status.toUpperCase()}
              </Badge>
            </div>

            {/* Dept Filter Tabs */}
            <div className="flex bg-surface-secondary/50 p-1 rounded-none border border-border self-start">
              {detailDepartments.map(dept => (
                <button
                  key={dept}
                  onClick={() => setDetailDept(dept)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                    detailDept === dept ? 'bg-brand-teal text-white shadow-sm' : 'text-content-tertiary hover:text-content-primary'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Employee Payslips Table */}
            <DataTable columns={payslipColumns} data={filteredDetailRecords} />

            {/* Action Footer */}
            {runDetail.status !== 'disbursed' && (
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <p className="text-xs text-content-secondary flex items-center gap-2">
                  <RiMoneyDollarBoxLine className="text-state-warning w-4 h-4" />
                  Approving will mark all employee records as "Paid" and cannot be undone.
                </p>
                <Button
                  icon={RiCheckDoubleLine}
                  onClick={() => approveRun(runDetail._id)}
                  disabled={approving === runDetail._id}
                >
                  {approving === runDetail._id ? 'Processing...' : 'Approve & Disburse'}
                </Button>
              </div>
            )}
            {runDetail.status === 'disbursed' && (
              <div className="flex items-center gap-2 text-state-success text-sm font-bold p-3 bg-state-success/10 border border-state-success/20">
                <RiCheckDoubleLine className="w-4 h-4" />
                This payroll has been approved and disbursed.
                {runDetail.approvedBy && <span className="text-content-secondary font-normal ml-1">by {runDetail.approvedBy?.name}</span>}
              </div>
            )}
          </div>
        ) : null}
      </Modal>

    </div>
  );
}
