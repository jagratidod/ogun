import { useState, useEffect } from 'react';
import { RiAlertLine, RiShoppingCartLine, RiArrowRightUpLine, RiErrorWarningLine, RiCalendarCheckLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, EmptyState, formatCurrency, TableSkeleton } from '../../../core';
import inventoryService from '../../../core/services/inventoryService';
import { toast } from 'react-hot-toast';

export default function StockAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await inventoryService.getAlerts();
      setAlerts(res.data || []);
    } catch (error) {
      toast.error('Failed to fetch stock alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handlePlacePO = (product) => {
     toast.success(`Purchase Order initiated for ${product.name}. Stock update pending.`);
  };

  const columns = [
    { key: 'product', label: 'Product Details', render: (val) => (
      <div>
        <h4 className="text-sm font-semibold text-content-primary leading-tight">{val?.name}</h4>
        <span className="text-[10px] text-content-tertiary">SKU: {val?.sku}</span>
      </div>
    )},
    { key: 'product', label: 'Category', render: (val) => (
      <Badge variant="teal">{val?.category}</Badge>
    )},
    { key: 'quantity', label: 'Quantity Left', align: 'center', render: (val) => (
       <span className={`text-sm font-bold ${val === 0 ? 'text-state-danger' : 'text-state-warning'}`}>
          {val} units
       </span>
    )},
    { key: 'minStockThreshold', label: 'Threshold', align: 'center', render: (val) => (
       <span className="text-sm text-content-tertiary">{val} units</span>
    )},
    { key: 'status', label: 'Alert Type', render: (val) => (
      <Badge size="sm" variant={val === 'Out of Stock' ? 'danger' : 'warning'}>
         {val}
      </Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" icon={RiShoppingCartLine} onClick={() => handlePlacePO(row.product)}>Replenish</Button>
          <Button variant="ghost" size="sm" icon={RiArrowRightUpLine}>View History</Button>
       </div>
    )}
  ];

  if (loading) return <div className="page-container"><TableSkeleton /></div>;

  const outOfStockCount = alerts.filter(a => a.quantity === 0).length;
  const lowStockCount = alerts.filter(a => a.quantity > 0).length;

  return (
    <div className="page-container">
      <PageHeader 
        title="Stock Alerts" 
        subtitle="Critical inventory items requiring immediate attention"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 border-l-4 border-state-danger">
          <div className="flex items-start gap-4">
             <div className="w-12 h-12 rounded-none bg-state-danger/15 flex items-center justify-center">
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
             <div className="w-12 h-12 rounded-none bg-state-warning/15 flex items-center justify-center">
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
             <div className="w-12 h-12 rounded-none bg-brand-teal/15 flex items-center justify-center">
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

      <Card>
        <CardHeader>
          <CardTitle>Active Inventory Alarms</CardTitle>
          <CardDescription>Items currently below the safety threshold in your warehouse</CardDescription>
        </CardHeader>
        {alerts.length > 0 ? (
           <DataTable columns={columns} data={alerts} />
        ) : (
           <EmptyState 
             icon={RiErrorWarningLine} 
             title="Inventory Healthy" 
             description="All products are currently above their safety thresholds."
           />
        )}
      </Card>
    </div>
  );
}

