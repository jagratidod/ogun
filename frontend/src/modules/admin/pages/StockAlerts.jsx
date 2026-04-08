import { useState } from 'react';
import { RiAlertLine, RiShoppingCartLine, RiArrowRightUpLine, RiErrorWarningLine, RiCalendarCheckLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, EmptyState, formatCurrency } from '../../../core';
import productsData from '../../../data/products.json';
import { toast } from 'react-hot-toast';

export default function StockAlertsPage() {
  const [alerts, setAlerts] = useState(productsData.filter(p => p.stock <= p.minStock));

  const handlePlacePO = (product) => {
     // Simulated Action: Place a Purchase Order
     toast.success(`Purchase Order placed for ${product.name}. Stock will be updated shortly.`);
     setAlerts(prev => prev.filter(a => a.id !== product.id));
  };

  const columns = [
    { key: 'name', label: 'Product Name', render: (val, row) => (
      <div>
        <h4 className="text-sm font-semibold text-content-primary leading-tight">{val}</h4>
        <span className="text-[10px] text-content-tertiary">SKU: {row.sku}</span>
      </div>
    )},
    { key: 'category', label: 'Category' },
    { key: 'stock', label: 'Quantity Left', align: 'center', render: (val) => (
       <span className={`text-sm font-bold ${val === 0 ? 'text-state-danger' : 'text-state-warning'}`}>
          {val} units
       </span>
    )},
    { key: 'minStock', label: 'Threshold', align: 'center', render: (val) => (
       <span className="text-sm text-content-tertiary">{val} units</span>
    )},
    { key: 'status', label: 'Alert Type', render: (val) => (
      <Badge size="sm" variant={val === 'Out of Stock' ? 'danger' : 'warning'}>
         {val}
      </Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" icon={RiShoppingCartLine} onClick={() => handlePlacePO(row)}>Place PO</Button>
          <Button variant="ghost" size="sm" icon={RiArrowRightUpLine}>Details</Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Stock Alerts" 
        subtitle="Critical items requiring immediate replenishment"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 border-l-4 border-state-danger">
          <div className="flex items-start gap-4">
             <div className="w-12 h-12 rounded-none bg-state-danger/15 flex items-center justify-center">
                <RiErrorWarningLine className="text-state-danger w-6 h-6" />
             </div>
             <div>
                <p className="text-xs text-content-tertiary font-bold uppercase tracking-wider">Out of Stock</p>
                <h4 className="text-2xl font-bold text-content-primary">{alerts.filter(p => p.stock === 0).length} items</h4>
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
                <h4 className="text-2xl font-bold text-content-primary">{alerts.filter(p => p.stock > 0).length} items</h4>
             </div>
          </div>
        </div>
        <div className="glass-card p-5 border-l-4 border-brand-teal">
          <div className="flex items-start gap-4">
             <div className="w-12 h-12 rounded-none bg-brand-teal/15 flex items-center justify-center">
                <RiCalendarCheckLine className="text-brand-teal w-6 h-6" />
             </div>
             <div>
                <p className="text-xs text-content-tertiary font-bold uppercase tracking-wider">Incoming Shipment</p>
                <h4 className="text-2xl font-bold text-content-primary">3 shipments</h4>
                <span className="text-[10px] text-content-tertiary">Due in 2-4 days</span>
             </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Inventory Alarms</CardTitle>
          <CardDescription>Items that are below their minimum configured stock threshold</CardDescription>
        </CardHeader>
        {alerts.length > 0 ? (
           <DataTable columns={columns} data={alerts} />
        ) : (
           <EmptyState 
             icon={RiErrorWarningLine} 
             title="No Active Alerts" 
             description="All products are well within their stocking thresholds."
           />
        )}
      </Card>
    </div>
  );
}

