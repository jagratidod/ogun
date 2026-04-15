import { RiStore2Line, RiSearchLine, RiFilterLine, RiUserAddLine, RiEyeLine, RiHistoryLine, RiTrophyLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar, Input, Select } from '../../../core';
import entitiesData from '../../../data/entities.json';

export default function RetailerListPage() {
  const { retailers } = entitiesData;

  const columns = [
    {
      key: 'name', label: 'Retailer Store', sortable: true, render: (val) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <span className="font-bold text-content-primary">{val}</span>
        </div>
      )
    },
    {
      key: 'distributor', label: 'Mapped Distributor', render: (val) => (
        <div className="flex items-center gap-2">
          <RiUserAddLine className="text-brand-teal w-4 h-4" />
          <span className="text-sm font-medium text-content-secondary">{val}</span>
        </div>
      )
    },
    {
      key: 'orders', label: 'Total Orders', align: 'center', render: (val) => (
        <Badge variant="info">
          {val} Orders
        </Badge>
      )
    },
    {
      key: 'joined', label: 'Onboarded', render: (val) => (
        <span className="text-xs text-content-tertiary">{val}</span>
      )
    },
    {
      key: 'status', label: 'Status', render: (val) => (
        <Badge status={val.toLowerCase()}>{val}</Badge>
      )
    },
    {
      key: 'actions', label: 'Actions', align: 'right', render: () => (
        <div className="flex justify-end gap-1">
          <Button variant="icon">
            <RiEyeLine className="w-4 h-4" />
          </Button>
          <Button variant="icon">
            <RiTrophyLine className="w-4 h-4 text-state-warning" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Retailer Stores"
        subtitle="Manage end-point retail stores and their order frequency"
      >
        <Button icon={RiUserAddLine}>Add Retailer</Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <Select options={[
              { label: 'All Distributors', value: 'all' },
              { label: 'Arjun Patel', value: 'arjun' },
              { label: 'Suresh Reddy', value: 'suresh' }
            ]} className="w-48" />
            <div className="flex items-center gap-2">
              <Input icon={RiSearchLine} placeholder="Search retailer name..." className="w-full md:w-64" />
              <Button variant="secondary" icon={RiFilterLine}>Filters</Button>
            </div>
          </div>
        </CardHeader>
        <DataTable columns={columns} data={retailers} />
      </Card>
    </div>
  );
}
