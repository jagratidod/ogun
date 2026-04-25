import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { RiShoppingBasketFill, RiVerifiedBadgeFill, RiPriceTag3Fill, RiAddCircleFill, RiShieldStarFill, RiHeartFill, RiLoader4Line } from 'react-icons/ri';
import api from '../../../core/api';

export default function MyProductsPage() {
   const navigate = useNavigate();
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetchProducts();
   }, []);

   const fetchProducts = async () => {
      try {
         const res = await api.get('/customer/products');
         setProducts(res.data?.data || []);
      } catch (err) {
         console.error('Failed to fetch products:', err);
      } finally {
         setLoading(false);
      }
   };

   const getWarrantyStatus = (expiryDate) => {
      if (!expiryDate) return { label: 'Unknown', color: 'text-gray-400 bg-gray-50 border-gray-100' };
      const now = new Date();
      const expiry = new Date(expiryDate);
      if (expiry > now) return { label: 'Active', color: 'text-green-600 bg-green-50 border-green-100' };
      return { label: 'Expired', color: 'text-red-500 bg-red-50 border-red-100' };
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
      <div className="page-container flex flex-col gap-3 max-w-lg mx-auto">
         <div className="flex items-center justify-between pt-1">
            <div>
               <h2 className="text-xl font-black text-gray-800 tracking-tight font-heading leading-none">Appliances</h2>
               <p className="text-[10px] font-bold text-gray-400 mt-1.5 font-secondary uppercase tracking-[0.1em]">Official Warranty Tracking</p>
            </div>
            <RiAddCircleFill 
               onClick={() => navigate('/customer/products/register')} 
               className="w-9 h-9 text-brand-teal cursor-pointer hover:scale-110 active:scale-90 transition-all"
            />
         </div>

         <div className="grid grid-cols-2 gap-3 mt-1">
            {products.map(prod => {
               const warranty = getWarrantyStatus(prod.warrantyExpiryDate);
               return (
                  <div
                     key={prod._id}
                     onClick={() => navigate(`/customer/products/${prod._id}`)}
                     className="p-3 rounded-3xl bg-white border border-gray-100 flex flex-col gap-3 group hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] active:scale-[0.97] transition-all cursor-pointer overflow-hidden relative"
                  >
                     {/* Status Badge */}
                     <div className={`absolute top-2.5 right-2.5 z-10 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-sm ${warranty.color}`}>
                        <div className={`w-1 h-1 rounded-full ${warranty.label === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></div>
                        <span className="text-[6px] font-black uppercase tracking-tighter">{warranty.label}</span>
                     </div>

                     <div className="w-full aspect-square rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-brand-teal/20 transition-all flex-shrink-0">
                        <RiShoppingBasketFill className="w-12 h-12 text-brand-teal/20" />
                     </div>
                     
                     <div className="flex flex-col gap-1.5 px-0.5">
                        <h4 className="text-[12px] font-black text-gray-800 leading-tight truncate">{prod.productName}</h4>
                        <div className="flex items-center gap-1.5 bg-teal-50/50 p-1.5 rounded-lg border border-brand-teal/5">
                           <RiShieldStarFill className="w-3 h-3 text-brand-teal" />
                           <span className="text-[8px] font-black text-brand-teal uppercase tracking-widest leading-none">EXP: {formatDate(prod.warrantyExpiryDate)}</span>
                        </div>
                     </div>
                  </div>
               );
            })}

            {/* Add Button Card */}
            <div className="p-3 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 group hover:border-brand-teal/30 hover:bg-gray-50 transition-all cursor-pointer min-h-[160px]"
               onClick={() => navigate('/customer/products/register')}
            >
               <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-300 group-hover:scale-110 group-hover:text-brand-teal transition-all duration-500">
                  <RiAddCircleFill className="w-6 h-6" />
               </div>
               <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-wider">Register New</h4>
            </div>
         </div>

         {products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 opacity-40">
               <RiShoppingBasketFill className="w-16 h-16 text-gray-300 mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No Products Registered Yet</p>
            </div>
         )}

         <div className="pb-8 mt-4">
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-brand-pink/5 border border-brand-pink/10">
               <RiHeartFill className="w-4 h-4 text-brand-pink" />
               <p className="text-[9px] font-black uppercase tracking-widest text-brand-pink/70 text-center">Extended warranty plans are available</p>
            </div>
         </div>
      </div>
   );
}
