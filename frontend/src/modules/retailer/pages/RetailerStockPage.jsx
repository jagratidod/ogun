import { useState, useMemo, useEffect } from 'react';
import { 
  RiStockLine, RiAddLine, RiSearchLine, RiFilterLine, RiEditLine, 
  RiDeleteBin7Line, RiArrowRightDownLine, RiRepeatLine, RiTruckLine, 
  RiInformationLine, RiRefreshLine, RiCheckDoubleLine, RiPriceTag3Line,
  RiBox3Line, RiAlertLine, RiMoneyDollarCircleLine
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  DataTable, Badge, Button, Input, Select, useModal, Modal, 
  formatCurrency 
} from '../../../core';
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
      const mapped = (res.data || []).map(item => ({
        id: item._id,
        name: item.product?.name || 'Unknown Product',
        sku: item.product?.sku || 'N/A',
        stock: item.quantity,
        purchasePrice: item.product?.retailerPrice || 0,
        sellingPrice: item.sellingPrice || item.product?.retailerPrice || 0,
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

  const [updateLoading, setUpdateLoading] = useState(false);
  const [editPrice, setEditPrice] = useState(0);

  const handleOpenEdit = (row) => {
    setEditPrice(row.sellingPrice);
    open(row);
  };

  const handleUpdateInventory = async () => {
    try {
      setUpdateLoading(true);
      await retailerService.updateInventoryItem(selectedStock.id, { 
        sellingPrice: Number(editPrice) 
      });
      toast.success('Selling price updated');
      close();
      fetchInventory();
    } catch (error) {
      toast.error('Failed to update price');
    } finally {
      setUpdateLoading(false);
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
    toast.success(`Restock request for ${selectedStock.name} sent.`);
    close();
  };

  const statCards = [
    { label: 'SKU Inventory', val: `${stockData.length} Models`, icon: RiBox3Line, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
    { label: 'Low Stock', val: `${stockData.filter(p => p.stock <= 5).length} Items`, icon: RiAlertLine, color: 'text-state-warning', bg: 'bg-state-warning/10' },
    { label: 'Stock Value', val: formatCurrency(stockData.reduce((acc, p) => acc + (p.sellingPrice * p.stock), 0)), icon: RiMoneyDollarCircleLine, color: 'text-brand-pink', bg: 'bg-brand-pink/10' }
  ];

  const columns = [
    { key: 'name', label: 'Product Model', sortable: true, render: (val, row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-surface-elevated border border-border flex items-center justify-center overflow-hidden">
           {row.original.product?.images?.[0]?.url ? (
             <img src={row.original.product.images[0].url} className="w-full h-full object-cover" alt="" />
           ) : <RiStockLine className="text-content-tertiary" />}
        </div>
        <div className="flex flex-col">
          <h4 className="text-[11px] font-black text-content-primary uppercase tracking-tight leading-tight">{val}</h4>
          <span className="text-[8px] text-content-tertiary font-black uppercase tracking-[0.2em]">{row.sku}</span>
        </div>
      </div>
    )},
    { key: 'stock', label: 'In-Store', align: 'center', sortable: true, render: (val) => (
      <span className={`text-[11px] font-black ${val <= 3 ? 'text-state-danger' : val <= 8 ? 'text-state-warning' : 'text-state-success'}`}>
        {val} units
      </span>
    )},
    { key: 'sellingPrice', label: 'Selling Price', align: 'right', render: (val) => (
      <span className="text-[11px] font-black text-brand-teal">{formatCurrency(val)}</span>
    )},
    { key: 'status', label: 'Status', render: (_, row) => {
      const status = row.stock === 0 ? 'Out' : row.stock <= 5 ? 'Low' : 'OK';
      return (
        <Badge variant={status === 'OK' ? 'success' : status === 'Low' ? 'warning' : 'danger'} size="xs" className="text-[7px] font-black uppercase">
          {status}
        </Badge>
      );
    }},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
      <div className="flex justify-end gap-1">
        <Button variant="secondary" size="sm" className="h-7 px-2 text-[8px] font-black uppercase" icon={RiEditLine} onClick={() => handleOpenEdit(row)}>Price</Button>
        <Button variant="secondary" size="sm" className="h-7 px-2 text-[8px] font-black uppercase" icon={RiTruckLine} onClick={() => open(row)}>Restock</Button>
      </div>
    )},
  ];

  return (
    <div className="p-3 space-y-5 bg-surface-primary min-h-screen pb-24">
      {/* Header */}
      <section className="flex justify-between items-center px-1 pt-2">
         <div>
            <h2 className="text-xl font-black text-content-primary tracking-tighter uppercase">Inventory</h2>
            <p className="text-[9px] text-brand-teal font-black uppercase tracking-widest leading-none mt-1">Stock Control Center</p>
         </div>
         <Button variant="secondary" size="sm" className="h-9 px-3 text-[9px] font-black uppercase" icon={RiRefreshLine} onClick={fetchInventory} disabled={loading}>Sync</Button>
      </section>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            className={`p-4 bg-white border border-border shadow-sm flex flex-col gap-3 relative overflow-hidden rounded-[24px] ${i === 2 ? 'col-span-2 flex-row items-center gap-4 py-3' : ''}`}
          >
            <div className={`w-10 h-10 rounded-2xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`${stat.color} w-5 h-5`} />
            </div>
            <div>
              <p className="text-[9px] font-black text-content-tertiary uppercase tracking-widest leading-none mb-1.5 opacity-60">{stat.label}</p>
              <h4 className="text-lg font-black text-content-primary tracking-tighter">
                {stat.val}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
         <div className="relative flex-1 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-teal">
               <RiSearchLine className="w-4 h-4" />
            </div>
            <input
               type="text"
               placeholder="Search models..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full h-11 pl-11 pr-4 bg-white border border-border shadow-sm outline-none focus:border-brand-teal/30 transition-all text-[10px] font-bold"
            />
         </div>
         <Select 
           value={statusFilter}
           onChange={(e) => setStatusFilter(e.target.value)}
           options={[{ label: 'All', value: 'all' }, { label: 'In Stock', value: 'available' }, { label: 'Low', value: 'low' }, { label: 'Out', value: 'out' }]} 
           className="w-24 h-11 text-[9px] font-black uppercase"
         />
      </div>

      <Card className="rounded-[24px] overflow-hidden">
        <DataTable columns={columns} data={filteredProducts} loading={loading} />
      </Card>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={selectedStock?.sku ? `SKU: ${selectedStock.sku}` : 'Stock Action'}
        className="rounded-[32px]"
        footer={
           <div className="flex gap-3 w-full">
              <Button variant="secondary" className="flex-1 h-11 uppercase text-[10px] font-black" onClick={close}>Cancel</Button>
              {selectedStock?.sellingPrice !== undefined ? (
                 <Button className="flex-1 h-11 uppercase text-[10px] font-black" icon={RiCheckDoubleLine} onClick={handleUpdateInventory} loading={updateLoading}>Update Price</Button>
              ) : (
                 <Button className="flex-1 h-11 uppercase text-[10px] font-black" icon={RiTruckLine} onClick={handleRestock}>Request Stock</Button>
              )}
           </div>
        }
      >
        <div className="space-y-5 py-2">
           <div className="p-4 rounded-[20px] bg-surface-secondary flex items-center justify-between border border-border/50">
              <div>
                 <p className="text-[9px] text-content-tertiary uppercase font-black mb-1">On-Shelf</p>
                 <h4 className="text-2xl font-black text-brand-teal">{selectedStock?.stock} Units</h4>
              </div>
              <RiArrowRightDownLine className="text-content-tertiary w-6 h-6" />
              <div className="text-right">
                 <p className="text-[9px] text-content-tertiary uppercase font-black mb-1">Purchase Cost</p>
                 <h4 className="text-2xl font-black text-content-primary">{formatCurrency(selectedStock?.purchasePrice)}</h4>
              </div>
           </div>

           {selectedStock?.sellingPrice !== undefined ? (
              <div className="space-y-4">
                 <div className="p-5 bg-brand-teal/5 border border-brand-teal/10 rounded-[24px]">
                    <p className="text-[10px] text-brand-teal font-black mb-4 uppercase tracking-widest">Adjust Customer Pricing</p>
                    <Input 
                      type="number" 
                      label="Selling Price (₹)" 
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      placeholder="Amount"
                      icon={RiPriceTag3Line}
                      className="h-12 text-lg font-black"
                    />
                    <div className="mt-4 p-3 bg-white border border-brand-teal/10 rounded-xl flex items-center justify-between">
                       <span className="text-[8px] font-black text-content-tertiary uppercase">Recommended MRP</span>
                       <span className="text-[11px] font-black text-brand-teal">{formatCurrency(selectedStock.mrp)}</span>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="space-y-4">
                 <Input label="Quantity Needed" type="number" placeholder="Enter units..." className="h-12" />
                 <div className="p-4 rounded-[20px] bg-brand-teal/5 border border-brand-teal/10 text-brand-teal text-[10px] font-black uppercase flex gap-3 leading-relaxed">
                    <RiInformationLine className="w-5 h-5 flex-shrink-0" />
                    <p>Standard fulfillment via regional distributor. Expect delivery within 24-48 business hours.</p>
                 </div>
              </div>
           )}
        </div>
      </Modal>
    </div>
  );
}
