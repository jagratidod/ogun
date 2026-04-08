import { useState, useMemo } from 'react';
import { RiShoppingBag3Line, RiSearchLine, RiFilterLine, RiEyeLine, RiFileDownloadLine, RiPrinterLine, RiTimeLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime } from '../../../core';

const history = [
  { id: 'SL-998', customer: 'Rahul Verma', items: 3, total: 12500, status: 'Completed', method: 'UPI', date: '2026-04-06T10:30:00' },
  { id: 'SL-997', customer: 'Anita Singh', items: 1, total: 8400, status: 'Completed', method: 'Cash', date: '2026-04-06T09:15:00' },
  { id: 'SL-994', customer: 'Amit Shah', items: 12, total: 45600, status: 'Completed', method: 'Card', date: '2026-04-05T18:45:00' }
];

export default function SalesHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  const filteredHistory = useMemo(() => {
    return history.filter(h => {
      const matchSearch = h.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          h.customer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isToday = new Date(h.date).toDateString() === new Date().toDateString();
      const matchTime = timeFilter === 'all' || (timeFilter === 'today' && isToday);
      
      return matchSearch && matchTime;
    });
  }, [searchTerm, timeFilter]);

  const columns = [
    { key: 'id', label: 'Sale ID', sortable: true, render: (val) => (
      <span className="font-bold text-content-primary">#{val}</span>
    )},
    { key: 'date', label: 'Processing On', sortable: true, render: (val) => (
       <div className="flex flex-col">
          <span className="text-sm font-medium text-content-primary">{formatDateTime(val).split(',')[0]}</span>
          <span className="text-[10px] text-content-tertiary">{formatDateTime(val).split(',')[1]}</span>
       </div>
    )},
    { key: 'customer', label: 'Customer', flex: 1 },
    { key: 'items', label: 'Qty', align: 'center', render: (val) => (
       <Badge variant="info">{val} Items</Badge>
    )},
    { key: 'total', label: 'Final Value', align: 'right', sortable: true, render: (val) => (
       <span className="font-bold text-brand-teal">{formatCurrency(val)}</span>
    )},
    { key: 'method', label: 'Via', align: 'center', render: (val) => (
       <Badge variant="teal" size="xs">{val}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <div className="flex justify-end gap-1">
          <Button variant="icon" title="View Transaction">
             <RiEyeLine className="w-4 h-4" />
          </Button>
          <Button variant="icon" title="Print Invoice">
             <RiPrinterLine className="w-4 h-4" />
          </Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Transaction Ledger" 
        subtitle="Manage and audit all historical point-of-sale entries and invoices"
      >
        <Button icon={RiFileDownloadLine} variant="secondary">Sync POS Terminal</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-2">
         {[
           { label: 'Weekly Gross', val: 456000, color: 'text-brand-teal' },
           { label: 'UPI Payout', val: 312000, color: 'text-state-success' },
           { label: 'Cash Balance', val: 124000, color: 'text-state-warning' },
           { label: 'Avg Sale Value', val: 12450, color: 'text-content-secondary' }
         ].map(stat => (
           <div key={stat.label} className="glass-card p-4">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h4 className={`text-xl font-bold ${stat.color}`}>{typeof stat.val === 'number' ? formatCurrency(stat.val) : stat.val}</h4>
           </div>
         ))}
      </div>

      <Card>
         <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 max-sm:w-full max-w-sm">
               <Input 
                 icon={RiSearchLine} 
                 placeholder="Search sale ID or consumer name..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="flex gap-2">
               <Select 
                 value={timeFilter}
                 onChange={(e) => setTimeFilter(e.target.value)}
                 options={[{ label: 'All History', value: 'all' }, { label: 'Today Only', value: 'today' }]} 
                 className="w-40" 
               />
               <Button variant="secondary" icon={RiFilterLine}>Filters</Button>
            </div>
         </CardHeader>
         <DataTable columns={columns} data={filteredHistory} />
      </Card>
    </div>
  );
}

