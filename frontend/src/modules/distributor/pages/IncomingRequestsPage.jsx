import { RiTruckLine, RiCheckDoubleLine, RiCloseCircleLine, RiInformationLine, RiEyeLine, RiInboxLine, RiArrowRightUpLine, RiSettings4Line, RiTimeLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, useModal, Modal, formatCurrency, formatDateTime } from '../../../core';
import orders from '../../../data/orders.json';

export default function IncomingRequestsPage() {
  const { isOpen, open, close, data: selectedReq } = useModal();

  const columns = [
    { key: 'id', label: 'Request ID', render: (val) => <span className="font-bold text-content-primary">#{val}</span> },
    { key: 'retailer', label: 'Retailer Store', sortable: true },
    { key: 'amount', label: 'Total Value', align: 'right', render: (val) => <span className="font-black text-brand-teal">{formatCurrency(val)}</span> },
    { key: 'date', label: 'Requested On', render: (val) => <span className="text-sm text-content-secondary">{val.split('T')[0]}</span> },
    { key: 'status', label: 'Status', render: (val) => <Badge status={val.toLowerCase()}>{val}</Badge> },
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-1">
          {row.status === 'Requested' && (
             <Button variant="secondary" size="sm" icon={RiCheckDoubleLine} onClick={() => open(row)}>Approve</Button>
          )}
          {row.status === 'Approved' && (
             <Button size="sm" icon={RiTruckLine} className="group">
                <span className="group-hover:text-state-success transition-colors">Dispatch</span>
             </Button>
          )}
          <Button variant="icon">
             <RiEyeLine className="w-4 h-4 cursor-pointer" />
          </Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Restock Requests" 
        subtitle="Manage and approve inventory replenishment requests from your retailer network"
      >
        <Button icon={RiTruckLine}>Shipment Log</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-2">
         {[
           { label: 'Unassigned', val: 3, color: 'text-state-danger' },
           { label: 'Pending Processing', val: 5, color: 'text-state-warning' },
           { label: 'Approved Today', val: 8, color: 'text-brand-teal' },
           { label: 'Delivered (Last 7D)', val: 24, color: 'text-state-success' }
         ].map(stat => (
           <div key={stat.label} className="glass-card p-4">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h4 className={`text-xl font-bold ${stat.color || 'text-content-primary'}`}>{stat.val}</h4>
           </div>
         ))}
      </div>

      <Card>
        <CardHeader>
           <CardTitle>Inbound Request Log</CardTitle>
           <CardDescription>Requests from retailers assigned to your distribution node</CardDescription>
        </CardHeader>
        <DataTable columns={columns} data={orders.filter(o => o.type === 'Restock Request')} />
      </Card>
    </div>
  );
}
