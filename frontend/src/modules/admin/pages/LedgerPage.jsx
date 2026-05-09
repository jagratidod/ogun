import { useState, useMemo, useEffect } from 'react';
import { 
  RiFileList3Line, RiArrowDownLine, RiArrowUpLine, RiFilterLine, 
  RiSearchLine, RiDownloadLine, RiHistoryLine, RiLoader4Line,
  RiUserFill, RiBriefcaseLine, RiMapPinLine, RiPhoneLine
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  DataTable, Badge, Button, Input, Select, formatCurrency, 
  formatDateTime, Avatar
} from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function LedgerPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ transactions: [], stats: { balance: 0, totalCredits: 0, totalDebits: 0 } });
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedPartner === 'all') {
      fetchLedger();
    } else {
      fetchPartnerLedger(selectedPartner);
    }
  }, [selectedPartner]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [ledgerRes, distributorsRes, retailersRes] = await Promise.all([
        api.get('/admin/accounts/ledger'),
        api.get('/admin/distributors'),
        api.get('/admin/retailers')
      ]);
      setData(ledgerRes.data.data);
      setPartners([
        ...distributorsRes.data.data.map(p => ({ ...p, type: 'Distributor' })),
        ...retailersRes.data.data.map(p => ({ ...p, type: 'Retailer' }))
      ]);
    } catch (error) {
      toast.error('Failed to initialize ledger data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/accounts/ledger');
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch ledger');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerLedger = async (partnerId) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/accounts/ledger/${partnerId}`);
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch partner ledger');
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
    link.setAttribute("download", `ledger_export_${selectedPartner === 'all' ? 'general' : 'partner'}_${new Date().toISOString().split('T')[0]}.csv`);
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
    { key: 'transactionId', label: 'Reference', render: (val) => (
      <span className="font-bold text-content-primary text-xs">{val}</span>
    )},
    { key: 'description', label: 'Description', flex: 1, render: (val) => (
        <span className="text-sm font-bold text-content-secondary line-clamp-1">{val}</span>
    )},
    { key: 'type', label: 'Type', align: 'center', render: (val) => (
       <Badge variant={val === 'income' ? 'success' : 'danger'} className="text-[9px] font-black tracking-widest px-2 py-0.5">
          {val === 'income' ? 'CREDIT' : 'DEBIT'}
       </Badge>
    )},
    { key: 'amount', label: 'Amount', align: 'right', render: (val, row) => (
       <span className={`font-black ${row.type === 'income' ? 'text-state-success' : 'text-state-danger'}`}>
          {row.type === 'income' ? '+' : '-'}{formatCurrency(val)}
       </span>
    )},
    { key: 'category', label: 'Group', render: (val) => (
        <span className="text-[9px] font-black uppercase tracking-wider text-content-tertiary bg-surface-secondary px-1.5 py-0.5 rounded">{val.replace('_', ' ')}</span>
    )}
  ];

  if (loading && partners.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Enterprise Ledger" 
        subtitle="Tracking capital flow and partner balances across the ecosystem"
      >
        <div className="flex gap-2">
            <Button variant="secondary" icon={RiHistoryLine} onClick={fetchInitialData}>Refresh</Button>
            <Button icon={RiDownloadLine} variant="primary" onClick={handleExport}>Export Statement</Button>
        </div>
      </PageHeader>

      {/* Profile/Balance Header for Partner Selection */}
      {selectedPartner !== 'all' && data.user && (
         <Card className="border-none shadow-sm bg-brand-teal/[0.02] border-l-4 border-l-brand-teal rounded-none">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <Avatar name={data.user.businessName || data.user.name} size="lg" className="rounded-2xl" />
                  <div>
                     <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-content-primary">{data.user.businessName || data.user.name}</h2>
                        <Badge variant="outline" className="text-[8px]">{partners.find(p => p.id === selectedPartner)?.type}</Badge>
                     </div>
                     <p className="text-xs text-content-tertiary font-bold mt-1">Contact: {data.user.name} • {partners.find(p => p.id === selectedPartner)?.location}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-brand-teal uppercase tracking-widest mb-1">Live Ledger Balance</p>
                  <h3 className={`text-3xl font-black ${data.stats.balance < 0 ? 'text-state-danger' : 'text-state-success'}`}>
                     {formatCurrency(data.stats.balance)}
                  </h3>
               </div>
            </div>
         </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 border-none shadow-sm">
           <p className="text-[10px] text-content-tertiary font-black uppercase tracking-widest mb-2">Total Balance</p>
           <h4 className={`text-2xl font-black ${data.stats.balance < 0 ? 'text-state-danger' : 'text-content-primary'}`}>{formatCurrency(data.stats.balance)}</h4>
           <div className="mt-3 h-1 w-full bg-surface-secondary rounded-full overflow-hidden">
              <div className="h-full bg-brand-teal" style={{ width: '65%' }} />
           </div>
        </div>
        <div className="glass-card p-6 border-none shadow-sm bg-state-success/5">
           <p className="text-[10px] text-state-success font-black uppercase tracking-widest mb-2">Total Credits</p>
           <h4 className="text-2xl font-black text-state-success">{formatCurrency(data.stats.totalCredits)}</h4>
        </div>
        <div className="glass-card p-6 border-none shadow-sm bg-state-danger/5">
           <p className="text-[10px] text-state-danger font-black uppercase tracking-widest mb-2">Total Debits</p>
           <h4 className="text-2xl font-black text-state-danger">{formatCurrency(data.stats.totalDebits)}</h4>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="py-5 bg-surface-secondary/30">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-3">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-content-tertiary uppercase tracking-widest mb-1 ml-1">Filter by Partner</span>
                    <Select 
                      value={selectedPartner}
                      onChange={(e) => setSelectedPartner(e.target.value)}
                      options={[
                         { label: 'System General Ledger', value: 'all' },
                         ...partners.map(p => ({ label: `[${p.type}] ${p.businessName || p.name}`, value: p.id }))
                      ]} 
                      className="w-64" 
                    />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-content-tertiary uppercase tracking-widest mb-1 ml-1">Type</span>
                    <Select 
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      options={[
                         { label: 'All Entries', value: 'all' },
                         { label: 'Credits (+)', value: 'credit' },
                         { label: 'Debits (-)', value: 'debit' }
                      ]} 
                      className="w-32" 
                    />
                 </div>
              </div>
              <div className="flex items-center gap-2 self-end">
                 <Input 
                   icon={RiSearchLine} 
                   placeholder="Search ID or description..." 
                   className="w-full md:w-64"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <Button variant="secondary" icon={RiFilterLine} className="h-10 px-3" />
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={filteredLedger} />
      </Card>
    </div>
  );
}
