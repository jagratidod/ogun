import { useState, useMemo, useEffect } from 'react';
import { 
  RiShoppingBag3Line, RiSearchLine, RiFilterLine, RiEyeLine, 
  RiFileDownloadLine, RiPrinterLine, RiTimeLine, RiRefreshLine,
  RiHandCoinLine, RiQrCodeLine, RiMoneyDollarCircleLine, RiFileList3Line
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime 
} from '../../../core';
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

  const statCards = [
    { label: 'Weekly Gross', val: formatCurrency(history.reduce((acc, h) => acc + h.totalAmount, 0)), icon: RiHandCoinLine, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
    { label: 'UPI Payout', val: formatCurrency(history.filter(h => h.paymentMethod === 'UPI').reduce((acc, h) => acc + h.totalAmount, 0)), icon: RiQrCodeLine, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Cash Entry', val: formatCurrency(history.filter(h => h.paymentMethod === 'Cash').reduce((acc, h) => acc + h.totalAmount, 0)), icon: RiMoneyDollarCircleLine, color: 'text-brand-pink', bg: 'bg-brand-pink/10' },
    { label: 'Transactions', val: history.length, icon: RiFileList3Line, color: 'text-brand-purple', bg: 'bg-brand-purple/10' }
  ];

  const columns = [
    { key: 'saleId', label: 'Sale ID', sortable: true, render: (val) => (
      <span className="text-[11px] font-black text-content-primary uppercase tracking-tight">#{val}</span>
    )},
    { key: 'createdAt', label: 'Processing', sortable: true, render: (val) => (
       <div className="flex flex-col opacity-70">
          <span className="text-[10px] font-bold text-content-primary uppercase">{formatDateTime(val).split(',')[0]}</span>
          <span className="text-[8px] font-black text-content-tertiary uppercase">{formatDateTime(val).split(',')[1]}</span>
       </div>
    )},
    { key: 'customer', label: 'Consumer', flex: 1, render: (val) => (
      <div className="flex flex-col">
        <span className="text-[11px] font-black text-content-primary uppercase leading-tight">{val?.name}</span>
        <span className="text-[8px] text-content-tertiary font-black tracking-widest">{val?.phone}</span>
      </div>
    )},
    { key: 'products', label: 'Qty', align: 'center', render: (val) => (
       <span className="text-[10px] font-black text-brand-teal">{val?.length} PCS</span>
    )},
    { key: 'totalAmount', label: 'Final Value', align: 'right', sortable: true, render: (val) => (
       <span className="text-[11px] font-black text-brand-teal">{formatCurrency(val)}</span>
    )},
    { key: 'paymentMethod', label: 'Via', align: 'center', render: (val) => (
       <Badge variant="teal" size="xs" className="text-[7px] font-black uppercase">{val}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-1">
          <Button variant="secondary" size="sm" className="h-7 w-7 p-0" icon={RiEyeLine} />
          <Button variant="secondary" size="sm" className="h-7 w-7 p-0" icon={RiPrinterLine} onClick={() => window.print()} />
       </div>
    )}
  ];

  return (
    <div className="p-3 space-y-5 bg-surface-primary min-h-screen pb-24">
      {/* Header */}
      <section className="flex justify-between items-center px-1 pt-2">
         <div>
            <h2 className="text-xl font-black text-content-primary tracking-tighter uppercase">Ledger</h2>
            <p className="text-[9px] text-brand-teal font-black uppercase tracking-widest leading-none mt-1">Sales Transaction Log</p>
         </div>
         <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="h-9 px-3 text-[9px] font-black uppercase" icon={RiRefreshLine} onClick={fetchHistory} disabled={loading}>Sync</Button>
            <Button size="sm" className="h-9 px-3 text-[9px] font-black uppercase" icon={RiFileDownloadLine}>Export</Button>
         </div>
      </section>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            className="p-4 bg-white border border-border shadow-sm flex flex-col gap-3 relative overflow-hidden rounded-[24px]"
          >
            <div className={`w-10 h-10 rounded-2xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`${stat.color} w-5 h-5`} />
            </div>
            <div>
              <p className="text-[9px] font-black text-content-tertiary uppercase tracking-widest leading-none mb-1.5 opacity-60">{stat.label}</p>
              <h4 className="text-lg font-black text-content-primary tracking-tighter">
                {stat.val}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
         <div className="relative flex-1 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-teal">
               <RiSearchLine className="w-4 h-4" />
            </div>
            <input
               type="text"
               placeholder="Search by ID or Consumer..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full h-11 pl-11 pr-4 bg-white border border-border shadow-sm outline-none focus:border-brand-teal/30 transition-all text-[10px] font-bold"
            />
         </div>
         <Select 
           value={timeFilter}
           onChange={(e) => setTimeFilter(e.target.value)}
           options={[{ label: 'All Time', value: 'all' }, { label: 'Today', value: 'today' }]} 
           className="w-28 h-11 text-[9px] font-black uppercase"
         />
      </div>

      <Card className="rounded-[24px] overflow-hidden">
        <DataTable columns={columns} data={filteredHistory} loading={loading} />
      </Card>
    </div>
  );
}
