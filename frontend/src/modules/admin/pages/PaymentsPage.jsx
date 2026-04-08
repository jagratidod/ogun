import { RiBankCardLine, RiSearchLine, RiFileDownloadLine, RiTableLine, RiCheckDoubleLine, RiBankLine, RiExchangeLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime } from '../../../core';
import accountsData from '../../../data/accounts.json';

export default function PaymentsPage() {
  const { payments } = accountsData;

  const columns = [
    { key: 'id', label: 'Payment ID', sortable: true, render: (val) => (
      <span className="font-bold text-content-primary">{val}</span>
    )},
    { key: 'invoiceId', label: 'Invoice #', render: (val) => (
      <span className="text-sm font-medium text-brand-teal underline cursor-pointer">{val}</span>
    )},
    { key: 'method', label: 'Payment Method', render: (val) => (
      <div className="flex items-center gap-2">
         {val === 'Bank Transfer' ? <RiBankLine className="w-4 h-4 text-brand-teal" /> : <RiExchangeLine className="w-4 h-4 text-brand-pink" />}
         <span className="text-sm font-medium text-content-primary">{val}</span>
      </div>
    )},
    { key: 'date', label: 'Processing Date', render: (val) => (
       <span className="text-sm text-content-secondary">{val}</span>
    )},
    { key: 'amount', label: 'Amount', align: 'right', render: (val) => (
       <span className="font-bold text-state-success">{formatCurrency(val)}</span>
    )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge status={val.toLowerCase()}>{val}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={RiTableLine}>Journal Entry</Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Incoming Payments" 
        subtitle="Manage and verify all inward digital transfers and cash payments"
      >
        <Button icon={RiCheckDoubleLine}>Reconcile Statements</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
           { label: 'Today Total', val: 125000, trend: 12 },
           { label: 'Weekly Total', val: 840000, trend: 8 },
           { label: 'Monthly Total', val: 3254000, trend: 15 },
           { label: 'Avg Collection Time', val: '4.2 Days', trend: -5 }
        ].map((item) => (
           <div key={item.label} className="glass-card p-4">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{item.label}</p>
              <h4 className="text-xl font-bold text-content-primary">
                 {typeof item.val === 'number' ? formatCurrency(item.val) : item.val}
              </h4>
              <div className={`mt-1 text-[10px] font-bold ${item.trend > 0 ? 'text-state-success' : 'text-state-warning'}`}>
                 {item.trend > 0 ? '↑' : '↓'} {Math.abs(item.trend)}% vs prev
              </div>
           </div>
        ))}
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <Select options={[
                 { label: 'Bank Transfers', value: 'bank' },
                 { label: 'Digital Wallets/UPI', value: 'upi' },
                 { label: 'Cash on Delivery', value: 'cod' }
              ]} className="w-48" />
              <div className="flex items-center gap-2">
                 <Input icon={RiSearchLine} placeholder="Search #, retailer..." className="w-full md:w-64" />
                 <Button variant="secondary" icon={RiFileDownloadLine}>Download Log</Button>
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={payments} />
      </Card>
    </div>
  );
}
