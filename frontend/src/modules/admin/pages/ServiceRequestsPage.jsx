import { useState } from 'react';
import { 
  RiCustomerServiceLine, RiSearchLine, RiFilterLine, 
  RiEyeLine, RiUserLine, RiSettings4Line, 
  RiArrowRightUpLine, RiTimeLine, RiToolsLine, RiCheckDoubleLine, RiInformationLine 
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  DataTable, Badge, Button, Input, Select, Modal, useModal, formatDateTime 
} from '../../../core';
import serviceData from '../../../data/service.json';
import { toast } from 'react-hot-toast';

export default function ServiceRequestsPage() {
  const { isOpen, open, close, data: selectedTicket } = useModal();
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = () => {
    setIsAssigning(true);
    toast.loading('Assigning field technician...');
    setTimeout(() => {
       toast.dismiss();
       toast.success(`Technician assigned to Ticket ${selectedTicket.id}`);
       setIsAssigning(false);
       close();
    }, 1500);
  };

  const columns = [
    { key: 'id', label: 'Ticket ID', sortable: true, render: (val) => (
      <span className="font-bold text-content-primary">{val}</span>
    )},
    { key: 'date', label: 'Requested On', render: (val) => (
       <div className="flex flex-col">
          <span className="text-sm font-medium text-content-primary">{formatDateTime(val).split(',')[0]}</span>
          <span className="text-[10px] text-content-tertiary">{formatDateTime(val).split(',')[1]}</span>
       </div>
    )},
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'product', label: 'Product Model', sortable: true },
    { key: 'priority', label: 'Priority', render: (val) => (
       <Badge variant={val === 'High' ? 'danger' : val === 'Medium' ? 'warning' : 'info'}>{val}</Badge>
    )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge status={val.toLowerCase()}>{val}</Badge>
    )},
    { key: 'technician', label: 'Assigned Tech', render: (val) => (
       <div className="flex items-center gap-2">
          {val ? (
             <>
                <RiUserLine className="w-3.5 h-3.5 text-brand-teal" />
                <span className="text-sm text-content-secondary">{val}</span>
             </>
          ) : (
             <span className="text-xs text-content-tertiary italic">Unassigned</span>
          )}
       </div>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-1">
          <Button variant="icon" title="View Details" onClick={() => toast.info(`Viewing Ticket ${row.id} details`)}>
             <RiEyeLine className="w-4 h-4" />
          </Button>
          <Button variant="icon" title="Manage Assignment" onClick={() => open(row)}>
             <RiSettings4Line className="w-4 h-4 text-brand-teal" />
          </Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Service Requests" 
        subtitle="Managing post-sales maintenance and warranty support tickets"
      >
        <div className="flex items-center gap-3">
           <Button icon={RiSettings4Line} variant="secondary" onClick={() => toast.success('Syncing Dispatch Board...')}>Dispatch Board</Button>
           <Button icon={RiCustomerServiceLine} onClick={() => toast.info('Direct ticket entry is restricted to support staff.')}>Raise New Ticket</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: 'All Open Tickets', val: 12 },
           { label: 'Unassigned', val: 3, color: 'text-state-danger' },
           { label: 'Assigned Today', val: 6, color: 'text-brand-teal' },
           { label: 'Closed This Week', val: 18, color: 'text-state-success' }
         ].map(stat => (
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
                    { label: 'Assigned', value: 'assigned' },
                    { label: 'In Progress', value: 'in_progress' },
                    { label: 'Resolved', value: 'closed' }
                 ]} className="w-48" />
                 <Select options={[{ label: 'High Priority', value: 'high' }, { label: 'Medium Priority', value: 'med' }]} className="w-48" />
              </div>
              <Input icon={RiSearchLine} placeholder="Search Ticket ID or customer..." className="w-full md:w-64" />
           </div>
        </CardHeader>
        <DataTable columns={columns} data={serviceData} />
      </Card>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={`Manage Ticket: ${selectedTicket?.id}`}
        footer={
           <div className="flex gap-3">
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button icon={RiCheckDoubleLine} onClick={handleAssign} loading={isAssigning}>Assign Technician</Button>
           </div>
        }
      >
        <div className="space-y-6">
           <div className="p-4 bg-surface-elevated border border-border flex items-center justify-between">
              <div>
                 <p className="text-[10px] text-content-tertiary uppercase font-black mb-1">Service Required</p>
                 <h4 className="text-sm font-bold text-content-primary">{selectedTicket?.issue || 'General Maintenance'}</h4>
              </div>
              <Badge variant={selectedTicket?.priority === 'High' ? 'danger' : 'warning'}>{selectedTicket?.priority}</Badge>
           </div>

           <div className="space-y-3">
              <Select label="Select On-Field Expert" options={[
                 { label: 'Ramesh Kumar (Sakinaka)', value: 'rk' },
                 { label: 'Suresh Patil (Andheri)', value: 'sp' },
                 { label: 'Anil Gupta (Marol)', value: 'ag' }
              ]} />
              <div className="p-3 bg-brand-teal/5 border border-brand-teal/10 flex items-start gap-3">
                 <RiToolsLine className="text-brand-teal w-5 h-5 flex-shrink-0" />
                 <p className="text-[11px] text-content-secondary leading-normal">Selected technician has <strong>3 active tickets</strong>. Estimated arrival: 4 hours from assignment.</p>
              </div>
           </div>

           <div className="p-4 rounded-none bg-surface-elevated/40 border border-dashed border-border flex items-center gap-3">
              <RiInformationLine className="w-4 h-4 text-content-tertiary" />
              <p className="text-[10px] text-content-tertiary italic">Confirmation SMS will be sent to {selectedTicket?.customer} automatically.</p>
           </div>
        </div>
      </Modal>
    </div>
  );
}
