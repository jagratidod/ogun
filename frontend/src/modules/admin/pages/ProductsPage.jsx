import { useState, useMemo } from 'react';
import { RiBox3Line, RiAddLine, RiSearchLine, RiFilterLine, RiEditLine, RiDeleteBin7Line, RiArrowRightUpLine, RiMoreFill, RiLayoutGridLine, RiFileList3Line } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, useModal, Modal, Tabs, EmptyState, useSearch, useSort, usePagination, formatCurrency } from '../../../core';
import productsData from '../../../data/products.json';

export default function ProductsPage() {
  const [products, setProducts] = useState(productsData);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const filteredByCategory = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  const { query, setQuery, filteredData } = useSearch(filteredByCategory, ['name', 'sku', 'category']);
  const { sortedData, sortKey, sortDirection, requestSort } = useSort(filteredData, 'stock', 'asc');
  const { paginatedData, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems } = usePagination(sortedData, 10);
  const { isOpen, open, close, data: selectedProduct } = useModal();
  const [viewMode, setViewMode] = useState('list');

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product from the catalog?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const columns = [
    { key: 'image', label: '', width: '50px', render: (val, row) => (
      <img src={val} alt={row.name} className="w-10 h-10 rounded-none object-cover bg-surface-input border border-border" />
    )},
    { key: 'name', label: 'Product Name', sortable: true, render: (val, row) => (
      <div>
        <h4 className="text-sm font-semibold text-content-primary leading-tight">{val}</h4>
        <span className="text-[10px] text-content-tertiary">SKU: {row.sku}</span>
      </div>
    )},
    { key: 'category', label: 'Category', sortable: true, render: (val) => (
      <Badge variant="teal">{val}</Badge>
    )},
    { key: 'price', label: 'Price', sortable: true, align: 'right', render: (val) => (
       <div className="flex flex-col items-end">
          <span className="font-semibold text-brand-teal">{formatCurrency(val)}</span>
          <span className="text-[10px] text-content-tertiary line-through">{formatCurrency(val * 1.5)}</span>
       </div>
    )},
    { key: 'stock', label: 'Stock', sortable: true, align: 'center', render: (val) => (
       <div className={`flex flex-col items-center gap-1.5`}>
          <span className={`text-sm font-bold ${val <= 10 ? 'text-state-danger' : val <= 30 ? 'text-state-warning' : 'text-state-success'}`}>
            {val} units
          </span>
          <div className="w-16 h-1 bg-surface-input rounded-none overflow-hidden">
             <div 
                className={`h-full rounded-none transition-all duration-500 ${val <= 10 ? 'bg-state-danger' : val <= 30 ? 'bg-state-warning' : 'bg-state-success'}`}
                style={{ width: `${Math.min(100, (val / 100) * 100)}%` }}
             ></div>
          </div>
       </div>
    )},
    { key: 'status', label: 'Status', render: (val) => (
      <Badge 
        variant={val === 'Available' ? 'success' : val === 'Low Stock' ? 'warning' : 'danger'}
      >
        {val}
      </Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
      <div className="flex justify-end gap-1">
        <Button variant="icon" onClick={() => open(row)} title="Edit Product">
          <RiEditLine className="w-4 h-4" />
        </Button>
        <Button variant="icon" className="group" onClick={() => handleDelete(row.id)} title="Delete Product">
          <RiDeleteBin7Line className="w-4 h-4 text-state-danger opacity-70 group-hover:opacity-100" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Products" 
        subtitle="Manage the complete kitchen appliance product catalog"
      >
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-input p-1 rounded-none border border-border">
            <button 
               onClick={() => setViewMode('list')}
               className={`p-1.5 rounded-none transition-colors ${viewMode === 'list' ? 'bg-brand-teal text-white' : 'text-content-tertiary hover:text-content-secondary'}`}
            >
               <RiFileList3Line className="w-4 h-4" />
            </button>
            <button 
               onClick={() => setViewMode('grid')}
               className={`p-1.5 rounded-none transition-colors ${viewMode === 'grid' ? 'bg-brand-teal text-white' : 'text-content-tertiary hover:text-content-secondary'}`}
            >
               <RiLayoutGridLine className="w-4 h-4" />
            </button>
          </div>
          <Button icon={RiAddLine} onClick={() => open(null)}>Add Product</Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex flex-wrap gap-2">
                 {['All', 'Mixer Grinder', 'Induction Cooktop', 'Chimney', 'Water Purifier'].map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 text-xs font-medium rounded-none border transition-colors ${activeCategory === cat ? 'bg-brand-teal text-white border-brand-teal' : 'bg-surface-input text-content-secondary hover:text-brand-teal hover:border-brand-teal border-border'}`}
                    >
                       {cat}
                    </button>
                 ))}
              </div>
              <div className="flex items-center gap-2">
                 <Input 
                   icon={RiSearchLine} 
                   placeholder="Search name, sku or category..." 
                   className="w-full md:w-64"
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                 />
                 <Button variant="secondary" icon={RiFilterLine}>Filters</Button>
              </div>
           </div>
        </CardHeader>

        {viewMode === 'list' ? (
           <DataTable 
             columns={columns} 
             data={paginatedData} 
             sortKey={sortKey} 
             sortDirection={sortDirection} 
             onSort={requestSort}
           />
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-5">
              {paginatedData.map(p => (
                 <div key={p.id} className="glass-card-hover group flex flex-col p-3 overflow-hidden">
                    <img src={p.image} className="aspect-square w-full rounded-none object-cover bg-surface-input border border-border mb-3" alt={p.name} />
                    <div className="flex-1">
                       <span className="text-[10px] text-content-tertiary font-bold tracking-wider uppercase mb-1 block">{p.category}</span>
                       <h4 className="text-sm font-semibold text-content-primary leading-tight group-hover:text-brand-teal transition-colors line-clamp-1">{p.name}</h4>
                       <p className="text-[10px] text-content-tertiary mt-0.5">SKU: {p.sku}</p>
                       <div className="mt-3 flex items-end justify-between">
                          <div>
                             <span className="text-xs text-content-tertiary line-through">{formatCurrency(p.price * 1.5)}</span>
                             <p className="text-sm font-bold text-brand-teal">{formatCurrency(p.price)}</p>
                          </div>
                          <Badge size="xs" variant={p.status === 'Available' ? 'success' : 'warning'}>{p.status}</Badge>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        )}

        <div className="p-4 border-t border-border flex items-center justify-between">
           <span className="text-xs text-content-tertiary">Showing {startIndex} to {endIndex} of {totalItems} items</span>
           <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
              <Button variant="secondary" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
           </div>
        </div>
      </Card>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={selectedProduct ? `Update Product: ${selectedProduct.name}` : 'Add New Product'}
        footer={
           <div className="flex gap-3">
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button onClick={close}>{selectedProduct ? 'Save Changes' : 'Add to Catalog'}</Button>
           </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Input label="Product Name" defaultValue={selectedProduct?.name} placeholder="e.g. TurboMix Plus 500W" className="md:col-span-2" />
           <Input label="SKU / ID" defaultValue={selectedProduct?.sku} placeholder="e.g. TMP-500" />
           <Select label="Category" defaultValue={selectedProduct?.category} options={[
              { label: 'Mixer Grinder', value: 'Mixer Grinder' },
              { label: 'Induction Cooktop', value: 'Induction Cooktop' },
              { label: 'Chimney', value: 'Chimney' },
              { label: 'Water Purifier', value: 'Water Purifier' },
              { label: 'Air Fryer', value: 'Air Fryer' }
           ]} />
           <Input label="Retail Price (INR)" type="number" defaultValue={selectedProduct?.price} />
           <Input label="List Price / MRP (INR)" type="number" defaultValue={selectedProduct?.mrp} />
           <Input label="In-Stock Quantity" type="number" defaultValue={selectedProduct?.stock} />
           <Input label="Min Threshold Stock" type="number" defaultValue={selectedProduct?.minStock || 10} />
           <div className="md:col-span-2">
              <Input label="Product Description (Internal)" placeholder="Briefly describe the product specs..." />
           </div>
        </div>
      </Modal>
    </div>
  );
}

