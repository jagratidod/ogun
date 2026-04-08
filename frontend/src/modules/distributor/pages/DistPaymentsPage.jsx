import { RiBankCardLine, RiSearchLine, RiFileDownloadLine, RiTableLine, RiCheckDoubleLine, RiBankLine, RiExchangeLine, RiWalletLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency } from '../../../core';
import accounts from '../../../data/accounts.json';

export default function DistPaymentsPage() {
  const { payments } = accounts;

  const columns = [
    { key: 'id', label: 'Payment ID', sortable: true, render: (val) => (
      <span className="font-bold text-content-primary">{val}</span>
    )},
    { key: 'invoiceId', label: 'Invoice #', render: (val) => (
      <span className="text-sm font-medium text-brand-teal underline cursor-pointer">{val}</span>
    )},
    { key: 'method', label: 'Processing Via', render: (val) => (
      <div className="flex items-center gap-2">
         <RiBankLine className="w-3.5 h-3.5 text-brand-teal" />
         <span className="text-sm font-medium text-content-primary">{val}</span>
      </div>
    )},
    { key: 'date', label: 'Date', render: (val) => <span className="text-sm text-content-secondary">{val}</span> },
    { key: 'amount', label: 'Amount', align: 'right', render: (val) => (
       <span className="font-black text-state-success">{formatCurrency(val)}</span>
    )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge status={val.toLowerCase()}>{val}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={RiTableLine}>Entry Note</Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Distributor Payments" 
        subtitle="Manage settlements from retailers and outward payments to Admin"
       >
        <Button icon={RiCheckDoubleLine}>Reconcile Statements</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-2">
         {[
           { label: 'Weekly Inwards', val: 345000, color: 'text-state-success' },
           { label: 'Pending Outwards', val: 125000, color: 'text-state-warning' },
           { label: 'GST Input Credit', val: 12450, color: 'text-brand-teal' },
           { label: 'Settlement Status', val: 'Verified', color: 'text-state-success' }
         ].map(stat => (
           <div key={stat.label} className="glass-card p-4">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h4 className={`text-xl font-bold ${stat.color}`}>{typeof stat.val === 'number' ? formatCurrency(stat.val) : stat.val}</h4>
           </div>
         ))}
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <Select options={[{ label: 'Store Collections', value: 'inwards' }, { label: 'Admin Payments', value: 'outwards' }]} className="w-48" />
              <div className="flex items-center gap-2">
                 <Input icon={RiSearchLine} placeholder="Search #, retailer store..." className="w-full md:w-64" />
                 <Button variant="secondary" icon={RiFileDownloadLine}>Download Log</Button>
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={payments} />
      </Card>
    </div>
  );
}
