import { RiHistoryLine, RiTrophyLine, RiSearchLine, RiFilterLine, RiIdCardLine, RiQuestionLine, RiMoneyDollarCircleFill, RiTimerFill } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select, Avatar } from '../../../core';
import rewardsData from '../../../data/rewards.json';

export default function PointsHistoryPage() {
  const { pointsHistory, systemConfig, entities } = rewardsData;

  const totalPointsAwarded = pointsHistory.reduce((acc, curr) => acc + curr.points, 0);
  const topEarner = entities.reduce((prev, current) => (prev.totalPoints > current.totalPoints) ? prev : current);

  const columns = [
    { key: 'date', label: 'Processing Date', sortable: true, render: (val) => (
       <div className="flex flex-col">
          <span className="text-sm font-medium text-content-primary">{val}</span>
          <span className="text-[10px] text-content-tertiary">10:45 AM GTM+5:30</span>
       </div>
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
       <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-brand-teal">
             <RiTrophyLine className="w-4 h-4" />
             <span className="font-black">+{val.toLocaleString()}</span>
          </div>
          <span className="text-[10px] font-bold text-content-tertiary tracking-tighter">Value: ₹{(val * systemConfig.pointToRupeeRatio).toLocaleString()}</span>
       </div>
    )},
    { key: 'reason', label: 'Disbursement Reason', render: (val) => (
       <div className="flex items-center gap-2 max-w-xs">
          <RiIdCardLine className="w-4 h-4 text-content-tertiary" />
          <span className="text-sm text-content-secondary line-clamp-1">{val}</span>
       </div>
    )},
    { key: 'expiry', label: 'Valid Until', render: (val) => (
       <div className="flex items-center gap-1.5 text-state-warning">
          <RiTimerFill className="w-3.5 h-3.5" />
          <span className="text-[11px] font-black">{val}</span>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
          <Card className="p-4 border-l-4 border-brand-teal">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Total Awarded</p>
              <div className="flex items-center gap-2">
                 <h4 className="text-xl font-bold text-content-primary">{totalPointsAwarded.toLocaleString()}</h4>
                 <Badge variant="teal" size="xs">Pts</Badge>
              </div>
          </Card>
          <Card className="p-4 border-l-4 border-state-warning">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Top Earner Entity</p>
              <h4 className="text-xl font-bold text-content-primary truncate tracking-tight">{topEarner.name}</h4>
          </Card>
          <Card className="p-4 border-l-4 border-brand-purple">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Monetary Total</p>
              <h4 className="text-xl font-bold text-content-primary">₹{(totalPointsAwarded * systemConfig.pointToRupeeRatio).toLocaleString()}</h4>
          </Card>
          <Card className="p-4 border-l-4 border-brand-pink">
              <p className="text-[10px] text-content-tertiary font-bold uppercase tracking-wider mb-1">Retention Expiry</p>
              <h4 className="text-xl font-bold text-content-primary">{systemConfig.pointsExpiryMonths} Months</h4>
          </Card>
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                 <Select options={[{ label: 'All History', value: 'all' }, { label: 'Retailer Network', value: 'retailer' }, { label: 'Distributor Network', value: 'distributor' }]} className="w-48" />
                 <Select options={[{ label: 'Last 30 Days', value: '30' }, { label: 'Last 90 Days', value: '90' }]} className="w-48" />
              </div>
              <Input icon={RiSearchLine} placeholder="Search entity name or reason..." className="w-full md:w-64 h-9" />
           </div>
        </CardHeader>
        <DataTable columns={columns} data={pointsHistory} />
      </Card>
    </div>
  );
}
