import { useState, useEffect } from 'react';
import { RiCustomerServiceLine, RiTimeLine, RiCheckboxCircleLine, RiMapPinLine, RiPhoneLine, RiArrowRightSLine, RiInformationLine, RiLoader4Line, RiCameraLine, RiCloseLine } from 'react-icons/ri';
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
      // Need to use raw api for FormData or update service
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
    <div className="p-4 space-y-6">
      <section>
        <h2 className="text-xl font-black text-content-primary">Service Desk</h2>
        <p className="text-xs text-content-tertiary font-bold uppercase tracking-widest mt-1">Manage Field Service Requests</p>
      </section>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest px-1">Active Tasks ({activeTickets.length})</h3>
        
        {activeTickets.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <RiCustomerServiceLine className="w-12 h-12 text-content-tertiary mx-auto mb-3 opacity-20" />
            <p className="text-sm text-content-tertiary font-bold">No active service tasks assigned.</p>
          </Card>
        ) : (
          activeTickets.map(ticket => (
            <Card key={ticket._id} className="p-4 relative overflow-hidden group border-l-4 border-l-brand-teal">
              <div className="flex justify-between items-start mb-3">
                <div>
                   <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest">{ticket.ticketId}</span>
                   <h4 className="text-sm font-black text-content-primary mt-1">{ticket.registeredProduct?.productName}</h4>
                </div>
                <Badge variant={ticket.priority === 'High' ? 'danger' : 'warning'} size="xs">{ticket.priority}</Badge>
              </div>

              <div className="space-y-2 mb-4">
                 <div className="flex items-center gap-2 text-xs text-content-secondary">
                    <RiMapPinLine className="text-content-tertiary" />
                    <span className="truncate">{ticket.serviceAddress || 'No address provided'}</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs text-content-secondary">
                    <RiPhoneLine className="text-content-tertiary" />
                    <span>{ticket.customer?.phone} ({ticket.customer?.name})</span>
                 </div>
                 <div className="p-2 bg-surface-elevated text-[10px] font-medium text-content-secondary">
                    {ticket.issueDescription}
                 </div>
              </div>

              <div className="flex gap-2">
                 {ticket.status === 'Assigned' && (
                   <Button size="sm" className="flex-1 h-9" onClick={() => handleUpdateStatus('In Progress')}>Start Service</Button>
                 )}
                 {ticket.status === 'In Progress' && (
                   <Button size="sm" className="flex-1 h-9" variant="primary" onClick={() => statusModal.open(ticket)}>Mark Resolved</Button>
                 )}
                 <Button variant="secondary" size="sm" className="h-9 w-9 p-0 flex items-center justify-center">
                    <RiInformationLine className="w-4 h-4" />
                 </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {resolvedTickets.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-[10px] font-black text-content-tertiary uppercase tracking-widest px-1">Recent Resolutions</h3>
          <div className="space-y-2 opacity-60">
             {resolvedTickets.slice(0, 3).map(ticket => (
               <div key={ticket._id} className="p-3 bg-surface-elevated border border-border flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-black text-content-secondary">{ticket.ticketId}</p>
                     <p className="text-xs font-bold text-content-primary">{ticket.registeredProduct?.productName}</p>
                  </div>
                  <RiCheckboxCircleLine className="text-state-success w-5 h-5" />
               </div>
             ))}
          </div>
        </div>
      )}

      <Modal isOpen={statusModal.isOpen} onClose={statusModal.close} title="Resolution Details">
         <div className="space-y-5">
            <p className="text-xs text-content-secondary font-bold uppercase tracking-widest">Ticket: {statusModal.data?.ticketId}</p>
            
            <div className="space-y-2">
               <label className="text-[10px] font-black text-content-tertiary uppercase">Resolution Note</label>
               <textarea 
                  className="w-full h-24 p-3 bg-surface-input border border-border text-sm focus:border-brand-teal outline-none"
                  placeholder="Describe the resolution (e.g., replaced motor, fixed wiring...)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
               />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-content-tertiary uppercase">Proof of Service (Max 5)</label>
               <div className="grid grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="aspect-square relative border border-border bg-surface-elevated">
                       <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                       <button 
                         onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                         className="absolute -top-1 -right-1 w-5 h-5 bg-state-danger text-white rounded-full flex items-center justify-center shadow-lg"
                       >
                          <RiCloseLine />
                       </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="aspect-square border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-brand-teal transition-colors group">
                       <input 
                         type="file" 
                         multiple 
                         accept="image/*" 
                         className="hidden" 
                         onChange={(e) => setImages([...images, ...Array.from(e.target.files)].slice(0, 5))} 
                       />
                       <RiCameraLine className="w-5 h-5 text-content-tertiary group-hover:text-brand-teal" />
                       <span className="text-[8px] font-bold text-content-tertiary uppercase mt-1">Add Photo</span>
                    </label>
                  )}
               </div>
            </div>

            <div className="flex gap-3 pt-4">
               <Button variant="secondary" className="flex-1" onClick={statusModal.close}>Cancel</Button>
               <Button className="flex-1" loading={submitting} onClick={() => handleUpdateStatus('Resolved')}>Confirm Resolution</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
}
