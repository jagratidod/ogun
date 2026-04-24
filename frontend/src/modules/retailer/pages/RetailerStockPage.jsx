import { useState, useMemo, useEffect } from 'react';
import { RiStockLine, RiAddLine, RiSearchLine, RiFilterLine, RiEditLine, RiDeleteBin7Line, RiArrowRightDownLine, RiRepeatLine, RiTruckLine, RiInformationLine, RiRefreshLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, useModal, Modal, formatCurrency } from '../../../core';
import retailerService from '../../../core/services/retailerService';
import { toast } from 'react-hot-toast';

export default function RetailerStockPage() {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { isOpen, open, close, data: selectedStock } = useModal();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await retailerService.getMyInventory();
      // Map API data to flat structure for easier filtering/display
      const mapped = (res.data || []).map(item => ({
        id: item._id,
        name: item.product?.name || 'Unknown Product',
        sku: item.product?.sku || 'N/A',
        stock: item.quantity,
        purchasePrice: item.product?.distributorPrice || 0, // This is what retailer paid
        mrp: item.product?.mrp || 0,
        category: item.product?.category,
        original: item
      }));
      setStockData(mapped);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return stockData.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const status = p.stock === 0 ? 'out' : p.stock <= 5 ? 'low' : 'available';
      const matchStatus = statusFilter === 'all' || status === statusFilter;
      
      return matchSearch && matchStatus;
    });
  }, [stockData, searchTerm, statusFilter]);

  const handleRestock = () => {
    toast.success(`Restock request for ${selectedStock.name} sent to distributor.`);
    close();
  };

  const columns = [
    { key: 'name', label: 'Product Model', sortable: true, render: (val, row) => (
      <div className="flex flex-col">
        <h4 className="text-sm font-semibold text-content-primary leading-tight">{val}</h4>
        <span className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest">{row.sku}</span>
      </div>
    )},
    { key: 'stock', label: 'In-Store Qty', align: 'center', sortable: true, render: (val) => (
       <div className="flex flex-col items-center gap-1.5">
          <span className={`text-sm font-black ${val <= 3 ? 'text-state-danger' : val <= 8 ? 'text-state-warning' : 'text-state-success'}`}>
            {val} units
          </span>
       </div>
    )},
    { key: 'purchasePrice', label: 'Purchase Price (Unit)', align: 'right', render: (val) => (
       <span className="text-xs font-bold text-brand-teal">{formatCurrency(val)}</span>
    )},
    { key: 'status', label: 'Stock Status', render: (_, row) => {
      const status = row.stock === 0 ? 'Stock-out' : row.stock <= 5 ? 'Low Stock' : 'Available';
      return (
        <Badge variant={status === 'Available' ? 'success' : status === 'Low Stock' ? 'warning' : 'danger'}>
          {status}
        </Badge>
      );
    }},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
      <div className="flex justify-end gap-1">
        <Button variant="secondary" size="sm" icon={RiTruckLine} onClick={() => open(row)}>Restock</Button>
      </div>
    )},
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Store Inventory" 
        subtitle="Manage and audit on-shelf appliance stock levels and localized pricing"
      >
        <Button variant="secondary" icon={RiRefreshLine} onClick={fetchInventory} disabled={loading}>Refresh</Button>
        <Button icon={RiAddLine}>Physical Count Audit</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-2">
         <div className="glass-card p-6 border-l-4 border-brand-teal relative overflow-hidden group hover:-translate-y-1 transition-all">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-2">Inventory Depth</p>
            <h4 className="text-3xl font-black text-content-primary">{stockData.length} SKUs</h4>
            <Badge className="mt-2" variant="teal">HEALTHY SUPPLY</Badge>
         </div>
         <div className="glass-card p-6 border-l-4 border-state-warning flex flex-col justify-between group hover:-translate-y-1 transition-all">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-2">Reorder Alerts</p>
            <h4 className="text-3xl font-black text-state-warning">
              {stockData.filter(p => p.stock <= 5).length} Items
            </h4>
            <p className="text-[10px] text-content-tertiary mt-2">Critical below safety buffer</p>
         </div>
         <div className="glass-card p-6 border-l-4 border-brand-pink group hover:-translate-y-1 transition-all">
            <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-2">Inventory Value</p>
            <h4 className="text-3xl font-black text-brand-pink">{formatCurrency(stockData.reduce((acc, p) => acc + (p.price * p.stock), 0))}</h4>
            <p className="text-xs text-state-success font-bold mt-2">Estimated Market Val</p>
         </div>
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[{ label: 'All Stock', value: 'all' }, { label: 'Available', value: 'available' }, { label: 'Low Stock', value: 'low' }, { label: 'Stock-out', value: 'out' }]} 
                className="w-48" 
              />
              <div className="flex items-center gap-2">
                 <Input 
                   icon={RiSearchLine} 
                   placeholder="Search product or SKU..." 
                   className="w-full md:w-64"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={filteredProducts} loading={loading} />
      </Card>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={`Restock Demand: ${selectedStock?.name}`}
        footer={
           <div className="flex gap-3">
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button icon={RiTruckLine} onClick={handleRestock}>Send Request to Distributor</Button>
           </div>
        }
      >
        <div className="space-y-5">
           <div className="p-4 rounded-none bg-surface-elevated border border-border flex items-center justify-between">
              <div>
                 <p className="text-xs text-content-tertiary uppercase font-black mb-1">On-Counter</p>
                 <h4 className="text-2xl font-black text-brand-teal">{selectedStock?.stock} Units</h4>
              </div>
              <RiArrowRightDownLine className="text-content-tertiary w-6 h-6 animate-pulse" />
              <div className="text-right">
                 <p className="text-xs text-content-tertiary uppercase font-black mb-1">Local Threshold</p>
                 <h4 className="text-2xl font-bold text-content-primary">5 Units</h4>
              </div>
           </div>
           <Input label="Restock Quantity Needed" type="number" placeholder="Enter quantity..." />
           <div className="p-4 rounded-none bg-state-info/5 border border-state-info/20 text-state-info text-xs font-semibold flex gap-3">
              <RiInformationLine className="w-5 h-5 flex-shrink-0" />
              <p className="leading-relaxed">This request will be sent to your assigned distributor for regional inventory fulfillment. Standard delivery is 24-48 hours.</p>
           </div>
        </div>
      </Modal>
    </div>
  );
}
