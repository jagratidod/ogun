import { useState } from 'react';
import { RiTruckLine, RiCheckDoubleLine, RiCloseCircleLine, RiInformationLine, RiEyeLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, useModal, Modal, formatCurrency, formatDateTime } from '../../../core';
import ordersData from '../../../data/orders.json';
import { toast } from 'react-hot-toast';

export default function RestockRequestsPage() {
  const [requests, setRequests] = useState(ordersData.filter(o => o.type === 'Restock Request'));
  const { isOpen, open, close, data: selectedReq } = useModal();

  const handleApprove = (id) => {
     setRequests(prev => prev.map(r => 
        r.id === id ? { ...r, status: 'Approved' } : r
     ));
     toast.success(`Request ${id} approved and assigned to distributor.`);
  };

  const columns = [
    { key: 'id', label: 'Request ID', render: (val) => (
      <span className="font-bold text-content-primary">{val}</span>
    )},
    { key: 'date', label: 'Date', render: (val) => (
       <div className="flex flex-col">
          <span className="text-sm font-medium text-content-primary">{formatDateTime(val).split(',')[0]}</span>
          <span className="text-[10px] text-content-tertiary">{formatDateTime(val).split(',')[1]}</span>
       </div>
    )},
    { key: 'retailer', label: 'Retailer', sortable: true },
    { key: 'amount', label: 'Total Value', align: 'right', render: (val) => (
       <span className="font-bold text-brand-teal">{formatCurrency(val)}</span>
    )},
    { key: 'itemsCount', label: 'Items', align: 'center', render: (val) => (
       <span className="text-sm text-content-secondary">{val} types</span>
    )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge status={val.toLowerCase()}>{val}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-1">
          {row.status === 'Requested' && (
             <Button variant="secondary" size="sm" icon={RiCheckDoubleLine} className="group" onClick={() => handleApprove(row.id)}>
                <span className="group-hover:text-state-success transition-colors">Approve</span>
             </Button>
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
        title="Restock Requests" 
        subtitle="Manage and approve inventory replenishment requests from retailers"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
           <p className="text-xs text-content-tertiary font-bold uppercase tracking-wider mb-2">Pending Requests</p>
           <h4 className="text-2xl font-bold text-content-primary">
              {requests.filter(r => r.status === 'Requested').length}
           </h4>
        </div>
        <div className="glass-card p-5">
           <p className="text-xs text-content-tertiary font-bold uppercase tracking-wider mb-2">Approved this Week</p>
           <h4 className="text-2xl font-bold text-brand-teal">
              {requests.filter(r => r.status === 'Approved').length}
           </h4>
        </div>
        <div className="glass-card p-5">
           <p className="text-xs text-content-tertiary font-bold uppercase tracking-wider mb-2">Total Value</p>
           <h4 className="text-2xl font-bold text-content-primary">
              {formatCurrency(requests.reduce((acc, curr) => acc + curr.amount, 0))}
           </h4>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incoming Restocks</CardTitle>
          <CardDescription>Requests that need to be assigned to a distributor for dispatch</CardDescription>
        </CardHeader>
        <DataTable columns={columns} data={requests} />
      </Card>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={`Request Detail: ${selectedReq?.id}`}
        footer={
           <div className="flex gap-3">
              <Button variant="secondary" onClick={close}>Close</Button>
              {selectedReq?.status === 'Requested' && (
                 <Button onClick={() => { handleApprove(selectedReq.id); close(); }}>Approve Request</Button>
              )}
           </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
             <div>
                <p className="text-content-tertiary font-medium">Retailer</p>
                <p className="text-content-primary font-semibold">{selectedReq?.retailer}</p>
             </div>
             <div>
                <p className="text-content-tertiary font-medium">Requested On</p>
                <p className="text-content-primary font-semibold">{formatDateTime(selectedReq?.date || '')}</p>
             </div>
             <div>
                <p className="text-content-tertiary font-medium">Total Items</p>
                <p className="text-content-primary font-semibold">{selectedReq?.itemsCount}</p>
             </div>
             <div>
                <p className="text-content-tertiary font-medium">Total Amount</p>
                <p className="text-brand-teal font-bold">{formatCurrency(selectedReq?.amount || 0)}</p>
             </div>
          </div>
          <div className="pt-4 border-t border-border">
             <h5 className="text-sm font-semibold text-content-primary mb-3">Item Breakdown</h5>
             <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-none bg-surface-input/50">
                   <div>
                      <p className="text-sm font-medium text-content-primary">TurboMix Pro 750W</p>
                      <p className="text-xs text-content-tertiary">SKU: TMP-750</p>
                   </div>
                   <p className="text-sm font-bold text-content-secondary">x 5 units</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-none bg-surface-input/50">
                   <div>
                      <p className="text-sm font-medium text-content-primary">QuickMix 500W Grinder</p>
                      <p className="text-xs text-content-tertiary">SKU: QM-500</p>
                   </div>
                   <p className="text-sm font-bold text-content-secondary">x 10 units</p>
                </div>
             </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

