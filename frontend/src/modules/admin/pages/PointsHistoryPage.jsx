import { RiHistoryLine, RiTrophyLine, RiSearchLine, RiFilterLine, RiIdCardLine, RiQuestionLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, Avatar } from '../../../core';
import rewardsData from '../../../data/rewards.json';

export default function PointsHistoryPage() {
  const { pointsHistory } = rewardsData;

  const columns = [
    { key: 'date', label: 'Processing Date', sortable: true, render: (val) => (
       <span className="text-sm font-medium text-content-primary">{val}</span>
    )},
    { key: 'entity', label: 'Entity Profile', sortable: true, render: (val, row) => (
      <div className="flex items-center gap-3">
         <Avatar name={val} size="xs" />
         <div>
            <p className="text-sm font-bold text-content-primary">{val}</p>
            <p className="text-[10px] text-content-tertiary uppercase font-black">{row.type}</p>
         </div>
      </div>
    )},
    { key: 'points', label: 'Pts Awarded', align: 'center', render: (val) => (
       <div className="flex items-center justify-center gap-1.5 text-brand-teal">
          <RiTrophyLine className="w-4 h-4" />
          <span className="font-black">+{val.toLocaleString()}</span>
       </div>
    )},
    { key: 'reason', label: 'Disbursement Reason', render: (val) => (
       <div className="flex items-center gap-2 max-w-xs truncate">
          <RiIdCardLine className="w-4 h-4 text-content-tertiary" />
          <span className="text-sm text-content-secondary">{val}</span>
       </div>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <Button variant="ghost" size="sm" icon={RiQuestionLine}>Audit</Button>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Points Distribution Log" 
        subtitle="Auditable record of all reward disbursements across our business network"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: 'Total Awarded', val: '1.2M+', trend: 15 },
           { label: 'Top Earner Entity', val: 'Priya Kitchen', trend: 2 },
           { label: 'Avg Pts / Campaign', val: '2,400', trend: 8 },
           { label: 'Pending Payouts', val: '0', trend: -100 }
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
              <div className="flex items-center gap-2">
                 <Select options={[{ label: 'All History', value: 'all' }, { label: 'Retailer Network', value: 'retailer' }, { label: 'Distributor Network', value: 'distributor' }]} className="w-48" />
                 <Select options={[{ label: 'Last 30 Days', value: '30' }, { label: 'Last 90 Days', value: '90' }]} className="w-48" />
              </div>
              <Input icon={RiSearchLine} placeholder="Search entity name or reason..." className="w-full md:w-64" />
           </div>
        </CardHeader>
        <DataTable columns={columns} data={pointsHistory} />
      </Card>
    </div>
  );
}
