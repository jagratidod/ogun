import { useState } from 'react';
import { 
  RiStockLine, RiAddLine, RiSearchLine, RiFilterLine, 
  RiEditLine, RiDeleteBin7Line, RiArrowRightDownLine, 
  RiRepeatLine, RiCheckDoubleLine, RiTruckLine 
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  DataTable, Badge, Button, Input, Select, useModal, Modal, formatCurrency 
} from '../../../core';
import productsData from '../../../data/products.json';
import { toast } from 'react-hot-toast';

export default function DistributorStockPage() {
  const { isOpen, open, close, data: selectedStock } = useModal();
  const [isSending, setIsSending] = useState(false);

  const handleReplenish = () => {
    setIsSending(true);
    toast.loading('Pushing replenishment demand to Admin...');
    setTimeout(() => {
       toast.dismiss();
       toast.success(`Demand for ${selectedStock.name} sent successfully.`);
       setIsSending(false);
       close();
    }, 1500);
  };

  const columns = [
    { key: 'name', label: 'Product Name', sortable: true, render: (val, row) => (
      <div className="flex flex-col">
        <h4 className="text-sm font-semibold text-content-primary leading-tight">{val}</h4>
        <span className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest">{row.sku}</span>
      </div>
    )},
    { key: 'category', label: 'Category' },
    { key: 'stock', label: 'Available Stock', align: 'center', sortable: true, render: (val) => (
       <div className="flex flex-col items-center gap-1.5">
          <span className={`text-sm font-black ${val <= 10 ? 'text-state-danger' : val <= 30 ? 'text-state-warning' : 'text-state-success'}`}>
            {val} units
          </span>
       </div>
    )},
    { key: 'minStock', label: 'Safety Buffer', align: 'center', render: (val) => (
       <span className="text-xs text-content-tertiary font-medium">{val} units</span>
    )},
    { key: 'status', label: 'Availability', render: (val) => (
      <Badge variant={val === 'Available' ? 'success' : val === 'Low Stock' ? 'warning' : 'danger'}>
        {val}
      </Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
      <div className="flex justify-end gap-1">
        <Button variant="icon" title="Request Reorder" onClick={() => open(row)}>
          <RiRepeatLine className="w-4 h-4 text-brand-teal" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Distributor Inventory" 
        subtitle="Manage your specific regional stock levels and safety buffers"
      >
        <Button icon={RiAddLine} onClick={() => toast.success('Physical audit logs saved for syncing...')}>Update Physical Audit</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-2">
         <div className="glass-card p-6 border-l-4 border-brand-teal animate-slide-up">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-2">Total SKU Managed</p>
            <h4 className="text-3xl font-black text-content-primary">{productsData.length}</h4>
            <Badge className="mt-2" variant="teal">HEALTHY SUPPLY</Badge>
         </div>
         <div className="glass-card p-6 border-l-4 border-state-warning animate-slide-up [animation-delay:100ms]">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-2">Replenishment Pushed</p>
            <h4 className="text-3xl font-black text-state-warning">12</h4>
            <div className="mt-2 text-[10px] text-content-tertiary font-bold uppercase">Due in 2 days</div>
         </div>
         <div className="glass-card p-6 border-l-4 border-brand-pink animate-slide-up [animation-delay:200ms]">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-2">Monthly Turnover</p>
            <h4 className="text-3xl font-black text-brand-pink">{formatCurrency(1245000)}</h4>
            <p className="text-xs text-state-success mt-2 font-bold">↑ 8.4% monthly growth</p>
         </div>
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <Select options={[{ label: 'All Stock', value: 'all' }, { label: 'Low Stock Only', value: 'low' }, { label: 'Stock-out', value: 'out' }]} className="w-48" />
              <div className="flex items-center gap-2">
                 <Input icon={RiSearchLine} placeholder="Search name or SKU..." className="w-full md:w-64" />
                 <Button variant="secondary" icon={RiFilterLine}>Filters</Button>
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={productsData} />
      </Card>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={`Replenishment Demand: ${selectedStock?.name}`}
        footer={
           <div className="flex gap-3">
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button icon={RiTruckLine} onClick={handleReplenish} loading={isSending}>Send Request</Button>
           </div>
        }
      >
        <div className="space-y-4">
           <div className="p-4 rounded-none bg-surface-elevated flex items-center justify-between border border-border">
              <div>
                 <p className="text-xs text-content-tertiary uppercase font-black mb-1 tracking-widest">Current Stock</p>
                 <h4 className="text-xl font-black text-state-warning">{selectedStock?.stock} units</h4>
              </div>
              <div className="text-right">
                 <p className="text-xs text-content-tertiary uppercase font-black mb-1 tracking-widest">Threshold</p>
                 <h4 className="text-xl font-bold text-content-primary">{selectedStock?.minStock} units</h4>
              </div>
           </div>
           <Input label="Replenishment Quantity" type="number" placeholder="Enter units needed..." />
           <div className="p-4 rounded-none bg-state-info/5 border border-state-info/20 text-state-info text-xs font-semibold flex items-center gap-3">
              <RiCheckDoubleLine className="w-5 h-5 flex-shrink-0" />
              <p className="leading-tight">This demand will be sent to the <strong>Warehouse Admin</strong> for immediate allocation. Expected pickup: 24-48 hours.</p>
           </div>
        </div>
      </Modal>
    </div>
  );
}
