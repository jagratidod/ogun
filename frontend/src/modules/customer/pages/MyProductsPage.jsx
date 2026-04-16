import { useNavigate } from 'react-router-dom';
import { RiShoppingBasketFill, RiVerifiedBadgeFill, RiPriceTag3Fill, RiInformationFill, RiAddCircleFill, RiSmartphoneFill, RiHeartFill, RiCustomerServiceFill, RiArrowRightSLine, RiShieldStarFill, RiTimeFill } from 'react-icons/ri';
import { Badge, Button, Avatar, Card, CardHeader, CardTitle, CardDescription, PageHeader } from '../../../core';
import customerData from '../../../data/customer.json';

export default function MyProductsPage() {
   const navigate = useNavigate();
   const { products } = customerData;

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
            {products.map(prod => (
               <div
                  key={prod.id}
                  onClick={() => navigate(`/customer/products/${prod.id}`)}
                  className="p-3 rounded-3xl bg-white border border-gray-100 flex flex-col gap-3 group hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] active:scale-[0.97] transition-all cursor-pointer overflow-hidden relative"
               >
                  {/* Status Badge */}
                  <div className="absolute top-2.5 right-2.5 z-10 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-gray-100 flex items-center gap-1 shadow-sm">
                     <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                     <span className="text-[6px] font-black text-green-600 uppercase tracking-tighter">Active</span>
                  </div>

                  <div className="w-full aspect-square rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-brand-teal/20 transition-all flex-shrink-0">
                     <img 
                        src={prod.image || "/products/mixer.png"} 
                        alt={prod.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                     />
                  </div>
                  
                  <div className="flex flex-col gap-1.5 px-0.5">
                     <h4 className="text-[12px] font-black text-gray-800 leading-tight truncate">{prod.name}</h4>
                     
                     <div className="flex items-center gap-1.5 bg-teal-50/50 p-1.5 rounded-lg border border-brand-teal/5">
                        <RiShieldStarFill className="w-3 h-3 text-brand-teal" />
                        <span className="text-[8px] font-black text-brand-teal uppercase tracking-widest leading-none">EXP: {prod.warrantyExp}</span>
                     </div>
                  </div>
               </div>
            ))}

            {/* Compact Add Button Card */}
            <div className="p-3 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 group hover:border-brand-teal/30 hover:bg-gray-50 transition-all cursor-pointer min-h-[160px]"
               onClick={() => navigate('/customer/products/register')}
            >
               <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-300 group-hover:scale-110 group-hover:text-brand-teal transition-all duration-500">
                  <RiAddCircleFill className="w-6 h-6" />
               </div>
               <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-wider">Register New</h4>
            </div>
         </div>

         <div className="pb-8 mt-4">
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-brand-pink/5 border border-brand-pink/10">
               <RiHeartFill className="w-4 h-4 text-brand-pink" />
               <p className="text-[9px] font-black uppercase tracking-widest text-brand-pink/70 text-center">Extended warranty plans are available</p>
            </div>
         </div>
      </div>
   );
}

