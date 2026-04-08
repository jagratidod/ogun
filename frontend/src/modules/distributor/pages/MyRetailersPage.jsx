import { RiStore2Line, RiSearchLine, RiFilterLine, RiUserAddLine, RiEyeLine, RiHistoryLine, RiTrophyLine, RiMapPinLine, RiPhoneLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, Input, Select } from '../../../core';
import entities from '../../../data/entities.json';

export default function MyRetailersPage() {
  const myRetailers = entities.retailers.filter(r => r.distributor === 'Arjun Patel');

  const columns = [
    { key: 'name', label: 'Retailer Store', sortable: true, render: (val) => (
       <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <div>
            <p className="text-sm font-bold text-content-primary">{val}</p>
            <p className="text-xs text-content-tertiary">Verified Partner</p>
          </div>
       </div>
    )},
    { key: 'orders', label: 'Total Orders', align: 'center', render: (val) => (
       <Badge variant="info">
          {val} Orders
       </Badge>
    )},
    { key: 'joined', label: 'Partner Since', render: (val) => (
       <span className="text-xs text-content-tertiary">{val}</span>
    )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge status={val.toLowerCase()}>{val}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={RiPhoneLine}>Call</Button>
          <Button variant="icon">
             <RiEyeLine className="w-4 h-4 text-brand-teal" />
          </Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="My Retailer Network" 
        subtitle="Manage and track performance across your assigned retail stores"
      >
        <Button icon={RiUserAddLine}>Add Retailer</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-2">
         {[
           { label: 'Active Retailers', val: myRetailers.length },
           { label: 'Avg Order Val', val: '₹14,500' },
           { label: 'Retention Rate', val: '92%' },
           { label: 'Monthly Growth', val: '+4.2%' }
         ].map(stat => (
           <div key={stat.label} className="glass-card p-4">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <h4 className="text-xl font-bold text-content-primary">{stat.val}</h4>
           </div>
         ))}
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <Select options={[{ label: 'Mumbai North', value: 'north' }, { label: 'Mumbai South', value: 'south' }]} className="w-48" />
              <div className="flex items-center gap-2">
                 <Input icon={RiSearchLine} placeholder="Search store name..." className="w-full md:w-64" />
                 <Button variant="secondary" icon={RiFilterLine}>Filters</Button>
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={myRetailers} />
      </Card>
    </div>
  );
}
