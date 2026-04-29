import { useState, useEffect, useMemo } from 'react';
import { RiFileList3Line, RiArrowDownLine, RiArrowUpLine, RiFilterLine, RiSearchLine, RiDownloadLine, RiMoneyDollarBoxLine, RiLoader4Line, RiHistoryLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime } from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function DistLedgerPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ transactions: [], stats: { balance: 0, totalIncome: 0, totalExpense: 0 } });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await api.get('/distributor/ledger');
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch ledger');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return data.transactions.filter(t => 
      t.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data.transactions, searchTerm]);

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
      <PageHeader 
        title="Distributor Ledger" 
        subtitle="Tracking accounts receivables and payables for your distribution node"
      >
        <div className="flex gap-2">
            <Button variant="secondary" icon={RiHistoryLine} onClick={fetchLedger}>Refresh</Button>
            <Button icon={RiDownloadLine} variant="secondary">Download FY Statement</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-2">
         <Card className="bg-brand-teal/5 border-brand-teal/10">
            <div className="p-6">
               <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Total Income</p>
               <h4 className="text-3xl font-black text-brand-teal">{formatCurrency(data.stats.totalIncome)}</h4>
               <p className="text-xs text-content-tertiary mt-2">Historical Collections</p>
            </div>
         </Card>
         <Card className="bg-state-warning/5 border-state-warning/10">
            <div className="p-6">
               <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Total Expenses</p>
               <h4 className="text-3xl font-black text-state-warning">{formatCurrency(data.stats.totalExpense)}</h4>
               <p className="text-xs text-content-tertiary mt-2">Payments & Overheads</p>
            </div>
         </Card>
         <Card className="bg-brand-pink/5 border-brand-pink/10">
            <div className="p-6">
               <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Net Position</p>
               <h4 className="text-3xl font-black text-brand-pink">{formatCurrency(data.stats.balance)}</h4>
               <p className="text-xs text-content-tertiary mt-2">Available Margin</p>
            </div>
         </Card>
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <Select options={[{ label: 'All Transactions', value: 'all' }]} className="w-48" />
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
        <DataTable columns={columns} data={filteredTransactions} />
      </Card>
    </div>
  );
}
