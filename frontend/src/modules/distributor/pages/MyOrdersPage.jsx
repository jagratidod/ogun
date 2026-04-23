import { useState, useEffect, useMemo } from 'react';
import { 
  RiHistoryLine, 
  RiTruckLine, 
  RiTimeLine, 
  RiCheckDoubleLine, 
  RiInformationLine,
  RiArrowRightSLine,
  RiFileList3Line,
  RiCloseLine
} from 'react-icons/ri';
import { 
  PageHeader, 
  Card, 
  DataTable, 
  Badge, 
  formatCurrency, 
  useModal, 
  Modal, 
  Button,
  formatDateTime
} from '../../../core';
import marketplaceService from '../../../core/services/marketplaceService';
import { toast } from 'react-hot-toast';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, open, close, data: selectedOrder } = useModal();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await marketplaceService.getMyOrders();
      setOrders(res.data || []);
    } catch (error) {
      toast.error('Failed to fetch your orders');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      pending: orders.filter(o => o.status === 'Pending').length,
      confirmed: orders.filter(o => o.status === 'Confirmed' || o.status === 'Processing').length,
      transit: orders.filter(o => o.status === 'In Transit').length,
      delivered: orders.filter(o => o.status === 'Completed').length
    };
  }, [orders]);

  const columns = [
    {
      key: 'orderId', label: 'Order #', render: (val) => (
        <span className="text-xs font-bold text-content-primary tracking-wider">{val}</span>
      )
    },
    {
      key: 'createdAt', label: 'Order Date', render: (val) => (
        <span className="text-xs text-content-secondary">{formatDateTime(val).split(',')[0]}</span>
      )
    },
    {
      key: 'products', label: 'Items', align: 'center', render: (val) => (
        <span className="text-xs font-medium text-content-secondary">
          {val?.reduce((acc, curr) => acc + curr.quantity, 0)} units
        </span>
      )
    },
    {
      key: 'totalAmount', label: 'Total Amount', align: 'right', render: (val) => (
        <span className="text-sm font-black text-brand-teal">{formatCurrency(val)}</span>
      )
    },
    {
      key: 'status', label: 'Status', render: (val) => (
        <Badge 
          variant={
            val === 'Pending' ? 'warning' : 
            val === 'Confirmed' ? 'teal' : 
            val === 'Processing' ? 'info' :
            val === 'In Transit' ? 'info' : 
            val === 'Cancelled' ? 'danger' :
            val === 'Completed' ? 'success' :
            'secondary'
          }
          icon={
            val === 'Pending' ? RiTimeLine : 
            val === 'In Transit' ? RiTruckLine : 
            val === 'Cancelled' ? RiCloseLine :
            val === 'Processing' ? RiFileList3Line :
            RiCheckDoubleLine
          }
        >
          {val}
        </Badge>
      )
    },
    {
      key: 'actions', label: '', align: 'right', render: (_, row) => (
        <Button variant="icon" onClick={() => open(row)}>
          <RiArrowRightSLine className="w-5 h-5 text-content-tertiary" />
        </Button>
      )
    }
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="My Orders" 
        subtitle="Track your product restocking history and current shipments"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 border-l-4 border-state-warning shadow-sm">
          <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Pending Orders</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-content-primary">{String(stats.pending).padStart(2, '0')}</h3>
            <div className="bg-state-warning/10 p-2 text-state-warning rounded-none">
              <RiTimeLine className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-brand-teal shadow-sm">
          <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Confirmed / Processing</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-content-primary">{String(stats.confirmed).padStart(2, '0')}</h3>
            <div className="bg-brand-teal/10 p-2 text-brand-teal rounded-none">
              <RiFileList3Line className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-blue-500 shadow-sm">
          <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">In Transit</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-content-primary">{String(stats.transit).padStart(2, '0')}</h3>
            <div className="bg-blue-500/10 p-2 text-blue-500 rounded-none">
              <RiTruckLine className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-state-success shadow-sm">
          <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1">Delivered</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-content-primary">{String(stats.delivered).padStart(2, '0')}</h3>
            <div className="bg-state-success/10 p-2 text-state-success rounded-none">
              <RiCheckDoubleLine className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <DataTable 
          columns={columns}
          data={orders}
          loading={loading}
        />
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={selectedOrder ? `Order Details: ${selectedOrder.orderId}` : 'Order details'}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6 pb-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-4 bg-surface-secondary border border-border">
              <div>
                <p className="text-[10px] text-content-tertiary font-bold uppercase">Order Status</p>
                <div className="mt-1 flex items-center gap-1.5 text-brand-teal">
                  <RiCheckDoubleLine className="w-4 h-4" />
                  <span className="text-sm font-bold">{selectedOrder.status}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-content-tertiary font-bold uppercase">Date Placed</p>
                <p className="mt-1 text-sm font-bold text-content-primary">
                  {formatDateTime(selectedOrder.createdAt).split(',')[0]}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-content-tertiary font-bold uppercase">Payment Status</p>
                <div className="mt-1 flex items-center gap-1.5 text-content-secondary">
                  <span className="text-sm font-bold">{selectedOrder.paymentStatus || 'Pending'}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-content-tertiary font-bold uppercase">Reference ID</p>
                <p className="mt-1 text-[10px] font-bold text-content-primary uppercase select-all tracking-wider">
                  {selectedOrder._id}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-content-primary uppercase tracking-widest border-l-2 border-brand-teal pl-2">Ordered Products</h4>
              <div className="border border-border">
                <table className="w-full text-left">
                  <thead className="bg-surface-secondary border-b border-border">
                    <tr>
                      <th className="p-3 text-[10px] font-bold text-content-tertiary uppercase">Item</th>
                      <th className="p-3 text-[10px] font-bold text-content-tertiary uppercase text-center">Qty</th>
                      <th className="p-3 text-[10px] font-bold text-content-tertiary uppercase text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedOrder.products?.map((item, idx) => (
                       <tr key={idx} className="hover:bg-surface-secondary/50 transition-colors">
                          <td className="p-3 text-xs font-bold text-content-primary">
                             {item.product?.name}
                             <p className="text-[9px] text-content-tertiary font-normal tracking-wider mt-0.5">SKU: {item.product?.sku}</p>
                          </td>
                          <td className="p-3 text-center text-xs font-medium">{item.quantity}</td>
                          <td className="p-3 text-right text-xs font-bold">{formatCurrency(item.priceAtOrder)}</td>
                       </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-surface-secondary border-t border-border">
                    <tr>
                      <td colSpan="2" className="p-3 text-right text-[10px] font-bold text-content-tertiary uppercase">Total Amount</td>
                      <td className="p-3 text-right text-base font-black text-brand-teal">{formatCurrency(selectedOrder.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="bg-surface-secondary p-4 flex gap-4">
              <div className="w-1.5 h-auto bg-brand-teal" />
              <div>
                <p className="text-xs font-bold text-content-primary">Order Notes</p>
                <p className="text-[11px] text-content-tertiary leading-relaxed mt-1 italic">
                  {selectedOrder.notes || "No additional notes from Admin."}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-border">
              <Button onClick={close} variant="secondary">Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
