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
  
  const { isOpen, open, close } = useModal();
  const { isOpen: isInvoiceOpen, open: openInvoice, close: closeInvoice } = useModal();

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await retailerService.getMyInventory();
      // Only show products with stock > 0
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
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
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
        fetchStock(); // Refresh stock
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
    <div className="page-container h-full overflow-hidden flex flex-col">
      <PageHeader 
        title="POS Terminal" 
        subtitle="Process sales and issue invoices for walk-in customers"
      >
        <Button icon={RiUserLine} variant="secondary">Loyalty Program</Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden mt-2">
         <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden h-[calc(100vh-220px)]">
            <Card className="flex flex-col flex-1 overflow-hidden">
               <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 max-w-sm">
                    <Input 
                      icon={RiSearchLine} 
                      placeholder="Search available products..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1 text-[10px] uppercase font-black rounded-none border transition-all ${activeCategory === cat ? 'bg-brand-teal text-white border-brand-teal' : 'bg-surface-input text-content-tertiary border-border hover:border-brand-teal'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
               </CardHeader>
               <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 scrollbar-hide">
                  {loading && stock.length === 0 ? (
                      <div className="col-span-full py-20 text-center animate-pulse">Loading Inventory...</div>
                  ) : filteredProducts.map(prod => (
                    <div key={prod.id} className="glass-card p-3 flex flex-col group cursor-pointer hover:border-brand-teal transition-all active:scale-95" onClick={() => addToCart(prod)}>
                       <div className="w-full aspect-[4/3] rounded-none bg-surface-elevated flex items-center justify-center mb-3 text-brand-teal/20 relative overflow-hidden">
                          <img src={prod.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={prod.name} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-brand-teal/60 transition-all" />
                          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                             <Badge size="xs" variant="teal">{prod.category}</Badge>
                          </div>
                       </div>
                       <h4 className="text-xs font-bold text-content-primary line-clamp-1">{prod.name}</h4>
                       <p className="text-[10px] text-content-tertiary mb-2 uppercase">{prod.sku}</p>
                       <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
                          <span className="text-sm font-black text-brand-teal leading-none">{formatCurrency(prod.price)}</span>
                          <span className={`text-[9px] font-black uppercase ${prod.stock < 5 ? 'text-state-danger' : 'text-state-success'}`}>{prod.stock} Left</span>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
         </div>

         <div className="flex flex-col h-[calc(100vh-220px)]">
            <Card className="flex flex-col flex-1 overflow-hidden border-brand-teal/20">
               <CardHeader className="bg-brand-teal/5">
                  <div className="flex items-center justify-between w-full">
                     <CardTitle>Basket Cart</CardTitle>
                     <Badge variant="teal">{cart.length} Items</Badge>
                  </div>
               </CardHeader>
               <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 text-center space-y-2">
                       <RiShoppingBasketLine className="w-12 h-12" />
                       <p className="text-xs font-medium">Cart is empty.<br/>Select products to begin sale.</p>
                    </div>
                  ) : cart.map((item, i) => (
                    <div key={item.id} className="p-3 rounded-none bg-surface-input/50 flex items-center gap-3 group animate-slide-up">
                       <div className="flex-1">
                          <h4 className="text-[11px] font-bold text-content-primary truncate">{item.name}</h4>
                          <h4 className="text-[10px] text-brand-teal font-black">{formatCurrency(item.price)}</h4>
                       </div>
                       <div className="flex items-center gap-2 bg-surface-elevated px-2 py-1 rounded-none border border-border">
                          <span className="text-xs font-black text-content-primary w-4 text-center">x{item.qty}</span>
                       </div>
                       <RiDeleteBin7Line className="w-4 h-4 text-state-danger opacity-40 hover:opacity-100 cursor-pointer" onClick={() => removeFromCart(item.id)} />
                    </div>
                  ))}
               </div>
               <div className="p-4 border-t border-border bg-surface-elevated/40 space-y-3">
                  <div className="space-y-1.5 pt-2 border-b border-border/50 pb-3">
                     <div className="flex justify-between items-center text-[11px] text-content-tertiary uppercase font-bold">
                        <span>Cart Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                     </div>
                     <div className="flex justify-between items-center text-[11px] text-content-tertiary uppercase font-bold">
                        <span>Tax / GST (18%)</span>
                        <span>{formatCurrency(tax)}</span>
                     </div>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-xs text-content-tertiary font-black uppercase tracking-wider">Final Payable</span>
                     <span className="text-2xl font-black text-brand-teal">{formatCurrency(total)}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 pt-2">
                     <Button variant="secondary" className="col-span-1 h-11" icon={RiQuestionLine} />
                     <Button className="col-span-3 h-11 shadow-glow" icon={RiHandCoinLine} disabled={cart.length === 0} onClick={() => open()}>
                        Checkout & Print
                     </Button>
                  </div>
               </div>
            </Card>
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

