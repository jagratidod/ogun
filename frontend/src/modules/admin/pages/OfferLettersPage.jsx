import { RiMailSendLine, RiDownloadLine, RiSearchLine, RiAddLine, RiSendPlaneLine, RiCheckDoubleLine, RiTimeLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Input, Select, formatCurrency } from '../../../core';
import Button from '../../../core/components/ui/Button';

export default function OfferLettersPage() {
  const offers = [
    { id: 'OFF-101', candidate: 'Aryan Malhotra', role: 'Area Sales Manager', department: 'Sales', salary: 1450000, date: 'Apr 02, 2026', status: 'signed' },
    { id: 'OFF-102', candidate: 'Sanya Gupta', role: 'Support Engineer', department: 'Service', salary: 650000, date: 'Apr 05, 2026', status: 'sent' },
    { id: 'OFF-103', candidate: 'Ishaan Verma', role: 'Logistics Head', department: 'Operations', salary: 1800000, date: 'Apr 06, 2026', status: 'sent' },
    { id: 'OFF-104', candidate: 'Zoya Khan', role: 'HR Executive', department: 'HR', salary: 550000, date: 'Apr 06, 2026', status: 'draft' },
  ];

  const columns = [
    { key: 'candidate', label: 'Candidate', render: (val) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-surface-hover flex items-center justify-center text-brand-teal font-bold border border-border">
          {val.charAt(0)}
        </div>
        <span className="text-sm font-semibold text-content-primary">{val}</span>
      </div>
    )},
    { key: 'role', label: 'Position' },
    { key: 'salary', label: 'Annual CTC', render: (val) => formatCurrency(val) },
    { key: 'date', label: 'Issued On' },
    { key: 'status', label: 'Status', render: (val) => (
      <Badge status={val === 'signed' ? 'success' : val === 'sent' ? 'warning' : 'info'}>
        {val.toUpperCase()}
      </Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (val, row) => (
      <div className="flex justify-end gap-1">
        {row.status === 'draft' ? (
          <Button variant="ghost" size="sm" icon={RiSendPlaneLine}>Send Now</Button>
        ) : (
          <Button variant="icon" title="Download Copy">
            <RiDownloadLine className="w-4 h-4" />
          </Button>
        )}
      </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Official Offer Letters" 
        subtitle="Manage end-to-end recruitment documents and candidate onboarding offers"
      >
        <Button icon={RiAddLine}>Generate New Offer</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Signature', val: 2, icon: RiTimeLine, color: 'text-state-warning' },
          { label: 'Released (Apr)', val: 4, icon: RiSendPlaneLine, color: 'text-brand-teal' },
          { label: 'Accepted', val: 1, icon: RiCheckDoubleLine, color: 'text-state-success' },
          { label: 'Acceptance Rate', val: '86%', icon: RiMailSendLine, color: 'text-content-primary' }
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest">{stat.label}</p>
                <h4 className={`text-xl font-black mt-1 ${stat.color}`}>{stat.val}</h4>
              </div>
              <stat.icon className="w-5 h-5 text-content-tertiary opacity-30" />
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <Select options={[{ label: 'All Status', value: 'all' }, { label: 'Sent', value: 'sent' }, { label: 'Signed', value: 'signed' }]} className="w-48" />
              <Select options={[{ label: 'All Dept', value: 'all' }, { label: 'Sales', value: 'sales' }, { label: 'Service', value: 'service' }]} className="w-48" />
            </div>
            <Input icon={RiSearchLine} placeholder="Search candidate or role..." className="w-64" />
          </div>
        </CardHeader>
        <DataTable columns={columns} data={offers} />
        <div className="p-4 bg-surface-elevated flex items-center gap-2">
          <RiMailSendLine className="text-brand-teal w-4 h-4" />
          <p className="text-xs text-content-secondary">Offers are sent via automated secure links with e-signature tracking enabled.</p>
        </div>
      </Card>
    </div>
  );
}
