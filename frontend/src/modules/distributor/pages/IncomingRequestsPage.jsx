import { useMemo, useState } from 'react';
import { RiTruckLine, RiCheckDoubleLine, RiInformationLine, RiEyeLine, RiTimeLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, useModal, Modal, Input, Select, formatCurrency } from '../../../core';
import { useDistributorStore } from '../store/useDistributorStore';
import { toast } from 'react-hot-toast';

export default function IncomingRequestsPage() {
  const { restockRequests, actions } = useDistributorStore();
  const { isOpen, open, close, data: selectedReq } = useModal();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dispatchCarrier, setDispatchCarrier] = useState('Local Delivery Service');
  const [dispatchEta, setDispatchEta] = useState('Tomorrow, 10:00 AM');

  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (restockRequests || [])
      .filter((o) => statusFilter === 'all' ? true : (o.status || '').toLowerCase() === statusFilter)
      .filter((o) => {
        if (!q) return true;
        return String(o.id || '').toLowerCase().includes(q) || String(o.retailer || '').toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [restockRequests, search, statusFilter]);

  const approve = (row) => {
    actions.approveRestockRequest(row.id);
    toast.success(`Request ${row.id} approved`);
    close();
  };

  const dispatch = (row) => {
    actions.dispatchRestockRequest(row.id, { carrier: dispatchCarrier, eta: dispatchEta });
    toast.success(`Dispatch initiated for ${row.id}`);
    close();
  };

  const columns = [
    { key: 'id', label: 'Request ID', render: (val) => <span className="font-bold text-content-primary">#{val}</span> },
    { key: 'retailer', label: 'Retailer Store', sortable: true },
    { key: 'amount', label: 'Total Value', align: 'right', render: (val) => <span className="font-black text-brand-teal">{formatCurrency(val)}</span> },
    { key: 'date', label: 'Requested On', render: (val) => (
      <div className="flex items-center gap-2 text-sm text-content-secondary">
        <RiTimeLine className="w-4 h-4 text-content-tertiary" />
        <span>{String(val || '').split('T')[0] || '—'}</span>
      </div>
    ) },
    { key: 'status', label: 'Status', render: (val) => <Badge status={val.toLowerCase()}>{val}</Badge> },
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
       <div className="flex justify-end gap-1">
          {row.status === 'Requested' && (
             <Button variant="secondary" size="sm" icon={RiCheckDoubleLine} onClick={() => open({ mode: 'approve', row })}>Approve</Button>
          )}
          {row.status === 'Approved' && (
             <Button size="sm" icon={RiTruckLine} className="group" onClick={() => open({ mode: 'dispatch', row })}>
                <span className="group-hover:text-state-success transition-colors">Dispatch</span>
             </Button>
          )}
          <Button variant="icon">
             <RiEyeLine className="w-4 h-4 cursor-pointer" />
          </Button>
       </div>
    )}
  ];

  const selected = selectedReq?.row;
  const modalMode = selectedReq?.mode;

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
           { label: 'Requested', val: (restockRequests || []).filter(r => r.status === 'Requested').length, color: 'text-state-warning' },
           { label: 'Approved', val: (restockRequests || []).filter(r => r.status === 'Approved').length, color: 'text-brand-teal' },
           { label: 'Dispatched', val: (restockRequests || []).filter(r => r.status === 'Dispatched').length, color: 'text-state-warning' },
           { label: 'Delivered', val: (restockRequests || []).filter(r => r.status === 'Delivered').length, color: 'text-state-success' }
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
             <div>
               <CardTitle>Inbound Request Log</CardTitle>
               <CardDescription>Requests from retailers assigned to your distribution node</CardDescription>
             </div>
             <div className="flex items-center gap-2">
               <Select
                 className="w-44"
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 options={[
                   { label: 'All Status', value: 'all' },
                   { label: 'Requested', value: 'requested' },
                   { label: 'Approved', value: 'approved' },
                   { label: 'Dispatched', value: 'dispatched' },
                   { label: 'Delivered', value: 'delivered' },
                 ]}
               />
               <Input
                 placeholder="Search ID / retailer..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={data} />
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={modalMode === 'dispatch' ? `Dispatch: ${selected?.id}` : `Approve: ${selected?.id}`}
        footer={
          selected ? (
            <div className="flex gap-3">
              <Button variant="secondary" onClick={close}>Cancel</Button>
              {modalMode === 'dispatch' ? (
                <Button icon={RiTruckLine} onClick={() => dispatch(selected)}>Confirm Dispatch</Button>
              ) : (
                <Button icon={RiCheckDoubleLine} onClick={() => approve(selected)}>Confirm Approval</Button>
              )}
            </div>
          ) : null
        }
      >
        {!selected ? null : (
          <div className="space-y-4">
            <div className="p-4 bg-surface-elevated border border-border">
              <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest mb-1">Retailer</p>
              <p className="text-sm font-bold text-content-primary">{selected.retailer}</p>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-content-tertiary font-bold uppercase">Value</span>
                <span className="text-brand-teal font-black">{formatCurrency(selected.amount)}</span>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-content-tertiary font-bold uppercase">Status</span>
                <Badge status={(selected.status || '').toLowerCase()}>{selected.status}</Badge>
              </div>
            </div>

            {modalMode === 'dispatch' && (
              <div className="space-y-3">
                <Input label="Carrier" value={dispatchCarrier} onChange={(e) => setDispatchCarrier(e.target.value)} />
                <Input label="ETA" value={dispatchEta} onChange={(e) => setDispatchEta(e.target.value)} />
                <div className="p-4 bg-brand-teal/5 border border-brand-teal/10 flex items-start gap-3">
                  <RiInformationLine className="w-5 h-5 text-brand-teal flex-shrink-0" />
                  <p className="text-xs font-bold text-brand-teal leading-relaxed">
                    This will create a shipment entry in your Dispatch Board and mark the request as DISPATCHED.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
