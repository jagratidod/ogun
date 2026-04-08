import { useNavigate, useParams } from 'react-router-dom';
import { RiPulseLine, RiArrowLeftSLine, RiShieldLine, RiTimeLine, RiVerifiedBadgeLine, RiUserLine, RiPhoneLine, RiSettings4Line, RiHistoryLine, RiInformationLine, RiCheckDoubleLine, RiCustomerServiceLine } from 'react-icons/ri';
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
        className="flex items-center gap-4 py-2 opacity-50 group cursor-pointer hover:opacity-100 transition-all active:scale-95 outline-none"
      >
         <RiArrowLeftSLine className="w-6 h-6 text-content-primary group-hover:-translate-x-1 transition-transform" />
         <span className="text-[10px] font-black uppercase tracking-widest leading-none">Back to Tickets</span>
      </div>

      <div className="glass-card p-6 border-0 shadow-glow bg-gradient-to-br from-brand-pink to-brand-purple flex flex-col items-center justify-center text-center text-white text-center gap-4">
         <div className="w-24 h-24 rounded-none bg-white/10 flex items-center justify-center border-4 border-white/20">
            <RiPulseLine className="w-12 h-12" />
         </div>
         <div className="flex flex-col items-center">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1.5">Ticket ID: #{ticket.id}</p>
            <h3 className="text-xl font-black">{ticket.status}</h3>
         </div>
      </div>

      <Card>
         <CardHeader>
            <CardTitle>Case Observation</CardTitle>
            <CardDescription>Issue reported and product specifications</CardDescription>
         </CardHeader>
         <div className="p-6 space-y-6">
            <div className="p-4 rounded-none bg-surface-elevated border border-border">
               <p className="text-xs text-brand-pink font-bold mb-1 uppercase tracking-widest">User Complaint</p>
               <p className="text-xs text-content-secondary leading-relaxed font-medium italic">"{ticket.issue}"</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
               {[
                 { label: 'Assigned Appliance', val: ticket.product },
                 { label: 'Priority Support', val: ticket.priority, status: 'Active' },
                 { label: 'Field Technician', val: ticket.technician || 'Not Assigned' },
                 { label: 'Warranty Class', val: 'Gold Coverage', status: 'Active' }
               ].map(item => (
                 <div key={item.label}>
                    <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-widest mb-1 leading-none">{item.label}</p>
                    <div className="flex items-center gap-1.5">
                       <span className="text-sm font-bold text-content-primary leading-tight">{item.val}</span>
                       {item.status && <div className="w-1.5 h-1.5 rounded-none bg-state-success shadow-glow-sm" />}
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </Card>

      <Card>
         <CardHeader>
            <CardTitle>Repair Progress</CardTitle>
            <CardDescription>Event timeline for this service request</CardDescription>
         </CardHeader>
         <div className="p-6 px-1.5">
            <div className="relative">
               <div className="absolute left-[34px] top-4 h-[calc(100%-20px)] w-0.5 bg-border/40 -z-0" />
               <div className="space-y-8">
                  {ticket.history?.map((evt, idx) => (
                     <div key={idx} className="relative z-10 flex gap-6">
                        <div className="w-8 h-8 rounded-none bg-surface-primary border-2 border-brand-pink flex items-center justify-center flex-shrink-0 text-brand-pink shadow-glow-sm ml-4">
                           <RiCheckDoubleLine className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center justify-between">
                              <Badge variant="teal" size="xs">{evt.status}</Badge>
                              <span className="text-[9px] text-content-tertiary font-black uppercase tracking-widest">{formatDateTime(evt.time).split(',')[0]}</span>
                           </div>
                           <p className="text-xs text-content-secondary mt-1">{evt.note}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </Card>

      <div className="pb-8 space-y-4">
         <div className="flex items-center justify-center gap-3 p-4 rounded-none bg-surface-elevated border border-border opacity-60">
            <RiInformationLine className="text-brand-pink w-4 h-4 flex-shrink-0" />
            <p className="text-[10px] text-center font-medium leading-relaxed">Closing ticket requires customer code verification after repair completion.</p>
         </div>
      </div>
    </div>
  );
}

