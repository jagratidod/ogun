import { useState, useEffect, useMemo } from 'react';
import { RiSearchLine, RiFilterLine, RiShoppingBag3Line, RiInboxLine, RiInformationLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, DataTable, Badge, Button, Input, Select, formatCurrency, Modal, useModal } from '../../../core';
import retailerService from '../../../core/services/retailerService';
import { toast } from 'react-hot-toast';

export default function BrowseDistributorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { isOpen, open, close, data: selectedProduct } = useModal();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await retailerService.getDistributorProducts();
      setProducts(res.data || []);
    } catch (error) {
      toast.error('Failed to load distributor products');
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))].filter(Boolean);
    return [{ label: 'All Categories', value: 'all' }, ...cats.map(c => ({ label: c, value: c }))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, categoryFilter]);

  const columns = [
    { key: 'name', label: 'Product', sortable: true, render: (val, row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded flex items-center justify-center overflow-hidden">
           {row.images?.[0]?.url ? (
             <img src={row.images[0].url} alt={val} className="w-full h-full object-cover" />
           ) : (
             <RiInboxLine className="text-slate-300 w-5 h-5" />
           )}
        </div>
        <div>
          <p className="text-sm font-bold text-content-primary leading-tight">{val}</p>
          <p className="text-[10px] text-content-tertiary uppercase tracking-widest font-black mt-0.5">{row.sku}</p>
        </div>
      </div>
    )},
    { key: 'category', label: 'Category', render: (val) => (
      <Badge variant="ghost">{val || 'General'}</Badge>
    )},
    { key: 'retailerPrice', label: 'MOP (Your Price)', sortable: true, render: (val) => (
      <span className="font-bold text-brand-teal">{formatCurrency(val)}</span>
    )},
    { key: 'availableStock', label: 'Distributor Stock', align: 'center', render: (val) => (
      <div className="flex flex-col items-center">
        <span className={`text-sm font-black ${val === 0 ? 'text-state-danger' : val <= 10 ? 'text-state-warning' : 'text-state-success'}`}>
          {val} Units
        </span>
        {val === 0 && <span className="text-[9px] font-bold text-state-danger uppercase">Stock Out</span>}
      </div>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="xs" icon={RiInformationLine} onClick={() => open(row)}>Detail</Button>
        <Button variant="primary" size="xs" icon={RiShoppingBag3Line} disabled={row.availableStock === 0}>Order</Button>
      </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Distributor Marketplace" 
        subtitle="Browse and order products directly from your assigned distributor's inventory"
      >
        <Button icon={RiShoppingBag3Line} variant="secondary" onClick={fetchProducts}>Refresh Catalog</Button>
      </PageHeader>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                 <Select
                   className="w-48"
                   value={categoryFilter}
                   onChange={(e) => setCategoryFilter(e.target.value)}
                   options={categories}
                 />
                 <Input
                   icon={RiSearchLine}
                   placeholder="Search product or SKU..."
                   className="w-full md:w-64"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
              <div className="flex items-center gap-2">
                 <Badge variant="teal">{filteredProducts.length} Products Available</Badge>
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={loading ? [] : filteredProducts} loading={loading} />
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={`Product Detail: ${selectedProduct?.name}`}
        size="md"
      >
        <div className="space-y-6 py-2">
           <div className="aspect-video bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
              {selectedProduct?.images?.[0]?.url ? (
                <img src={selectedProduct.images[0].url} alt="" className="w-full h-full object-contain" />
              ) : (
                <RiInboxLine className="w-12 h-12 text-slate-200" />
              )}
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-secondary border border-border">
                 <p className="text-[10px] text-content-tertiary font-black uppercase tracking-widest mb-1">Market Price (MOP)</p>
                 <h4 className="text-xl font-black text-brand-teal">{formatCurrency(selectedProduct?.retailerPrice)}</h4>
              </div>
              <div className="p-4 bg-surface-secondary border border-border">
                 <p className="text-[10px] text-content-tertiary font-black uppercase tracking-widest mb-1">Available at Distributor</p>
                 <h4 className={`text-xl font-black ${selectedProduct?.availableStock === 0 ? 'text-state-danger' : 'text-content-primary'}`}>
                    {selectedProduct?.availableStock} Units
                 </h4>
              </div>
           </div>

           <div>
              <h5 className="text-xs font-bold text-content-primary mb-2 border-b border-border pb-1 uppercase tracking-wider">Product Description</h5>
              <p className="text-sm text-content-secondary leading-relaxed">
                 {selectedProduct?.description || 'No detailed description provided for this SKU. Please contact your distributor for technical specifications.'}
              </p>
           </div>
           
           <div className="flex gap-3 pt-4 border-t border-border">
              <Button className="flex-1" variant="secondary" onClick={close}>Close</Button>
              <Button className="flex-1" icon={RiShoppingBag3Line} disabled={selectedProduct?.availableStock === 0}>Place Order Request</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
}
