import { RiFilterLine, RiSearchLine, RiMoneyDollarCircleLine, RiInformationLine, RiPulseLine, RiCheckboxCircleLine, RiAlertLine, RiAddLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency } from '../../../core';

export default function DeductionsPage() {
  const adjustments = [
    { id: 'AD-001', employee: 'Ramesh Kumar', type: 'Deduction', category: 'Loan EMI', amount: 5000, status: 'approved', date: 'Mar 15, 2026' },
    { id: 'AD-002', employee: 'Suresh Pal', type: 'Bonus', category: 'Performance Bonus', amount: 15000, status: 'pending', date: 'Mar 20, 2026' },
    { id: 'AD-003', employee: 'Karan Varma', type: 'Deduction', category: 'Advance Recovery', amount: 2500, status: 'approved', date: 'Mar 22, 2026' },
    { id: 'AD-004', employee: 'Manoj Singh', type: 'Bonus', category: 'Referral Bonus', amount: 5000, status: 'approved', date: 'Mar 25, 2026' },
  ];

  const columns = [
    { key: 'id', label: 'ID', render: (val) => <span className="font-bold text-content-primary">#{val}</span> },
    { key: 'employee', label: 'Employee', render: (val) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-surface-hover flex items-center justify-center text-brand-teal font-bold border border-border">
          {val.charAt(0)}
        </div>
        <span className="text-sm font-semibold text-content-primary">{val}</span>
      </div>
    )},
    { key: 'type', label: 'Type', render: (val) => (
      <Badge variant={val === 'Bonus' ? 'success' : 'danger'}>{val.toUpperCase()}</Badge>
    )},
    { key: 'category', label: 'Reason' },
    { key: 'amount', label: 'Value', align: 'right', render: (val, row) => (
      <span className={`font-bold ${row.type === 'Bonus' ? 'text-brand-teal' : 'text-state-warning'}`}>
        {row.type === 'Bonus' ? '+' : '-'}{formatCurrency(val)}
      </span>
    )},
    { key: 'status', label: 'Status', render: (val) => <Badge status={val}>{val.toUpperCase()}</Badge> },
    { key: 'date', label: 'Scheduled' },
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Deductions & Bonuses" 
        subtitle="Manage custom salary adjustments, performance bonuses, and loan recoveries"
      >
        <Button icon={RiAddLine}>New Adjustment</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Adj. (Mar)', val: adjustments.length, icon: RiMoneyDollarCircleLine },
          { label: 'Net Change', val: formatCurrency(12500), icon: RiPulseLine, color: 'text-brand-teal' },
          { label: 'Applied', val: 3, icon: RiCheckboxCircleLine, color: 'text-state-success' },
          { label: 'Pending Action', val: 1, icon: RiAlertLine, color: 'text-state-warning' }
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest leading-none">{stat.label}</p>
                <h4 className={`text-xl font-black mt-2 ${stat.color || 'text-content-primary'}`}>{stat.val}</h4>
              </div>
              <stat.icon className="w-6 h-6 text-content-tertiary opacity-30" />
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <Select options={[{ label: 'All Adjustments', value: 'all' }, { label: 'Bonuses Only', value: 'bonus' }, { label: 'Deductions Only', value: 'deduction' }]} className="w-48" />
              <Select options={[{ label: 'Internal Staff', value: 'staff' }, { label: 'Distributor Incentives', value: 'dist' }]} className="w-48" />
            </div>
            <div className="flex items-center gap-2">
              <Input icon={RiSearchLine} placeholder="Search adjustment..." className="w-64" />
              <Button variant="secondary" icon={RiFilterLine}>Filters</Button>
            </div>
          </div>
        </CardHeader>
        <DataTable columns={columns} data={adjustments} />
      </Card>
    </div>
  );
}
