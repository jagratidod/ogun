import { useNavigate } from 'react-router-dom';
import { RiShoppingBasketLine, RiVerifiedBadgeLine, RiPriceTag3Line, RiInformationLine, RiAddCircleLine, RiSmartphoneLine, RiHeartLine, RiCustomerServiceLine, RiArrowRightSLine, RiShieldStarLine, RiTimeLine } from 'react-icons/ri';
import { Badge, Button, Avatar, Card, CardHeader, CardTitle, CardDescription, PageHeader } from '../../../core';
import customerData from '../../../data/customer.json';

export default function MyProductsPage() {
   const navigate = useNavigate();
   const { products } = customerData;

   return (
      <div className="page-container flex flex-col gap-4 max-w-lg mx-auto">
         <div className="pt-2">
            <h2 className="text-xl font-black text-gray-800 tracking-tight">My Appliances</h2>
            <p className="text-[11px] font-bold text-gray-400 mt-0.5">Manage your registered Ogun products</p>
         </div>

         <div className="flex flex-col gap-3.5 mt-2">
            {products.map(prod => (
               <div
                  key={prod.id}
                  onClick={() => navigate(`/customer/products/${prod.id}`)}
                  className="py-2.5 px-3 rounded-2xl bg-white border border-gray-50 flex items-center gap-4 group hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-all cursor-pointer"
               >
                  <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-brand-teal/30 transition-all flex-shrink-0">
                     <img 
                        src={prod.image || "https://img.freepik.com/free-photo/electric-blender-isolated-white-side-view_185202-3.jpg"} 
                        alt={prod.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                     />
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="text-[14px] font-black text-gray-800 leading-tight mb-1 truncate">{prod.name}</h4>
                     <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-brand-teal uppercase tracking-widest bg-teal-50/50 px-2 py-0.5 border border-brand-teal/10">
                           EXP: {prod.warrantyExp}
                        </span>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 bg-green-50/50 px-2.5 py-1.5 rounded-lg border border-green-100/50">
                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                     <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Active</span>
                  </div>
                  
                  <RiArrowRightSLine className="text-gray-300 w-5 h-5 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
               </div>
            ))}
         </div>

         <div className="mt-6 p-8 rounded-[32px] border border-dashed border-gray-200 bg-gray-50/20 flex flex-col items-center text-center group hover:bg-gray-50 transition-all cursor-pointer"
            onClick={() => navigate('/customer/products/register')}
         >
            <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-300 mb-4 group-hover:scale-110 group-hover:text-brand-teal transition-all duration-500">
               <RiAddCircleLine className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-1">Add New Appliance</h4>
            <p className="text-[11px] text-gray-400 font-bold mb-5 max-w-[200px]">Register your recent purchase for official warranty tracking</p>
            <div className="px-8 py-2.5 bg-white border border-gray-100 rounded-full text-xs font-black text-brand-teal shadow-sm group-hover:shadow-md transition-all">
               Register Now
            </div>
         </div>

         <div className="pb-8 space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 rounded-none bg-brand-pink/5 border border-brand-pink/10 opacity-70">
               <RiHeartLine className="w-4 h-4 text-brand-pink" />
               <p className="text-[10px] font-medium text-center">Extended warranty plans are now available for Mixer Grinders!</p>
            </div>
         </div>
      </div>
   );
}

