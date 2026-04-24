import { useState, useEffect } from 'react';
import { RiSearchLine, RiShoppingCartLine, RiAddLine, RiSubtractLine, RiArrowRightLine, RiCloseLine } from 'react-icons/ri';
import executiveService from '../../../core/services/executiveService';
import { Card, Button, Input, Select, Badge, Modal, useModal, formatCurrency } from '../../../core';
import { toast } from 'react-hot-toast';

export default function SalesTerminalPage() {
  const [products, setProducts] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState('');
  
  const { isOpen, open, close } = useModal();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, rRes] = await Promise.all([
        executiveService.getProducts(),
        executiveService.getMyRetailers()
      ]);
      setProducts(pRes.data || []);
      setRetailers(rRes.data || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product._id);
      if (existing) {
        return prev.map(item => 
          item.productId === product._id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { 
        productId: product._id, 
        name: product.name, 
        price: product.retailerPrice || product.price, 
        quantity: 1,
        image: product.images?.[0]?.url
      }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handlePlaceOrder = async () => {
    if (!selectedRetailer) return toast.error('Please select a retailer');
    if (cart.length === 0) return toast.error('Cart is empty');

    try {
      setSubmitting(true);
      await executiveService.placeOrder({
        retailerId: selectedRetailer,
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity }))
      });
      toast.success('Order placed successfully!');
      setCart([]);
      setSelectedRetailer('');
      close();
    } catch (err) {
      toast.error('Order placement failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Top Bar */}
      <div className="p-4 bg-surface-primary border-b border-border space-y-3">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-black text-content-primary leading-none">Catalog</h2>
           <Badge variant="teal">{products.length} Products</Badge>
        </div>
        <Input
          icon={RiSearchLine}
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-surface-elevated"
        />
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-20 text-xs font-bold uppercase animate-pulse">Syncing Catalog...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map(product => (
              <Card key={product._id} className="p-2 flex flex-col h-full border-border hover:border-brand-teal transition-all">
                <div className="aspect-square bg-surface-elevated mb-2 relative overflow-hidden">
                  {product.images?.[0]?.url ? (
                    <img src={product.images[0].url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                      <RiShoppingCartLine className="w-10 h-10" />
                    </div>
                  )}
                  {cart.find(i => i.productId === product._id) && (
                     <div className="absolute top-1 right-1">
                        <Badge variant="teal" size="xs">Added</Badge>
                     </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[10px] font-black text-content-primary line-clamp-2 leading-tight uppercase">{product.name}</h4>
                  <p className="text-xs font-black text-brand-teal mt-1">{formatCurrency(product.retailerPrice || product.price)}</p>
                </div>
                <Button 
                  size="xs" 
                  variant="secondary" 
                  className="mt-2 w-full font-bold uppercase tracking-widest text-[9px]"
                  onClick={() => addToCart(product)}
                >
                  Add To Sell
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Checkout Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 p-4 animate-slide-up">
          <div className="glass-card bg-brand-teal text-white p-4 flex items-center justify-between shadow-2xl border-none">
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80">Cart Total</span>
              <span className="text-lg font-black">{formatCurrency(total)}</span>
            </div>
            <Button 
              variant="secondary" 
              className="bg-white text-brand-teal border-none font-black h-10 px-6 uppercase tracking-widest text-xs"
              onClick={open}
            >
              Checkout <RiArrowRightLine className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Finalize Sale"
        size="md"
        footer={
          <div className="flex gap-2 w-full">
            <Button variant="secondary" className="flex-1" onClick={close}>Cancel</Button>
            <Button 
              variant="primary" 
              className="flex-2" 
              onClick={handlePlaceOrder}
              loading={submitting}
              disabled={!selectedRetailer}
            >
              Confirm Order
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-content-tertiary uppercase tracking-widest">Select Retailer</label>
            <Select
              value={selectedRetailer}
              onChange={(e) => setSelectedRetailer(e.target.value)}
              options={[
                { label: 'Choose Retailer', value: '' },
                ...retailers.map(r => ({ label: r.shopName, value: r._id }))
              ]}
              className="bg-surface-elevated"
            />
          </div>

          <div className="space-y-3">
            <h5 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-border pb-1">Order Summary</h5>
            <div className="max-h-60 overflow-y-auto divide-y divide-border border border-border">
              {cart.map(item => (
                <div key={item.productId} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-elevated flex-shrink-0">
                      {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-content-primary line-clamp-1 uppercase leading-none">{item.name}</p>
                      <p className="text-[9px] text-brand-teal font-bold mt-1">{formatCurrency(item.price)}/u</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.productId, -1)} className="p-1 text-content-tertiary"><RiSubtractLine /></button>
                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, 1)} className="p-1 text-brand-teal"><RiAddLine /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-brand-teal/5 border border-brand-teal/10 flex justify-between items-center">
            <span className="text-xs font-black text-brand-teal uppercase tracking-widest">Grand Total</span>
            <span className="text-xl font-black text-brand-teal">{formatCurrency(total)}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
