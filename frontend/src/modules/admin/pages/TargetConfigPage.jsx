import { RiTrophyLine, RiCalendarCheckLine, RiEditLine, RiDeleteBin7Line, RiFilterLine, RiSearchLine, RiInformationLine, RiCheckboxCircleLine, RiTimeLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, useModal, Modal } from '../../../core';
import rewardsData from '../../../data/rewards.json';

export default function TargetConfigPage() {
  const { targets } = rewardsData;
  const { isOpen, open, close, data: selectedTgt } = useModal();

  const columns = [
    { key: 'name', label: 'Campaign Name', sortable: true, render: (val) => (
      <span className="font-bold text-content-primary">{val}</span>
    )},
    { key: 'type', label: 'Entity Type', render: (val) => (
       <Badge variant={val === 'Distributor' ? 'purple' : val === 'Retailer' ? 'teal' : 'info'}>{val}</Badge>
    )},
    { key: 'value', label: 'Target Value', align: 'right', render: (val, row) => (
       <div className="flex flex-col items-end">
          <span className="font-black text-brand-teal text-base">{val.toLocaleString()}</span>
          <span className="text-[10px] text-content-tertiary font-bold uppercase">{row.type === 'Staff' ? 'Satisf. Score' : 'Revenue INR'}</span>
       </div>
    )},
    { key: 'points', label: 'Award Points', align: 'center', render: (val) => (
       <div className="flex items-center justify-center gap-1.5 text-state-warning">
          <RiTrophyLine className="w-4 h-4" />
          <span className="font-black">{val.toLocaleString()}</span>
       </div>
    )},
    { key: 'deadline', label: 'Campaign Deadline', render: (val) => (
       <div className="flex items-center gap-2">
          <RiTimeLine className="w-3.5 h-3.5 text-content-tertiary" />
          <span className="text-xs text-content-secondary">{val}</span>
       </div>
    )},
    { key: 'status', label: 'Status', render: (val) => (
       <Badge status={val.toLowerCase()}>{val}</Badge>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: (_, row) => (
      <div className="flex justify-end gap-1">
        <Button variant="icon" onClick={() => open(row)}>
          <RiEditLine className="w-4 h-4" />
        </Button>
        <Button variant="icon" className="group">
          <RiDeleteBin7Line className="w-4 h-4 text-state-danger opacity-70 group-hover:opacity-100" />
        </Button>
      </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Target Configuration" 
        subtitle="Define point-based logic and performance benchmarks for all entities"
      >
        <Button icon={RiTrophyLine} onClick={() => open(null)}>New Reward Component</Button>
      </PageHeader>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                 <Select options={[
                    { label: 'Active Targets', value: 'active' },
                    { label: 'Completed Campaigns', value: 'completed' },
                    { label: 'Expired', value: 'expired' }
                 ]} className="w-48" />
                 <Select options={[ { label: 'Retailer Network', value: 'retailer' }, { label: 'Distributor Network', value: 'distributor' } ]} className="w-48" />
              </div>
              <Input icon={RiSearchLine} placeholder="Search campaign campaign name..." className="w-full md:w-64" />
           </div>
        </CardHeader>
        <DataTable columns={columns} data={targets} />
      </Card>

      <Modal 
        isOpen={isOpen} 
        onClose={close} 
        title={selectedTgt ? `Update Reward Formula: ${selectedTgt.name}` : 'Create New Performance Target'}
        footer={
           <div className="flex gap-3">
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button onClick={close}>{selectedTgt ? 'Sync Logic' : 'Initiate Program'}</Button>
           </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Input label="Campaign Title" defaultValue={selectedTgt?.name} className="md:col-span-2" placeholder="e.g. Q3 Sales Booster" />
           <Select label="Entity Scope" defaultValue={selectedTgt?.type} options={[
              { label: 'Retailer', value: 'Retailer' },
              { label: 'Distributor', value: 'Distributor' },
              { label: 'Service Staff', value: 'Staff' }
           ]} />
           <Select label="Target Metric" options={[
              { label: 'Gross Revenue (INR)', value: 'rev' },
              { label: 'Unit Sales (Qty)', value: 'qty' },
              { label: 'Service Satisfaction (%)', value: 'srv' }
           ]} />
           <Input label="Goal Target Value" type="number" defaultValue={selectedTgt?.value} placeholder="e.g. 500000" />
           <Input label="Point Awarding Logic" type="number" defaultValue={selectedTgt?.points} placeholder="Points on achievement" />
           <Input label="Expiry Date" type="date" defaultValue={selectedTgt?.deadline} />
           <div className="md:col-span-2">
              <Input label="Internal Success Notes" placeholder="Strategy details for this reward program..." />
           </div>
        </div>
      </Modal>
    </div>
  );
}
