import { RiFileTextLine, RiSearchLine, RiDownloadLine, RiPrinterLine, RiMailSendLine, RiEyeLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime } from '../../../core';
import accountsData from '../../../data/accounts.json';

export default function InvoicesPage() {
  const { invoices } = accountsData;

  const columns = [
    { key: 'id', label: 'Invoice #', sortable: true, render: (val) => (
      <span className="font-bold text-content-primary">{val}</span>
    )},
    { key: 'customer', label: 'Retailer', sortable: true },
    { key: 'date', label: 'Issue Date', render: (val) => (
       <span className="text-sm text-content-secondary">{val}</span>
    )},
    { key: 'dueDate', label: 'Due Date', render: (val) => (
       <span className="text-sm text-state-warning">{val}</span>
    )},
    { key: 'amount', label: 'Amount', align: 'right', render: (val) => (
       <span className="font-bold text-brand-teal">{formatCurrency(val)}</span>
    )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge status={val.toLowerCase()}>{val}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <div className="flex justify-end gap-1">
          <Button variant="icon">
             <RiEyeLine className="w-4 h-4" />
          </Button>
          <Button variant="icon">
             <RiPrinterLine className="w-4 h-4" />
          </Button>
          <Button variant="icon">
             <RiMailSendLine className="w-4 h-4 text-brand-teal" />
          </Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Sales Invoices" 
        subtitle="Manage and track invoice status across all retailers"
      >
        <Button icon={RiDownloadLine} variant="secondary">Export All</Button>
      </PageHeader>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                 <Select options={[
                    { label: 'All Statuses', value: 'all' },
                    { label: 'Paid Only', value: 'paid' },
                    { label: 'Pending Only', value: 'pending' },
                    { label: 'Overdue Only', value: 'overdue' }
                 ]} className="w-40" />
                 <Select options={[
                    { label: 'Sort by Date', value: 'date' },
                    { label: 'Sort by Amount', value: 'amount' }
                 ]} className="w-40" />
              </div>
              <div className="flex items-center gap-2">
                 <Input icon={RiSearchLine} placeholder="Search #, customer..." className="w-full md:w-64" />
                 <Button variant="secondary" icon={RiPrinterLine}>Batch Print</Button>
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={invoices} />
      </Card>
    </div>
  );
}
