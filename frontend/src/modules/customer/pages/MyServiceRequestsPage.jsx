import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { RiCustomerService2Fill, RiTimeFill, RiBarChartFill, RiArrowRightSLine, RiInformationFill, RiPulseFill, RiLoader4Line } from 'react-icons/ri';
import { classNames } from '../../../core/utils/helpers';
import { useAuthContext } from '../../../core/context/AuthContext';
import api from '../../../core/api';

export default function MyServiceRequestsPage() {
   const navigate = useNavigate();
   const { user } = useAuthContext();
   const [requests, setRequests] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetchRequests();
   }, []);

   const fetchRequests = async () => {
      try {
         const res = await api.get('/customer/service-requests');
         setRequests(res.data?.data || []);
      } catch (err) {
         console.error('Failed to fetch service requests:', err);
      } finally {
         setLoading(false);
      }
   };

   const formatTimeAgo = (date) => {
      if (!date) return 'Just now';
      const diff = Date.now() - new Date(date).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
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
            {requests.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 gap-4 grayscale">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                     <RiCustomerService2Fill className="w-8 h-8" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] leading-tight">No Active Tickets</p>
                  <p className="text-[8px] text-gray-400">Register a product and raise a service request</p>
               </div>
            ) : requests.map(req => (
               <div
                  key={req._id}
                  onClick={() => navigate(`/customer/service/${req._id}`)}
                  className="p-3.5 rounded-3xl bg-white border border-gray-100 flex items-center gap-4 group hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
               >
                  {/* Status Indicator Bar */}
                  <div className={classNames(
                     "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full",
                     req.status === 'Open' ? 'bg-amber-400' :
                     req.status === 'Assigned' ? 'bg-brand-pink' :
                     req.status === 'In Progress' ? 'bg-brand-teal' :
                     req.status === 'Resolved' ? 'bg-green-500' : 'bg-gray-300'
                  )} />

                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-brand-pink/20 transition-all flex-shrink-0">
                     <RiCustomerService2Fill className="w-7 h-7 text-brand-teal/30" />
                  </div>
                  
                  <div className="flex-1 min-w-0 px-0.5">
                     <div className="flex items-center justify-between mb-1">
                        <h4 className="text-[13px] font-black text-gray-800 tracking-tight">#{req.ticketId}</h4>
                        <span className={classNames(
                           "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                           req.status === 'Open' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                           req.status === 'Assigned' ? 'text-brand-pink bg-brand-pink/5 border-brand-pink/10' :
                           req.status === 'In Progress' ? 'text-brand-teal bg-brand-teal/5 border-brand-teal/10' :
                           req.status === 'Resolved' ? 'text-green-600 bg-green-50 border-green-100' :
                           'text-gray-500 bg-gray-50 border-gray-100'
                        )}>
                           {req.status}
                        </span>
                     </div>
                     <p className="text-[10px] text-gray-400 font-bold truncate italic leading-none mb-2.5 opacity-80 uppercase tracking-tighter">
                        "{req.issueDescription}"
                     </p>
                     <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
                           <RiTimeFill className="text-brand-pink w-2.5 h-2.5" />
                           <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest leading-none">
                              {formatTimeAgo(req.createdAt)}
                           </span>
                        </div>
                        {req.registeredProduct && (
                           <span className="text-[7px] text-gray-400 font-bold uppercase tracking-wider truncate">
                              {req.registeredProduct.productName}
                           </span>
                        )}
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
               <p className="text-[9px] text-gray-400 font-bold tracking-tight uppercase">Resolution: <span className="text-brand-pink">Top 1% Global Support</span></p>
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
