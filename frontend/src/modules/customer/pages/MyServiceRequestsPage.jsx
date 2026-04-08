import { useNavigate } from 'react-router-dom';
import { RiCustomerServiceLine, RiTimeLine, RiBarChartLine, RiEyeLine, RiArrowRightSLine, RiInformationLine, RiPulseLine } from 'react-icons/ri';
import { Badge, Button, Avatar, Card, CardHeader, CardTitle, CardDescription, PageHeader } from '../../../core';
import serviceData from '../../../data/service.json';

export default function MyServiceRequestsPage() {
  const navigate = useNavigate();
  const myRequests = serviceData.filter(s => s.customer === 'Rahul Verma');

  return (
    <div className="page-container flex flex-col gap-6 max-w-lg mx-auto">
      <PageHeader 
        title="Service Tickets" 
        subtitle="Manage and track status of all your complaints and technician visits"
      >
        <Button size="sm" variant="secondary" icon={RiCustomerServiceLine} onClick={() => navigate('/customer/service/raise')}>Report Issue</Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 mt-2">
         {myRequests.length === 0 ? (
           <div className="flex flex-col items-center justify-center p-12 text-center opacity-30 gap-3 grayscale">
              <RiCustomerServiceLine className="w-16 h-16" />
              <p className="text-sm font-bold uppercase tracking-widest leading-tight">No Active Complaints</p>
           </div>
         ) : myRequests.map(req => (
           <Card 
             key={req.id} 
             onClick={() => navigate(`/customer/service/${req.id}`)}
             className="group active:scale-95 transition-all outline-none border-brand-pink/20 overflow-hidden hover:border-brand-pink cursor-pointer"
           >
              <div className="p-4 flex items-center gap-4">
                 <div className="w-16 h-16 rounded-none bg-brand-pink/10 flex items-center justify-center text-brand-pink group-hover:shadow-glow transition-all">
                    <RiPulseLine className="w-8 h-8" />
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                       <h4 className="text-sm font-black text-content-primary">#{req.id}</h4>
                       <Badge variant={req.status === 'Assigned' ? 'teal' : 'warning'} size="xs">{req.status}</Badge>
                    </div>
                    <p className="text-[10px] text-content-secondary line-clamp-1 italic">"{req.issue}"</p>
                    <div className="flex items-center gap-1.5 mt-2">
                       <RiTimeLine className="text-content-tertiary w-3 h-3" />
                       <p className="text-[9px] text-content-tertiary font-bold uppercase tracking-widest leading-none">Last Update: Just Now</p>
                    </div>
                 </div>
                 <div className="flex items-center justify-center w-8 h-8 rounded-none bg-surface-primary border border-border group-hover:bg-brand-pink group-hover:text-white transition-all">
                    <RiArrowRightSLine className="w-5 h-5 text-content-tertiary group-hover:text-white" />
                 </div>
              </div>
           </Card>
         ))}
      </div>

      <Card>
         <div className="p-6 flex items-center gap-6">
            <div className="w-14 h-14 rounded-none bg-brand-teal/10 flex items-center justify-center shadow-glow border border-brand-teal/20">
               <RiBarChartLine className="text-brand-teal w-7 h-7" />
            </div>
            <div className="flex-1">
               <h4 className="text-xs font-black text-content-primary">Service Performance Hub</h4>
               <p className="text-[10px] text-content-secondary mt-1">Our average resolution time for Silver City is <strong>1.4 days</strong>. We're here for you!</p>
            </div>
         </div>
      </Card>

      <div className="pb-8 space-y-4">
         <div className="flex items-center justify-center gap-3 p-4 rounded-none bg-surface-elevated border border-border opacity-60">
            <RiInformationLine className="text-brand-teal w-4 h-4 flex-shrink-0" />
            <p className="text-[10px] text-center font-medium leading-relaxed">Closed tickets are archived and can be viewed in the Full History section.</p>
         </div>
      </div>
    </div>
  );
}

