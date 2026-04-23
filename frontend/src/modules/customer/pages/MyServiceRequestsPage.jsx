import { useNavigate } from 'react-router-dom';
import { RiCustomerService2Fill, RiTimeFill, RiBarChartFill, RiEyeFill, RiArrowRightSLine, RiInformationFill, RiPulseFill } from 'react-icons/ri';
import { Badge, Button, Avatar, Card, CardHeader, CardTitle, CardDescription, PageHeader } from '../../../core';
import { classNames } from '../../../core/utils/helpers';
import serviceData from '../../../data/service.json';
import customerData from '../../../data/customer.json';

import { useAuthContext } from '../../../core/context/AuthContext';

export default function MyServiceRequestsPage() {
   const navigate = useNavigate();
   const { user } = useAuthContext();
   const { products: customerProducts } = customerData;
   // Show all requests for demo/test purposes if no direct match found
   const myRequests = serviceData.filter(s => 
      !user?.name || s.customer === user.name || s.customer === 'Rahul Verma' || s.customer === 'Guest User'
   );

   const getProductImage = (productName) => {
      const prod = customerProducts.find(p => p.name === productName);
      return prod?.image || "https://img.freepik.com/free-photo/electric-blender-isolated-white-side-view_185202-3.jpg";
   };

   return (
      <div className="page-container flex flex-col gap-3 max-w-lg mx-auto">
         <div className="pt-0.5 flex items-center justify-between px-0.5">
            <div>
               <h2 className="text-lg font-black text-gray-800 tracking-tight leading-none uppercase font-heading">Service Desk</h2>
               <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase font-secondary tracking-[0.1em] opacity-60">High Priority Tracking</p>
            </div>
            <button 
               onClick={() => navigate('/customer/service/raise')}
               className="group flex flex-col items-center gap-1 active:scale-95 transition-all outline-none"
            >
               <div className="w-9 h-9 rounded-xl bg-brand-pink/5 border border-brand-pink/10 flex items-center justify-center text-brand-pink group-hover:bg-brand-pink group-hover:text-white transition-all">
                  <RiCustomerService2Fill className="w-4.5 h-4.5" />
               </div>
               <span className="text-[6px] font-black text-brand-pink uppercase font-secondary tracking-widest">Report</span>
            </button>
         </div>

         <div className="flex flex-col gap-2.5 mt-0.5">
            {myRequests.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 gap-4 grayscale">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                     <RiCustomerService2Fill className="w-8 h-8" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] leading-tight">No Active Tickets</p>
               </div>
            ) : myRequests.map(req => (
               <div
                  key={req.id}
                  onClick={() => navigate(`/customer/service/${req.id}`)}
                  className="p-3.5 rounded-3xl bg-white border border-gray-100 flex items-center gap-4 group hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
               >
                  {/* Status Indicator Bar */}
                  <div className={classNames(
                     "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full",
                     req.status === 'Assigned' ? 'bg-brand-pink' : 'bg-brand-pink/30'
                  )} />

                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-brand-pink/20 transition-all flex-shrink-0">
                     <img 
                        src={getProductImage(req.product)} 
                        alt={req.product} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                     />
                  </div>
                  
                  <div className="flex-1 min-w-0 px-0.5">
                     <div className="flex items-center justify-between mb-1">
                        <h4 className="text-[13px] font-black text-gray-800 tracking-tight">#{req.id}</h4>
                        <span className="text-[8px] font-black text-brand-pink uppercase tracking-widest bg-brand-pink/5 px-2 py-0.5 rounded-full border border-brand-pink/10">
                           {req.status}
                        </span>
                     </div>
                     <p className="text-[10px] text-gray-400 font-bold truncate italic leading-none mb-2.5 opacity-80 uppercase tracking-tighter">"{req.issue}"</p>
                     
                     <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
                           <RiTimeFill className="text-brand-pink w-2.5 h-2.5" />
                           <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest leading-none">Just Update</span>
                        </div>
                     </div>
                  </div>
                  <RiArrowRightSLine className="text-gray-200 w-5 h-5 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
               </div>
            ))}
         </div>

         <div className="mt-2 p-5 rounded-[28px] bg-gradient-to-br from-brand-pink/[0.03] to-transparent border border-brand-pink/5 flex items-center gap-4 relative overflow-hidden shadow-sm">
            <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-brand-pink/10 relative z-10">
               <RiBarChartFill className="text-brand-pink w-6 h-6" />
            </div>
            <div className="flex-1 relative z-10">
               <h4 className="text-[11px] font-black text-brand-pink uppercase tracking-widest leading-none mb-1">Service Excellence Hub</h4>
               <p className="text-[9px] text-gray-400 font-bold tracking-tight uppercase tracking-tighter">Resolution: <span className="text-brand-pink">Top 1% Global Support</span></p>
            </div>
            <RiPulseFill className="absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] text-brand-pink" />
         </div>

         <div className="mt-auto py-8">
            <div className="flex items-center justify-center gap-2.5 opacity-40">
               <RiInformationFill className="text-gray-400 w-3.5 h-3.5" />
               <p className="text-[8px] text-center font-black uppercase tracking-[0.2em] text-gray-400">Secure Ticket Archive Protocol</p>
            </div>
         </div>
      </div>
   );
}

