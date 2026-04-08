import { useState, useMemo } from 'react';
import { RiAddLine, RiSearchLine, RiDeleteBin7Line, RiShoppingBasketLine, RiUserLine, RiHandCoinLine, RiCouponLine, RiQuestionLine, RiCloseLine, RiCheckDoubleLine, RiFileList3Line } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, Badge, Button, Input, Select, Avatar, formatCurrency, useModal, Modal } from '../../../core';
import products from '../../../data/products.json';
import { toast } from 'react-hot-toast';

export default function NewSalePage() {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { isOpen, open, close } = useModal();

  const categories = ['All', 'Mixer Grinder', 'Induction Cooktop', 'Chimney', 'Water Purifier'];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const addToCart = (prod) => {
    const existing = cart.find(c => c.id === prod.id);
    if (existing) {
       setCart(cart.map(c => c.id === prod.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
       setCart([...cart, { ...prod, qty: 1 }]);
    }
    toast.success(`Added ${prod.name} to basket`, { id: 'cart-add' });
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.id !== id));
    toast.error('Removed from basket');
  };

  const subtotal = cart.reduce((acc, c) => acc + (c.price * c.qty), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handleCheckout = () => {
    toast.success('Transaction Completed. Printing GST Invoice...');
    setCart([]);
    close();
  };

  return (
    <div className="page-container h-full overflow-hidden flex flex-col">
      <PageHeader 
        title="POS Terminal" 
        subtitle="Process sales and issue invoices for walk-in customers"
      >
        <Button icon={RiUserLine} variant="secondary">Register New Consumer</Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden mt-2">
         <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden h-[calc(100vh-220px)]">
            <Card className="flex flex-col flex-1 overflow-hidden">
               <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 max-w-sm">
                    <Input 
                      icon={RiSearchLine} 
                      placeholder="Scan SKU or search product name..." 
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
                  {filteredProducts.map(prod => (
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
                     <Badge variant="teal">{cart.length} Products</Badge>
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

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title="Complete POS Transaction"
        footer={
           <div className="flex gap-3">
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button icon={RiCheckDoubleLine} onClick={handleCheckout}>Generate GST Invoice</Button>
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

           <div className="grid grid-cols-2 gap-4">
              <Select label="Payment Method" options={[{ label: 'UPI / QR Scan', value: 'upi' }, { label: 'Cash Settlement', value: 'cash' }, { label: 'Credit Card', value: 'card' }]} />
              <Input label="Customer Contact" placeholder="+91 99XXXXX..." />
           </div>

           <div className="space-y-2">
              <label className="text-[11px] text-content-tertiary font-bold uppercase tracking-widest pl-1">Loyalty Discount</label>
              <div className="flex gap-2">
                 <Input className="flex-1 h-10" icon={RiCouponLine} placeholder="Enter Code or search by phone..." />
                 <Button variant="secondary" className="h-10 text-xs px-4">Verify Profile</Button>
              </div>
           </div>

           <div className="bg-surface-elevated border border-border p-3 rounded-none flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <RiCheckDoubleLine className="text-state-success w-5 h-5 flex-shrink-0" />
                 <p className="text-[11px] text-content-secondary leading-tight">Stock for <strong>{cart.length} products</strong> will be auto-deducted after fulfillment.</p>
              </div>
           </div>
        </div>
      </Modal>
    </div>
  );
}

