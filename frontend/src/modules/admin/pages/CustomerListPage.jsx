import { RiUserLine, RiSearchLine, RiFilterLine, RiIdCardLine, RiEyeLine, RiHistoryLine, RiTrophyLine, RiMapPinLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, Input, Select } from '../../../core';
import entitiesData from '../../../data/entities.json';

export default function CustomerListPage() {
  const { customers } = entitiesData;

  const columns = [
    { key: 'name', label: 'End Consumer', sortable: true, render: (val) => (
       <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <span className="font-bold text-content-primary">{val}</span>
       </div>
    )},
    { key: 'city', label: 'Location', render: (val) => (
       <div className="flex items-center gap-2">
          <RiMapPinLine className="text-brand-teal w-4 h-4" />
          <span className="text-sm font-medium text-content-secondary">{val}</span>
       </div>
    )},
    { key: 'orders', label: 'Total Purchases', align: 'center', render: (val) => (
       <Badge variant="teal">
          {val} Orders
       </Badge>
    )},
    { key: 'loyalty', label: 'Loyalty Class', render: (val) => (
       <Badge variant={val === 'Platinum' ? 'purple' : 'warning'}>
          {val}
       </Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <div className="flex justify-end gap-1">
          <Button variant="icon">
             <RiEyeLine className="w-4 h-4" />
          </Button>
          <Button variant="icon">
             <RiIdCardLine className="w-4 h-4 text-brand-teal" />
          </Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Consumer Base" 
        subtitle="Insights and direct access to end-customers using OGUN appliances"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: 'Total Consumers', val: '8,420+' },
           { label: 'Active This Month', val: '1,250' },
           { label: 'Avg Order Value', val: '₹4,850' },
           { label: 'Retention Rate', val: '22%' }
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
              <Select options={[{ label: 'All Tiers', value: 'all' }, { label: 'Platinum', value: 'plat' }, { label: 'Gold', value: 'gold' }]} className="w-48" />
              <div className="flex items-center gap-2">
                 <Input icon={RiSearchLine} placeholder="Search consumer name..." className="w-full md:w-64" />
                 <Button variant="secondary" icon={RiFilterLine}>Filters</Button>
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={customers} />
      </Card>
    </div>
  );
}
