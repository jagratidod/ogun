import { useEffect, useMemo, useState } from 'react';
import { RiAddLine, RiSearchLine, RiFilterLine, RiEditLine, RiDeleteBin7Line, RiLayoutGridLine, RiFileList3Line, RiPriceTag3Line } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, DataTable, Badge, Button, Input, Select, useModal, Modal, useSearch, useSort, usePagination, formatCurrency, useNotification } from '../../../core';
import inventoryService from '../../../core/services/inventoryService';

function computeStockStatus(stock, minStock) {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= minStock) return 'Low Stock';
  return 'Available';
}

function buildPlaceholderImage(label) {
  const text = label?.trim() ? label.trim().slice(0, 18) : 'Product';
  return `https://placehold.co/256x256?text=${encodeURIComponent(text)}`;
}



function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        inventoryService.getProducts(),
        inventoryService.getCategories()
      ]);
      setProducts(prodRes.data || []);
      const mappedCategories = (catRes.data || []).map(c => ({
        label: c.name,
        value: c.name
      }));
      setCategories(mappedCategories);
    } catch (error) {
      showNotification('error', 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const filteredByCategory = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  const { query, setQuery, filteredData } = useSearch(filteredByCategory, ['name', 'sku', 'category']);
  const { sortedData, sortKey, sortDirection, requestSort } = useSort(filteredData, 'quantity', 'asc');
  const { paginatedData, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems } = usePagination(sortedData, 10);
  const { isOpen, open, close, data: selectedProduct } = useModal();
  const { isOpen: isCatModalOpen, open: openCatModal, close: closeCatModal } = useModal();
  const [newCategory, setNewCategory] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [form, setForm] = useState({
    id: '',
    name: '',
    sku: '',
    category: '',
    price: '',
    mrp: '',
    distributorPrice: '',
    retailerPrice: '',
    stock: '',
    minStock: 10,
    image: '',
    description: '',
    unit: 'units',
  });
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setImageError('');
    if (selectedProduct) {
      setForm({
        id: selectedProduct.id || '',
        name: selectedProduct.name || '',
        sku: selectedProduct.sku || '',
        category: selectedProduct.category || (categories[0]?.value || ''),
        price: selectedProduct.price ?? '',
        mrp: selectedProduct.mrp ?? '',
        distributorPrice: selectedProduct.distributorPrice ?? '',
        retailerPrice: selectedProduct.retailerPrice ?? '',
        stock: selectedProduct.quantity ?? '',
        minStock: selectedProduct.minStock ?? 10,
        image: selectedProduct.image || '',
        description: selectedProduct.description || '',
        unit: selectedProduct.unit || 'units',
      });
      return;
    }
    setForm({
      id: '',
      name: '',
      sku: '',
      category: categories[0]?.value || '',
      price: '',
      mrp: '',
      distributorPrice: '',
      retailerPrice: '',
      stock: '',
      minStock: 10,
      image: '',
      description: '',
      unit: 'units',
    });
  }, [isOpen, selectedProduct, categories]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await inventoryService.deleteProduct(id);
        setProducts(products.filter(p => p._id !== id));
        showNotification('success', 'Product deleted successfully');
      } catch (error) {
        showNotification('error', 'Failed to delete product');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      setImageError('Please select an image file (PNG, JPG, WEBP, etc).');
      return;
    }
    setImageError('');
    setForm((prev) => ({ ...prev, imageFile: file, image: URL.createObjectURL(file) }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!String(form.name || '').trim()) nextErrors.name = 'Product name is required';
    if (!String(form.sku || '').trim()) nextErrors.sku = 'SKU is required';
    if (!String(form.category || '').trim()) nextErrors.category = 'Category is required';
    if (!form.price) nextErrors.price = 'Retail price is required';
    if (!form.mrp) nextErrors.mrp = 'MRP is required';
    if (!form.distributorPrice) nextErrors.distributorPrice = 'Distributor price is required';
    if (!form.retailerPrice) nextErrors.retailerPrice = 'Retailer price is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('sku', form.sku);
      formData.append('category', form.category);
      formData.append('price', form.price);
      formData.append('mrp', form.mrp);
      formData.append('distributorPrice', form.distributorPrice);
      formData.append('retailerPrice', form.retailerPrice);
      formData.append('description', form.description);
      formData.append('initialStock', form.stock);
      formData.append('unit', form.unit);
      
      if (form.imageFile) {
        formData.append('image', form.imageFile);
      }

      if (selectedProduct) {
        const res = await inventoryService.updateProduct(selectedProduct._id, formData);
        setProducts(prev => prev.map(p => p._id === selectedProduct._id ? res.data : p));
        showNotification('success', 'Product updated successfully');
      } else {
        const res = await inventoryService.createProduct(formData);
        setProducts(prev => [res.data.product, ...prev]);
        showNotification('success', 'Product added successfully');
      }
      close();
    } catch (error) {
      showNotification('error', error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await inventoryService.createCategory({ name: newCategory.trim() });
      const newCatObj = { label: newCategory.trim(), value: newCategory.trim() };
      setCategories((prev) => [...prev, newCatObj]);
      setNewCategory('');
      showNotification('success', 'Category added');
      closeCatModal();
    } catch (error) {
      showNotification('error', 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (catName) => {
     try {
       // Since categories is now an array of objects {label, value}
       setCategories(prev => prev.filter(c => c.value !== catName));
       showNotification('info', 'Category removed from local view');
     } catch (error) {
       showNotification('error', 'Failed to remove category');
     }
  };

  const columns = [
    {
      key: 'image', label: '', width: '50px', render: (val, row) => {
        const imgSrc = (row.images && row.images.length > 0) ? row.images[0].url : (typeof val === 'string' && val.startsWith('http') ? val : buildPlaceholderImage(row.name));
        return (
          <img
            src={imgSrc}
            alt={row.name}
            className="w-10 h-10 rounded-none object-cover bg-surface-input border border-border"
          />
        );
      }
    },
    {
      key: 'name', label: 'Product Name', sortable: true, render: (val, row) => (
        <div>
          <h4 className="text-sm font-semibold text-content-primary leading-tight">{val}</h4>
          <span className="text-[10px] text-content-tertiary">SKU: {row.sku}</span>
        </div>
      )
    },
    {
      key: 'category', label: 'Category', sortable: true, render: (val) => (
        <Badge variant="teal">{val}</Badge>
      )
    },
    {
      key: 'price', label: 'Pricing', sortable: true, align: 'right', render: (val, row) => (
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-content-tertiary font-medium">MRP:</span>
            <span className="text-xs text-content-tertiary line-through">{formatCurrency(row.mrp)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-brand-teal font-bold uppercase tracking-tighter">Selling:</span>
            <span className="font-bold text-brand-teal">{formatCurrency(val)}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 text-[10px]">
            <span className="text-content-tertiary text-right whitespace-nowrap">Dist: {formatCurrency(row.distributorPrice)}</span>
            <span className="text-content-tertiary text-right whitespace-nowrap">Ret: {formatCurrency(row.retailerPrice)}</span>
          </div>
        </div>
      )
    },
    {
      key: 'quantity', label: 'Stock', sortable: true, align: 'center', render: (val, row) => {
        const stockVal = Number(val) || 0;
        return (
          <div className={`flex flex-col items-center gap-1.5`}>
            <span className={`text-sm font-bold ${stockVal <= 20 ? 'text-state-danger' : stockVal <= 100 ? 'text-state-warning' : 'text-state-success'}`}>
              {stockVal} {row.unit || 'units'}
            </span>
            <div className="w-16 h-1 bg-surface-input rounded-none overflow-hidden">
              <div
                className={`h-full rounded-none transition-all duration-500 ${stockVal <= 20 ? 'bg-state-danger' : stockVal <= 100 ? 'bg-state-warning' : 'bg-state-success'}`}
                style={{ width: `${Math.min(100, (stockVal / 500) * 100)}%` }}
              ></div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'status', label: 'Status', render: (val) => (
        <Badge
          variant={val === 'Available' ? 'success' : val === 'Low Stock' ? 'warning' : 'danger'}
        >
          {val}
        </Badge>
      )
    },
    {
      key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
        <div className="flex justify-end gap-1">
          <Button variant="icon" onClick={() => open(row)} title="Edit Product">
            <RiEditLine className="w-4 h-4" />
          </Button>
          <Button variant="icon" className="group" onClick={() => handleDelete(row._id)} title="Delete Product">
            <RiDeleteBin7Line className="w-4 h-4 text-state-danger opacity-70 group-hover:opacity-100" />
          </Button>
        </div>
      )
    },
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
          <Button variant="secondary" icon={RiPriceTag3Line} onClick={openCatModal}>Categories</Button>
          <Button icon={RiAddLine} onClick={() => open(null)}>Add Product</Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex flex-wrap gap-2">
              {['All', ...categories.map(c => c.value)].map(cat => (
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
              <div key={p._id || p.id} className="glass-card-hover group flex flex-col p-3 overflow-hidden">
                <img src={(p.images && p.images[0]?.url) || p.image || buildPlaceholderImage(p.name)} className="aspect-square w-full rounded-none object-cover bg-surface-input border border-border mb-3" alt={p.name} />
                <div className="flex-1">
                  <span className="text-[10px] text-content-tertiary font-bold tracking-wider uppercase mb-1 block">{p.category}</span>
                  <h4 className="text-sm font-semibold text-content-primary leading-tight group-hover:text-brand-teal transition-colors line-clamp-1">{p.name}</h4>
                  <p className="text-[10px] text-content-tertiary mt-0.5">SKU: {p.sku}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <span className="text-xs text-content-tertiary line-through">{formatCurrency(p.mrp || p.price * 1.5)}</span>
                      <p className="text-sm font-bold text-brand-teal">{formatCurrency(p.price)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black text-content-tertiary uppercase">{p.quantity || 0} UNITS</span>
                      <Badge size="xs" variant={p.status === 'Available' ? 'success' : 'warning'}>{p.status}</Badge>
                    </div>
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
            <Button onClick={handleSave}>{selectedProduct ? 'Save Changes' : 'Add to Catalog'}</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="product-image-upload" className="text-sm font-medium text-content-secondary">Product Image</label>
            <div className="mt-1.5 flex gap-4 items-start">
              <img
                src={String(form.image || '').trim() || buildPlaceholderImage(form.name)}
                alt="Product preview"
                className="w-24 h-24 rounded-none object-cover bg-surface-input border border-border"
              />
              <div className="flex-1">
                <Input id="product-image-upload" type="file" accept="image/*" onChange={handleImageChange} />
                {(imageError) && <p className="mt-1 text-xs text-state-danger">{imageError}</p>}
                <p className="mt-1 text-[11px] text-content-tertiary">Upload a square image for best results.</p>
              </div>
            </div>
          </div>

          <Input
            label="Product Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            error={errors.name}
            placeholder="e.g. TurboMix Plus 500W"
            className="md:col-span-2"
          />
          <Input
            label="SKU / ID"
            value={form.sku}
            onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
            error={errors.sku}
            placeholder="e.g. TMP-500"
          />
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            error={errors.category}
            options={categories}
          />
          <Input
            label="Retail Price (INR)"
            type="number"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
          />
          <Input
            label="List Price / MRP (INR)"
            type="number"
            value={form.mrp}
            onChange={(e) => setForm((prev) => ({ ...prev, mrp: e.target.value }))}
          />
          <Input
            label="Distributor Price (INR)"
            type="number"
            value={form.distributorPrice}
            onChange={(e) => setForm((prev) => ({ ...prev, distributorPrice: e.target.value }))}
            placeholder="Buying price for distributors"
          />
          <Input
            label="Retailer Price (INR)"
            type="number"
            value={form.retailerPrice}
            onChange={(e) => setForm((prev) => ({ ...prev, retailerPrice: e.target.value }))}
            placeholder="Buying price for retailers"
          />
          <Input
            label="In-Stock Quantity"
            type="number"
            value={form.stock}
            onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
          />
          <Input
            label="Min Threshold Stock"
            type="number"
            value={form.minStock}
            onChange={(e) => setForm((prev) => ({ ...prev, minStock: e.target.value }))}
          />
          <Input
            label="Unit of Measure"
            value={form.unit}
            onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
            placeholder="e.g. pcs, units, kg, box"
          />
          <div className="md:col-span-2">
            <Input
              label="Product Description (Internal)"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Briefly describe the product specs..."
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCatModalOpen}
        onClose={closeCatModal}
        title="Manage Categories"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={closeCatModal}>Close</Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-content-secondary mb-1.5 block">New Category Name</label>
            <Input 
              placeholder="e.g. Microwave Oven" 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-content-tertiary uppercase tracking-wider mb-3 block">Existing Categories</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <div key={cat.value} className="flex items-center justify-between p-2 bg-surface-secondary border border-border group">
                  <span className="text-sm text-content-secondary">{cat.label}</span>
                  <button 
                    onClick={() => handleDeleteCategory(cat.value)}
                    className="text-state-danger opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-state-danger/10"
                  >
                    <RiDeleteBin7Line className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            {categories.length === 0 && (
              <p className="text-xs text-content-tertiary text-center py-4 italic">No categories found. Add one above.</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
