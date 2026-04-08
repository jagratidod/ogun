import { RiTruckLine, RiSearchLine, RiFilterLine, RiEyeLine, RiFileDownloadLine, RiFilter2Line } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, formatCurrency, formatDateTime } from '../../../core';
import orders from '../../../data/orders.json';

export default function DistOrderHistoryPage() {
  const allOrders = orders.filter(o => o.distributor === 'Arjun Patel'); // Regular orders for current distributor

  const columns = [
    { key: 'id', label: 'Order ID', sortable: true, render: (val) => (
      <span className="font-bold text-content-primary">{val}</span>
    )},
    { key: 'date', label: 'Date', sortable: true, render: (val) => (
       <div className="flex flex-col">
          <span className="text-sm font-medium text-content-primary">{formatDateTime(val).split(',')[0]}</span>
          <span className="text-[10px] text-content-tertiary">{formatDateTime(val).split(',')[1]}</span>
       </div>
    )},
    { key: 'retailer', label: 'Retailer Store', sortable: true },
    { key: 'amount', label: 'Amount', align: 'right', sortable: true, render: (val) => (
       <span className="font-bold text-brand-teal">{formatCurrency(val)}</span>
    )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge status={val.toLowerCase()}>{val}</Badge>
    )},
    { key: 'paymentStatus', label: 'Payment', align: 'center', render: (val) => (
       <Badge variant={val === 'Paid' ? 'success' : 'warning'}>{val}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <div className="flex justify-end gap-1">
          <Button variant="icon">
             <RiEyeLine className="w-4 h-4" />
          </Button>
          <Button variant="icon">
             <RiFileDownloadLine className="w-4 h-4" />
          </Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Distributor Order History" 
        subtitle="Historical record of all transactions within your assigned retailer node"
      >
        <Button icon={RiFileDownloadLine} variant="secondary">Export Statement</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-2">
         {[
           { label: 'Total Volume', val: 782, color: 'text-brand-teal' },
           { label: 'Delivered', val: 745, color: 'text-state-success' },
           { label: 'Cancelled', val: 12, color: 'text-state-danger' },
           { label: 'Avg Payout Time', val: '4.2 Days', color: 'text-content-secondary' }
         ].map(stat => (
           <div key={stat.label} className="glass-card p-4">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h4 className={`text-xl font-bold ${stat.color}`}>{stat.val}</h4>
           </div>
         ))}
      </div>

      <Card>
         <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
               <div className="flex items-center gap-2">
                  <Select options={[
                     { label: 'All History', value: 'all' },
                     { label: 'Delivered Only', value: 'delivered' },
                     { label: 'Pending Only', value: 'pending' }
                  ]} className="w-48" />
                  <Input icon={RiSearchLine} placeholder="Search order ID or retailer..." className="w-full md:w-64" />
               </div>
               <Button variant="secondary" icon={RiFilter2Line}>Advanced Filters</Button>
            </div>
         </CardHeader>
         <DataTable columns={columns} data={allOrders} />
      </Card>
    </div>
  );
}
