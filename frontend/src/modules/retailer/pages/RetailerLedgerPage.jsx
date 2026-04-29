import { useState, useMemo, useEffect } from 'react';
import { RiFileList3Line, RiArrowDownLine, RiArrowUpLine, RiFilterLine, RiSearchLine, RiDownloadLine, RiMoneyDollarBoxLine, RiHandCoinLine, RiLoader4Line, RiHistoryLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime } from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function RetailerLedgerPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ transactions: [], stats: { balance: 0, totalTransactions: 0 } });
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await api.get('/retailer/ledger');
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch ledger');
    } finally {
      setLoading(false);
    }
  };

  const filteredLedger = useMemo(() => {
    return data.transactions.filter(item => {
      const matchSearch = item.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'all' || 
                       (typeFilter === 'credit' && item.type === 'income') || 
                       (typeFilter === 'debit' && item.type === 'expense');
      return matchSearch && matchType;
    });
  }, [data.transactions, searchTerm, typeFilter]);

  const columns = [
    { key: 'createdAt', label: 'Date', sortable: true, render: (val) => (
       <div className="flex flex-col">
          <span className="text-sm font-medium text-content-primary">{formatDateTime(val).split(',')[0]}</span>
          <span className="text-[10px] text-content-tertiary">{formatDateTime(val).split(',')[1]}</span>
       </div>
    )},
    { key: 'transactionId', label: 'Reference ID', render: (val) => (
      <span className="font-bold text-content-primary">#{val}</span>
    )},
    { key: 'description', label: 'Description', flex: 1 },
    { key: 'type', label: 'Flow', align: 'center', render: (val) => (
       <Badge variant={val === 'income' ? 'success' : 'danger'}>
          {val === 'income' ? <RiHandCoinLine className="mr-1 inline" /> : <RiArrowUpLine className="mr-1 inline" />}
          {val === 'income' ? 'CREDIT' : 'DEBIT'}
       </Badge>
    )},
    { key: 'amount', label: 'Value', align: 'right', render: (val, row) => (
       <span className={`font-bold ${row.type === 'income' ? 'text-state-success' : 'text-state-warning'}`}>
          {formatCurrency(val)}
       </span>
    )}
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-2">
         <div className="glass-card p-4">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Current Balance</p>
            <h4 className={`text-xl font-bold ${data.stats.balance >= 0 ? 'text-brand-teal' : 'text-state-warning'}`}>{formatCurrency(data.stats.balance)}</h4>
         </div>
         <div className="glass-card p-4">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Total Entries</p>
            <h4 className="text-xl font-bold text-content-primary">{data.stats.totalTransactions}</h4>
         </div>
         <div className="glass-card p-4">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Today Revenue</p>
            <h4 className="text-xl font-bold text-brand-pink">{formatCurrency(0)}</h4>
         </div>
         <div className="glass-card p-4">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Settlement Status</p>
            <h4 className="text-xl font-bold text-state-success">Active</h4>
         </div>
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <Select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { label: 'All Transactions', value: 'all' }, 
                  { label: 'Income (Credits)', value: 'credit' }, 
                  { label: 'Expense (Debits)', value: 'debit' }
                ]} 
                className="w-48" 
              />
              <div className="flex items-center gap-2">
                 <Input 
                   icon={RiSearchLine} 
                   placeholder="Search reference ID..." 
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

