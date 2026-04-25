import { useState, useEffect } from 'react';
import { 
  RiCustomerService2Fill, RiTimeFill, RiCheckboxCircleFill, 
  RiMapPinFill, RiPhoneFill, RiArrowRightSLine, 
  RiInformationFill, RiLoader4Line, RiCameraLine, RiCloseLine 
} from 'react-icons/ri';
import { PageHeader, Card, Badge, Button, Modal, useModal } from '../../../core';
import executiveService from '../../../core/services/executiveService';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function TechnicianServicePage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const statusModal = useModal();
  const [note, setNote] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await executiveService.getServiceTickets();
      setTickets(res.data);
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append('status', status);
    formData.append('note', note);
    images.forEach(img => formData.append('resolutionImages', img));

    try {
      await api.patch(`/sales-executive/service-tickets/${statusModal.data._id}/status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Ticket marked as ${status}`);
      statusModal.close();
      setNote('');
      setImages([]);
      fetchTickets();
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
      </div>
    );
  }

  const activeTickets = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed');
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');

  return (
    <div className="p-3 space-y-5 bg-surface-primary min-h-screen pb-24">
      <section className="px-1 pt-2">
        <h2 className="text-xl font-black text-content-primary tracking-tighter">Service Desk</h2>
        <p className="text-[9px] text-content-tertiary font-black uppercase tracking-widest opacity-70">Field Task Manager</p>
      </section>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
           <h3 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest">Active ({activeTickets.length})</h3>
        </div>
        
        {activeTickets.length === 0 ? (
          <Card className="p-10 text-center border-dashed bg-transparent">
            <RiCustomerService2Fill className="w-10 h-10 text-content-tertiary mx-auto mb-2 opacity-20" />
            <p className="text-[10px] text-content-tertiary font-black uppercase tracking-widest">Clear for now</p>
          </Card>
        ) : (
          activeTickets.map(ticket => (
            <Card key={ticket._id} className="p-3 rounded-[20px] shadow-sm relative overflow-hidden border-none bg-white">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                      <RiCustomerService2Fill className="w-4 h-4" />
                   </div>
                   <div>
                      <span className="text-[9px] font-black text-brand-teal uppercase tracking-widest">{ticket.ticketId}</span>
                      <h4 className="text-xs font-black text-content-primary">{ticket.registeredProduct?.productName}</h4>
                   </div>
                </div>
                <Badge variant={ticket.priority === 'High' ? 'danger' : 'warning'} className="text-[8px] px-1.5 py-0 font-black">{ticket.priority}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                 <div className="flex items-center gap-1.5 p-1.5 bg-surface-elevated rounded-xl">
                    <RiMapPinFill className="text-brand-teal w-3 h-3 flex-shrink-0" />
                    <span className="text-[9px] font-bold text-content-secondary truncate">{ticket.serviceAddress || 'No Address'}</span>
                 </div>
                 <div className="flex items-center gap-1.5 p-1.5 bg-surface-elevated rounded-xl">
                    <RiPhoneFill className="text-brand-pink w-3 h-3 flex-shrink-0" />
                    <span className="text-[9px] font-bold text-content-secondary truncate">{ticket.customer?.name}</span>
                 </div>
              </div>

              <div className="flex gap-2">
                 {ticket.status === 'Assigned' && (
                   <Button size="sm" className="flex-1 h-8 text-[10px] font-black rounded-xl" onClick={() => handleUpdateStatus('In Progress')}>Start Task</Button>
                 )}
                 {ticket.status === 'In Progress' && (
                   <Button size="sm" className="flex-1 h-8 text-[10px] font-black rounded-xl" variant="primary" onClick={() => statusModal.open(ticket)}>Resolve</Button>
                 )}
                 <Button variant="secondary" size="sm" className="h-8 w-8 p-0 flex items-center justify-center rounded-xl">
                    <RiInformationFill className="w-4 h-4" />
                 </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {resolvedTickets.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest px-1">Recently Resolved</h3>
          <div className="grid grid-cols-1 gap-2">
             {resolvedTickets.slice(0, 3).map(ticket => (
               <div key={ticket._id} className="p-2 bg-white/50 border border-border rounded-xl flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                     <RiCheckboxCircleFill className="text-state-success w-3.5 h-3.5" />
                     <span className="text-[9px] font-black text-content-secondary uppercase tracking-tight">{ticket.ticketId} - {ticket.registeredProduct?.productName}</span>
                  </div>
                  <RiArrowRightSLine className="text-content-tertiary opacity-40 group-hover:translate-x-1 transition-transform" />
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      <Modal isOpen={statusModal.isOpen} onClose={statusModal.close} title="Resolution Details">
         <div className="space-y-4">
            <p className="text-[10px] text-content-tertiary font-black uppercase tracking-widest">Ticket: {statusModal.data?.ticketId}</p>
            
            <div className="space-y-1.5">
               <label className="text-[9px] font-black text-content-tertiary uppercase ml-1">Resolution Note</label>
               <textarea 
                  className="w-full h-20 p-3 bg-surface-input border border-border text-xs focus:border-brand-teal outline-none rounded-2xl"
                  placeholder="What was fixed?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
               />
            </div>

            <div className="space-y-1.5">
               <label className="text-[9px] font-black text-content-tertiary uppercase ml-1">Photos (Max 5)</label>
               <div className="grid grid-cols-4 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="aspect-square relative border border-border bg-surface-elevated rounded-xl overflow-hidden">
                       <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                       <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-4 h-4 bg-state-danger text-white rounded-full flex items-center justify-center shadow-lg"><RiCloseLine className="w-2 h-2" /></button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="aspect-square border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-brand-teal transition-colors group rounded-xl">
                       <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setImages([...images, ...Array.from(e.target.files)].slice(0, 5))} />
                       <RiCameraLine className="w-4 h-4 text-content-tertiary group-hover:text-brand-teal" />
                    </label>
                  )}
               </div>
            </div>

            <div className="flex gap-2 pt-2">
               <Button variant="secondary" className="flex-1 h-10 text-[10px] font-black rounded-xl" onClick={statusModal.close}>Cancel</Button>
               <Button className="flex-1 h-10 text-[10px] font-black rounded-xl" loading={submitting} onClick={() => handleUpdateStatus('Resolved')}>Confirm</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
}
