import { useState, useMemo } from 'react';
import { RiMoneyDollarBoxLine, RiCheckDoubleLine, RiArrowRightLine, RiTimeLine, RiInformationLine, RiBankLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, Badge, DataTable, formatCurrency } from '../../../core';
import Button from '../../../core/components/ui/Button';
import hrData from '../../../data/hr.json';
import { toast } from 'react-hot-toast';

export default function SalaryProcessPage() {
  const { employees } = hrData;
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);

  const handleInitiate = () => {
    setIsProcessing(true);
    toast.loading('Contacting integrated banking partner...');
    
    setTimeout(() => {
       toast.dismiss();
       toast.success('Disbursement initiated for 52 employees.');
       setIsProcessing(false);
       setIsFinalized(true);
    }, 2000);
  };

  const columns = [
    { key: 'name', label: 'Employee', render: (val) => (
       <span className="text-sm font-semibold text-content-primary">{val}</span>
    )},
    { key: 'role', label: 'Designation' },
    { key: 'salary', label: 'Gross Pay', align: 'right', render: (val) => (
       <span className="font-bold text-content-primary">{formatCurrency(val)}</span>
    )},
    { key: 'deductions', label: 'Deductions', align: 'right', render: () => (
       <span className="text-sm text-state-danger">- {formatCurrency(2450)}</span>
    )},
    { key: 'net', label: 'Net Payable', align: 'right', render: (_, row) => (
       <span className="font-bold text-brand-teal">{formatCurrency(row.salary - 2450)}</span>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <Button variant="ghost" size="sm" icon={RiInformationLine}>Adjust</Button>
    )}
  ];

  return (
    <div className="page-container max-w-5xl mx-auto">
      <PageHeader 
        title="Process Salary Cycle" 
        subtitle="Review and initiate the disbursement of staff payroll for March 2026"
      >
        <Button icon={RiMoneyDollarBoxLine} onClick={handleInitiate} disabled={isProcessing || isFinalized}>
          {isFinalized ? 'Disbursement Complete' : isProcessing ? 'Processing...' : 'Initiate Disbursement'}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="glass-card p-6 border-l-4 border-brand-teal">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-2">Total Payable</p>
            <h4 className="text-3xl font-bold text-content-primary">{formatCurrency(4560000)}</h4>
            <p className="text-xs text-content-tertiary mt-2">Across 52 active staff profiles</p>
         </div>
         <div className="glass-card p-6 border-l-4 border-state-warning">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-2">Cycle Status</p>
            <h4 className={`text-2xl font-bold ${isFinalized ? 'text-state-success' : 'text-state-warning'}`}>
               {isFinalized ? 'Disbursed' : 'Pending Review'}
            </h4>
            <p className="text-xs text-content-tertiary mt-2">{isFinalized ? 'Paid on '+new Date().toLocaleDateString() : 'Attendance locked by HR'}</p>
         </div>
         <div className="glass-card p-6 border-l-4 border-brand-pink">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-2">Payment Date</p>
            <h4 className="text-2xl font-bold text-brand-pink">30th Apr 2026</h4>
            <p className="text-xs text-content-tertiary mt-2">Bank integration active</p>
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
        <DataTable columns={columns} data={employees} />
        <div className="p-6 bg-surface-elevated flex items-center justify-between">
           <div className="flex items-center gap-2">
              <RiInformationLine className="text-brand-teal w-5 h-5" />
              <p className="text-xs text-content-secondary">All figures are auto-calculated based on attendance and tax slabs.</p>
           </div>
           <div className="flex items-center gap-4">
              <Button variant="ghost" disabled={isFinalized}>Re-calculate All</Button>
              <Button icon={RiArrowRightLine} onClick={handleInitiate} disabled={isProcessing || isFinalized}>
                 {isFinalized ? 'Finalized' : 'Finalize Payouts'}
              </Button>
           </div>
        </div>
      </Card>
    </div>
  );
}

