import { useNavigate, useParams } from 'react-router-dom';
import { RiPulseFill, RiArrowLeftSLine, RiShieldFill, RiTimeFill, RiVerifiedBadgeFill, RiUserFill, RiPhoneFill, RiSettings4Fill, RiHistoryFill, RiInformationFill, RiCheckDoubleFill, RiCustomerService2Fill } from 'react-icons/ri';
import { Badge, Button, Avatar, Card, CardHeader, CardTitle, CardDescription, PageHeader, formatDateTime } from '../../../core';
import serviceData from '../../../data/service.json';

export default function ServiceRequestDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const ticket = serviceData.find(s => s.id === id) || serviceData[0];

  return (
    <div className="page-container flex flex-col gap-6 max-w-lg mx-auto">
      <div 
        onClick={() => navigate('/customer/service')}
        className="flex items-center gap-3 py-2 opacity-50 group cursor-pointer hover:opacity-100 transition-all active:scale-95 outline-none"
      >
         <RiArrowLeftSLine className="w-5 h-5 text-gray-800 group-hover:-translate-x-1 transition-transform" />
         <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Back to Tickets</span>
      </div>

      <div className="rounded-[32px] p-8 border-0 shadow-lg bg-gradient-to-br from-brand-pink to-brand-purple flex flex-col items-center justify-center text-center text-white gap-4 relative overflow-hidden">
         <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
         <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center border-4 border-white/20 relative z-10 shadow-2xl">
            <RiPulseFill className="w-12 h-12" />
         </div>
         <div className="flex flex-col items-center relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Ticket ID • #{ticket.id}</p>
            <h3 className="text-2xl font-black tracking-tight">{ticket.status}</h3>
         </div>
      </div>

      <Card className="rounded-[28px] overflow-hidden">
         <CardHeader className="pb-2">
            <CardTitle>Case Observation</CardTitle>
            <CardDescription>Issue reported and product specifications</CardDescription>
         </CardHeader>
         <div className="p-6 space-y-6">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
               <p className="text-[10px] text-brand-pink font-black mb-1 uppercase tracking-widest leading-none">User Complaint</p>
               <p className="text-[13px] text-gray-600 leading-relaxed font-bold italic">"{ticket.issue}"</p>
            </div>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
               {[
                 { label: 'Assigned Appliance', val: ticket.product },
                 { label: 'Priority Support', val: ticket.priority, status: 'Active' },
                 { label: 'Field Technician', val: ticket.technician || 'Not Assigned' },
                 { label: 'Warranty Class', val: 'Gold Coverage', status: 'Active' }
               ].map(item => (
                 <div key={item.label}>
                    <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest mb-1.5 leading-none">{item.label}</p>
                    <div className="flex items-center gap-1.5">
                       <span className="text-[13px] font-black text-gray-800 leading-tight tracking-tight">{item.val}</span>
                       {item.status && <div className="w-1.5 h-1.5 rounded-full bg-state-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </Card>

      <Card className="rounded-[28px] overflow-hidden">
         <CardHeader className="pb-2">
            <CardTitle>Repair Progress</CardTitle>
            <CardDescription>Event timeline for this service request</CardDescription>
         </CardHeader>
         <div className="p-6 px-4">
            <div className="relative">
               <div className="absolute left-[17px] top-4 h-[calc(100%-24px)] w-[1.5px] bg-gray-100 -z-0" />
               <div className="space-y-8">
                  {ticket.history?.map((evt, idx) => (
                     <div key={idx} className="relative z-10 flex gap-5">
                        <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 text-brand-pink shadow-sm">
                           <RiCheckDoubleFill className="w-5 h-5" />
                        </div>
                        <div className="flex-1 pt-1">
                           <div className="flex items-center justify-between mb-1">
                              <Badge variant="teal" className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5">{evt.status}</Badge>
                              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">{formatDateTime(evt.time).split(',')[0]}</span>
                           </div>
                           <p className="text-[12px] text-gray-500 font-bold leading-relaxed">{evt.note}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </Card>

      <div className="pb-8 space-y-4">
         <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gray-50/50 border border-dashed border-gray-200 opacity-60">
            <RiInformationFill className="text-brand-pink w-4 h-4 flex-shrink-0" />
            <p className="text-[10px] text-center font-bold text-gray-400 leading-relaxed uppercase tracking-widest">Closing ticket requires customer code verification</p>
         </div>
      </div>
    </div>
  );
}

