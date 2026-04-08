import { useState, useMemo } from 'react';
import { RiFileList3Line, RiArrowDownLine, RiArrowUpLine, RiFilterLine, RiSearchLine, RiDownloadLine, RiHistoryLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime } from '../../../core';
import accountsData from '../../../data/accounts.json';

export default function LedgerPage() {
  const { ledger } = accountsData;
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLedger = useMemo(() => {
    return ledger.filter(item => {
      const matchType = typeFilter === 'all' || item.type === typeFilter;
      const matchSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [ledger, typeFilter, searchTerm]);

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
    { key: 'amount', label: 'Amount', align: 'right', render: (val, row) => (
       <span className={`font-bold ${row.type === 'credit' ? 'text-state-success' : 'text-state-danger'}`}>
          {row.type === 'credit' ? '+' : '-'}{formatCurrency(val)}
       </span>
    )},
    { key: 'balance', label: 'Balance', align: 'right', render: (val) => (
       <span className="text-sm text-content-secondary font-medium">{formatCurrency(val)}</span>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="General Ledger" 
        subtitle="Tracking every credit and debit across our entire business"
      >
        <Button icon={RiDownloadLine} variant="secondary">Export Statement</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
           <p className="text-xs text-content-tertiary font-bold uppercase tracking-wider mb-2">Total Balance</p>
           <h4 className="text-2xl font-bold text-content-primary">{formatCurrency(ledger[0].balance)}</h4>
           <div className="mt-2 flex items-center gap-1 text-[10px] text-state-success font-bold">
              <RiArrowDownLine /> ₹8,500 pending credit
           </div>
        </div>
        <div className="glass-card p-5">
           <p className="text-xs text-content-tertiary font-bold uppercase tracking-wider mb-2">Month to Date Credits</p>
           <h4 className="text-2xl font-bold text-state-success">{formatCurrency(310000)}</h4>
        </div>
        <div className="glass-card p-5">
           <p className="text-xs text-content-tertiary font-bold uppercase tracking-wider mb-2">Month to Date Debits</p>
           <h4 className="text-2xl font-bold text-state-danger">{formatCurrency(535000)}</h4>
        </div>
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                 <Select 
                   value={typeFilter}
                   onChange={(e) => setTypeFilter(e.target.value)}
                   options={[
                      { label: 'All Transactions', value: 'all' },
                      { label: 'Credits Only', value: 'credit' },
                      { label: 'Debits Only', value: 'debit' }
                   ]} 
                   className="w-40" 
                 />
                 <Select options={[
                    { label: 'This Month', value: 'this-month' },
                    { label: 'Last Month', value: 'last-month' },
                    { label: 'This Quarter', value: 'this-quarter' }
                 ]} className="w-40" />
              </div>
              <div className="flex items-center gap-2">
                 <Input 
                   icon={RiSearchLine} 
                   placeholder="Search ID or description..." 
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

