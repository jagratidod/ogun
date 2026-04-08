import { RiTruckLine, RiSearchLine, RiFilterLine, RiUserAddLine, RiEyeLine, RiMapPinLine, RiGroupLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, Input, Select } from '../../../core';
import entitiesData from '../../../data/entities.json';

export default function DistributorListPage() {
  const { distributors } = entitiesData;

  const columns = [
    { key: 'name', label: 'Distributor Name', sortable: true, render: (val) => (
       <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <span className="font-bold text-content-primary">{val}</span>
       </div>
    )},
    { key: 'region', label: 'Region', render: (val) => (
       <div className="flex items-center gap-2">
          <RiMapPinLine className="text-brand-teal w-4 h-4" />
          <span className="text-sm font-medium text-content-secondary">{val}</span>
       </div>
    )},
    { key: 'retailers', label: 'Retailer Network', align: 'center', render: (val) => (
       <Badge variant="info">
          <RiGroupLine className="mr-1 inline" /> {val}
       </Badge>
    )},
    { key: 'joined', label: 'Onboarded', render: (val) => (
       <span className="text-xs text-content-tertiary">{val}</span>
    )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge status={val.toLowerCase()}>{val}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <div className="flex justify-end gap-1">
          <Button variant="icon">
             <RiEyeLine className="w-4 h-4" />
          </Button>
          <Button variant="icon">
             <RiTruckLine className="w-4 h-4 text-brand-teal" />
          </Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Distributor Network" 
        subtitle="Manage regional distributor nodes and their logistics activity"
      >
        <Button icon={RiUserAddLine}>Add Distributor</Button>
      </PageHeader>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <Select options={[
                 { label: 'All Regions', value: 'all' },
                 { label: 'North India', value: 'north' },
                 { label: 'South India', value: 'south' }
              ]} className="w-48" />
              <div className="flex items-center gap-2">
                 <Input icon={RiSearchLine} placeholder="Search distributor name..." className="w-full md:w-64" />
                 <Button variant="secondary" icon={RiFilterLine}>Filters</Button>
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={distributors} />
      </Card>
    </div>
  );
}
