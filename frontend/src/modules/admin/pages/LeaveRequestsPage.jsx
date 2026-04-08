import { RiCalendarCheckLine, RiCheckDoubleLine, RiCloseCircleLine, RiInformationLine, RiEyeLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, useModal, Modal } from '../../../core';
import hrData from '../../../data/hr.json';

export default function LeaveRequestsPage() {
  const { leaveRequests } = hrData;
  const { isOpen, open, close, data: selectedReq } = useModal();

  const columns = [
    { key: 'employee', label: 'Employee', sortable: true, render: (val) => (
       <div className="flex items-center gap-2">
          <Avatar name={val} size="xs" />
          <span className="text-sm font-medium text-content-primary">{val}</span>
       </div>
    )},
    { key: 'type', label: 'Leave Type' },
    { key: 'from', label: 'Duration', render: (_, row) => (
       <span className="text-xs text-content-secondary">{row.from} to {row.to}</span>
    )},
    { key: 'days', label: 'Days', align: 'center', render: (val) => (
       <Badge variant="purple">{val} Days</Badge>
    )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge status={val.toLowerCase()}>{val}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-1">
          {row.status === 'Requested' && (
             <>
                <Button variant="secondary" size="sm" icon={RiCheckDoubleLine}>Approve</Button>
                <Button variant="ghost" size="sm" icon={RiCloseCircleLine}>Reject</Button>
             </>
          )}
          <Button variant="icon" onClick={() => open(row)}>
             <RiEyeLine className="w-4 h-4" />
          </Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Leave Management" 
        subtitle="Manage and approve staff time-off requests and vacation planning"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: 'Pending Approvals', val: leaveRequests.filter(r => r.status === 'Requested').length, color: 'text-state-warning' },
           { label: 'Out Today', val: 3, color: 'text-state-info' },
           { label: 'Upcoming (Next 7 Days)', val: 5, color: 'text-brand-teal' },
           { label: 'Avg Leave Usage', val: '2.1 Days', color: 'text-content-secondary' }
         ].map(item => (
           <div key={item.label} className="glass-card p-4">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{item.label}</p>
              <h4 className={`text-xl font-bold ${item.color}`}>{item.val}</h4>
           </div>
         ))}
      </div>

      <Card>
        <CardHeader>
           <CardTitle>Inbound Leave Tickets</CardTitle>
           <CardDescription>Leave applications awaiting managerial review</CardDescription>
        </CardHeader>
        <DataTable columns={columns} data={leaveRequests} />
      </Card>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title="Application Review"
        footer={
           <div className="flex gap-3">
              <Button variant="secondary" onClick={close}>Cancel</Button>
              {selectedReq?.status === 'Requested' && <Button onClick={close}>Approve Request</Button>}
           </div>
        }
      >
        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4 text-sm">
             <div>
                <p className="text-content-tertiary font-medium">Employee</p>
                <p className="text-content-primary font-semibold">{selectedReq?.employee}</p>
             </div>
             <div>
                <p className="text-content-tertiary font-medium">Leave Category</p>
                <p className="text-content-primary font-semibold">{selectedReq?.type}</p>
             </div>
             <div>
                <p className="text-content-tertiary font-medium">Requested Duration</p>
                <p className="text-content-primary font-semibold">{selectedReq?.from} to {selectedReq?.to}</p>
             </div>
             <div>
                <p className="text-content-tertiary font-medium">Total Days</p>
                <p className="text-brand-teal font-bold">{selectedReq?.days} Days</p>
             </div>
          </div>
          <div className="pt-4 border-t border-border">
             <h5 className="text-sm font-semibold text-content-primary mb-2">Reason for Leave</h5>
             <p className="text-sm text-content-secondary leading-relaxed bg-surface-input/50 p-3 rounded-none border border-border">
                "Not feeling well since last night. High fever and body ache. Doctor suggested 2 days rest to recover completely. Will be reachable on Slack for emergencies."
             </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
