import { useState, useEffect } from 'react';
import { 
  RiCustomerServiceLine, RiSearchLine, RiFilterLine, 
  RiEyeLine, RiUserLine, RiSettings4Line, 
  RiArrowRightUpLine, RiTimeLine, RiToolsLine, RiCheckDoubleLine, RiInformationLine, RiLoader4Line 
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  DataTable, Badge, Button, Input, Select, Modal, useModal, formatDateTime 
} from '../../../core';
import { toast } from 'react-hot-toast';
import api from '../../../core/api';
import { useNavigate } from 'react-router-dom';

export default function ServiceRequestsPage() {
  const navigate = useNavigate();
  const { isOpen, open, close, data: selectedTicket } = useModal();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchTechnicians();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/service-requests');
      setRequests(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/admin/users?role=sales_executive'); // Or specific service role if exists
      setTechnicians(res.data?.data?.map(t => ({ label: t.name, value: t._id })) || []);
    } catch (err) {
      console.error('Failed to fetch technicians');
    }
  };

  const handleAssign = async () => {
    if (!selectedTech) return toast.error('Please select a technician');
    
    setIsAssigning(true);
    const loadingToast = toast.loading('Assigning field technician...');
    try {
      await api.patch(`/admin/service-requests/${selectedTicket._id}/status`, {
        status: 'Assigned',
        assignedTechnician: selectedTech,
        note: `Technician assigned for service.`
      });
      toast.success(`Technician assigned to Ticket ${selectedTicket.ticketId}`, { id: loadingToast });
      fetchRequests();
      close();
    } catch (err) {
      toast.error('Assignment failed', { id: loadingToast });
    } finally {
      setIsAssigning(false);
    }
  };

  const columns = [
    { key: 'ticketId', label: 'Ticket ID', sortable: true, render: (val) => (
      <span className="font-bold text-content-primary">#{val}</span>
    )},
    { key: 'createdAt', label: 'Requested On', render: (val) => (
       <div className="flex flex-col">
          <span className="text-sm font-medium text-content-primary">{formatDateTime(val).split(',')[0]}</span>
          <span className="text-[10px] text-content-tertiary">{formatDateTime(val).split(',')[1]}</span>
       </div>
    )},
    { key: 'customer', label: 'Customer', render: (val) => val?.name || 'N/A' },
    { key: 'registeredProduct', label: 'Product Model', render: (val) => val?.productName || 'N/A' },
    { key: 'priority', label: 'Priority', render: (val) => (
       <Badge variant={val === 'High' ? 'danger' : val === 'Medium' ? 'warning' : 'info'}>{val}</Badge>
    )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge status={val.toLowerCase().replace(' ', '_')}>{val}</Badge>
    )},
    { key: 'assignedTechnician', label: 'Assigned Tech', render: (val) => (
       <div className="flex items-center gap-2">
          {val ? (
             <>
                <RiUserLine className="w-3.5 h-3.5 text-brand-teal" />
                <span className="text-sm text-content-secondary">{val.name}</span>
             </>
          ) : (
             <span className="text-xs text-content-tertiary italic">Unassigned</span>
          )}
       </div>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-1">
          <Button variant="icon" title="View Details" onClick={() => navigate(`/admin/service/tickets/${row._id}`)}>
             <RiEyeLine className="w-4 h-4" />
          </Button>
          <Button variant="icon" title="Manage Assignment" onClick={() => { setSelectedTech(row.assignedTechnician?._id || ''); open(row); }}>
             <RiSettings4Line className="w-4 h-4 text-brand-teal" />
          </Button>
       </div>
    )}
  ];

  const stats = [
    { label: 'All Open Tickets', val: requests.filter(r => r.status === 'Open').length },
    { label: 'Unassigned', val: requests.filter(r => !r.assignedTechnician).length, color: 'text-state-danger' },
    { label: 'In Progress', val: requests.filter(r => r.status === 'In Progress').length, color: 'text-brand-teal' },
    { label: 'Resolved Today', val: requests.filter(r => r.status === 'Resolved' && new Date(r.updatedAt).toDateString() === new Date().toDateString()).length, color: 'text-state-success' }
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Service Requests" 
        subtitle="Managing post-sales maintenance and warranty support tickets"
      >
        <div className="flex items-center gap-3">
           <Button icon={RiSettings4Line} variant="secondary" onClick={() => fetchRequests()}>Refresh Board</Button>
           <Button icon={RiCustomerServiceLine} onClick={() => toast.info('Direct ticket entry is restricted to support staff.')}>Raise New Ticket</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {stats.map(stat => (
           <div key={stat.label} className="glass-card p-4">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h4 className={`text-xl font-bold ${stat.color || 'text-content-primary'}`}>{stat.val}</h4>
           </div>
         ))}
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                 <Select options={[
                    { label: 'All Statuses', value: 'all' },
                    { label: 'Open', value: 'Open' },
                    { label: 'Assigned', value: 'Assigned' },
                    { label: 'In Progress', value: 'In Progress' },
                    { label: 'Resolved', value: 'Resolved' }
                 ]} className="w-48" />
                 <Select options={[{ label: 'High Priority', value: 'high' }, { label: 'Medium Priority', value: 'med' }]} className="w-48" />
              </div>
              <Input icon={RiSearchLine} placeholder="Search Ticket ID or customer..." className="w-full md:w-64" />
           </div>
        </CardHeader>
        {loading ? (
            <div className="flex items-center justify-center p-20">
                <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
            </div>
        ) : (
            <DataTable columns={columns} data={requests} />
        )}
      </Card>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={`Manage Ticket: #${selectedTicket?.ticketId}`}
        footer={
           <div className="flex gap-3">
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button icon={RiCheckDoubleLine} onClick={handleAssign} loading={isAssigning}>Confirm Assignment</Button>
           </div>
        }
      >
        <div className="space-y-6">
           <div className="p-4 bg-surface-elevated border border-border flex items-center justify-between">
              <div>
                 <p className="text-[10px] text-content-tertiary uppercase font-black mb-1">Service Required</p>
                 <h4 className="text-sm font-bold text-content-primary">{selectedTicket?.issueCategory || 'General Maintenance'}</h4>
                 <p className="text-xs text-content-tertiary mt-1 italic">"{selectedTicket?.issueDescription}"</p>
              </div>
              <Badge variant={selectedTicket?.priority === 'High' ? 'danger' : 'warning'}>{selectedTicket?.priority}</Badge>
           </div>

           <div className="space-y-3">
              <Select 
                label="Assign Technician" 
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                options={[{ label: 'Select Technician', value: '' }, ...technicians]} 
              />
              <div className="p-3 bg-brand-teal/5 border border-brand-teal/10 flex items-start gap-3">
                 <RiToolsLine className="text-brand-teal w-5 h-5 flex-shrink-0" />
                 <p className="text-[11px] text-content-secondary leading-normal">
                    Assigned technician will receive a notification immediately via the mobile app.
                 </p>
              </div>
           </div>

           <div className="p-4 rounded-none bg-surface-elevated/40 border border-dashed border-border flex items-center gap-3">
              <RiInformationLine className="w-4 h-4 text-content-tertiary" />
              <p className="text-[10px] text-content-tertiary italic">Confirmation SMS will be sent to {selectedTicket?.customer?.name} automatically.</p>
           </div>
        </div>
      </Modal>
    </div>
  );
}
