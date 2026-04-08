import { useState, useMemo } from 'react';
import { RiTruckLine, RiTimeLine, RiSearchLine, RiFilterLine, RiInformationLine, RiPulseLine, RiArrowRightUpLine, RiSettings4Line, RiCheckDoubleLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime } from '../../../core';

const requests = [
  { id: 'RR-102', items: 12, value: 45600, status: 'Shipped', distributor: 'Arjun Patel', date: '2026-04-06T10:30:00' },
  { id: 'RR-101', items: 5, value: 12400, status: 'Requested', distributor: 'Arjun Patel', date: '2026-04-05T14:45:00' }
];

export default function RestockRequestPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchSearch = r.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.distributor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [searchTerm, statusFilter]);

  const columns = [
    { key: 'id', label: 'Request ID', sortable: true, render: (val) => (
      <span className="font-bold text-content-primary">#{val}</span>
    )},
    { key: 'date', label: 'Processing On', sortable: true, render: (val) => (
       <div className="flex flex-col">
          <span className="text-sm font-medium text-content-primary">{formatDateTime(val).split(',')[0]}</span>
          <span className="text-[10px] text-content-tertiary">{formatDateTime(val).split(',')[1]}</span>
       </div>
    )},
    { key: 'items', label: 'Quantity', align: 'center', render: (val) => (
       <Badge variant="teal">{val} Units</Badge>
    )},
    { key: 'value', label: 'Estimated Cost', align: 'right', sortable: true, render: (val) => (
       <span className="font-bold text-brand-teal">{formatCurrency(val)}</span>
    )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge status={val.toLowerCase()}>{val}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <div className="flex justify-end gap-1">
          <Button variant="secondary" size="sm" icon={RiPulseLine}>Track Live</Button>
          <Button variant="icon" className="group">
             <RiCheckDoubleLine className="w-5 h-5 text-state-success opacity-40 group-hover:opacity-100" />
          </Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Restock Submissions" 
        subtitle="Manage and track inventory fulfillment requests sent to your distributor"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-2">
         {[
           { label: 'Sent Requests', val: requests.length, color: 'text-brand-teal' },
           { label: 'In Transit', val: requests.filter(r => r.status === 'Shipped').length, color: 'text-state-warning' },
           { label: 'Out for Delivery', val: 0, color: 'text-state-success' },
           { label: 'Pending Approval', val: requests.filter(r => r.status === 'Requested').length, color: 'text-state-warning' }
         ].map(stat => (
           <div key={stat.label} className="glass-card p-4">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h4 className={`text-xl font-bold ${stat.color}`}>{stat.val}</h4>
           </div>
         ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex-1 max-w-sm">
              <Input 
                icon={RiSearchLine} 
                placeholder="Search track ID or distributor..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-2">
              <Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Awaiting Order', value: 'requested' }, 
                  { label: 'Shipped Requests', value: 'shipped' }
                ]} 
                className="w-48" 
              />
              <Button variant="secondary" icon={RiFilterLine}>Filters</Button>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={filteredRequests} />
      </Card>
      
      <div className="mt-8 text-center glass-card p-6 border-dashed border-2 border-border">
         <RiInformationLine className="w-12 h-12 text-content-tertiary mx-auto mb-2 opacity-50" />
         <p className="text-sm text-content-tertiary font-medium">To replenish inventory, use the <strong>Restock</strong> trigger on specific products from the Store Inventory page.</p>
      </div>
    </div>
  );
}

