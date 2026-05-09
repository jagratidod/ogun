import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  RiArrowLeftSLine, RiCustomerService2Fill, RiTimeFill, 
  RiUserFill, RiMapPinFill, RiPhoneFill, RiLoader4Line, 
  RiCheckDoubleFill, RiShieldFill 
} from 'react-icons/ri';
import { Card, CardHeader, CardTitle, CardDescription, Badge } from '../../../core';
import { classNames } from '../../../core/utils/helpers';
import { toast } from 'react-hot-toast';
import api from '../../../core/api';

export default function ServiceRequestDetailPage() {
   const navigate = useNavigate();
   const { id } = useParams();
   const [request, setRequest] = useState(null);
   const [loading, setLoading] = useState(true);
   const [rating, setRating] = useState(0);
   const [feedback, setFeedback] = useState('');
   const [subLoading, setSubLoading] = useState(false);

   useEffect(() => {
      fetchDetail();
   }, [id]);

   const fetchDetail = async () => {
      try {
         const res = await api.get(`/customer/service-requests/${id}`);
         setRequest(res.data?.data);
      } catch (err) {
         console.error(err);
         navigate('/customer/service');
      } finally {
         setLoading(false);
      }
   };

   const submitFeedback = async () => {
      setSubLoading(true);
      try {
         await api.post(`/customer/service-requests/${id}/feedback`, { rating, feedback });
         toast.success('Thank you for your feedback!');
         fetchDetail();
      } catch (err) {
         toast.error('Failed to submit feedback');
      } finally {
         setSubLoading(false);
      }
   };

   const formatDate = (d) => {
      if (!d) return '—';
      return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
   };

   const statusColor = (s) => {
      switch(s) {
         case 'Open': return 'text-amber-600 bg-amber-50 border-amber-100';
         case 'Assigned': return 'text-brand-pink bg-brand-pink/5 border-brand-pink/10';
         case 'In Progress': return 'text-brand-teal bg-brand-teal/5 border-brand-teal/10';
         case 'Resolved': return 'text-green-600 bg-green-50 border-green-100';
         default: return 'text-gray-500 bg-gray-50 border-gray-100';
      }
   };

   if (loading) {
      return (
         <div className="page-container max-w-lg mx-auto flex items-center justify-center min-h-[60vh]">
            <RiLoader4Line className="w-8 h-8 text-brand-teal animate-spin" />
         </div>
      );
   }

   if (!request) return null;

   const product = request.registeredProduct;

   return (
      <div className="page-container max-w-lg mx-auto flex flex-col gap-5 pb-20">
         <div onClick={() => navigate('/customer/service')} className="flex items-center gap-3 py-2 opacity-50 group cursor-pointer hover:opacity-100 transition-all active:scale-95">
            <RiArrowLeftSLine className="w-5 h-5 text-gray-800 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Service Desk</span>
         </div>

         {/* Ticket Header */}
         <div className="rounded-[32px] p-6 bg-gradient-to-br from-brand-pink to-brand-purple text-white relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
            <div className="relative z-10 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Ticket</p>
                  <h2 className="text-2xl font-black tracking-tight">#{request.ticketId}</h2>
               </div>
               <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-white/20 backdrop-blur-md border-white/30 text-white`}>
                  {request.status}
               </div>
            </div>
         </div>

         {/* Product Info */}
         {product && (
            <Card className="rounded-[28px] overflow-hidden">
               <CardHeader className="pb-2">
                  <CardTitle>Product Details</CardTitle>
               </CardHeader>
               <div className="p-5 space-y-4">
                  {[
                     { icon: RiShieldFill, label: 'Product', val: product.productName },
                     { icon: RiCustomerService2Fill, label: 'Serial Number', val: product.serialNumber },
                     { icon: RiMapPinFill, label: 'Location', val: `${product.city || ''}, ${product.state || ''}` },
                  ].map(item => (
                     <div key={item.label} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-brand-teal border border-gray-100">
                           <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{item.label}</p>
                           <p className="text-[12px] font-black text-gray-800">{item.val}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </Card>
         )}

         {/* Issue Details */}
         <Card className="rounded-[28px] overflow-hidden">
            <CardHeader className="pb-2">
               <CardTitle>Issue Information</CardTitle>
            </CardHeader>
            <div className="p-5 space-y-4">
               <div>
                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">Description</p>
                  <p className="text-[13px] font-bold text-gray-700 italic">"{request.issueDescription}"</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">Priority</p>
                     <p className={`text-[12px] font-black ${request.priority === 'High' ? 'text-red-500' : request.priority === 'Medium' ? 'text-amber-500' : 'text-green-500'}`}>
                        {request.priority}
                     </p>
                  </div>
                  <div>
                     <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">Contact</p>
                     <p className="text-[12px] font-black text-gray-800">{request.contactNumber}</p>
                  </div>
               </div>
               {request.assignedTechnician && (
                  <div>
                     <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">Assigned Technician</p>
                     <p className="text-[12px] font-black text-brand-teal">{request.assignedTechnician.name}</p>
                  </div>
               )}
               {request.adminRemarks && (
                  <div>
                     <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">Admin Remarks</p>
                     <p className="text-[12px] font-bold text-gray-600">{request.adminRemarks}</p>
                  </div>
               )}
            </div>
         </Card>

         {/* Activity Timeline */}
         {request.history && request.history.length > 0 && (
            <Card className="rounded-[28px] overflow-hidden">
               <CardHeader className="pb-2">
                  <CardTitle>Activity Timeline</CardTitle>
               </CardHeader>
               <div className="p-5 space-y-4">
                  {request.history.map((entry, idx) => (
                     <div key={idx} className="flex items-start gap-3 relative">
                        {idx < request.history.length - 1 && (
                           <div className="absolute left-[17px] top-8 w-0.5 h-full bg-gray-100" />
                        )}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border ${statusColor(entry.status)}`}>
                           <RiCheckDoubleFill className="w-4 h-4" />
                        </div>
                        <div className="flex-1 pb-4">
                           <p className="text-[11px] font-black text-gray-800">{entry.status}</p>
                           <p className="text-[9px] text-gray-400 font-bold mt-0.5">{entry.note}</p>
                           <p className="text-[8px] text-gray-300 font-bold mt-1">{formatDate(entry.timestamp)}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </Card>
         )}

         {/* Feedback Form */}
         {request.status === 'Resolved' && (
            <Card className="rounded-[28px] overflow-hidden border-brand-teal bg-brand-teal/[0.02]">
               <div className="p-6 space-y-4">
                  <div className="text-center">
                     <h4 className="text-sm font-black text-content-primary uppercase tracking-widest">Share Your Experience</h4>
                     <p className="text-[10px] text-content-tertiary font-bold mt-1">Help us improve our service quality</p>
                  </div>
                  
                  <div className="flex justify-center gap-2 py-2">
                     {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                           key={star} 
                           onClick={() => setRating(star)}
                           className={classNames(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                              rating >= star ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20' : 'bg-white border border-gray-100 text-gray-300'
                           )}
                        >
                           <RiShieldFill className="w-5 h-5" />
                        </button>
                     ))}
                  </div>

                  <textarea 
                     className="w-full h-24 rounded-2xl bg-white border border-gray-100 p-4 text-[13px] font-bold text-gray-700 outline-none focus:border-brand-teal/30 transition-all placeholder:text-gray-200"
                     placeholder="Tell us what you liked (optional)..."
                     value={feedback}
                     onChange={(e) => setFeedback(e.target.value)}
                  />

                  <button 
                     onClick={submitFeedback}
                     disabled={!rating || subLoading}
                     className="w-full h-12 bg-brand-teal text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl shadow-brand-teal/20 disabled:opacity-50 active:scale-95 transition-all"
                  >
                     {subLoading ? 'SUBMITTING...' : 'SUBMIT FEEDBACK & CLOSE TICKET'}
                  </button>
               </div>
            </Card>
         )}

         {request.status === 'Closed' && request.rating && (
            <Card className="rounded-[28px] overflow-hidden bg-gray-50/50">
               <div className="p-5 flex items-center justify-between">
                  <div>
                     <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">Your Rating</p>
                     <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                           <RiShieldFill key={i} className={classNames("w-3 h-3", i < request.rating ? 'text-brand-teal' : 'text-gray-200')} />
                        ))}
                     </div>
                  </div>
                  <div className="text-right">
                     <Badge variant="secondary">TICKET CLOSED</Badge>
                  </div>
               </div>
            </Card>
         )}
      </div>
   );
}
