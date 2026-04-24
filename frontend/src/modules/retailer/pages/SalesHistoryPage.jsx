import { useState, useMemo, useEffect } from 'react';
import { RiShoppingBag3Line, RiSearchLine, RiFilterLine, RiEyeLine, RiFileDownloadLine, RiPrinterLine, RiTimeLine, RiRefreshLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime } from '../../../core';
import retailerService from '../../../core/services/retailerService';
import { toast } from 'react-hot-toast';

export default function SalesHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await retailerService.getSaleHistory();
      setHistory(res.data || []);
    } catch (error) {
      toast.error('Failed to load sale history');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter(h => {
      const matchSearch = h.saleId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          h.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isToday = new Date(h.createdAt).toDateString() === new Date().toDateString();
      const matchTime = timeFilter === 'all' || (timeFilter === 'today' && isToday);
      
      return matchSearch && matchTime;
    });
  }, [history, searchTerm, timeFilter]);

  const columns = [
    { key: 'saleId', label: 'Sale ID', sortable: true, render: (val) => (
      <span className="font-bold text-content-primary">#{val}</span>
    )},
    { key: 'createdAt', label: 'Processing On', sortable: true, render: (val) => (
       <div className="flex flex-col">
          <span className="text-sm font-medium text-content-primary">{formatDateTime(val).split(',')[0]}</span>
          <span className="text-[10px] text-content-tertiary">{formatDateTime(val).split(',')[1]}</span>
       </div>
    )},
    { key: 'customer', label: 'Customer', flex: 1, render: (val) => (
      <div className="flex flex-col">
        <span className="text-sm font-bold text-content-primary">{val?.name}</span>
        <span className="text-[10px] text-content-tertiary font-bold tracking-widest">{val?.phone}</span>
      </div>
    )},
    { key: 'products', label: 'Qty', align: 'center', render: (val) => (
       <Badge variant="info">{val?.length} Items</Badge>
    )},
    { key: 'totalAmount', label: 'Final Value', align: 'right', sortable: true, render: (val) => (
       <span className="font-bold text-brand-teal">{formatCurrency(val)}</span>
    )},
    { key: 'paymentMethod', label: 'Via', align: 'center', render: (val) => (
       <Badge variant="teal" size="xs">{val}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-1">
          <Button variant="icon" title="View Transaction">
             <RiEyeLine className="w-4 h-4" />
          </Button>
          <Button variant="icon" title="Print Invoice" onClick={() => window.print()}>
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
        <Button variant="secondary" icon={RiRefreshLine} onClick={fetchHistory} disabled={loading}>Refresh</Button>
        <Button icon={RiFileDownloadLine} variant="secondary">Export CSV</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-2">
         {[
           { label: 'Weekly Gross', val: history.reduce((acc, h) => acc + h.totalAmount, 0), color: 'text-brand-teal' },
           { label: 'UPI Payout', val: history.filter(h => h.paymentMethod === 'UPI').reduce((acc, h) => acc + h.totalAmount, 0), color: 'text-state-success' },
           { label: 'Cash Balance', val: history.filter(h => h.paymentMethod === 'Cash').reduce((acc, h) => acc + h.totalAmount, 0), color: 'text-state-warning' },
           { label: 'Total Sales', val: history.length, color: 'text-content-secondary' }
         ].map(stat => (
           <div key={stat.label} className="glass-card p-4">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h4 className={`text-xl font-bold ${stat.color}`}>
                {stat.label.includes('Sales') ? stat.val : formatCurrency(stat.val)}
              </h4>
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
            </div>
         </CardHeader>
         <DataTable columns={columns} data={filteredHistory} loading={loading} />
      </Card>
    </div>
  );
}

