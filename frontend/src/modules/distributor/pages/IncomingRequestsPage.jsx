import { useMemo, useState, useEffect } from 'react';
import { 
  RiTruckLine, RiCheckDoubleLine, RiInformationLine, RiEyeLine, RiTimeLine,
  RiRefreshLine, RiInboxLine, RiCloseCircleLine, RiCheckboxCircleLine
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, 
  Badge, Button, useModal, Modal, Input, Select, formatCurrency 
} from '../../../core';
import distributorService from '../../../core/services/distributorService';
import { useSocket } from '../../../core/context/SocketContext';
import { toast } from 'react-hot-toast';

export default function IncomingRequestsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, open, close, data: selectedOrder } = useModal();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const socket = useSocket();

  useEffect(() => {
    fetchRetailerOrders();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_retailer_order', (data) => {
        toast('New order received!', { icon: '📦' });
        fetchRetailerOrders();
      });

      return () => socket.off('new_retailer_order');
    }
  }, [socket]);

  const fetchRetailerOrders = async () => {
    try {
      setLoading(true);
      const res = await distributorService.getRetailerOrders();
      setOrders(res.data || []);
    } catch (error) {
      toast.error('Failed to load retailer orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await distributorService.updateRetailerOrderStatus(id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchRetailerOrders();
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders
      .filter((o) => statusFilter === 'all' ? true : o.status.toLowerCase() === statusFilter.toLowerCase())
      .filter((o) => {
        if (!q) return true;
        return (
          o.orderId.toLowerCase().includes(q) || 
          o.buyer?.name?.toLowerCase().includes(q) ||
          o.buyer?.shopName?.toLowerCase().includes(q)
        );
      });
  }, [orders, search, statusFilter]);

  const columns = [
    { 
      key: 'orderId', label: 'Order ID', 
      render: (val) => <span className="font-bold text-content-primary">#{val}</span> 
    },
    { 
      key: 'buyer', label: 'Retailer', 
      render: (val) => (
        <div>
          <p className="font-bold text-content-primary">{val?.shopName || val?.name}</p>
          <p className="text-[10px] text-content-tertiary uppercase font-black">{val?.name}</p>
        </div>
      )
    },
    { 
      key: 'totalAmount', label: 'Value', align: 'right', 
      render: (val) => <span className="font-black text-brand-teal">{formatCurrency(val)}</span> 
    },
    { 
      key: 'createdAt', label: 'Date', 
      render: (val) => (
        <div className="flex items-center gap-2 text-sm text-content-secondary">
          <RiTimeLine className="w-4 h-4 text-content-tertiary" />
          <span>{new Date(val).toLocaleDateString()}</span>
        </div>
      ) 
    },
    { 
      key: 'status', label: 'Status', 
      render: (val) => {
        const variantMap = {
          'Pending': 'warning',
          'Confirmed': 'info',
          'Processing': 'secondary',
          'In Transit': 'warning',
          'Completed': 'success',
          'Cancelled': 'danger'
        };
        return <Badge variant={variantMap[val] || 'ghost'}>{val}</Badge>;
      } 
    },
    { 
      key: 'actions', label: 'Actions', align: 'right', 
      render: (_, row) => (
        <div className="flex justify-end gap-1">
          <Button variant="secondary" size="xs" icon={RiEyeLine} onClick={() => open(row)}>View</Button>
          {row.status === 'Pending' && (
             <Button variant="primary" size="xs" icon={RiCheckDoubleLine} onClick={() => handleUpdateStatus(row._id, 'Confirmed')}>Confirm</Button>
          )}
          {row.status === 'Confirmed' && (
             <Button variant="primary" size="xs" icon={RiTruckLine} onClick={() => handleUpdateStatus(row._id, 'In Transit')}>Dispatch</Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Retailer Orders" 
        subtitle="Manage incoming stock orders from your assigned retailer network"
      >
        <Button icon={RiRefreshLine} variant="secondary" onClick={fetchRetailerOrders} disabled={loading}>
          Refresh
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
             <div>
               <CardTitle>Incoming Orders</CardTitle>
               <CardDescription>Real-time list of orders from retailers</CardDescription>
             </div>
             <div className="flex items-center gap-2">
               <Select
                 className="w-44"
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 options={[
                   { label: 'All Status', value: 'all' },
                   { label: 'Pending', value: 'pending' },
                   { label: 'Confirmed', value: 'confirmed' },
                   { label: 'In Transit', value: 'in transit' },
                   { label: 'Completed', value: 'completed' },
                 ]}
               />
               <Input
                 placeholder="Search ID / shop..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 icon={RiInformationLine}
               />
             </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={filteredData} loading={loading} />
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={`Order Detail: #${selectedOrder?.orderId}`}
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-5 py-2">
             <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-surface-secondary border border-border">
                   <p className="text-[10px] text-content-tertiary font-black uppercase mb-1">Retailer</p>
                   <p className="text-sm font-bold">{selectedOrder.buyer?.shopName}</p>
                   <p className="text-xs text-content-tertiary">{selectedOrder.buyer?.name}</p>
                </div>
                <div className="p-3 bg-surface-secondary border border-border">
                   <p className="text-[10px] text-content-tertiary font-black uppercase mb-1">Status</p>
                   <Badge variant="warning">{selectedOrder.status}</Badge>
                </div>
             </div>

             <div className="space-y-2">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-content-tertiary border-b border-border pb-1">Items Ordered</h5>
                <div className="max-h-60 overflow-y-auto space-y-2">
                   {selectedOrder.products.map((item, i) => (
                     <div key={i} className="flex items-center justify-between p-2 hover:bg-surface-secondary border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-white border border-border rounded overflow-hidden">
                              {item.product?.images?.[0]?.url 
                                ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                                : <RiInboxLine className="p-2 text-slate-200" />
                              }
                           </div>
                           <div>
                              <p className="text-sm font-bold leading-tight">{item.product?.name}</p>
                              <p className="text-[10px] text-content-tertiary">{item.product?.sku}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-black">{item.quantity} Units</p>
                           <p className="text-[10px] text-content-tertiary">{formatCurrency(item.priceAtOrder)}/ea</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="flex items-center justify-between p-4 bg-brand-teal text-white rounded-sm">
                <span className="font-bold">Total Order Value</span>
                <span className="text-xl font-black">{formatCurrency(selectedOrder.totalAmount)}</span>
             </div>

             <div className="space-y-3">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-content-tertiary border-b border-border pb-1">Update Order Status</h5>
                <div className="flex gap-2">
                   <Select 
                     className="flex-1"
                     value={selectedOrder.status}
                     onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                     options={[
                       { label: 'Pending', value: 'Pending' },
                       { label: 'Confirmed', value: 'Confirmed' },
                       { label: 'Processing', value: 'Processing' },
                       { label: 'In Transit', value: 'In Transit' },
                       { label: 'Completed', value: 'Completed' },
                       { label: 'Cancelled', value: 'Cancelled' },
                     ]}
                   />
                </div>
             </div>

             <div className="flex gap-3 pt-2">
                <Button className="flex-1" variant="secondary" onClick={close}>Close</Button>
                {/* Cancel is still shown separately for quick action if not completed */}
                {selectedOrder.status !== 'Completed' && selectedOrder.status !== 'Cancelled' && (
                   <Button variant="danger" icon={RiCloseCircleLine} onClick={() => handleUpdateStatus(selectedOrder._id, 'Cancelled')}>Cancel Order</Button>
                )}
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
