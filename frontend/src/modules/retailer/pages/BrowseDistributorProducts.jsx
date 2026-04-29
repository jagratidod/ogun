import { useState, useEffect, useMemo } from 'react';
import {
  RiSearchLine, RiShoppingBag3Line, RiInboxLine, RiInformationLine,
  RiCheckboxCircleLine, RiCloseCircleLine, RiFilterLine,
  RiAlertLine, RiRefreshLine, RiGridLine, RiListCheck2,
  RiPriceTag3Line, RiStore3Line, RiArchiveLine, RiCheckDoubleLine
} from 'react-icons/ri';
import {
  PageHeader, Card, CardHeader, DataTable, Badge, Button,
  Input, Select, formatCurrency, Modal, useModal
} from '../../../core';
import retailerService from '../../../core/services/retailerService';
import { toast } from 'react-hot-toast';

// ─── Status badge helper ─────────────────────────────────────────
function StockBadge({ stockStatus }) {
  const map = {
    'In Stock':    { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    'Low Stock':   { cls: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
    'Out of Stock':{ cls: 'bg-red-50 text-red-600 border-red-200',             dot: 'bg-red-500' },
    'Unavailable': { cls: 'bg-slate-50 text-slate-500 border-slate-200',       dot: 'bg-slate-400' },
  };
  const style = map[stockStatus] || map['Unavailable'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${style.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {stockStatus}
    </span>
  );
}

// ─── Product card for grid view ──────────────────────────────────
function ProductCard({ product, onDetail, onQuery, onOrder }) {
  const unavailable = !product.available;

  return (
    <div
      className={`relative flex flex-col border rounded-none overflow-hidden transition-all duration-200 group
        ${unavailable
          ? 'bg-surface-secondary border-border opacity-60'
          : 'bg-surface-card border-border hover:border-brand-teal/40 hover:shadow-lg hover:shadow-brand-teal/5'
        }`}
    >
      <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-300 ${!unavailable ? 'group-hover:scale-105' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <RiInboxLine className="w-10 h-10 text-slate-300" />
          </div>
        )}

        {unavailable && (
          <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
            <span className="bg-slate-800/80 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm">
              Not at Distributor
            </span>
          </div>
        )}

        <div className="absolute top-2 right-2">
          <StockBadge stockStatus={product.stockStatus} />
        </div>
      </div>

      <div className="flex flex-col flex-1 p-3 gap-2">
        <div>
          <p className="text-[11px] font-black text-content-primary leading-tight line-clamp-2 uppercase">{product.name}</p>
          <p className="text-[8px] text-content-tertiary uppercase tracking-[0.2em] font-black mt-0.5">{product.sku}</p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-1 border-t border-border">
          <span className="text-sm font-black text-brand-teal">{formatCurrency(product.retailerPrice)}</span>
          <Badge variant="ghost" size="xs" className="text-[8px] font-black uppercase">{product.category}</Badge>
        </div>

        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase
          ${product.available ? 'text-emerald-600' : 'text-slate-400'}`}>
          {product.available
            ? <RiCheckboxCircleLine className="w-3.5 h-3.5 flex-shrink-0" />
            : <RiCloseCircleLine className="w-3.5 h-3.5 flex-shrink-0" />
          }
          <span>{product.displayStock}</span>
        </div>

        <div className="flex gap-2 mt-1">
          <Button
            variant="secondary" size="xs" className="flex-1 h-7 text-[8px] font-black uppercase"
            icon={RiInformationLine}
            onClick={() => onDetail(product)}
          >
            Detail
          </Button>
          {product.available ? (
            <Button
              variant="primary" size="xs" className="flex-1 h-7 text-[8px] font-black uppercase"
              icon={RiShoppingBag3Line}
              onClick={() => onOrder(product)}
            >
              Order
            </Button>
          ) : (
            <Button
              variant="warning" size="xs" className="flex-1 h-7 text-[8px] font-black uppercase"
              icon={RiAlertLine}
              onClick={() => onQuery(product)}
            >
              Request
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function BrowseDistributorProducts() {
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availFilter, setAvailFilter]     = useState('all');
  const [viewMode, setViewMode]           = useState('grid');
  const { isOpen, open, close, data: selectedProduct } = useModal();

  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [queryProduct, setQueryProduct] = useState(null);
  const [queryQty, setQueryQty] = useState(1);
  const [queryMessage, setQueryMessage] = useState('');
  const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);
  
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderProduct, setOrderProduct] = useState(null);
  const [orderQty, setOrderQty] = useState(1);
  const [orderNote, setOrderNote] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => { fetchCatalog(); }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await retailerService.getAdminCatalog();
      setProducts(res.data || []);
    } catch (error) {
      toast.error('Failed to load product catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQueryModal = (product) => {
    setQueryProduct(product);
    setQueryQty(1);
    setQueryMessage('');
    setIsQueryModalOpen(true);
  };

  const handleSubmitQuery = async () => {
    try {
      setIsSubmittingQuery(true);
      await retailerService.createProductQuery({
        productId: queryProduct.id,
        requestedQuantity: queryQty,
        message: queryMessage
      });
      toast.success('Request sent!');
      setIsQueryModalOpen(false);
    } catch (error) {
      toast.error('Failed to submit request');
    } finally {
      setIsSubmittingQuery(false);
    }
  };

  const handleOpenOrderModal = (product) => {
    setOrderProduct(product);
    setOrderQty(1);
    setOrderNote('');
    setIsOrderModalOpen(true);
  };

  const handleSubmitOrder = async () => {
    try {
      setIsSubmittingOrder(true);
      const orderData = {
        items: [{ productId: orderProduct.id, quantity: orderQty }],
        notes: orderNote
      };
      await retailerService.placeOrder(orderData);
      toast.success(`Order placed successfully!`);
      setIsOrderModalOpen(false);
      fetchCatalog();
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))].filter(Boolean);
    return [
      { label: 'All Categories', value: 'all' },
      ...cats.map(c => ({ label: c, value: c }))
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
      const matchCat    = categoryFilter === 'all' || p.category === categoryFilter;
      const matchAvail  =
        availFilter === 'all'         ? true :
        availFilter === 'available'   ? p.available :
        !p.available;
      return matchSearch && matchCat && matchAvail;
    });
  }, [products, search, categoryFilter, availFilter]);

  const stats = useMemo(() => ({
    total:       products.length,
    available:   products.filter(p => p.available).length,
    unavailable: products.filter(p => !p.available).length,
    lowStock:    products.filter(p => p.stockStatus === 'Low Stock').length,
  }), [products]);

  const statCards = [
    { label: 'Total Catalog', val: stats.total, icon: RiArchiveLine, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
    { label: 'Available', val: stats.available, icon: RiCheckDoubleLine, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
    { label: 'Unavailable', val: stats.unavailable, icon: RiCloseCircleLine, color: 'text-slate-400', bg: 'bg-slate-400/10' },
    { label: 'Low Stock', val: stats.lowStock, icon: RiAlertLine, color: 'text-brand-pink', bg: 'bg-brand-pink/10' }
  ];

  const columns = [
    {
      key: 'name', label: 'Product', sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
            {row.images?.[0]?.url
              ? <img src={row.images[0].url} alt={val} className="w-full h-full object-cover" />
              : <RiInboxLine className="text-slate-300 w-4 h-4" />
            }
          </div>
          <div>
            <p className="text-[11px] font-black text-content-primary leading-tight uppercase">{val}</p>
            <p className="text-[8px] text-content-tertiary uppercase tracking-widest font-black mt-0.5">{row.sku}</p>
          </div>
        </div>
      )
    },
    {
      key: 'retailerPrice', label: 'Your MOP', sortable: true,
      render: (val) => <span className="font-black text-brand-teal text-[11px]">{formatCurrency(val)}</span>
    },
    {
      key: 'distributorUnits', label: 'Dist. Stock', align: 'center',
      render: (val, row) => (
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black uppercase text-content-primary">{row.displayStock}</span>
          <StockBadge stockStatus={row.stockStatus} />
        </div>
      )
    },
    {
      key: 'actions', label: 'Actions', align: 'right',
      render: (_, row) => (
        <div className="flex justify-end gap-1">
          <Button variant="secondary" size="sm" className="h-7 px-2 text-[8px] font-black uppercase" icon={RiInformationLine} onClick={() => open(row)}>Detail</Button>
          {row.available ? (
             <Button variant="primary" size="sm" className="h-7 px-2 text-[8px] font-black uppercase" icon={RiShoppingBag3Line} onClick={() => handleOpenOrderModal(row)}>Order</Button>
          ) : (
             <Button variant="warning" size="sm" className="h-7 px-2 text-[8px] font-black uppercase" icon={RiAlertLine} onClick={() => handleOpenQueryModal(row)}>Request</Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-3 space-y-5 bg-surface-primary min-h-screen pb-24">

      {/* KPI Cards Grid - Premium Style */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            className="p-4 bg-white border border-border shadow-sm flex flex-col gap-3 relative overflow-hidden rounded-[24px]"
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

      {/* Modern Filter Section */}
      <div className="space-y-2">
         <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-teal">
               <RiSearchLine className="w-4 h-4" />
            </div>
            <input
               type="text"
               placeholder="Search product catalog..."
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="w-full h-11 pl-11 pr-4 bg-white border border-border shadow-sm outline-none focus:border-brand-teal/30 transition-all text-[10px] font-bold"
            />
         </div>
         <div className="flex gap-2">
            <Select
               className="flex-1 h-11 text-[9px] font-black uppercase"
               value={categoryFilter}
               onChange={e => setCategoryFilter(e.target.value)}
               options={categories}
            />
            <div className="flex border border-border rounded-xl overflow-hidden bg-white">
               <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 transition-colors ${viewMode === 'grid' ? 'bg-brand-teal text-white' : 'text-content-tertiary hover:bg-surface-secondary'}`}
               >
                  <RiGridLine className="w-4 h-4" />
               </button>
               <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 transition-colors ${viewMode === 'table' ? 'bg-brand-teal text-white' : 'text-content-tertiary hover:bg-surface-secondary'}`}
               >
                  <RiListCheck2 className="w-4 h-4" />
               </button>
            </div>
         </div>
      </div>

      {/* Content View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-3">
          {loading ? Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="aspect-square bg-white border border-border animate-pulse rounded-[24px]" />
          )) : filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onDetail={open} onQuery={handleOpenQueryModal} onOrder={handleOpenOrderModal} />
          ))}
        </div>
      ) : (
        <Card className="rounded-[24px] overflow-hidden">
          <DataTable columns={columns} data={filteredProducts} loading={loading} />
        </Card>
      )}

      {/* Detail Modal */}
      <Modal isOpen={isOpen} onClose={close} title={selectedProduct?.name} className="rounded-[32px]">
        {selectedProduct && (
          <div className="space-y-5 py-2">
            <div className="aspect-video bg-white border border-border flex items-center justify-center overflow-hidden rounded-[20px]">
              {selectedProduct.images?.[0]?.url
                ? <img src={selectedProduct.images[0].url} alt="" className="w-full h-full object-contain" />
                : <RiInboxLine className="w-12 h-12 text-slate-200" />
              }
            </div>

            <div className="flex items-center justify-between">
              <div>
                 <p className="text-[10px] text-content-tertiary font-black uppercase tracking-widest">{selectedProduct.sku}</p>
                 <h3 className="text-sm font-black text-content-primary uppercase mt-1">{selectedProduct.name}</h3>
              </div>
              <Badge variant="teal" size="xs" className="uppercase font-black">{selectedProduct.category}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-brand-teal/5 border border-brand-teal/10 rounded-[20px]">
                <p className="text-[9px] text-brand-teal font-black uppercase tracking-widest mb-1">Retailer MOP</p>
                <p className="text-xl font-black text-brand-teal">{formatCurrency(selectedProduct.retailerPrice)}</p>
              </div>
              <div className="p-4 bg-surface-secondary border border-border rounded-[20px]">
                <p className="text-[9px] text-content-tertiary font-black uppercase tracking-widest mb-1">Market MRP</p>
                <p className="text-xl font-black text-content-primary">{formatCurrency(selectedProduct.mrp)}</p>
              </div>
            </div>

            <div className="p-4 rounded-[20px] bg-white border border-border space-y-3">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-content-tertiary uppercase">Distributor Supply</span>
                  <StockBadge stockStatus={selectedProduct.stockStatus} />
               </div>
               <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${selectedProduct.available ? 'bg-brand-teal' : 'bg-slate-300'}`} style={{ width: selectedProduct.available ? '100%' : '0%' }} />
               </div>
               <p className="text-[10px] font-bold text-content-secondary text-center uppercase tracking-widest leading-none">
                  {selectedProduct.displayStock}
               </p>
            </div>

            <div className="flex gap-3 w-full pt-2">
              <Button className="flex-1 h-11 uppercase text-[10px] font-black" variant="secondary" onClick={close}>Cancel</Button>
              {selectedProduct.available ? (
                <Button className="flex-1 h-11 uppercase text-[10px] font-black" icon={RiShoppingBag3Line} onClick={() => { close(); handleOpenOrderModal(selectedProduct); }}>Order Now</Button>
              ) : (
                <Button className="flex-1 h-11 uppercase text-[10px] font-black" variant="warning" icon={RiAlertLine} onClick={() => { close(); handleOpenQueryModal(selectedProduct); }}>Request</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Simple Order Modal */}
      <Modal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} title="Market Order" className="rounded-[32px]">
         <div className="space-y-4 py-2 text-center">
            <h4 className="text-lg font-black text-content-primary uppercase tracking-tight">{orderProduct?.name}</h4>
            <div className="p-4 bg-brand-teal/5 border border-brand-teal/10 rounded-[24px]">
               <Input label="Quantity" type="number" value={orderQty} onChange={(e) => setOrderQty(parseInt(e.target.value) || 1)} className="h-12 text-center text-xl font-black" />
               <div className="mt-4 flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-brand-teal uppercase">Total Amount</span>
                  <span className="text-lg font-black text-brand-teal">{formatCurrency((orderProduct?.retailerPrice || 0) * orderQty)}</span>
               </div>
            </div>
            <Button className="w-full h-12 uppercase text-[11px] font-black shadow-lg" loading={isSubmittingOrder} onClick={handleSubmitOrder}>Confirm Supply Order</Button>
         </div>
      </Modal>

      {/* Simple Request Modal */}
      <Modal isOpen={isQueryModalOpen} onClose={() => setIsQueryModalOpen(false)} title="Product Request" className="rounded-[32px]">
         <div className="space-y-4 py-2">
            <Input label="Desired Quantity" type="number" value={queryQty} onChange={(e) => setQueryQty(parseInt(e.target.value) || 1)} className="h-12 text-xl font-black" />
            <textarea className="w-full bg-surface-secondary border border-border p-4 rounded-[20px] text-sm focus:border-brand-teal outline-none min-h-[100px]" placeholder="Add a message for distributor..." value={queryMessage} onChange={(e) => setQueryMessage(e.target.value)} />
            <Button className="w-full h-12 uppercase text-[11px] font-black shadow-lg" variant="warning" loading={isSubmittingQuery} onClick={handleSubmitQuery}>Send Availability Request</Button>
         </div>
      </Modal>
    </div>
  );
}
