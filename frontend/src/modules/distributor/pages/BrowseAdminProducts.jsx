import { useState, useMemo, useEffect } from 'react';
import { 
  RiSearchLine, 
  RiShoppingCartLine, 
  RiFilter3Line, 
  RiInformationLine,
  RiAddLine,
  RiSubtractLine,
  RiArrowRightLine,
  RiCheckDoubleLine,
  RiEyeLine
} from 'react-icons/ri';
import { 
  PageHeader, 
  Card, 
  Badge, 
  Button, 
  Input, 
  DataTable, 
  formatCurrency, 
  useModal, 
  Modal,
  useNotification
} from '../../../core';
import marketplaceService from '../../../core/services/marketplaceService';

export default function BrowseAdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { isOpen, open, close } = useModal();
  const { isOpen: isDetailsOpen, open: openDetails, close: closeDetails } = useModal();
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await marketplaceService.getAvailableProducts();
      setProducts(res.data || []);
    } catch (error) {
      showNotification('error', 'Failed to fetch available products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Categories extraction
  const categories = useMemo(() => {
    return ['All', ...new Set(products.map(p => p.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const updateCart = (product, delta) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(item => item._id !== product._id);
        return prev.map(item => item._id === product._id ? { ...item, quantity: newQty } : item);
      }
      if (delta > 0) return [...prev, { ...product, quantity: delta }];
      return prev;
    });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.distributorPrice || item.price) * item.quantity, 0);
  }, [cart]);

  const handleSubmitOrder = async () => {
    try {
      const items = cart.map(item => ({
        productId: item._id,
        quantity: item.quantity
      }));
      
      await marketplaceService.placeOrder({ items });
      showNotification('success', 'Order placed successfully! Admin will review it shortly.');
      setCart([]);
      close();
    } catch (error) {
      showNotification('error', 'Failed to place order');
    }
  };

  return (
    <div className="page-container relative">
      <PageHeader 
        title="Admin Marketplace" 
        subtitle="Browse available products and place restock orders directly with the factory"
      >
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            icon={RiShoppingCartLine} 
            className="relative"
            onClick={open}
          >
            Review Order
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-teal text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-surface">
                {cart.length}
              </span>
            )}
          </Button>
        </div>
      </PageHeader>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 text-xs font-medium border transition-all whitespace-nowrap rounded-none ${selectedCategory === cat ? 'bg-brand-teal text-white border-brand-teal' : 'bg-surface hover:border-brand-teal text-content-secondary'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Input 
            icon={RiSearchLine} 
            placeholder="Search products..." 
            className="md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="secondary" icon={RiFilter3Line} />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {filteredProducts.map(product => {
          const cartItem = cart.find(item => item._id === product._id);
          return (
            <Card key={product._id} className="group overflow-hidden flex flex-col h-full hover:border-brand-teal transition-colors">
              <div className="aspect-square relative overflow-hidden bg-surface-secondary border-b border-border">
                <img 
                  src={product.images?.[0]?.url || product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-1 right-1 flex flex-col gap-1">
                  <Badge variant="teal" size="xs" className="px-1 py-0 text-[8px]">Stock: {product.stock}</Badge>
                  <button 
                    onClick={() => { setSelectedProductDetails(product); openDetails(); }}
                    className="w-6 h-6 bg-white shadow-md flex items-center justify-center text-content-secondary hover:text-brand-teal transition-colors"
                  >
                    <RiEyeLine className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-2.5 flex-1 flex flex-col">
                <div className="mb-2 flex-1">
                  <span className="text-[9px] text-content-tertiary font-bold tracking-widest uppercase">{product.category}</span>
                  <h3 className="text-xs font-bold text-content-primary leading-tight mt-0.5 line-clamp-2">{product.name}</h3>
                  <p className="text-[9px] text-content-tertiary mt-0.5">SKU: {product.sku}</p>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className="text-[9px] text-content-tertiary leading-none mb-1">Dist. Price</p>
                      <p className="text-sm font-black text-brand-teal leading-none">{formatCurrency(product.distributorPrice || product.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-content-tertiary leading-none mb-1">MRP</p>
                      <p className="text-[10px] text-content-tertiary line-through leading-none">{formatCurrency(product.mrp)}</p>
                    </div>
                  </div>

                  {cartItem ? (
                    <div className="flex items-center justify-between bg-surface-secondary border border-border overflow-hidden">
                      <button 
                        onClick={() => updateCart(product, -1)}
                        className="p-1 px-2 hover:bg-surface text-content-primary transition-colors flex-1"
                      >
                        <RiSubtractLine className="w-3 h-3 mx-auto" />
                      </button>
                      <span className="text-xs font-bold w-8 text-center">{cartItem.quantity}</span>
                      <button 
                        onClick={() => updateCart(product, 1)}
                        className="p-1 px-2 hover:bg-surface text-brand-teal transition-colors flex-1"
                      >
                        <RiAddLine className="w-3 h-3 mx-auto" />
                      </button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full py-1.5 h-auto text-[11px]" 
                      variant="primary" 
                      onClick={() => updateCart(product, 1)}
                    >
                      Add Order
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Cart Drawer / Modal */}
      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Review Your Order"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-xs text-content-tertiary">Estimated Total</p>
              <p className="text-xl font-black text-brand-teal">{formatCurrency(cartTotal)}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={close}>Continue Shopping</Button>
              <Button 
                onClick={handleSubmitOrder} 
                disabled={cart.length === 0}
                icon={RiArrowRightLine}
              >
                Place Order
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {cart.length > 0 ? (
            <div className="border border-border">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-secondary border-b border-border">
                  <tr>
                    <th className="p-3 text-[10px] font-bold uppercase tracking-widest text-content-tertiary">Product</th>
                    <th className="p-3 text-[10px] font-bold uppercase tracking-widest text-content-tertiary text-center">Qty</th>
                    <th className="p-3 text-[10px] font-bold uppercase tracking-widest text-content-tertiary text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cart.map(item => (
                    <tr key={item._id} className="hover:bg-surface-secondary/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img src={item.images?.[0]?.url || item.image} className="w-10 h-10 object-cover border border-border" />
                          <div>
                            <p className="text-xs font-bold text-content-primary leading-tight">{item.name}</p>
                            <p className="text-[9px] text-content-tertiary mt-0.5">{formatCurrency(item.distributorPrice || item.price)} per unit</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => updateCart(item, -1)} className="p-1 hover:bg-surface-input"><RiSubtractLine className="w-3 h-3"/></button>
                          <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateCart(item, 1)} className="p-1 hover:bg-surface-input"><RiAddLine className="w-3 h-3"/></button>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-xs font-bold text-content-primary">
                          {formatCurrency((item.distributorPrice || item.price) * item.quantity)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-surface-secondary flex items-center justify-center rounded-full mb-4">
                <RiShoppingCartLine className="w-8 h-8 text-content-tertiary" />
              </div>
              <h3 className="text-base font-bold text-content-primary">Your cart is empty</h3>
              <p className="text-xs text-content-tertiary max-w-xs mt-1">
                Browse our product catalog to start building your restock order.
              </p>
              <Button variant="secondary" className="mt-6" onClick={close}>Browse Products</Button>
            </div>
          )}

          {cart.length > 0 && (
            <div className="bg-surface-secondary p-4 flex gap-4 border-l-4 border-brand-teal">
              <RiInformationLine className="w-5 h-5 text-brand-teal flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-content-primary">B2B Order Policy</p>
                <p className="text-[11px] text-content-tertiary leading-relaxed mt-0.5">
                  Orders placed here are subject to admin availability. Once confirmed, you will receive a proforma invoice and shipment details.
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Product Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        title={selectedProductDetails?.name}
        size="lg"
      >
        {selectedProductDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            <div className="bg-surface-secondary aspect-square border border-border">
              <img 
                src={selectedProductDetails.images?.[0]?.url || selectedProductDetails.image} 
                className="w-full h-full object-cover" 
                alt={selectedProductDetails.name} 
              />
            </div>
            <div className="flex flex-col">
              <div className="mb-6">
                <Badge variant="teal" className="mb-2 uppercase tracking-widest text-[10px]">
                  {selectedProductDetails.category}
                </Badge>
                <h2 className="text-2xl font-black text-content-primary mb-1 leading-tight">
                  {selectedProductDetails.name}
                </h2>
                <p className="text-sm text-content-tertiary">SKU: {selectedProductDetails.sku}</p>
              </div>

              <div className="flex gap-8 mb-8 pb-8 border-b border-border">
                <div>
                  <p className="text-xs text-content-tertiary mb-1 uppercase font-bold tracking-wider">Distributor Price</p>
                  <p className="text-2xl font-black text-brand-teal">{formatCurrency(selectedProductDetails.distributorPrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-content-tertiary mb-1 uppercase font-bold tracking-wider">MRP</p>
                  <p className="text-lg font-bold text-content-tertiary line-through">{formatCurrency(selectedProductDetails.mrp)}</p>
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-xs font-bold text-content-primary uppercase tracking-widest mb-3">Description</h4>
                <p className="text-sm text-content-secondary leading-relaxed">
                  {selectedProductDetails.description || 'No description available for this product.'}
                </p>
              </div>

              <div className="mt-8">
                <Button 
                  className="w-full" 
                  icon={RiShoppingCartLine}
                  onClick={() => { updateCart(selectedProductDetails, 1); closeDetails(); }}
                >
                  Add to Restock Order
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Cart Summary Floating Button for Mobile */}

      {cart.length > 0 && !isOpen && (
        <div className="fixed bottom-6 right-6 lg:hidden z-30">
          <button 
            onClick={open}
            className="flex items-center gap-3 bg-brand-teal text-white p-4 shadow-xl hover:bg-brand-teal/90 transition-all group border border-surface/20"
          >
            <div className="relative">
              <RiShoppingCartLine className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-white text-brand-teal text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {cart.length}
              </span>
            </div>
            <div className="text-left pr-2">
              <p className="text-[9px] uppercase font-bold tracking-widest opacity-80 leading-none mb-1">View Order</p>
              <p className="text-sm font-black leading-none">{formatCurrency(cartTotal)}</p>
            </div>
            <RiArrowRightLine className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
