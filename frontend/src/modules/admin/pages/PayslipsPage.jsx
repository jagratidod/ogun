import { RiFileLine, RiDownloadLine, RiSearchLine, RiFilterLine, RiUserLine, RiCalendarLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency } from '../../../core';
import hrData from '../../../data/hr.json';

export default function PayslipsPage() {
  const { employees } = hrData;

  const mockPayslips = employees.map(emp => ({
    id: `PS-${emp.id}-${new Date().getFullYear()}`,
    employeeName: emp.name,
    employeeId: emp.id,
    month: 'March 2026',
    gross: emp.salary,
    deductions: emp.salary * 0.12, // Mock 12% deductions
    net: emp.salary * 0.88,
    status: 'generated'
  }));

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
    { key: 'month', label: 'Period' },
    { key: 'gross', label: 'Gross Pay', align: 'right', render: (val) => <span className="font-medium">{formatCurrency(val)}</span> },
    { key: 'deductions', label: 'Deductions', align: 'right', render: (val) => <span className="text-state-danger">{formatCurrency(val)}</span> },
    { key: 'net', label: 'Net Pay', align: 'right', render: (val) => <span className="font-bold text-brand-teal">{formatCurrency(val)}</span> },
    { key: 'status', label: 'Status', render: (val) => <Badge status="success">Released</Badge> },
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
      <Button variant="icon" title="Download PDF">
        <RiDownloadLine className="w-4 h-4" />
      </Button>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Employee Payslips" 
        subtitle="Access and manage historical salary statements for all staff members"
      >
        <Button icon={RiDownloadLine} variant="secondary">Bulk Export (PDF)</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Payslips (Mar)', val: mockPayslips.length, icon: RiFileLine },
          { label: 'Total Disbursed', val: formatCurrency(mockPayslips.reduce((acc, curr) => acc + curr.net, 0)), icon: RiCalendarLine },
          { label: 'Pending Downloads', val: 0, icon: RiDownloadLine }
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest">{stat.label}</p>
                <h4 className="text-xl font-black text-content-primary mt-1">{stat.val}</h4>
              </div>
              <stat.icon className="w-5 h-5 text-brand-teal opacity-50" />
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <Select options={[
                { label: 'March 2026', value: 'mar26' },
                { label: 'February 2026', value: 'feb26' },
                { label: 'January 2026', value: 'jan26' }
              ]} className="w-48" />
              <Select options={[{ label: 'All Departments', value: 'all' }, { label: 'Sales', value: 'sales' }, { label: 'Service', value: 'service' }]} className="w-48" />
            </div>
            <div className="flex items-center gap-2">
              <Input icon={RiSearchLine} placeholder="Search by name or ID..." className="w-64" />
              <Button variant="secondary" icon={RiFilterLine}>Filters</Button>
            </div>
          </div>
        </CardHeader>
        <DataTable columns={columns} data={mockPayslips} />
      </Card>
    </div>
  );
}
