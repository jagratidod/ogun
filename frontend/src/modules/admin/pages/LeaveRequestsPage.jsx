import { useState, useEffect } from 'react';
import { RiCalendarCheckLine, RiCheckDoubleLine, RiCloseCircleLine, RiInformationLine, RiEyeLine, RiMessage2Line } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, useModal, Modal, useNotification } from '../../../core';
import api from '../../../core/api';

export default function LeaveRequestsPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, open, close, data: selectedReq } = useModal();
  const [remarks, setRemarks] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchHRLeaves();
  }, []);

  const fetchHRLeaves = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/hr-leaves');
      setLeaves(response.data.data);
    } catch (error) {
      showNotification({ title: 'Error', message: 'Failed to fetch HR leaves', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      await api.patch(`/admin/hr-leaves/${id}/review`, {
        status,
        adminRemarks: remarks
      });
      showNotification({ title: 'Success', message: `Request ${status}`, type: 'success' });
      setRemarks('');
      close();
      fetchHRLeaves();
    } catch (error) {
      showNotification({ title: 'Error', message: 'Failed to review request', type: 'error' });
    }
  };

  const columns = [
    { key: 'employee', label: 'Employee', sortable: true, render: (val, row) => (
       <div className="flex items-center gap-2">
          <Avatar name={val.name} size="xs" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-content-primary">{val.name}</span>
            <span className="text-[10px] text-content-tertiary uppercase font-black">{val.subRole?.replace('_', ' ')}</span>
          </div>
       </div>
    )},
    { key: 'type', label: 'Leave Type', render: (val) => <span className="uppercase font-bold text-xs">{val}</span> },
    { key: 'fromDate', label: 'Duration', render: (_, row) => (
       <span className="text-xs text-content-secondary font-medium">
         {new Date(row.fromDate).toLocaleDateString()} to {new Date(row.toDate).toLocaleDateString()}
       </span>
    )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge variant={val === 'approved' ? 'success' : val === 'rejected' ? 'danger' : 'warning'} className="uppercase font-black text-[9px]">
         {val}
       </Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-1">
          {row.status === 'pending' && (
             <>
                <Button variant="secondary" size="sm" icon={RiCheckDoubleLine} onClick={() => open(row)}>Review</Button>
             </>
          )}
          <Button variant="icon" onClick={() => open(row)}>
             <RiEyeLine className="w-4 h-4" />
          </Button>
       </div>
    )}
  ];

  return (
    <div className="page-container animate-fade-in">
      <PageHeader 
        title="Staff Leave Review" 
        subtitle="Approve or manage time-off requests from Managers and HR Staff"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
         {[
           { label: 'Pending HR Leaves', val: leaves.filter(r => r.status === 'pending').length, color: 'text-state-warning' },
           { label: 'Approved this month', val: leaves.filter(r => r.status === 'approved').length, color: 'text-brand-teal' },
           { label: 'Rejected', val: leaves.filter(r => r.status === 'rejected').length, color: 'text-state-danger' },
           { label: 'Total Requests', val: leaves.length, color: 'text-content-secondary' }
         ].map(item => (
           <Card key={item.label} className="p-4 border-border/40">
              <p className="text-[10px] text-content-tertiary font-black uppercase tracking-wider mb-1">{item.label}</p>
              <h4 className={`text-xl font-bold ${item.color}`}>{item.val}</h4>
           </Card>
         ))}
      </div>

      <Card>
        <CardHeader>
           <CardTitle>Inbound Leave Tickets</CardTitle>
           <CardDescription>HR applications awaiting Super Admin review</CardDescription>
        </CardHeader>
        <DataTable columns={columns} data={leaves} loading={loading} />
      </Card>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title="Leave Review"
        footer={
           <div className="flex gap-3">
              <Button variant="secondary" onClick={close}>Close</Button>
              {selectedReq?.status === 'pending' && (
                <>
                  <Button variant="danger" onClick={() => handleReview(selectedReq._id, 'rejected')}>Reject</Button>
                  <Button onClick={() => handleReview(selectedReq._id, 'approved')}>Approve Request</Button>
                </>
              )}
           </div>
        }
      >
        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4 text-sm bg-surface-secondary/50 p-4 rounded-sm border border-border/40">
             <div>
                <p className="text-[10px] text-content-tertiary font-black uppercase">Employee</p>
                <p className="text-content-primary font-bold">{selectedReq?.employee?.name}</p>
             </div>
             <div>
                <p className="text-[10px] text-content-tertiary font-black uppercase">Category</p>
                <p className="text-content-primary font-bold uppercase">{selectedReq?.type} Leave</p>
             </div>
             <div className="col-span-2">
                <p className="text-[10px] text-content-tertiary font-black uppercase">Duration</p>
                <p className="text-content-primary font-bold">
                  {selectedReq && new Date(selectedReq.fromDate).toLocaleDateString()} to {selectedReq && new Date(selectedReq.toDate).toLocaleDateString()}
                </p>
             </div>
          </div>

          <div className="space-y-2">
             <h5 className="text-[10px] font-black text-content-tertiary uppercase">Reason for Leave</h5>
             <p className="text-sm text-content-secondary leading-relaxed bg-white p-3 rounded-none border border-border italic">
                "{selectedReq?.reason}"
             </p>
          </div>

          {selectedReq?.status === 'pending' && (
            <div className="space-y-2 pt-2">
              <h5 className="text-[10px] font-black text-content-tertiary uppercase">Admin Remarks (Optional)</h5>
              <textarea 
                className="input-field w-full min-h-[80px] py-2 resize-none"
                placeholder="Add comments or instructions..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          )}

          {selectedReq?.status !== 'pending' && selectedReq?.hrRemarks && (
             <div className="p-3 bg-brand-teal/5 border border-brand-teal/20">
                <p className="text-[10px] font-black text-brand-teal uppercase">Admin Remark</p>
                <p className="text-xs text-content-primary italic">"{selectedReq.hrRemarks}"</p>
             </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
