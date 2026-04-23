import { useState, useEffect, useMemo } from 'react';
import { 
  RiTimeLine, RiInboxLine, RiRefreshLine, RiInformationLine,
  RiShoppingBag3Line, RiTruckLine, RiCheckboxCircleLine, RiCloseCircleLine
} from 'react-icons/ri';
import { 
  PageHeader, Card, DataTable, Badge, Button, 
  formatCurrency, useModal, Modal 
} from '../../../core';
import retailerService from '../../../core/services/retailerService';
import { useSocket } from '../../../core/context/SocketContext';
import { toast } from 'react-hot-toast';

export default function RetailerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, open, close, data: selectedOrder } = useModal();
  const socket = useSocket();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('order_status_updated', (data) => {
        setOrders(prev => prev.map(o => 
          o.orderId === data.orderId ? { ...o, status: data.status } : o
        ));
      });

      return () => socket.off('order_status_updated');
    }
  }, [socket]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await retailerService.getMyOrders();
      setOrders(res.data || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      key: 'orderId', label: 'Order ID', 
      render: (val) => <span className="font-bold text-content-primary">#{val}</span> 
    },
    {
      key: 'products', label: 'Items',
      render: (val) => (
        <div className="flex -space-x-2 overflow-hidden">
          {val.map((item, i) => (
            <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-50 border border-border overflow-hidden">
              {item.product?.images?.[0]?.url 
                ? <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />
                : <RiInboxLine className="p-1 text-slate-300" />
              }
            </div>
          ))}
          {val.length > 3 && (
            <div className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 text-[10px] font-bold text-slate-500">
              +{val.length - 3}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'totalAmount', label: 'Total Value',
      render: (val) => <span className="font-black text-brand-teal">{formatCurrency(val)}</span>
    },
    {
      key: 'createdAt', label: 'Placed On',
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
        <Button variant="secondary" size="xs" icon={RiInformationLine} onClick={() => open(row)}>Detail</Button>
      )
    }
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="My Orders" 
        subtitle="Track and manage your stock orders placed to your distributor"
      >
        <Button icon={RiRefreshLine} variant="secondary" onClick={fetchOrders} disabled={loading}>
          Refresh
        </Button>
      </PageHeader>

      <Card>
        <DataTable columns={columns} data={orders} loading={loading} />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        isOpen={isOpen}
        onClose={close}
        title={`Order Details: #${selectedOrder?.orderId}`}
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-6 py-2">
            {/* Status Timeline Placeholder */}
            <div className="flex items-center justify-between p-4 bg-surface-secondary border border-border">
               <div>
                  <p className="text-[10px] text-content-tertiary font-black uppercase tracking-widest mb-1">Current Status</p>
                  <p className="text-lg font-black text-brand-teal">{selectedOrder.status}</p>
               </div>
               <Badge variant="teal">{selectedOrder.orderType === 'retailer_to_distributor' ? 'B2B Retail Order' : 'Stock Request'}</Badge>
            </div>

            {/* Seller Info */}
            <div className="space-y-2">
               <h5 className="text-[10px] text-content-tertiary font-black uppercase tracking-widest border-b border-border pb-1">Supplier Information</h5>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-teal/10 text-brand-teal rounded flex items-center justify-center">
                     <RiTruckLine className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-content-primary">{selectedOrder.seller?.shopName || selectedOrder.seller?.name}</p>
                     <p className="text-xs text-content-tertiary">{selectedOrder.seller?.businessName}</p>
                  </div>
               </div>
            </div>

            {/* Product List */}
            <div className="space-y-2">
               <h5 className="text-[10px] text-content-tertiary font-black uppercase tracking-widest border-b border-border pb-1">Order Items</h5>
               <div className="space-y-3">
                  {selectedOrder.products.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 border border-border rounded overflow-hidden flex-shrink-0">
                           {item.product?.images?.[0]?.url 
                             ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                             : <RiInboxLine className="w-full h-full p-3 text-slate-300" />
                           }
                        </div>
                        <div>
                          <p className="text-sm font-bold text-content-primary">{item.product?.name}</p>
                          <p className="text-[10px] text-content-tertiary font-black">{item.product?.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-content-primary">{item.quantity} {item.product?.unit || 'Units'}</p>
                        <p className="text-xs text-content-tertiary">{formatCurrency(item.priceAtOrder)} / unit</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Total Section */}
            <div className="p-4 bg-slate-900 text-white rounded-sm flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Bill Amount</p>
                  <p className="text-xs opacity-80">Inclusive of all taxes</p>
               </div>
               <p className="text-2xl font-black">{formatCurrency(selectedOrder.totalAmount)}</p>
            </div>

            {selectedOrder.notes && (
               <div className="p-3 bg-amber-50 border border-amber-100 rounded-sm">
                  <p className="text-[9px] text-amber-700 font-black uppercase tracking-widest mb-1">Your Note</p>
                  <p className="text-xs text-amber-800 leading-relaxed italic">"{selectedOrder.notes}"</p>
               </div>
            )}

            <div className="flex gap-3 pt-2">
               <Button className="flex-1" variant="secondary" onClick={close}>Close Detail</Button>
               {selectedOrder.status === 'In Transit' && (
                  <Button className="flex-1" variant="primary" icon={RiCheckboxCircleLine}>Mark Received</Button>
               )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
