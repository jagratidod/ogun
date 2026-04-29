import { useState, useEffect } from 'react';
import { RiBankCardLine, RiSearchLine, RiFileDownloadLine, RiTableLine, RiCheckDoubleLine, RiBankLine, RiExchangeLine, RiWalletLine, RiLoader4Line, RiHistoryLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime } from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function DistPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ payments: [], stats: { totalCollected: 0, count: 0 } });
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [retailers, setRetailers] = useState([]);
  const [formData, setFormData] = useState({ retailerId: '', amount: '', paymentMethod: 'upi', description: '' });

  useEffect(() => {
    fetchPayments();
    fetchRetailers();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/distributor/payments');
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchRetailers = async () => {
    try {
      const res = await api.get('/distributor/retailers');
      setRetailers(res.data.data);
    } catch (error) {
      console.error('Failed to fetch retailers');
    }
  };

  const filteredPayments = data.payments.filter(p => 
    p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.relatedUser?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.relatedUser?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCollection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/distributor/payments', formData);
      toast.success('Collection recorded successfully');
      setShowModal(false);
      setFormData({ retailerId: '', amount: '', paymentMethod: 'upi', description: '' });
      fetchPayments();
    } catch (error) {
      toast.error('Failed to record collection');
    }
  };

  const columns = [
    { key: 'transactionId', label: 'Payment ID', sortable: true, render: (val) => (
      <span className="font-bold text-content-primary">#{val}</span>
    )},
    { key: 'relatedUser', label: 'From Retailer', render: (val) => (
      <span className="text-sm font-medium text-brand-teal">{val?.businessName || val?.name || 'Unknown'}</span>
    )},
    { key: 'paymentMethod', label: 'Method', render: (val) => (
      <div className="flex items-center gap-2">
         <RiBankLine className="w-3.5 h-3.5 text-brand-teal" />
         <span className="text-xs font-medium text-content-primary uppercase">{val?.replace('_', ' ')}</span>
      </div>
    )},
    { key: 'createdAt', label: 'Date', render: (val) => <span className="text-sm text-content-secondary">{formatDateTime(val).split(',')[0]}</span> },
    { key: 'amount', label: 'Amount', align: 'right', render: (val) => (
       <span className="font-black text-state-success">{formatCurrency(val)}</span>
    )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge variant="success">{val?.toUpperCase() || 'COMPLETED'}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={RiTableLine}>View</Button>
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
        title="Distributor Payments" 
        subtitle="Manage settlements from retailers and outward payments to Admin"
       >
        <div className="flex gap-2">
            <Button variant="secondary" icon={RiHistoryLine} onClick={fetchPayments}>Refresh</Button>
            <Button icon={RiCheckDoubleLine} onClick={() => setShowModal(true)}>Record Collection</Button>
        </div>
      </PageHeader>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader>
               <CardTitle>Record Store Collection</CardTitle>
               <CardDescription>Enter payment details received from a retailer store</CardDescription>
            </CardHeader>
            <form onSubmit={handleCollection} className="p-6 space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-content-tertiary mb-1 block">Retailer Store</label>
                  <Select 
                    required
                    value={formData.retailerId}
                    onChange={(e) => setFormData({...formData, retailerId: e.target.value})}
                    options={[
                      { label: 'Select Store', value: '' },
                      ...retailers.map(r => ({ label: r.businessName || r.shopName, value: r._id }))
                    ]}
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-content-tertiary mb-1 block">Amount Received</label>
                    <Input 
                      required
                      type="number" 
                      placeholder="₹ 0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-content-tertiary mb-1 block">Payment Method</label>
                    <Select 
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      options={[
                        { label: 'UPI / QR', value: 'upi' },
                        { label: 'Cash', value: 'cash' },
                        { label: 'Bank Transfer', value: 'bank_transfer' }
                      ]}
                    />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-content-tertiary mb-1 block">Internal Note</label>
                  <Input 
                    placeholder="Reference # or detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
               </div>
               <div className="flex gap-2 pt-2">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" className="flex-1">Submit Record</Button>
               </div>
            </form>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-2">
         <div className="glass-card p-4">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Total Collected</p>
            <h4 className="text-xl font-bold text-state-success">{formatCurrency(data.stats.totalCollected)}</h4>
         </div>
         <div className="glass-card p-4">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Payment Count</p>
            <h4 className="text-xl font-bold text-brand-teal">{data.stats.count}</h4>
         </div>
         <div className="glass-card p-4">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">GST Input Credit</p>
            <h4 className="text-xl font-bold text-content-primary">{formatCurrency(0)}</h4>
         </div>
         <div className="glass-card p-4">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Settlement Status</p>
            <h4 className="text-xl font-bold text-state-success">Verified</h4>
         </div>
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <Select options={[{ label: 'Inward Collections', value: 'inwards' }]} className="w-48" />
              <div className="flex items-center gap-2">
                 <Input 
                    icon={RiSearchLine} 
                    placeholder="Search ID, retailer..." 
                    className="w-full md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <Button variant="secondary" icon={RiFileDownloadLine}>Download Log</Button>
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={filteredPayments} />
      </Card>
    </div>
  );
}
