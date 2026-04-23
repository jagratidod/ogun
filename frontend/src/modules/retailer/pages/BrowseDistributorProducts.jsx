import { useState, useEffect, useMemo } from 'react';
import {
  RiSearchLine, RiShoppingBag3Line, RiInboxLine, RiInformationLine,
  RiCheckboxCircleLine, RiCloseCircleLine, RiFilterLine,
  RiAlertLine, RiRefreshLine, RiGridLine, RiListCheck2,
  RiPriceTag3Line, RiStore3Line
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
function ProductCard({ product, onDetail, onQuery }) {
  const unavailable = !product.available;

  return (
    <div
      className={`relative flex flex-col border rounded-none overflow-hidden transition-all duration-200 group
        ${unavailable
          ? 'bg-surface-secondary border-border opacity-60'
          : 'bg-surface-card border-border hover:border-brand-teal/40 hover:shadow-lg hover:shadow-brand-teal/5'
        }`}
    >
      {/* Product Image */}
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

        {/* Availability overlay for unavailable products */}
        {unavailable && (
          <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
            <span className="bg-slate-800/80 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm">
              Not at Distributor
            </span>
          </div>
        )}

        {/* Stock badge top-right */}
        <div className="absolute top-2 right-2">
          <StockBadge stockStatus={product.stockStatus} />
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <div>
          <p className="text-xs font-black text-content-primary leading-snug line-clamp-2">{product.name}</p>
          <p className="text-[9px] text-content-tertiary uppercase tracking-widest font-black mt-0.5">{product.sku}</p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-1 border-t border-border">
          <span className="text-sm font-black text-brand-teal">{formatCurrency(product.retailerPrice)}</span>
          <Badge variant="ghost" className="text-[9px]">{product.category}</Badge>
        </div>

        {/* Units row */}
        <div className={`flex items-center gap-1.5 text-[11px] font-bold
          ${product.available ? 'text-emerald-600' : 'text-slate-400'}`}>
          {product.available
            ? <RiCheckboxCircleLine className="w-3.5 h-3.5 flex-shrink-0" />
            : <RiCloseCircleLine className="w-3.5 h-3.5 flex-shrink-0" />
          }
          <span>{product.displayStock}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <Button
            variant="secondary" size="xs" className="flex-1"
            icon={RiInformationLine}
            onClick={() => onDetail(product)}
          >
            Detail
          </Button>
          {product.available ? (
            <Button
              variant="primary" size="xs" className="flex-1"
              icon={RiShoppingBag3Line}
            >
              Order
            </Button>
          ) : (
            <Button
              variant="warning" size="xs" className="flex-1 text-[10px]"
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
  const [availFilter, setAvailFilter]     = useState('all'); // 'all' | 'available' | 'unavailable'
  const [viewMode, setViewMode]           = useState('grid'); // 'grid' | 'table'
  const { isOpen, open, close, data: selectedProduct } = useModal();

  // Query Modal State
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [queryProduct, setQueryProduct] = useState(null);
  const [queryQty, setQueryQty] = useState(1);
  const [queryMessage, setQueryMessage] = useState('');
  const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);

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
    if (!queryQty || queryQty < 1) {
      return toast.error('Please enter a valid quantity');
    }

    try {
      setIsSubmittingQuery(true);
      await retailerService.createProductQuery({
        productId: queryProduct.id,
        requestedQuantity: queryQty,
        message: queryMessage
      });
      toast.success('Product request sent to distributor and admin');
      setIsQueryModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsSubmittingQuery(false);
    }
  };

  // ── Derived data ──────────────────────────────────────────────
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

  // ── Table columns ─────────────────────────────────────────────
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
            <p className="text-sm font-bold text-content-primary leading-tight">{val}</p>
            <p className="text-[9px] text-content-tertiary uppercase tracking-widest font-black mt-0.5">{row.sku}</p>
          </div>
        </div>
      )
    },
    {
      key: 'category', label: 'Category',
      render: (val) => <Badge variant="ghost">{val || 'General'}</Badge>
    },
    {
      key: 'retailerPrice', label: 'Your Price (MOP)', sortable: true,
      render: (val) => <span className="font-black text-brand-teal">{formatCurrency(val)}</span>
    },
    {
      key: 'distributorUnits', label: 'Distributor Stock', align: 'center', sortable: true,
      render: (val, row) => (
        <div className="flex flex-col items-center gap-1">
          <span className={`text-sm font-black
            ${row.stockStatus === 'In Stock'    ? 'text-emerald-600' :
              row.stockStatus === 'Low Stock'   ? 'text-amber-600'   :
              'text-slate-400'}`}>
            {row.displayStock}
          </span>
          <StockBadge stockStatus={row.stockStatus} />
        </div>
      )
    },
    {
      key: 'available', label: 'Available', align: 'center',
      render: (val) => val
        ? <RiCheckboxCircleLine className="w-5 h-5 text-emerald-500 mx-auto" />
        : <RiCloseCircleLine    className="w-5 h-5 text-slate-300 mx-auto" />
    },
    {
      key: 'actions', label: 'Actions', align: 'right',
      render: (_, row) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="xs" icon={RiInformationLine} onClick={() => open(row)}>Detail</Button>
          {row.available ? (
             <Button variant="primary"   size="xs" icon={RiShoppingBag3Line}>Order</Button>
          ) : (
             <Button variant="warning" size="xs" icon={RiAlertLine} onClick={() => handleOpenQueryModal(row)}>Request</Button>
          )}
        </div>
      )
    }
  ];

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="page-container">
      {/* Header */}
      <PageHeader
        title="Admin Product Catalog"
        subtitle="All products from Admin — showing your distributor's availability and stock levels"
      >
        <Button icon={RiRefreshLine} variant="secondary" onClick={fetchCatalog} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </Button>
      </PageHeader>

      {/* Stats row */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Total Products', value: stats.total,       icon: RiStore3Line,          color: 'text-content-primary' },
            { label: 'Available',      value: stats.available,   icon: RiCheckboxCircleLine,  color: 'text-emerald-600' },
            { label: 'Unavailable',    value: stats.unavailable, icon: RiCloseCircleLine,     color: 'text-slate-400' },
            { label: 'Low Stock',      value: stats.lowStock,    icon: RiAlertLine,            color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 flex items-center gap-3">
              <s.icon className={`w-7 h-7 ${s.color}`} />
              <div>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters + View Toggle */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Select
                className="w-44"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                options={categories}
              />
              <Select
                className="w-40"
                value={availFilter}
                onChange={e => setAvailFilter(e.target.value)}
                options={[
                  { label: 'All Products',   value: 'all' },
                  { label: 'Available Only', value: 'available' },
                  { label: 'Unavailable',    value: 'unavailable' },
                ]}
              />
              <Input
                icon={RiSearchLine}
                placeholder="Search name or SKU…"
                className="w-56"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <Badge variant="teal">{filteredProducts.length} Shown</Badge>
              {/* View toggle */}
              <div className="flex border border-border rounded overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-brand-teal text-white' : 'bg-surface-card text-content-tertiary hover:bg-surface-hover'}`}
                  title="Grid View"
                >
                  <RiGridLine className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-brand-teal text-white' : 'bg-surface-card text-content-tertiary hover:bg-surface-hover'}`}
                  title="Table View"
                >
                  <RiListCheck2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Content View */}
        {viewMode === 'grid' ? (
          <div className="p-4">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="border border-border rounded-none animate-pulse">
                    <div className="aspect-[4/3] bg-slate-100" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-3/4" />
                      <div className="h-2 bg-slate-100 rounded w-1/2" />
                      <div className="h-8 bg-slate-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-content-tertiary">
                <RiInboxLine className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm font-semibold">No products match your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} onDetail={open} onQuery={handleOpenQueryModal} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <DataTable columns={columns} data={loading ? [] : filteredProducts} loading={loading} />
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={isOpen}
        onClose={close}
        title={selectedProduct?.name}
        size="md"
      >
        {selectedProduct && (
          <div className="space-y-5 py-2">
            <div className="aspect-video bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden rounded-sm">
              {selectedProduct.images?.[0]?.url
                ? <img src={selectedProduct.images[0].url} alt="" className="w-full h-full object-contain" />
                : <RiInboxLine className="w-12 h-12 text-slate-200" />
              }
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[10px] text-content-tertiary font-black uppercase tracking-widest">{selectedProduct.sku}</p>
              <Badge variant="ghost">{selectedProduct.category}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-surface-secondary border border-border rounded-sm text-center">
                <p className="text-[9px] text-content-tertiary font-black uppercase tracking-widest mb-1">Your Price</p>
                <p className="text-lg font-black text-brand-teal">{formatCurrency(selectedProduct.retailerPrice)}</p>
              </div>
              <div className="p-3 bg-surface-secondary border border-border rounded-sm text-center">
                <p className="text-[9px] text-content-tertiary font-black uppercase tracking-widest mb-1">MRP</p>
                <p className="text-lg font-black text-content-primary">{formatCurrency(selectedProduct.mrp)}</p>
              </div>
              <div className={`p-3 border rounded-sm text-center
                ${selectedProduct.available ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[9px] text-content-tertiary font-black uppercase tracking-widest mb-1">At Distributor</p>
                <p className={`text-lg font-black ${selectedProduct.available ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {selectedProduct.displayStock}
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-2 px-4 py-3 rounded-sm border text-sm font-bold
              ${selectedProduct.available ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
              {selectedProduct.available
                ? <><RiCheckboxCircleLine className="w-4 h-4" /> This product is available at your distributor</>
                : <><RiCloseCircleLine className="w-4 h-4" /> Your distributor doesn't stock this product yet</>
              }
            </div>

            <div className="flex items-center justify-between py-2 border-t border-border">
              <span className="text-xs font-bold text-content-secondary">Stock Status</span>
              <StockBadge stockStatus={selectedProduct.stockStatus} />
            </div>

            {selectedProduct.description && (
              <div>
                <h5 className="text-xs font-bold text-content-primary mb-2 uppercase tracking-wider">Description</h5>
                <p className="text-sm text-content-secondary leading-relaxed">{selectedProduct.description}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2 border-t border-border">
              <Button className="flex-1" variant="secondary" onClick={close}>Close</Button>
              {selectedProduct.available ? (
                <Button className="flex-1" icon={RiShoppingBag3Line}>Place Order</Button>
              ) : (
                <Button
                  className="flex-1"
                  variant="warning"
                  icon={RiAlertLine}
                  onClick={() => { close(); handleOpenQueryModal(selectedProduct); }}
                >
                  Request Product
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Query Submission Modal */}
      <Modal
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
        title="Request Product from Distributor"
        size="sm"
      >
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 p-3 bg-surface-secondary border border-border">
            <div className="w-12 h-12 bg-white border border-border rounded flex items-center justify-center overflow-hidden">
              {queryProduct?.images?.[0]?.url ? (
                <img src={queryProduct.images[0].url} alt="" className="w-full h-full object-cover" />
              ) : (
                <RiInboxLine className="text-slate-300 w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-content-primary leading-tight">{queryProduct?.name}</p>
              <p className="text-[10px] text-content-tertiary uppercase tracking-widest font-black mt-0.5">{queryProduct?.sku}</p>
            </div>
          </div>

          <div className="space-y-3">
             <Input 
               label="Required Quantity" 
               type="number" 
               min="1"
               value={queryQty} 
               onChange={(e) => setQueryQty(parseInt(e.target.value) || 1)} 
               placeholder="How many units do you need?"
             />
             <div className="space-y-1.5">
               <label className="text-xs font-bold text-content-secondary uppercase tracking-wider">Additional Note (Optional)</label>
               <textarea 
                 className="w-full bg-surface-input border border-border p-3 text-sm focus:border-brand-teal outline-none min-h-[100px] resize-none"
                 placeholder="Tell your distributor why you need this product..."
                 value={queryMessage}
                 onChange={(e) => setQueryMessage(e.target.value)}
               />
             </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 flex items-start gap-3">
             <RiInformationLine className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
             <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
               This request will be sent to both your Distributor and the Admin. They will review it and update you on the availability.
             </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button className="flex-1" variant="secondary" onClick={() => setIsQueryModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" variant="primary" loading={isSubmittingQuery} onClick={handleSubmitQuery}>
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
