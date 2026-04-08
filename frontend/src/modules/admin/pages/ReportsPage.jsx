import { RiFileLine, RiDownloadLine, RiSearchLine, RiFilterLine, RiBarChartLine, RiFileChartLine, RiHistoryLine, RiTableLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Input, Select } from '../../../core';

const availableReports = [
  { id: 'REP-01', name: 'Q1 Sales Performance', type: 'Revenue', lastGenerated: '2026-04-01', size: '2.4 MB' },
  { id: 'REP-02', name: 'Inventory Aging Report', type: 'Stock', lastGenerated: '2026-04-05', size: '1.8 MB' },
  { id: 'REP-03', name: 'Distributor Retention Audit', type: 'Network', lastGenerated: '2026-03-15', size: '4.2 MB' },
  { id: 'REP-04', name: 'Regional Service TAT Analysis', type: 'Service', lastGenerated: '2026-04-06', size: '0.9 MB' }
];

export default function ReportsPage() {
  const columns = [
    { key: 'name', label: 'Report Name', render: (val) => (
       <div className="flex items-center gap-3">
          <RiFileChartLine className="text-brand-teal w-5 h-5 flex-shrink-0" />
          <span className="font-bold text-content-primary">{val}</span>
       </div>
    )},
    { key: 'type', label: 'Module', render: (val) => (
       <Badge variant="info">{val}</Badge>
    )},
    { key: 'lastGenerated', label: 'Last Generated', render: (val) => (
       <span className="text-xs text-content-secondary">{val}</span>
    )},
    { key: 'size', label: 'File Size', render: (val) => (
       <span className="text-[10px] text-content-tertiary font-bold">{val}</span>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <div className="flex justify-end gap-1">
          <Button variant="secondary" size="sm" icon={RiHistoryLine}>Archive</Button>
          <Button variant="icon">
             <RiDownloadLine className="w-4 h-4 text-brand-teal" />
          </Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Business Reports" 
        subtitle="Generate and download customized operational and financial insights"
      >
        <Button icon={RiBarChartLine}>Legacy Report Builder</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         {[
           { title: 'Inventory Analytics', desc: 'Predictive stock needs based on 12-month trends.', icon: RiTableLine },
           { title: 'Finance Summary', desc: 'Consolidated P&L and GST compliance reports.', icon: RiFileChartLine },
           { title: 'Service Performance', desc: 'Detailed TAT and technician efficiency logs.', icon: RiBarChartLine }
         ].map(card => (
            <div key={card.title} className="glass-card p-6 group hover:translate-y-[-4px] transition-all cursor-pointer border hover:border-brand-teal">
               <div className="w-12 h-12 rounded-none bg-brand-teal/10 flex items-center justify-center mb-4 text-brand-teal">
                  <card.icon className="w-6 h-6" />
               </div>
               <h4 className="text-lg font-bold text-content-primary mb-2 group-hover:text-brand-teal transition-colors">{card.title}</h4>
               <p className="text-sm text-content-secondary line-clamp-2">{card.desc}</p>
            </div>
         ))}
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <Select options={[{ label: 'All Categories', value: 'all' }, { label: 'Revenue', value: 'rev' }, { label: 'Stock', value: 'stock' }]} className="w-48" />
              <div className="flex items-center gap-2">
                 <Input icon={RiSearchLine} placeholder="Search report name..." className="w-full md:w-64" />
                 <Button variant="secondary" icon={RiFilterLine}>Filters</Button>
              </div>
           </div>
        </CardHeader>
        <DataTable columns={columns} data={availableReports} />
      </Card>
    </div>
  );
}
