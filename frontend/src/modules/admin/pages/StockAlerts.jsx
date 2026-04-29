import { useState, useEffect } from 'react';
import {
  RiAlertLine, RiShoppingCartLine, RiArrowRightUpLine,
  RiErrorWarningLine, RiCalendarCheckLine, RiLoader4Line,
  RiHistoryLine, RiTimeLine, RiCloseLine
} from 'react-icons/ri';
import {
  PageHeader, Card, CardHeader, CardTitle, CardDescription,
  DataTable, Badge, Button, EmptyState, Modal, useModal, formatDateTime
} from '../../../core';
import { toast } from 'react-hot-toast';
import api from '../../../core/api';

export default function StockAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const { isOpen, open, close, data: selectedAlert } = useModal();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/inventory/alerts');
      const raw = res.data?.data || [];
      // Normalize: add status field
      setAlerts(raw.map(a => ({
        ...a,
        status: a.quantity === 0 ? 'Out of Stock' : 'Low Stock',
        minStockThreshold: a.minStockThreshold ?? 100,
      })));
    } catch {
      toast.error('Failed to fetch stock alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleViewHistory = async (row) => {
    open(row);
    setHistory([]);
    setHistoryLoading(true);
    try {
      const res = await api.get('/admin/orders');
      const orders = res.data?.data || [];
      // Filter orders that contain this product
      const productId = row.product?._id?.toString();
      const filtered = orders.filter(o =>
        o.products?.some(p =>
          (p.product?._id || p.product)?.toString() === productId
        )
      );
      setHistory(filtered);
    } catch {
      toast.error('Failed to load order history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleReplenish = (row) => {
    toast.success(`Purchase order initiated for ${row.product?.name}`);
  };

  const columns = [
    {
      key: 'product', label: 'Product Details',
      render: (val) => (
        <div>
          <h4 className="text-sm font-semibold text-content-primary">{val?.name}</h4>
          <span className="text-[10px] text-content-tertiary">SKU: {val?.sku}</span>
        </div>
      )
    },
    {
      key: 'product', label: 'Category',
      render: (val) => <Badge variant="teal">{val?.category || '—'}</Badge>
    },
    {
      key: 'quantity', label: 'Quantity Left', align: 'center',
      render: (val) => (
        <span className={`text-sm font-bold ${val === 0 ? 'text-state-danger' : 'text-state-warning'}`}>
          {val} units
        </span>
      )
    },
    {
      key: 'minStockThreshold', label: 'Threshold', align: 'center',
      render: (val) => <span className="text-sm text-content-tertiary">{val} units</span>
    },
    {
      key: 'status', label: 'Alert Type',
      render: (val) => (
        <Badge variant={val === 'Out of Stock' ? 'danger' : 'warning'}>{val}</Badge>
      )
    },
    {
      key: 'actions', label: 'Actions', align: 'right',
      render: (_, row) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" icon={RiShoppingCartLine} onClick={() => handleReplenish(row)}>
            Replenish
          </Button>
          <Button variant="ghost" size="sm" icon={RiHistoryLine} onClick={() => handleViewHistory(row)}>
            View History
          </Button>
        </div>
      )
    }
  ];

  const outOfStockCount = alerts.filter(a => a.quantity === 0).length;
  const lowStockCount   = alerts.filter(a => a.quantity > 0).length;

  return (
    <div className="page-container">
      <PageHeader
        title="Stock Alerts"
        subtitle="Critical inventory items requiring immediate attention"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 border-l-4 border-state-danger">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-state-danger/15 flex items-center justify-center">
              <RiErrorWarningLine className="text-state-danger w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-content-tertiary font-bold uppercase tracking-wider">Out of Stock</p>
              <h4 className="text-2xl font-bold text-content-primary">{outOfStockCount} items</h4>
            </div>
          </div>
        </div>
        <div className="glass-card p-5 border-l-4 border-state-warning">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-state-warning/15 flex items-center justify-center">
              <RiAlertLine className="text-state-warning w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-content-tertiary font-bold uppercase tracking-wider">Low Inventory</p>
              <h4 className="text-2xl font-bold text-content-primary">{lowStockCount} items</h4>
            </div>
          </div>
        </div>
        <div className="glass-card p-5 border-l-4 border-brand-teal">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-brand-teal/15 flex items-center justify-center">
              <RiCalendarCheckLine className="text-brand-teal w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-content-tertiary font-bold uppercase tracking-wider">Last Sync</p>
              <h4 className="text-sm font-bold text-content-primary">{new Date().toLocaleTimeString()}</h4>
              <span className="text-[10px] text-content-tertiary">Real-time alerts active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Inventory Alarms</CardTitle>
          <CardDescription>Items currently below the safety threshold in your warehouse</CardDescription>
        </CardHeader>
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <RiLoader4Line className="w-8 h-8 text-brand-teal animate-spin" />
          </div>
        ) : alerts.length > 0 ? (
          <DataTable columns={columns} data={alerts} />
        ) : (
          <EmptyState
            icon={RiErrorWarningLine}
            title="Inventory Healthy"
            description="All products are currently above their safety thresholds."
          />
        )}
      </Card>

      {/* History Modal */}
      <Modal
        isOpen={isOpen}
        onClose={close}
        title={`Order History — ${selectedAlert?.product?.name || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          {/* Product info */}
          <div className="flex items-center justify-between p-3 bg-surface-elevated border border-border">
            <div>
              <p className="text-sm font-bold text-content-primary">{selectedAlert?.product?.name}</p>
              <p className="text-xs text-content-tertiary">SKU: {selectedAlert?.product?.sku} · {selectedAlert?.product?.category}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${selectedAlert?.quantity === 0 ? 'text-state-danger' : 'text-state-warning'}`}>
                {selectedAlert?.quantity} units left
              </p>
              <Badge variant={selectedAlert?.quantity === 0 ? 'danger' : 'warning'}>
                {selectedAlert?.status}
              </Badge>
            </div>
          </div>

          {/* Orders list */}
          {historyLoading ? (
            <div className="flex items-center justify-center py-10">
              <RiLoader4Line className="w-7 h-7 text-brand-teal animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <RiHistoryLine className="w-10 h-10 text-content-tertiary mb-2 opacity-40" />
              <p className="text-sm font-semibold text-content-secondary">No order history found</p>
              <p className="text-xs text-content-tertiary mt-1">This product hasn't been ordered yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {history.map(order => {
                const productLine = order.products?.find(p =>
                  (p.product?._id || p.product)?.toString() === selectedAlert?.product?._id?.toString()
                );
                return (
                  <div key={order._id} className="flex items-center justify-between p-3 border border-border bg-surface-elevated">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                        <RiShoppingCartLine className="w-4 h-4 text-brand-teal" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-content-primary">{order.orderId}</p>
                        <p className="text-xs text-content-tertiary">
                          {order.buyer?.shopName || order.buyer?.businessName || order.buyer?.name || '—'}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <RiTimeLine className="w-3 h-3 text-content-tertiary" />
                          <span className="text-[10px] text-content-tertiary">
                            {formatDateTime(order.createdAt).split(',')[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {productLine && (
                        <p className="text-sm font-bold text-content-primary">
                          Qty: {productLine.quantity}
                        </p>
                      )}
                      <Badge status={order.status?.toLowerCase().replace(' ', '_')}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-[11px] text-content-tertiary text-right">
            {history.length} order{history.length !== 1 ? 's' : ''} found for this product
          </p>
        </div>
      </Modal>
    </div>
  );
}
