import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiShieldStarFill, RiShieldCheckFill, RiArrowRightSLine, RiLoader4Line, RiHistoryFill, RiCheckDoubleFill } from 'react-icons/ri';
import { Button, Card, Select } from '../../../core';
import { toast } from 'react-hot-toast';
import api from '../../../core/api';

export default function WarrantyExtensionPage() {
   const navigate = useNavigate();
   const [products, setProducts] = useState([]);
   const [extensions, setExtensions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [extending, setExtending] = useState(null); // product id being extended
   const [extForm, setExtForm] = useState({ months: '12', type: 'standard' });
   const [submitting, setSubmitting] = useState(false);

   const pricing = {
      '6':  { standard: 999, premium: 1499 },
      '12': { standard: 1799, premium: 2499 },
      '24': { standard: 2999, premium: 4499 }
   };

   useEffect(() => {
      fetchData();
   }, []);

   const fetchData = async () => {
      try {
         const [prodRes, extRes] = await Promise.all([
            api.get('/customer/products'),
            api.get('/customer/warranty-history')
         ]);
         setProducts(prodRes.data?.data || []);
         setExtensions(extRes.data?.data || []);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const handleExtend = async (productId) => {
      setSubmitting(true);
      try {
         const amount = pricing[extForm.months]?.[extForm.type] || 0;
         await api.post(`/customer/products/${productId}/extend-warranty`, {
            extensionMonths: extForm.months,
            extensionType: extForm.type,
            amount
         });
         toast.success('Warranty extended successfully!');
         setExtending(null);
         fetchData();
      } catch (err) {
         toast.error(err.response?.data?.message || 'Extension failed');
      } finally {
         setSubmitting(false);
      }
   };

   const formatDate = (d) => {
      if (!d) return '—';
      return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
   };

   if (loading) {
      return (
         <div className="page-container max-w-lg mx-auto flex items-center justify-center min-h-[60vh]">
            <RiLoader4Line className="w-8 h-8 text-brand-teal animate-spin" />
         </div>
      );
   }

   return (
      <div className="page-container max-w-lg mx-auto flex flex-col gap-6 pb-20">
         <div className="pt-2">
            <h2 className="text-xl font-black text-gray-800 tracking-tight">Warranty Extensions</h2>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Extend coverage on your registered appliances</p>
         </div>

         {/* ─── Products List ─── */}
         <section className="space-y-3">
            <h3 className="text-[12px] font-black text-gray-800 uppercase tracking-widest px-1 flex items-center gap-2">
               <RiShieldCheckFill className="text-brand-teal w-4 h-4" />
               My Products
            </h3>

            {products.length === 0 ? (
               <Card className="rounded-[28px] p-8 text-center border-gray-50">
                  <p className="text-sm text-gray-400 mb-4">No registered products</p>
                  <Button onClick={() => navigate('/customer/products/register')} size="sm">Register Product</Button>
               </Card>
            ) : products.map(prod => {
               const isExpired = prod.warrantyExpiryDate && new Date(prod.warrantyExpiryDate) < new Date();
               const isExtending = extending === prod._id;

               return (
                  <div key={prod._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                     <div className="p-4 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isExpired ? 'bg-red-50 border-red-100 text-red-400' : 'bg-brand-teal/5 border-brand-teal/10 text-brand-teal'}`}>
                           <RiShieldStarFill size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="text-[14px] font-black text-gray-800 truncate">{prod.productName}</h4>
                           <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                              Expires: {formatDate(prod.warrantyExpiryDate)}
                              {isExpired && <span className="text-red-500 ml-2">· EXPIRED</span>}
                           </p>
                        </div>
                        <button 
                           onClick={() => setExtending(isExtending ? null : prod._id)}
                           className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                              isExtending 
                              ? 'bg-gray-100 text-gray-500' 
                              : 'bg-brand-pink text-white shadow-lg shadow-brand-pink/20 hover:scale-105 active:scale-95'
                           }`}
                        >
                           {isExtending ? 'Cancel' : 'Extend'}
                        </button>
                     </div>

                     {isExtending && (
                        <div className="p-4 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-gray-50">
                           <div className="grid grid-cols-3 gap-3 pt-4">
                              {['6', '12', '24'].map(months => (
                                 <button
                                    key={months}
                                    onClick={() => setExtForm(f => ({ ...f, months }))}
                                    className={`p-3 rounded-2xl border-2 text-center transition-all ${
                                       extForm.months === months 
                                       ? 'border-brand-pink bg-brand-pink/5' 
                                       : 'border-gray-100 bg-white hover:border-brand-pink/30'
                                    }`}
                                 >
                                    <p className="text-lg font-black text-gray-800">{months === '6' ? '6' : months === '12' ? '1' : '2'}</p>
                                    <p className="text-[8px] font-black text-gray-400 uppercase">{months === '6' ? 'Months' : months === '12' ? 'Year' : 'Years'}</p>
                                    <p className="text-[11px] font-black text-brand-pink mt-1">₹{pricing[months]?.[extForm.type]}</p>
                                 </button>
                              ))}
                           </div>
                           <Select
                              label="Coverage Type"
                              value={extForm.type}
                              onChange={(e) => setExtForm(f => ({ ...f, type: e.target.value }))}
                              options={[
                                 { label: 'Standard Coverage', value: 'standard' },
                                 { label: 'Premium (Parts + Labor)', value: 'premium' }
                              ]}
                           />
                           <Button 
                              loading={submitting}
                              onClick={() => handleExtend(prod._id)} 
                              className="w-full rounded-full bg-brand-pink text-white border-none shadow-xl shadow-brand-pink/20"
                           >
                              Confirm Extension · ₹{pricing[extForm.months]?.[extForm.type]}
                           </Button>
                        </div>
                     )}
                  </div>
               );
            })}
         </section>

         {/* ─── Extension History ─── */}
         <section className="space-y-3">
            <h3 className="text-[12px] font-black text-gray-800 uppercase tracking-widest px-1 flex items-center gap-2">
               <RiHistoryFill className="text-brand-pink w-4 h-4" />
               Extension History
            </h3>

            {extensions.length === 0 ? (
               <div className="p-8 rounded-3xl bg-gray-50/50 border border-dashed border-gray-200 text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No extensions yet</p>
               </div>
            ) : extensions.map(ext => (
               <div key={ext._id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 border border-green-100">
                     <RiCheckDoubleFill size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="text-[12px] font-black text-gray-800 truncate">
                        {ext.registeredProduct?.productName || 'Product'}
                     </h4>
                     <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                        +{ext.extensionMonths} months · ₹{ext.amount} · {ext.extensionType}
                     </p>
                     <p className="text-[8px] text-brand-teal font-black uppercase tracking-widest mt-1">
                        {formatDate(ext.previousExpiryDate)} → {formatDate(ext.newExpiryDate)}
                     </p>
                  </div>
               </div>
            ))}
         </section>
      </div>
   );
}
