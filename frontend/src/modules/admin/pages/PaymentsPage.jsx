import { useState, useEffect } from 'react';
import { RiBankCardLine, RiSearchLine, RiFileDownloadLine, RiTableLine, RiCheckDoubleLine, RiBankLine, RiExchangeLine, RiLoader4Line, RiHistoryLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime } from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ payments: [], stats: { todayTotal: 0, weeklyTotal: 0, monthlyTotal: 0 } });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/accounts/payments');
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ['Payment ID', 'From Entity', 'Method', 'Date', 'Amount', 'Status'];
    const rows = filteredPayments.map(p => [
        p.transactionId,
        p.party?.businessName || p.party?.name || 'N/A',
        p.paymentMethod?.replace('_', ' ').toUpperCase(),
        new Date(p.createdAt).toLocaleDateString(),
        p.amount,
        p.status.toUpperCase()
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPayments = data.payments.filter(p => 
    p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.party?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.party?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'transactionId', label: 'Payment ID', sortable: true, render: (val) => (
      <span className="font-bold text-content-primary">{val}</span>
    )},
    { key: 'party', label: 'From Entity', render: (val) => (
      <div className="flex flex-col">
          <span className="text-sm font-bold text-content-primary">{val?.businessName || val?.name || 'N/A'}</span>
          <span className="text-[10px] text-content-tertiary uppercase font-black">{val?.shopName || 'Partner'}</span>
      </div>
    )},
    { key: 'paymentMethod', label: 'Payment Method', render: (val) => (
      <div className="flex items-center gap-2">
         {val === 'bank_transfer' ? <RiBankLine className="w-4 h-4 text-brand-teal" /> : <RiExchangeLine className="w-4 h-4 text-brand-pink" />}
         <span className="text-sm font-medium text-content-primary">{val?.replace('_', ' ').toUpperCase()}</span>
      </div>
    )},
    { key: 'createdAt', label: 'Processing Date', render: (val) => (
       <span className="text-sm text-content-secondary">{formatDateTime(val)}</span>
    )},
    { key: 'amount', label: 'Amount', align: 'right', render: (val) => (
       <span className="font-bold text-state-success">{formatCurrency(val)}</span>
    )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge status={val.toLowerCase()}>{val.toUpperCase()}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={RiTableLine}>Journal Entry</Button>
       </div>
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
        title="Incoming Payments" 
        subtitle="Manage and verify all inward digital transfers and cash payments"
      >
        <div className="flex gap-2">
            <Button variant="secondary" icon={RiHistoryLine} onClick={fetchPayments}>Refresh</Button>
            <Button icon={RiCheckDoubleLine}>Reconcile Statements</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
           <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Today Total</p>
           <h4 className="text-xl font-bold text-content-primary">{formatCurrency(data.stats.todayTotal)}</h4>
        </div>
        <div className="glass-card p-4">
           <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Weekly Total</p>
           <h4 className="text-xl font-bold text-content-primary">{formatCurrency(data.stats.weeklyTotal)}</h4>
        </div>
        <div className="glass-card p-4">
           <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Monthly Total</p>
           <h4 className="text-xl font-bold text-content-primary">{formatCurrency(data.stats.monthlyTotal)}</h4>
        </div>
        <div className="glass-card p-4">
           <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Active Transfers</p>
           <h4 className="text-xl font-bold text-content-primary">{filteredPayments.length} Entries</h4>
        </div>
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <Select options={[
                 { label: 'All Payments', value: 'all' },
                 { label: 'Bank Transfers', value: 'bank_transfer' },
                 { label: 'UPI Payments', value: 'upi' }
              ]} className="w-48" />
              <div className="flex items-center gap-2">
                 <Input 
                   icon={RiSearchLine} 
                   placeholder="Search ID, party..." 
                   className="w-full md:w-64" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <Button variant="secondary" icon={RiFileDownloadLine} onClick={handleExport}>Download Log</Button>
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={filteredPayments} />
      </Card>
    </div>
  );
}
