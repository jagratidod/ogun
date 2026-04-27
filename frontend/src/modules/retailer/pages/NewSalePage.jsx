import { useState, useMemo, useEffect } from 'react';
import { RiAddLine, RiSearchLine, RiDeleteBin7Line, RiShoppingBasketLine, RiUserLine, RiHandCoinLine, RiCouponLine, RiQuestionLine, RiCloseLine, RiCheckDoubleLine, RiFileList3Line, RiPrinterLine, RiCheckboxCircleFill } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, Badge, Button, Input, Select, Avatar, formatCurrency, useModal, Modal } from '../../../core';
import retailerService from '../../../core/services/retailerService';
import { toast } from 'react-hot-toast';

export default function NewSalePage() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [completedSale, setCompletedSale] = useState(null);
  
  const [viewMode, setViewMode] = useState('products'); // 'products' or 'cart' (mobile only)
  
  const { isOpen, open, close } = useModal();
  const { isOpen: isInvoiceOpen, open: openInvoice, close: closeInvoice } = useModal();

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await retailerService.getMyInventory();
      const items = (res.data || [])
        .filter(i => i.quantity > 0)
        .map(i => ({
          id: i.product?._id,
          name: i.product?.name,
          sku: i.product?.sku,
          price: i.sellingPrice || i.product?.retailerPrice || 0,
          stock: i.quantity,
          category: i.product?.category || 'General',
          image: i.product?.images?.[0]?.url || 'https://via.placeholder.com/150'
        }));
      setStock(items);
    } catch (error) {
      toast.error('Failed to load stock');
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(stock.map(p => p.category))];
    return cats;
  }, [stock]);

  const filteredProducts = useMemo(() => {
    return stock.filter(p => {
      const matchesSearch = searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [stock, searchQuery, activeCategory]);

  const addToCart = (prod) => {
    const existing = cart.find(c => c.id === prod.id);
    if (existing) {
       if (existing.qty >= prod.stock) return toast.error('Out of stock');
       setCart(cart.map(c => c.id === prod.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
       setCart([...cart, { ...prod, qty: 1 }]);
    }
    toast.success(`Added ${prod.name}`, { id: 'cart-add' });
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.id !== id));
    toast.error('Removed from basket');
  };

  const subtotal = cart.reduce((acc, c) => acc + (c.price * c.qty), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (!customer.name || !customer.phone) {
        return toast.error('Customer details required');
    }

    try {
        setLoading(true);
        const saleData = {
            customer,
            items: cart.map(c => ({
                product: c.id,
                quantity: c.qty,
                priceAtSale: c.price
            })),
            paymentMethod,
            totalAmount: total
        };

        const res = await retailerService.createSale(saleData);
        setCompletedSale(res.data);
        setCart([]);
        setCustomer({ name: '', phone: '', address: '' });
        close();
        openInvoice();
        fetchStock();
        toast.success('Sale completed successfully!');
    } catch (error) {
        toast.error(error.response?.data?.message || 'Checkout failed');
    } finally {
        setLoading(false);
    }
  };


  const printBill = () => {
     window.print();
  };

  return (
    <div className="page-container h-full overflow-hidden flex flex-col p-0 sm:p-6">
      {/* Mobile Top Bar (Hidden on Desktop) */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-border sticky top-0 z-20">
         <div className="flex flex-col">
            <h1 className="text-lg font-black text-content-primary leading-none uppercase">POS Terminal</h1>
            <span className="text-[8px] text-brand-teal font-black uppercase tracking-widest mt-1">Live Inventory</span>
         </div>
         <div className="flex items-center gap-2">
            <button 
               onClick={() => setViewMode(viewMode === 'products' ? 'cart' : 'products')}
               className={`relative p-2 rounded-none border transition-all ${viewMode === 'cart' ? 'bg-brand-teal text-white border-brand-teal' : 'bg-surface-secondary text-content-primary border-border'}`}
            >
               {viewMode === 'products' ? <RiShoppingBasketLine size={20} /> : <RiAddLine size={20} />}
               {cart.length > 0 && viewMode === 'products' && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-pink text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                     {cart.length}
                  </span>
               )}
            </button>
         </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
         <PageHeader 
            title="POS Terminal" 
            subtitle="Process sales and issue invoices for walk-in customers"
         >
            <Button icon={RiUserLine} variant="secondary">Loyalty Program</Button>
         </PageHeader>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-0 lg:gap-6 flex-1 overflow-hidden">
         {/* Products Section */}
         <div className={`lg:col-span-2 flex flex-col gap-4 overflow-hidden ${viewMode === 'products' ? 'flex' : 'hidden lg:flex'} h-full lg:h-[calc(100vh-220px)]`}>
            <div className="flex flex-col flex-1 overflow-hidden bg-white lg:border lg:border-border">
               <div className="p-4 border-b border-border space-y-4">
                  <div className="flex-1">
                    <Input 
                      icon={RiSearchLine} 
                      placeholder="Search products..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-surface-secondary"
                    />
                  </div>
                <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
                  {categories.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1.5 text-[9px] uppercase font-black whitespace-nowrap rounded-none border transition-all ${activeCategory === cat ? 'bg-brand-teal text-white border-brand-teal shadow-sm' : 'bg-surface-secondary text-content-tertiary border-border hover:border-brand-teal'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
             </div>
             <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 scrollbar-hide pb-24 lg:pb-3">

                  {loading && stock.length === 0 ? (
                      <div className="col-span-full py-20 text-center animate-pulse text-xs font-black text-brand-teal/40">SYNCING INVENTORY...</div>
                  ) : filteredProducts.map(prod => (
                    <div key={prod.id} className="bg-surface-primary border border-border/50 p-2.5 flex flex-col group cursor-pointer hover:border-brand-teal transition-all active:scale-95" onClick={() => addToCart(prod)}>
                       <div className="w-full aspect-square rounded-none bg-surface-secondary flex items-center justify-center mb-2.5 text-brand-teal/20 relative overflow-hidden">
                          <img src={prod.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={prod.name} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent group-hover:from-brand-teal/40 transition-all" />
                          <div className="absolute top-1.5 right-1.5">
                             <Badge size="xs" variant={prod.stock < 10 ? 'danger' : 'teal'} className="text-[7px] px-1 py-0">{prod.stock} LEFT</Badge>
                          </div>
                       </div>
                       <h4 className="text-[11px] font-bold text-content-primary line-clamp-1 leading-tight">{prod.name}</h4>
                       <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                          <span className="text-sm font-black text-brand-teal leading-none">{formatCurrency(prod.price)}</span>
                          <RiAddLine className="w-4 h-4 text-brand-teal opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                    </div>
                  ))}
               </div>
               
               {/* Mobile Floating Checkout Bar */}
               {cart.length > 0 && viewMode === 'products' && (
                  <div className="lg:hidden fixed bottom-[72px] left-4 right-4 z-40 bg-brand-teal shadow-2xl p-4 flex items-center justify-between animate-slide-up">
                     <div className="flex flex-col">
                        <span className="text-[10px] text-white/70 font-black uppercase tracking-widest">Total Payable</span>
                        <span className="text-xl font-black text-white leading-none">{formatCurrency(total)}</span>
                     </div>
                     <Button 
                        variant="secondary" 
                        size="sm" 
                        className="bg-white text-brand-teal border-none shadow-lg px-6 font-black uppercase text-[11px]"
                        onClick={() => setViewMode('cart')}
                     >
                        View Basket ({cart.length})
                     </Button>
                  </div>
               )}
            </div>
         </div>

         {/* Cart Section */}
         <div className={`flex flex-col h-full lg:h-[calc(100vh-220px)] ${viewMode === 'cart' ? 'flex' : 'hidden lg:flex'}`}>
            <div className="flex flex-col flex-1 overflow-hidden bg-white lg:border lg:border-brand-teal/20">
               <div className="p-4 bg-brand-teal/5 border-b border-brand-teal/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <RiShoppingBasketLine className="text-brand-teal" size={18} />
                     <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Basket Cart</h3>
                  </div>
                  <Badge variant="teal" className="font-black">{cart.length} ITEMS</Badge>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 text-center space-y-4">
                       <div className="w-20 h-20 bg-surface-secondary flex items-center justify-center">
                          <RiShoppingBasketLine className="w-10 h-10" />
                       </div>
                       <p className="text-xs font-black uppercase tracking-widest">Cart is empty</p>
                    </div>
                  ) : cart.map((item, i) => (
                    <div key={item.id} className="p-3 bg-surface-secondary/50 border border-border/30 flex items-center gap-3 group animate-slide-up">
                       <div className="w-10 h-10 bg-surface-elevated flex-shrink-0">
                          <img src={item.image} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1">
                          <h4 className="text-[11px] font-bold text-content-primary truncate">{item.name}</h4>
                          <h4 className="text-[10px] text-brand-teal font-black">{formatCurrency(item.price)}</h4>
                       </div>
                       <div className="flex items-center gap-2 bg-white px-2 py-1 border border-border">
                          <span className="text-xs font-black text-content-primary w-4 text-center">x{item.qty}</span>
                       </div>
                       <RiDeleteBin7Line className="w-4 h-4 text-state-danger opacity-40 hover:opacity-100 cursor-pointer transition-opacity" onClick={() => removeFromCart(item.id)} />
                    </div>
                  ))}
               </div>

               <div className="p-4 border-t border-border bg-surface-secondary/20 space-y-4 pb-24 lg:pb-4">
                  <div className="space-y-2">
                     <div className="flex justify-between items-center text-[10px] text-content-tertiary uppercase font-black tracking-widest">
                        <span>Cart Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] text-content-tertiary uppercase font-black tracking-widest">
                        <span>Tax / GST (18%)</span>
                        <span>{formatCurrency(tax)}</span>
                     </div>
                  </div>
                  <div className="flex justify-between items-end pt-2 border-t border-border/50">
                     <span className="text-[10px] text-content-tertiary font-black uppercase tracking-wider mb-1">Final Payable</span>
                     <span className="text-2xl font-black text-brand-teal leading-none">{formatCurrency(total)}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                     <Button 
                        className="h-12 shadow-glow font-black uppercase tracking-widest" 
                        icon={RiHandCoinLine} 
                        disabled={cart.length === 0} 
                        onClick={() => open()}
                     >
                        Process Checkout
                     </Button>
                     <Button 
                        variant="secondary" 
                        className="lg:hidden h-10 border-none font-black uppercase text-[10px] tracking-widest"
                        onClick={() => setViewMode('products')}
                     >
                        Add More Products
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      </div>


      {/* Checkout Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title="Complete POS Transaction"
        footer={
           <div className="flex gap-3">
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button icon={RiCheckDoubleLine} onClick={handleCheckout} loading={loading}>Complete Sale</Button>
           </div>
        }
      >
        <div className="space-y-6">
           <div className="p-4 bg-brand-teal/5 border border-brand-teal/20 rounded-none flex items-center justify-between">
              <div>
                <p className="text-[10px] text-content-tertiary uppercase font-black mb-1">Final Bill Amount</p>
                <h4 className="text-3xl font-black text-brand-teal underline decoration-dashed decoration-1 underline-offset-4">{formatCurrency(total)}</h4>
              </div>
              <RiHandCoinLine className="w-10 h-10 text-brand-teal opacity-20" />
           </div>

           <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <Input 
                    label="Customer Name" 
                    placeholder="Full Name" 
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    required
                 />
                 <Input 
                    label="Customer Phone" 
                    placeholder="+91..." 
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    required
                 />
              </div>
              <Select 
                label="Payment Method" 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[{ label: 'Cash Settlement', value: 'Cash' }, { label: 'UPI / QR Scan', value: 'UPI' }, { label: 'Credit/Debit Card', value: 'Card' }]} 
              />
           </div>

           <div className="bg-surface-elevated border border-border p-3 rounded-none flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <RiCheckDoubleLine className="text-state-success w-5 h-5 flex-shrink-0" />
                 <p className="text-[11px] text-content-secondary leading-tight">Stock for <strong>{cart.length} products</strong> will be auto-deducted after fulfillment.</p>
              </div>
           </div>
        </div>
      </Modal>

      {/* Printable Invoice Modal */}
      <Modal
        isOpen={isInvoiceOpen}
        onClose={closeInvoice}
        title="Sale Completed"
        maxWidth="max-w-2xl"
        footer={
           <div className="flex gap-3">
              <Button variant="secondary" onClick={closeInvoice}>Close</Button>
              <Button icon={RiPrinterLine} onClick={printBill}>Print Bill</Button>
           </div>
        }
      >
         <div id="printable-invoice" className="p-8 bg-white text-black font-sans">
            <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
               <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">GST INVOICE</h2>
                  <p className="text-xs mt-1">Invoice #: <strong>{completedSale?.saleId}</strong></p>
                  <p className="text-xs">Date: {new Date().toLocaleDateString()}</p>
               </div>
               <div className="text-right">
                  <h3 className="text-sm font-black uppercase tracking-widest">{completedSale?.retailer?.shopName || 'Retailer Shop'}</h3>
                  <p className="text-[10px] uppercase font-bold text-gray-500">Authorized Appliance Dealer</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-10 mb-8">
               <div>
                  <h4 className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Billed To:</h4>
                  <p className="text-sm font-black">{completedSale?.customer?.name}</p>
                  <p className="text-xs">{completedSale?.customer?.phone}</p>
               </div>
               <div className="text-right">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Payment Status:</h4>
                  <Badge variant="success" size="xs">PAID VIA {completedSale?.paymentMethod}</Badge>
               </div>
            </div>

            <table className="w-full mb-8">
               <thead>
                  <tr className="border-b border-gray-200 text-[10px] font-black uppercase text-gray-400">
                     <th className="text-left py-2">Product Description</th>
                     <th className="text-center py-2">Qty</th>
                     <th className="text-right py-2">Unit Price</th>
                     <th className="text-right py-2">Amount</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {completedSale?.products.map((item, idx) => (
                     <tr key={idx} className="text-xs">
                        <td className="py-3 font-bold">{item.product?.name}</td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right">{formatCurrency(item.priceAtSale)}</td>
                        <td className="py-3 text-right font-black">{formatCurrency(item.priceAtSale * item.quantity)}</td>
                     </tr>
                  ))}
               </tbody>
            </table>

            <div className="flex justify-end">
               <div className="w-64 space-y-2">
                  <div className="flex justify-between text-xs">
                     <span className="text-gray-400">Subtotal</span>
                     <span className="font-bold">{formatCurrency(completedSale?.totalAmount / 1.18)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                     <span className="text-gray-400">GST (18%)</span>
                     <span className="font-bold">{formatCurrency(completedSale?.totalAmount - (completedSale?.totalAmount / 1.18))}</span>
                  </div>
                  <div className="flex justify-between text-base font-black border-t-2 border-black pt-2 mt-2">
                     <span>Grand Total</span>
                     <span className="text-brand-teal">{formatCurrency(completedSale?.totalAmount)}</span>
                  </div>
               </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 text-center">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Thank you for your business!</p>
               <p className="text-[8px] text-gray-300 mt-2 italic">* This is a computer generated invoice *</p>
            </div>
         </div>
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}} />
    </div>
  );
}

