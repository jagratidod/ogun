import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { RiPriceTag3Fill, RiShieldFill, RiSmartphoneFill, RiHistoryFill, RiInformationFill, RiPulseFill, RiArrowLeftSLine, RiShoppingBasketFill, RiVerifiedBadgeFill, RiCustomerService2Fill, RiLoader4Line } from 'react-icons/ri';
import { toast } from 'react-hot-toast';
import { Badge, Button, Avatar, Card, CardHeader, CardTitle, CardDescription, PageHeader } from '../../../core';
import api from '../../../core/api';

export default function ProductDetailPage() {
   const navigate = useNavigate();
   const { id } = useParams();
   const [prod, setProd] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetchProduct();
   }, [id]);

   const fetchProduct = async () => {
      try {
         const res = await api.get(`/customer/products/${id}`);
         setProd(res.data?.data);
      } catch (err) {
         toast.error('Product not found');
         navigate('/customer/products');
      } finally {
         setLoading(false);
      }
   };

   const formatDate = (d) => {
      if (!d) return '—';
      return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
   };

   const getWarrantyLabel = () => {
      if (!prod?.warrantyExpiryDate) return 'Unknown';
      return new Date(prod.warrantyExpiryDate) > new Date() ? 'In Warranty' : 'Expired';
   };

   if (loading) {
      return (
         <div className="page-container max-w-lg mx-auto flex items-center justify-center min-h-[60vh]">
            <RiLoader4Line className="w-8 h-8 text-brand-teal animate-spin" />
         </div>
      );
   }

   if (!prod) return null;

   return (
      <div className="page-container flex flex-col gap-5 max-w-lg mx-auto">
         <div
            onClick={() => navigate('/customer/products')}
            className="flex items-center gap-3 py-2 opacity-50 group cursor-pointer hover:opacity-100 transition-all active:scale-95 outline-none"
         >
            <RiArrowLeftSLine className="w-5 h-5 text-gray-800 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Back to My Appliances</span>
         </div>

         <div className="rounded-[32px] p-8 border-0 shadow-lg bg-gradient-to-br from-brand-teal to-brand-purple flex flex-col items-center justify-center text-center text-white gap-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
            <div className="w-28 h-28 rounded-2xl bg-white p-1 flex items-center justify-center border-4 border-white/20 overflow-hidden shadow-2xl relative z-10">
               <RiShoppingBasketFill className="w-12 h-12 text-brand-teal" />
            </div>
            <div className="flex flex-col items-center relative z-10">
               <h3 className="text-2xl font-black tracking-tight leading-none">{prod.productName}</h3>
               <p className="text-[10px] mt-1 font-bold text-white/60 uppercase tracking-widest">SN: {prod.serialNumber}</p>
               <div className="flex items-center gap-2 mt-3 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                  <RiVerifiedBadgeFill className="text-yellow-400 w-4 h-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest">{getWarrantyLabel()}</p>
               </div>
            </div>
         </div>

         <Card className="rounded-[28px] overflow-hidden">
            <CardHeader className="pb-2">
               <CardTitle>Warranty Profile</CardTitle>
               <CardDescription>Official coverage details and expiration timeline</CardDescription>
            </CardHeader>
            <div className="p-6 space-y-5">
               {[
                  { icon: RiShieldFill, label: 'Coverage Active', val: `${prod.warrantyPeriod} Months · Full Parts + Labor`, color: 'text-brand-teal' },
                  { icon: RiHistoryFill, label: 'Warranty Start', val: formatDate(prod.warrantyStartDate), color: 'text-brand-teal' },
                  { icon: RiHistoryFill, label: 'Expiry Date', val: formatDate(prod.warrantyExpiryDate), color: 'text-brand-teal' },
                  { icon: RiSmartphoneFill, label: 'Category', val: prod.category?.toUpperCase(), color: 'text-brand-teal' },
                  { icon: RiPriceTag3Fill, label: 'Purchase Date', val: formatDate(prod.purchaseDate), color: 'text-brand-teal' },
                  { icon: RiInformationFill, label: 'Store / Dealer', val: prod.storeName || 'Not specified', color: 'text-brand-teal' },
               ].map(item => (
                  <div key={item.label} className="flex items-center gap-4 group">
                     <div className={`w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center ${item.color} border border-gray-100 group-hover:bg-white group-hover:shadow-md transition-all`}>
                        <item.icon className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">{item.label}</p>
                        <h4 className="text-[13px] font-black text-gray-800 leading-none">{item.val}</h4>
                     </div>
                  </div>
               ))}
            </div>
         </Card>

         <div className="grid grid-cols-2 gap-4">
            <button
               onClick={() => navigate('/customer/service/raise')}
               className="bg-white p-6 flex flex-col items-center gap-3 border border-gray-100 rounded-3xl group hover:border-brand-teal/30 hover:shadow-lg transition-all active:scale-95 outline-none"
            >
               <div className="w-14 h-14 rounded-2xl bg-brand-teal/5 flex items-center justify-center text-brand-teal border border-brand-teal/10">
                  <RiCustomerService2Fill className="w-7 h-7" />
               </div>
               <p className="text-[11px] font-black text-gray-800 uppercase tracking-wider">Request Service</p>
            </button>
            <button
               onClick={() => navigate('/customer/warranty')}
               className="bg-white p-6 flex flex-col items-center gap-3 border border-gray-100 rounded-3xl group hover:border-brand-pink/30 hover:shadow-lg transition-all active:scale-95 outline-none"
            >
               <div className="w-14 h-14 rounded-2xl bg-brand-pink/5 flex items-center justify-center text-brand-pink border border-brand-pink/10">
                  <RiPulseFill className="w-7 h-7" />
               </div>
               <p className="text-[11px] font-black text-gray-800 uppercase tracking-wider">Extend Warranty</p>
            </button>
         </div>

         <div className="space-y-3">
            <Button variant="secondary" className="w-full h-12 justify-start px-6 gap-4 rounded-2xl" icon={RiInformationFill} onClick={() => toast.success('Downloading Official User Manual...')}>
               Download Digital Manual
            </Button>
            <Button variant="secondary" className="w-full h-12 justify-start px-6 gap-4 rounded-2xl" icon={RiShieldFill} onClick={() => toast.success('Fetching Warranty Certificate...')}>
               Warranty Certificate
            </Button>
         </div>

         <div className="pb-8 pt-4">
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gray-50/50 border border-dashed border-gray-200 opacity-60">
               <RiInformationFill className="text-brand-teal w-4 h-4 flex-shrink-0" />
               <p className="text-[10px] text-center font-bold text-gray-400 leading-relaxed uppercase tracking-wider">Genuine Ogun components are used in all certified repairs</p>
            </div>
         </div>
      </div>
   );
}
