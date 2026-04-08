import { RiCustomerServiceLine, RiTimeLine, RiInformationLine, RiCheckDoubleLine, RiUserLine, RiPhoneLine, RiSettings4Line, RiArrowRightSLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, Badge, Button, Avatar, formatDateTime } from '../../../core';
import serviceData from '../../../data/service.json';

export default function ServiceDetailPage() {
  const ticket = serviceData[0];

  return (
    <div className="page-container max-w-5xl mx-auto">
      <PageHeader 
        title={`Ticket: ${ticket.id}`} 
        subtitle="Managing post-sales maintenance and warranty support tickets"
      >
        <div className="flex items-center gap-3">
           <Button icon={RiCheckDoubleLine} variant="secondary">Resolve Ticket</Button>
           <Button icon={RiInformationLine}>System Diagnostics</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Complaint Details</CardTitle>
                  <CardDescription>Customer reported issue and product specifications</CardDescription>
               </CardHeader>
               <div className="p-6 space-y-6">
                  <div className="p-4 rounded-none bg-surface-elevated border border-border">
                     <p className="text-sm font-semibold text-content-primary mb-2">Subject Issue</p>
                     <p className="text-sm text-content-secondary leading-relaxed font-medium italic">"{ticket.issue}"</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     {[
                       { label: 'Purchased On', val: '2025-12-15' },
                       { label: 'Warranty Expiry', val: '2026-12-15', status: 'valid' },
                       { label: 'Serial #', val: 'TMP-750-XYZ-0012' },
                       { label: 'AMC Coverage', val: 'Platinum Plan', status: 'active' }
                     ].map(item => (
                       <div key={item.label}>
                          <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{item.label}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-sm font-semibold text-content-primary">{item.val}</span>
                             {item.status && <Badge size="xs" variant="success">{item.status}</Badge>}
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Service Log & Timeline</CardTitle>
                  <CardDescription>Event history for this ticket lifecycle</CardDescription>
               </CardHeader>
               <div className="p-6">
                  <div className="relative">
                     <div className="absolute left-4 top-2 h-full w-0.5 bg-border -z-0" />
                     <div className="space-y-8">
                        {ticket.history?.map((evt, idx) => (
                           <div key={idx} className="relative z-10 flex gap-6">
                              <div className="w-8 h-8 rounded-none bg-surface-primary border border-border flex items-center justify-center flex-shrink-0 text-brand-teal">
                                 <RiTimeLine className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                 <div className="flex items-center justify-between">
                                    <Badge size="xs" variant="teal">{evt.status}</Badge>
                                    <span className="text-[10px] text-content-tertiary font-bold tracking-widest uppercase">{formatDateTime(evt.time)}</span>
                                 </div>
                                 <p className="text-sm text-content-secondary mt-1">{evt.note}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </Card>
         </div>

         <div className="space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Customer Contacts</CardTitle>
               </CardHeader>
               <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                     <Avatar name={ticket.customer} />
                     <div>
                        <p className="text-sm font-bold text-content-primary font-bold">{ticket.customer}</p>
                        <p className="text-xs text-content-tertiary">Verified Primary</p>
                     </div>
                  </div>
                  <div className="space-y-2 pt-2">
                     <Button className="w-full justify-start gap-3 h-10 border-border bg-surface-input" variant="secondary" icon={RiPhoneLine}>
                        +91 98765-43210
                     </Button>
                     <Button className="w-full justify-start gap-3 h-10 border-border bg-surface-input" variant="secondary" icon={RiUserLine}>
                        View Customer Profile
                     </Button>
                  </div>
               </div>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Technician Detail</CardTitle>
               </CardHeader>
               <div className="p-6">
                  <div className="flex items-center justify-between p-4 rounded-none bg-brand-teal/5 border border-brand-teal/20">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-none bg-brand-teal/15 flex items-center justify-center text-brand-teal">
                           <RiSettings4Line className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-content-primary">{ticket.technician}</p>
                           <p className="text-xs text-content-tertiary">Field Engineer</p>
                        </div>
                     </div>
                     <RiArrowRightSLine className="w-5 h-5 text-content-tertiary" />
                  </div>
                  <div className="mt-4 flex gap-2">
                     <Button variant="secondary" className="flex-1 h-9 text-xs">Reassign</Button>
                     <Button variant="secondary" className="flex-1 h-9 text-xs">Message</Button>
                  </div>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
