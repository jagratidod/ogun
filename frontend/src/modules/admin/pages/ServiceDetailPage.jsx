import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  RiCustomerServiceLine, RiTimeLine, RiUserLine, 
  RiToolsLine, RiMapPinLine, RiPhoneLine, 
  RiInformationLine, RiCheckDoubleLine, RiArrowLeftLine, RiHistoryLine, RiLoader4Line 
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  Badge, Button, Input, Select, formatDateTime 
} from '../../../core';
import { toast } from 'react-hot-toast';
import api from '../../../core/api';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    assignedTechnician: '',
    adminRemarks: '',
    note: ''
  });

  useEffect(() => {
    fetchTicketDetail();
    fetchTechnicians();
  }, [id]);

  const fetchTicketDetail = async () => {
    try {
      const res = await api.get(`/admin/service-requests/${id}`);
      const data = res.data?.data;
      setTicket(data);
      setFormData({
        status: data.status,
        assignedTechnician: data.assignedTechnician?._id || '',
        adminRemarks: data.adminRemarks || '',
        note: ''
      });
    } catch (err) {
      toast.error('Ticket not found');
      navigate('/admin/service/tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/admin/users?role=sales_executive');
      setTechnicians(res.data?.data?.map(t => ({ label: t.name, value: t._id })) || []);
    } catch (err) {
      console.error('Failed to fetch technicians');
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    const loadingToast = toast.loading('Updating ticket status...');
    try {
      await api.patch(`/admin/service-requests/${id}/status`, formData);
      toast.success('Ticket updated successfully', { id: loadingToast });
      fetchTicketDetail();
    } catch (err) {
      toast.error('Update failed', { id: loadingToast });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center p-20">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex items-center gap-2 mb-4">
         <Button variant="ghost" size="sm" onClick={() => navigate('/admin/service/tickets')} icon={RiArrowLeftLine}>Back to List</Button>
      </div>

      <PageHeader 
        title={`Ticket #${ticket.ticketId}`} 
        subtitle={`Raised by ${ticket.customer?.name} on ${formatDateTime(ticket.createdAt)}`}
      >
        <Badge variant={ticket.priority === 'High' ? 'danger' : ticket.priority === 'Medium' ? 'warning' : 'info'} className="text-sm px-4 py-1">
          {ticket.priority} Priority
        </Badge>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Issue Description</CardTitle>
              <CardDescription>Details provided by the customer at registration</CardDescription>
            </CardHeader>
            <div className="p-6">
               <div className="p-4 bg-surface-elevated border border-border rounded-none">
                  <p className="text-sm font-medium text-content-primary leading-relaxed italic">
                    "{ticket.issueDescription}"
                  </p>
               </div>
               <div className="mt-6 grid grid-cols-2 gap-8">
                  <div>
                     <p className="text-[10px] text-content-tertiary uppercase font-black mb-1">Issue Category</p>
                     <p className="text-sm font-bold text-content-primary">{ticket.issueCategory}</p>
                  </div>
                  <div>
                     <p className="text-[10px] text-content-tertiary uppercase font-black mb-1">Product Model</p>
                     <p className="text-sm font-bold text-brand-teal">{ticket.registeredProduct?.productName}</p>
                  </div>
               </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>Timeline of status changes and technician assignments</CardDescription>
            </CardHeader>
            <div className="p-6">
              <div className="space-y-6">
                {ticket.history?.map((entry, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {idx !== ticket.history.length - 1 && (
                      <div className="absolute left-[17px] top-10 bottom-[-24px] w-0.5 bg-border"></div>
                    )}
                    <div className="w-9 h-9 rounded-full bg-surface-elevated border border-border flex items-center justify-center flex-shrink-0 z-10">
                      <RiHistoryLine className="w-4 h-4 text-content-tertiary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Badge status={entry.status.toLowerCase().replace(' ', '_')}>{entry.status}</Badge>
                        <span className="text-[10px] text-content-tertiary">{formatDateTime(entry.timestamp)}</span>
                      </div>
                      <p className="text-xs text-content-secondary leading-normal">{entry.note}</p>
                      {entry.updatedBy && (
                        <p className="text-[9px] text-content-tertiary mt-1 uppercase font-bold tracking-widest">Updated by: {entry.updatedBy.name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Actions & Meta */}
        <div className="space-y-6">
          <Card className="border-brand-teal/20">
            <CardHeader>
              <CardTitle>Update Ticket</CardTitle>
            </CardHeader>
            <div className="p-6 space-y-4">
               <Select 
                  label="Update Status" 
                  value={formData.status}
                  onChange={(e) => setFormData(f => ({ ...f, status: e.target.value }))}
                  options={[
                    { label: 'Open', value: 'Open' },
                    { label: 'Assigned', value: 'Assigned' },
                    { label: 'In Progress', value: 'In Progress' },
                    { label: 'Resolved', value: 'Resolved' },
                    { label: 'Closed', value: 'Closed' }
                  ]}
               />
               <Select 
                  label="Re-assign Technician" 
                  value={formData.assignedTechnician}
                  onChange={(e) => setFormData(f => ({ ...f, assignedTechnician: e.target.value }))}
                  options={[{ label: 'Unassigned', value: '' }, ...technicians]} 
               />
               <div className="space-y-1">
                  <label className="text-xs font-medium text-content-secondary px-1">Internal Note (Reason for change)</label>
                  <textarea 
                     className="w-full h-24 bg-surface-primary border border-border p-3 text-xs outline-none focus:border-brand-teal"
                     placeholder="Why is this status being updated?"
                     value={formData.note}
                     onChange={(e) => setFormData(f => ({ ...f, note: e.target.value }))}
                  />
               </div>
               <div className="space-y-1">
                  <label className="text-xs font-medium text-content-secondary px-1">Remarks for Customer</label>
                  <Input 
                    placeholder="This will be visible to customer" 
                    value={formData.adminRemarks}
                    onChange={(e) => setFormData(f => ({ ...f, adminRemarks: e.target.value }))}
                  />
               </div>
               <Button className="w-full mt-2" loading={updating} onClick={handleUpdate}>Save Changes</Button>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Info</CardTitle>
            </CardHeader>
            <div className="p-6 space-y-4">
               <div className="flex items-start gap-3">
                  <RiUserLine className="w-4 h-4 text-content-tertiary mt-1" />
                  <div>
                    <p className="text-xs font-bold text-content-primary">{ticket.customer?.name}</p>
                    <p className="text-[10px] text-content-tertiary">{ticket.customer?.email}</p>
                  </div>
               </div>
               <div className="flex items-start gap-3">
                  <RiPhoneLine className="w-4 h-4 text-content-tertiary mt-1" />
                  <p className="text-xs font-bold text-content-primary">{ticket.contactNumber}</p>
               </div>
               <div className="flex items-start gap-3">
                  <RiMapPinLine className="w-4 h-4 text-content-tertiary mt-1" />
                  <p className="text-xs font-bold text-content-secondary leading-relaxed">{ticket.serviceAddress}</p>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
