import { useMemo, useState, useEffect } from 'react';
import { RiSearchLine, RiEyeLine, RiFileDownloadLine, RiFilter2Line, RiShoppingCartLine, RiPulseLine, RiArrowLeftRightLine, RiUserReceivedLine, RiUserSharedLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime, Modal, useModal } from '../../../core';
import partnerService from '../../../core/services/partnerService';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../../core/context/SocketContext';

export default function DistOrderHistoryPage() {
  const [orders, setOrders] = useState([]); // Combined orders
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // all, purchase, distribution
  const [search, setSearch] = useState('');
  const { isOpen, open, close, data: selectedOrder } = useModal();
  const socket = useSocket();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('order_status_updated', (data) => {
        fetchOrders();
      });
      return () => socket.off('order_status_updated');
    }
  }, [socket]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch both types of orders
      const [purchaseRes, distributionRes] = await Promise.all([
        partnerService.getDistributorOrders(),
        partnerService.getRetailerOrders()
      ]);

      // Tag them so we can distinguish in the list
      const purchases = (purchaseRes.data || []).map(o => ({ ...o, flowType: 'Purchase', party: 'ADMIN' }));
      const distributions = (distributionRes.data || []).map(o => ({ ...o, flowType: 'Distribution', party: o.buyer?.shopName || 'Retailer' }));

      setOrders([...purchases, ...distributions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      toast.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (orders || [])
      .filter((o) => statusFilter === 'all' ? true : (o.status || '').toLowerCase() === statusFilter.toLowerCase())
      .filter((o) => typeFilter === 'all' ? true : o.flowType.toLowerCase() === typeFilter.toLowerCase())
      .filter((o) => {
        if (!q) return true;
        return String(o.orderId || '').toLowerCase().includes(q) || 
               String(o.party || '').toLowerCase().includes(q);
      });
  }, [orders, search, statusFilter, typeFilter]);

  const columns = [
    { key: 'orderId', label: 'Order ID', render: (val) => (
      <span className="font-bold text-content-primary">#{val}</span>
    )},
    { key: 'flowType', label: 'Type', render: (val) => (
      <div className="flex items-center gap-1.5">
        {val === 'Purchase' ? <RiUserSharedLine className="text-brand-magenta" /> : <RiUserReceivedLine className="text-brand-teal" />}
        <span className={`text-[10px] font-black uppercase tracking-widest ${val === 'Purchase' ? 'text-brand-magenta' : 'text-brand-teal'}`}>{val}</span>
      </div>
    )},
    { key: 'party', label: 'Counter-Party', flex: 1, render: (val) => (
      <span className="text-xs font-bold text-content-secondary uppercase tracking-tight">{val}</span>
    )},
    { key: 'createdAt', label: 'Date', sortable: true, render: (val) => (
       <span className="text-xs text-content-tertiary">{new Date(val).toLocaleDateString()}</span>
    )},
    { key: 'totalAmount', label: 'Amount', align: 'right', sortable: true, render: (val) => (
       <span className="font-black text-content-primary">{formatCurrency(val)}</span>
    )},
    { key: 'status', label: 'Status', render: (val) => {
        const statusMap = {
           'Pending': 'warning',
           'Confirmed': 'teal',
           'Processing': 'info',
           'In Transit': 'info',
           'Completed': 'success',
           'Cancelled': 'danger'
        };
        return <Badge variant={statusMap[val] || 'secondary'} size="xs">{val}</Badge>;
    }},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-1">
          <Button variant="icon" size="sm" onClick={() => open(row)}><RiEyeLine /></Button>
          <Button variant="icon" title="Invoice"><RiFileDownloadLine className="text-brand-magenta" /></Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Consolidated Ledger" 
        subtitle="Full audit trail of orders with Admin (Purchases) and Retailers (Distributions)"
      >
        <Button icon={RiPulseLine} variant="secondary" onClick={fetchOrders} loading={loading}>Sync Records</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-2">
         {[
           { label: 'Total Volume', val: orders.length, color: 'text-content-primary' },
           { label: 'Purchase (In)', val: orders.filter(o => o.flowType === 'Purchase').length, color: 'text-brand-magenta' },
           { label: 'Distribution (Out)', val: orders.filter(o => o.flowType === 'Distribution').length, color: 'text-brand-teal' },
           { label: 'Completed', val: orders.filter(o => o.status === 'Completed').length, color: 'text-state-success' }
         ].map(stat => (
           <div key={stat.label} className="glass-card p-4">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h4 className={`text-xl font-black ${stat.color}`}>{stat.val}</h4>
           </div>
         ))}
      </div>

      <Card>
         <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4 w-full">
               <div className="flex flex-wrap items-center gap-2">
                  <Select 
                    className="w-40" 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    options={[
                       { label: 'All Types', value: 'all' },
                       { label: 'Purchases (Admin)', value: 'purchase' },
                       { label: 'Distributions (Retailer)', value: 'distribution' }
                    ]} 
                  />
                  <Select 
                    className="w-40" 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                       { label: 'All Statuses', value: 'all' },
                       { label: 'Pending', value: 'pending' },
                       { label: 'Completed', value: 'completed' }
                    ]} 
                  />
                  <Input
                    icon={RiSearchLine}
                    placeholder="Search Order ID or Party..."
                    className="w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
               </div>
               <Button variant="secondary" onClick={() => { setSearch(''); setStatusFilter('all'); setTypeFilter('all'); }}>Reset</Button>
            </div>
         </CardHeader>
         <DataTable columns={columns} data={filteredOrders} loading={loading} />
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={`Transaction Summary: ${selectedOrder?.orderId}`}
        size="md"
        footer={<Button variant="secondary" onClick={close}>Close Archive</Button>}
      >
        <div className="space-y-6">
           <div className={`p-4 border ${selectedOrder?.flowType === 'Purchase' ? 'bg-brand-magenta/5 border-brand-magenta/20' : 'bg-brand-teal/5 border-brand-teal/20'} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedOrder?.flowType === 'Purchase' ? 'bg-brand-magenta/10 text-brand-magenta' : 'bg-brand-teal/10 text-brand-teal'}`}>
                    {selectedOrder?.flowType === 'Purchase' ? <RiUserSharedLine /> : <RiUserReceivedLine />}
                 </div>
                 <div>
                    <p className="text-[10px] text-content-tertiary font-black uppercase tracking-widest">{selectedOrder?.flowType} to {selectedOrder?.party}</p>
                    <h4 className="text-sm font-black text-content-primary">#{selectedOrder?.orderId}</h4>
                 </div>
              </div>
              <Badge variant={selectedOrder?.status === 'Completed' ? 'success' : 'warning'}>{selectedOrder?.status}</Badge>
           </div>

           <div className="space-y-3">
              <h5 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-border pb-1">Line Items</h5>
              <div className="divide-y divide-border border border-border">
                 {selectedOrder?.products?.map((item, i) => (
                    <div key={i} className="p-3 flex items-center justify-between hover:bg-surface-elevated transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-surface-elevated flex-shrink-0">
                             {item.product?.images?.[0]?.url && <img src={item.product.images[0].url} className="w-full h-full object-cover" />}
                          </div>
                          <div>
                             <p className="text-xs font-bold text-content-primary">{item.product?.name}</p>
                             <p className="text-[9px] text-content-tertiary font-mono">{item.product?.sku}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-black text-content-primary">{item.quantity} Units</p>
                          <p className="text-[10px] text-brand-teal font-bold">{formatCurrency(item.priceAtOrder)}/u</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-surface-elevated p-4 border border-border flex justify-between items-center">
              <div>
                 <p className="text-[10px] text-content-tertiary font-black uppercase tracking-widest">Transaction Total</p>
                 <h3 className="text-xl font-black text-brand-teal leading-none mt-1">{formatCurrency(selectedOrder?.totalAmount)}</h3>
              </div>
              <div className="text-right">
                 <p className="text-[10px] text-content-tertiary font-black uppercase tracking-widest">Date</p>
                 <p className="text-xs font-bold text-content-secondary mt-1">{selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : '—'}</p>
              </div>
           </div>
        </div>
      </Modal>
    </div>
  );
}
