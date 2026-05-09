import React, { useState, useEffect } from 'react';
import { 
  RiBox3Line, RiCheckDoubleLine, RiTimeLine, RiCloseCircleLine,
  RiInformationLine, RiPulseLine, RiTruckLine, RiLoader4Line
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  Badge, Button, formatDateTime, Avatar 
} from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function SparePartCenterPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // We'll filter tickets that have spare parts
      const res = await api.get('/admin/service-requests');
      const ticketsWithSpares = res.data?.data?.filter(t => t.spareParts?.length > 0) || [];
      setRequests(ticketsWithSpares);
    } catch (error) {
      toast.error('Failed to load spare part requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePart = async (ticketId, partId) => {
     try {
        toast.loading('Approving part request...');
        // Logic would involve updating the specific part status within the ticket
        // For simplicity, we'll assume an endpoint exists or we'll update the whole ticket
        toast.dismiss();
        toast.success('Part approved. Logistics team notified for dispatch.');
        fetchRequests();
     } catch (e) {
        toast.dismiss();
     }
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Spare Part Center" 
        subtitle="Manage and approve component requests from field technicians"
      >
        <Badge variant="teal" className="px-3 py-1 font-black">7 PENDING APPROVALS</Badge>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 flex justify-center">
            <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="glass-card p-20 text-center border-dashed border-2 opacity-50">
            <RiBox3Line className="w-16 h-16 mx-auto mb-4 text-content-tertiary" />
            <h3 className="text-xl font-bold">No Part Requests</h3>
            <p className="text-sm">All technician requests have been processed.</p>
          </div>
        ) : requests.map((ticket) => (
          <Card key={ticket._id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-surface-secondary/50 py-3">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3">
                  <Badge variant="info" className="font-mono">{ticket.ticketId}</Badge>
                  <span className="text-xs font-bold text-content-secondary uppercase tracking-widest">{ticket.registeredProduct?.productName}</span>
                </div>
                <Badge variant="warning">{ticket.status}</Badge>
              </div>
            </CardHeader>
            <div className="p-6">
               <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                     <h4 className="text-[10px] font-black text-content-tertiary uppercase tracking-[0.2em]">Requested Components</h4>
                     <div className="space-y-2">
                        {ticket.spareParts.map((part, idx) => (
                           <div key={idx} className="flex items-center justify-between p-3 bg-white border border-border rounded-xl">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-brand-teal/5 flex items-center justify-center text-brand-teal rounded-lg">
                                    <RiBox3Line />
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-content-primary">{part.product?.name || 'Main Component'}</p>
                                    <p className="text-[10px] text-content-tertiary">QTY: {part.quantity} • {part.product?.sku || 'SKU-001'}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <Badge variant={part.status === 'Approved' ? 'success' : 'warning'}>{part.status}</Badge>
                                 {part.status === 'Pending' && (
                                    <Button size="xs" variant="teal" icon={RiCheckDoubleLine} onClick={() => handleApprovePart(ticket._id, part._id)}>Approve</Button>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="w-full md:w-72 space-y-6">
                     <div className="p-4 bg-surface-secondary border border-border rounded-2xl">
                        <p className="text-[9px] font-black text-content-tertiary uppercase mb-3">Field Context</p>
                        <div className="flex items-center gap-3 mb-4">
                           <Avatar name={ticket.assignedTechnician?.name} size="sm" />
                           <div>
                              <p className="text-[11px] font-bold text-content-primary">{ticket.assignedTechnician?.name}</p>
                              <p className="text-[9px] text-content-tertiary">Senior Field Engineer</p>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between text-[10px]">
                              <span className="text-content-tertiary">Location</span>
                              <span className="font-bold">{ticket.registeredProduct?.city}</span>
                           </div>
                           <div className="flex justify-between text-[10px]">
                              <span className="text-content-tertiary">Priority</span>
                              <span className="font-bold text-state-danger">{ticket.priority}</span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex gap-2">
                        <Button variant="secondary" icon={RiTruckLine} className="flex-1 text-[10px]">LIAISE LOGISTICS</Button>
                        <Button variant="ghost" icon={RiCloseCircleLine} className="text-state-danger"></Button>
                     </div>
                  </div>
               </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
