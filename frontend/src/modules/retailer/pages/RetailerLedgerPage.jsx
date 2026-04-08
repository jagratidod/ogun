import { useState, useMemo } from 'react';
import { RiFileList3Line, RiArrowDownLine, RiArrowUpLine, RiFilterLine, RiSearchLine, RiDownloadLine, RiMoneyDollarBoxLine, RiHandCoinLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime } from '../../../core';
import accounts from '../../../data/accounts.json';

export default function RetailerLedgerPage() {
  const { ledger } = accounts;
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredLedger = useMemo(() => {
    return ledger.filter(item => {
      const matchSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'all' || item.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [ledger, searchTerm, typeFilter]);

  const columns = [
    { key: 'date', label: 'Date', sortable: true, render: (val) => (
       <div className="flex flex-col">
          <span className="text-sm font-medium text-content-primary">{formatDateTime(val).split(',')[0]}</span>
          <span className="text-[10px] text-content-tertiary">{formatDateTime(val).split(',')[1]}</span>
       </div>
    )},
    { key: 'id', label: 'Sale / Pay ID', render: (val) => (
      <span className="font-bold text-content-primary">#{val}</span>
    )},
    { key: 'description', label: 'In-Store Item', flex: 1 },
    { key: 'type', label: 'Flow', align: 'center', render: (val) => (
       <Badge variant={val === 'credit' ? 'success' : 'danger'}>
          {val === 'credit' ? <RiHandCoinLine className="mr-1 inline" /> : <RiArrowUpLine className="mr-1 inline" />}
          {val === 'credit' ? 'SALE' : 'PAY'}
       </Badge>
    )},
    { key: 'amount', label: 'Value', align: 'right', render: (val, row) => (
       <span className={`font-bold ${row.type === 'credit' ? 'text-state-success' : 'text-state-warning'}`}>
          {formatCurrency(val)}
       </span>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Store Ledger" 
        subtitle="Tracking localized daily collections and restock payments"
      >
        <Button icon={RiDownloadLine} variant="secondary">E-Invoice Log</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-2">
         {[
           { label: 'Weekly Revenue', val: 456000, color: 'text-brand-teal' },
           { label: 'Owed to Dist.', val: 24500, color: 'text-state-warning' },
           { label: 'Daily Margin', val: 12450, color: 'text-brand-pink' },
           { label: 'Settlement Plan', val: 'Active', color: 'text-state-success' }
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
              <Select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { label: 'All Transactions', value: 'all' }, 
                  { label: 'Sales Credits', value: 'credit' }, 
                  { label: 'Restock Debits', value: 'debit' }
                ]} 
                className="w-48" 
              />
              <div className="flex items-center gap-2">
                 <Input 
                   icon={RiSearchLine} 
                   placeholder="Search transaction ID..." 
                   className="w-full md:w-64"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <Button variant="secondary" icon={RiFilterLine}>Filters</Button>
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={filteredLedger} />
      </Card>
    </div>
  );
}

