import { useState, useMemo, useEffect } from 'react';
import { RiFileList3Line, RiArrowDownLine, RiArrowUpLine, RiFilterLine, RiSearchLine, RiDownloadLine, RiHistoryLine, RiLoader4Line } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime } from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function LedgerPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ transactions: [], stats: { balance: 0, totalCredits: 0, totalDebits: 0 } });
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/accounts/ledger');
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch ledger data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ['Date', 'Transaction ID', 'Type', 'Category', 'Description', 'Amount'];
    const rows = filteredLedger.map(t => [
        new Date(t.createdAt).toLocaleString(),
        t.transactionId,
        t.type.toUpperCase(),
        t.category,
        t.description,
        t.amount
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLedger = useMemo(() => {
    return data.transactions.filter(item => {
      const matchType = typeFilter === 'all' || 
                       (typeFilter === 'credit' && item.type === 'income') || 
                       (typeFilter === 'debit' && item.type === 'expense');
      const matchSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [data.transactions, typeFilter, searchTerm]);

  const columns = [
    { key: 'createdAt', label: 'Date', sortable: true, render: (val) => (
       <div className="flex flex-col">
          <span className="text-sm font-medium text-content-primary">{formatDateTime(val).split(',')[0]}</span>
          <span className="text-[10px] text-content-tertiary">{formatDateTime(val).split(',')[1]}</span>
       </div>
    )},
    { key: 'transactionId', label: 'Transaction ID', render: (val) => (
      <span className="font-bold text-content-primary">{val}</span>
    )},
    { key: 'description', label: 'Description', flex: 1 },
    { key: 'type', label: 'Type', align: 'center', render: (val) => (
       <Badge variant={val === 'income' ? 'success' : 'danger'}>
          {val === 'income' ? <RiArrowDownLine className="mr-1 inline" /> : <RiArrowUpLine className="mr-1 inline" />}
          {val === 'income' ? 'CREDIT' : 'DEBIT'}
       </Badge>
    )},
    { key: 'amount', label: 'Amount', align: 'right', render: (val, row) => (
       <span className={`font-bold ${row.type === 'income' ? 'text-state-success' : 'text-state-danger'}`}>
          {row.type === 'income' ? '+' : '-'}{formatCurrency(val)}
       </span>
    )},
    { key: 'category', label: 'Category', render: (val) => (
        <span className="text-[10px] font-bold uppercase tracking-wider text-content-tertiary">{val.replace('_', ' ')}</span>
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
      <PageHeader 
        title="General Ledger" 
        subtitle="Tracking every credit and debit across our entire business"
      >
        <div className="flex gap-2">
            <Button variant="secondary" icon={RiHistoryLine} onClick={fetchLedger}>Refresh</Button>
            <Button icon={RiDownloadLine} variant="primary" onClick={handleExport}>Export Statement</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
           <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-2">Total Balance</p>
           <h4 className="text-2xl font-bold text-content-primary">{formatCurrency(data.stats.balance)}</h4>
           <div className="mt-2 flex items-center gap-1 text-[10px] text-state-success font-bold">
              <RiArrowDownLine /> Current Business Value
           </div>
        </div>
        <div className="glass-card p-5">
           <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-2">Total Credits (Income)</p>
           <h4 className="text-2xl font-bold text-state-success">{formatCurrency(data.stats.totalCredits)}</h4>
        </div>
        <div className="glass-card p-5">
           <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-2">Total Debits (Expense)</p>
           <h4 className="text-2xl font-bold text-state-danger">{formatCurrency(data.stats.totalDebits)}</h4>
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
                   className="w-48" 
                 />
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
