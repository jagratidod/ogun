import { useState, useMemo, useEffect } from 'react';
import { RiMoneyDollarBoxLine, RiCheckDoubleLine, RiArrowRightLine, RiTimeLine, RiInformationLine, RiBankLine, RiLoader4Line, RiHistoryLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, Badge, DataTable, formatCurrency } from '../../../core';
import Button from '../../../core/components/ui/Button';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function SalaryProcessPage() {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);

  useEffect(() => {
    fetchPreview();
  }, []);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hr/payroll/preview');
      setPreview(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch payroll preview');
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = async () => {
    if (!preview) return;
    
    setIsProcessing(true);
    const loadToast = toast.loading('Processing payroll disbursement...');
    
    try {
        const res = await api.post('/hr/payroll/runs', {
            month: preview.month,
            year: preview.year,
            records: preview.records
        });
        
        toast.dismiss(loadToast);
        toast.success(`Disbursement complete for ${res.data.data.records.length} employees.`);
        setIsFinalized(true);
    } catch (error) {
        toast.dismiss(loadToast);
        toast.error(error.response?.data?.message || 'Failed to process payroll');
    } finally {
        setIsProcessing(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Employee', render: (val, row) => (
       <div className="flex flex-col">
           <span className="text-sm font-semibold text-content-primary">{row.employeeName}</span>
           <span className="text-[10px] text-content-tertiary uppercase font-bold">{row.role?.replace('_', ' ')}</span>
       </div>
    )},
    { key: 'baseSalary', label: 'Base Pay', align: 'right', render: (val) => formatCurrency(val) },
    { key: 'allowances', label: 'Allowances', align: 'right', render: (val) => (
        <span className="text-state-success">+{formatCurrency(val)}</span>
    )},
    { key: 'deductions', label: 'Deductions', align: 'right', render: (val) => (
       <span className="text-sm text-state-danger">-{formatCurrency(val)}</span>
    )},
    { key: 'netSalary', label: 'Net Payable', align: 'right', render: (val) => (
       <span className="font-bold text-brand-teal">{formatCurrency(val)}</span>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <Button variant="ghost" size="sm" icon={RiInformationLine}>Adjust</Button>
    )}
  ];

  if (loading || !preview) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-5xl mx-auto">
      <PageHeader 
        title={`Process Salary Cycle - ${preview.monthLabel}`} 
        subtitle="Review and initiate the disbursement of staff payroll"
      >
        <div className="flex gap-2">
            <Button variant="secondary" icon={RiHistoryLine} onClick={fetchPreview}>Refresh</Button>
            <Button icon={RiMoneyDollarBoxLine} onClick={handleRunPayroll} disabled={isProcessing || isFinalized}>
            {isFinalized ? 'Disbursement Complete' : isProcessing ? 'Processing...' : 'Initiate Disbursement'}
            </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="glass-card p-6 border-l-4 border-brand-teal">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-2">Total Payable</p>
            <h4 className="text-3xl font-bold text-content-primary">{formatCurrency(preview.totalNet)}</h4>
            <p className="text-xs text-content-tertiary mt-2">Across {preview.records.length} active staff profiles</p>
         </div>
         <div className="glass-card p-6 border-l-4 border-state-warning">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-2">Cycle Status</p>
            <h4 className={`text-2xl font-bold ${isFinalized ? 'text-state-success' : 'text-state-warning'}`}>
               {isFinalized ? 'Disbursed' : 'Pending Review'}
            </h4>
            <p className="text-xs text-content-tertiary mt-2">{isFinalized ? 'Paid on '+new Date().toLocaleDateString() : 'Draft preview'}</p>
         </div>
         <div className="glass-card p-6 border-l-4 border-brand-pink">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-2">Target Date</p>
            <h4 className="text-2xl font-bold text-brand-pink">01st {preview.monthLabel.split(' ')[0]}</h4>
            <p className="text-xs text-content-tertiary mt-2">Automatic banking trigger</p>
         </div>
      </div>

      <Card>
        <CardHeader>
           <div className="flex items-center justify-between w-full">
              <div>
                 <CardTitle>Payroll Worksheet</CardTitle>
                 <CardDescription>Individual payout summary including statutory deductions</CardDescription>
              </div>
              <Button variant="secondary" icon={RiBankLine}>Bank Format (CSV)</Button>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={preview.records} />
        <div className="p-6 bg-surface-elevated flex items-center justify-between">
           <div className="flex items-center gap-2">
              <RiInformationLine className="text-brand-teal w-5 h-5" />
              <p className="text-xs text-content-secondary">All figures are real-time calculated based on DB records.</p>
           </div>
           <div className="flex items-center gap-4">
              <Button variant="ghost" disabled={isFinalized} onClick={fetchPreview}>Re-calculate All</Button>
              <Button icon={RiArrowRightLine} onClick={handleRunPayroll} disabled={isProcessing || isFinalized}>
                 {isFinalized ? 'Finalized' : 'Finalize Payouts'}
              </Button>
           </div>
        </div>
      </Card>
    </div>
  );
}

