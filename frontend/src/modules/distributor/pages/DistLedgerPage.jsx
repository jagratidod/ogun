import { RiFileList3Line, RiArrowDownLine, RiArrowUpLine, RiFilterLine, RiSearchLine, RiDownloadLine, RiMoneyDollarBoxLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime } from '../../../core';
import accounts from '../../../data/accounts.json';

export default function DistLedgerPage() {
  const { ledger } = accounts; // Reuse main ledger for dummy

  const columns = [
    { key: 'date', label: 'Date', sortable: true, render: (val) => (
       <div className="flex flex-col">
          <span className="text-sm font-medium text-content-primary">{formatDateTime(val).split(',')[0]}</span>
          <span className="text-[10px] text-content-tertiary">{formatDateTime(val).split(',')[1]}</span>
       </div>
    )},
    { key: 'id', label: 'Transaction ID', render: (val) => (
      <span className="font-bold text-content-primary">{val}</span>
    )},
    { key: 'description', label: 'Description', flex: 1 },
    { key: 'type', label: 'Type', align: 'center', render: (val) => (
       <Badge variant={val === 'credit' ? 'success' : 'danger'}>
          {val === 'credit' ? <RiArrowDownLine className="mr-1 inline" /> : <RiArrowUpLine className="mr-1 inline" />}
          {val.toUpperCase()}
       </Badge>
    )},
    { key: 'amount', label: 'Requested Value', align: 'right', render: (val, row) => (
       <span className={`font-bold ${row.type === 'credit' ? 'text-state-success' : 'text-state-warning'}`}>
          {formatCurrency(val)}
       </span>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Distributor Ledger" 
        subtitle="Tracking accounts receivables and payables for your distribution node"
      >
        <Button icon={RiDownloadLine} variant="secondary">Download FY Statement</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-2">
         <Card className="bg-brand-teal/5 border-brand-teal/10">
            <div className="p-6">
               <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Total Receivables</p>
               <h4 className="text-3xl font-black text-brand-teal">{formatCurrency(850000)}</h4>
               <p className="text-xs text-content-tertiary mt-2">From Retailers Network</p>
            </div>
         </Card>
         <Card className="bg-state-warning/5 border-state-warning/10">
            <div className="p-6">
               <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Total Payables</p>
               <h4 className="text-3xl font-black text-state-warning">{formatCurrency(245000)}</h4>
               <p className="text-xs text-content-tertiary mt-2">To Admin / Warehouse</p>
            </div>
         </Card>
         <Card className="bg-brand-pink/5 border-brand-pink/10">
            <div className="p-6">
               <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Net Position</p>
               <h4 className="text-3xl font-black text-brand-pink">{formatCurrency(605000)}</h4>
               <p className="text-xs text-content-tertiary mt-2">Available Margin</p>
            </div>
         </Card>
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <Select options={[{ label: 'Credits (Inward)', value: 'credit' }, { label: 'Debits (Outward)', value: 'debit' }]} className="w-48" />
              <div className="flex items-center gap-2">
                 <Input icon={RiSearchLine} placeholder="Search transaction ID..." className="w-full md:w-64" />
                 <Button variant="secondary" icon={RiFilterLine}>Filters</Button>
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={ledger} />
      </Card>
    </div>
  );
}
