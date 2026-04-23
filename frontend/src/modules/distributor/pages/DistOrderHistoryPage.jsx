import { useMemo, useState, useEffect } from 'react';
import { RiSearchLine, RiEyeLine, RiFileDownloadLine, RiFilter2Line, RiShoppingCartLine, RiPulseLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime, Modal, useModal } from '../../../core';
import partnerService from '../../../core/services/partnerService';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../../core/context/SocketContext';

export default function DistOrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { isOpen, open, close, data: selectedOrder } = useModal();
  const socket = useSocket();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('order_status_updated', (data) => {
        // Refresh only if the update belongs to this distributor's orders
        // Or just refresh everything for simplicity as per user request "real-time"
        console.log('[Socket] Refreshing history due to order update');
        fetchOrders();
      });

      return () => {
        socket.off('order_status_updated');
      };
    }
  }, [socket]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await partnerService.getDistributorOrders();
      setOrders(res.data || []);
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
      .filter((o) => {
        if (!q) return true;
        return String(o.orderId || '').toLowerCase().includes(q);
      });
  }, [orders, search, statusFilter]);

  const columns = [
    { key: 'orderId', label: 'Order ID', sortable: true, render: (val) => (
      <span className="font-bold text-content-primary">{val}</span>
    )},
    { key: 'createdAt', label: 'Date', sortable: true, render: (val) => {
       const dateObj = formatDateTime(val);
       return (
         <div className="flex flex-col">
            <span className="text-sm font-medium text-content-primary">{dateObj.split(',')[0]}</span>
            <span className="text-[10px] text-content-tertiary">{dateObj.split(',')[1]}</span>
         </div>
       );
    }},
    { key: 'products', label: 'Items', render: (val) => (
       <span className="text-xs font-semibold text-content-secondary">{val?.length || 0} Products</span>
    )},
    { key: 'totalAmount', label: 'Amount', align: 'right', sortable: true, render: (val) => (
       <span className="font-black text-brand-teal">{formatCurrency(val)}</span>
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
        return <Badge variant={statusMap[val] || 'secondary'}>{val}</Badge>;
    }},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={RiEyeLine} onClick={() => open(row)}>View</Button>
          <Button variant="icon" title="Download Invoice">
             <RiFileDownloadLine className="w-4 h-4 text-brand-magenta" />
          </Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Distributor Order History" 
        subtitle="Track orders placed with the Admin for regional inventory replenishment"
      >
        <Button icon={RiPulseLine} variant="secondary" onClick={fetchOrders} disabled={loading}>
           {loading ? 'Syncing...' : 'Refresh History'}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-2">
         {[
           { label: 'Total Volume', val: orders.length, color: 'text-brand-teal' },
           { label: 'Completed', val: orders.filter(o => o.status === 'Completed').length, color: 'text-state-success' },
           { label: 'Pending', val: orders.filter(o => o.status === 'Pending').length, color: 'text-state-warning' },
           { label: 'Total Spend', val: formatCurrency(orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0)), color: 'text-brand-magenta' }
         ].map(stat => (
           <div key={stat.label} className="glass-card p-4">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h4 className={`text-xl font-black ${stat.color}`}>{stat.val}</h4>
           </div>
         ))}
      </div>

      <Card>
         <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
               <div className="flex items-center gap-2">
                  <Select 
                    className="w-48" 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                       { label: 'All History', value: 'all' },
                       { label: 'Pending', value: 'pending' },
                       { label: 'Confirmed', value: 'confirmed' },
                       { label: 'Processing', value: 'processing' },
                       { label: 'In Transit', value: 'in transit' },
                       { label: 'Completed', value: 'completed' },
                       { label: 'Cancelled', value: 'cancelled' }
                    ]} 
                  />
                  <Input
                    icon={RiSearchLine}
                    placeholder="Search order ID..."
                    className="w-full md:w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
               </div>
               <Button variant="secondary" icon={RiFilter2Line} onClick={() => { setSearch(''); setStatusFilter('all'); }}>Clear</Button>
            </div>
         </CardHeader>
         <DataTable columns={columns} data={loading ? [] : filteredOrders} loading={loading} />
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={`Order Details: ${selectedOrder?.orderId}`}
        size="md"
        footer={<Button variant="secondary" onClick={close}>Close Detail</Button>}
      >
        <div className="space-y-6 py-2">
           <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
                    <RiShoppingCartLine className="text-brand-teal" />
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Order Status</p>
                    <h4 className="text-sm font-black text-slate-700">{selectedOrder?.status}</h4>
                 </div>
              </div>
              <Badge variant={
                selectedOrder?.status === 'Pending' ? 'warning' : 
                selectedOrder?.status === 'Completed' ? 'success' : 'teal'
              }>{selectedOrder?.status}</Badge>
           </div>

           <div className="space-y-3">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Product Breakdown</h5>
              <div className="divide-y divide-slate-50 border border-slate-100">
                 {selectedOrder?.products?.map((item, i) => (
                    <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 flex-shrink-0">
                             {item.product?.images?.[0]?.url && <img src={item.product.images[0].url} className="w-full h-full object-cover" />}
                          </div>
                          <div>
                             <p className="text-xs font-bold text-slate-700">{item.product?.name}</p>
                             <p className="text-[9px] text-slate-400 font-mono tracking-tighter">{item.product?.sku}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-black text-slate-700">{item.quantity} Units</p>
                          <p className="text-[10px] text-brand-teal font-bold">{formatCurrency(item.priceAtOrder)}/u</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-brand-teal/5 p-4 border border-brand-teal/10 flex justify-between items-center">
              <div>
                 <p className="text-[10px] text-brand-teal/60 font-black uppercase tracking-widest">Total Valuation</p>
                 <h3 className="text-xl font-black text-brand-teal leading-none mt-1">{formatCurrency(selectedOrder?.totalAmount)}</h3>
              </div>
              <div className="text-right">
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Order Date</p>
                 <p className="text-xs font-bold text-slate-600 mt-1">{selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : '—'}</p>
              </div>
           </div>
        </div>
      </Modal>
    </div>
  );
}
