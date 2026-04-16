import { useNavigate } from 'react-router-dom';
import { RiCustomerService2Fill, RiTimeFill, RiBarChartFill, RiEyeFill, RiArrowRightSLine, RiInformationFill, RiPulseFill } from 'react-icons/ri';
import { Badge, Button, Avatar, Card, CardHeader, CardTitle, CardDescription, PageHeader } from '../../../core';
import serviceData from '../../../data/service.json';
import customerData from '../../../data/customer.json';

export default function MyServiceRequestsPage() {
   const navigate = useNavigate();
   const { products: customerProducts } = customerData;
   const myRequests = serviceData.filter(s => s.customer === 'Rahul Verma');

   const getProductImage = (productName) => {
      const prod = customerProducts.find(p => p.name === productName);
      return prod?.image || "https://img.freepik.com/free-photo/electric-blender-isolated-white-side-view_185202-3.jpg";
   };

   return (
      <div className="page-container flex flex-col gap-4 max-w-lg mx-auto">
         <div className="pt-2 flex items-center justify-between">
            <div>
               <h2 className="text-xl font-black text-gray-800 tracking-tight">Service Tickets</h2>
               <p className="text-[11px] font-bold text-gray-400 mt-0.5">Track your complaints & technician visits</p>
            </div>
            <Button size="xs" variant="secondary" icon={RiCustomerService2Fill} onClick={() => navigate('/customer/service/raise')}>Report Issue</Button>
         </div>

         <div className="flex flex-col gap-3 mt-1">
            {myRequests.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 text-center opacity-30 gap-4 grayscale">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                     <RiCustomerService2Fill className="w-8 h-8" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-tight">No Active Complaints</p>
               </div>
            ) : myRequests.map(req => (
               <div
                  key={req.id}
                  onClick={() => navigate(`/customer/service/${req.id}`)}
                  className="py-2.5 px-3 rounded-2xl bg-white border border-gray-50 flex items-center gap-4 group hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-all cursor-pointer"
               >
                  <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-brand-pink/30 transition-all flex-shrink-0">
                     <img 
                        src={getProductImage(req.product)} 
                        alt={req.product} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                     />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-[14px] font-black text-gray-800 tracking-tight">#{req.id}</h4>
                        <Badge variant={req.status === 'Assigned' ? 'teal' : 'warning'} className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5">
                           {req.status}
                        </Badge>
                     </div>
                     <p className="text-[10px] text-gray-400 font-medium truncate italic leading-none mb-2">"{req.issue}"</p>
                     <div className="flex items-center gap-1.5">
                        <RiTimeFill className="text-brand-pink w-3 h-3" />
                        <p className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest">Last Update: Just Now</p>
                     </div>
                  </div>
                  <RiArrowRightSLine className="text-gray-300 w-5 h-5 group-hover:text-brand-pink group-hover:translate-x-1 transition-all" />
               </div>
            ))}
         </div>

         <div className="mt-4 p-4 rounded-3xl bg-white border border-gray-50 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-brand-pink/5 flex items-center justify-center border border-brand-pink/10">
               <RiBarChartFill className="text-brand-pink w-6 h-6" />
            </div>
            <div className="flex-1">
               <h4 className="text-[12px] font-black text-gray-800 uppercase tracking-wider leading-none mb-1">Service Hub</h4>
               <p className="text-[10px] text-gray-400 font-bold tracking-tight">Average resolution time: <span className="text-brand-pink">1.4 days</span></p>
            </div>
         </div>

         <div className="mt-auto py-6">
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gray-50/50 border border-dashed border-gray-200 opacity-60">
               <RiInformationFill className="text-brand-pink w-4 h-4 flex-shrink-0" />
               <p className="text-[10px] text-center font-bold text-gray-400 leading-relaxed uppercase tracking-wider">Closed tickets are archived and can be viewed in history</p>
            </div>
         </div>
      </div>
   );
}

