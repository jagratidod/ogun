import { RiOrganizationChart, RiGroupLine, RiArrowRightSLine, RiInformationLine, RiEditLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, DataTable, Badge, Button, Avatar } from '../../../core';
import hrData from '../../../data/hr.json';

export default function DepartmentsPage() {
  const { departments } = hrData;

  const columns = [
    { key: 'name', label: 'Department Name', sortable: true, render: (val) => (
      <div className="flex items-center gap-2">
         <RiOrganizationChart className="text-brand-teal w-4 h-4" />
         <span className="font-semibold text-content-primary">{val}</span>
      </div>
    )},
    { key: 'employees', label: 'Total Members', align: 'center', render: (val) => (
       <Badge variant="info">
          <RiGroupLine className="mr-1 inline" /> {val}
       </Badge>
    )},
    { key: 'head', label: 'Department Head', render: (val) => (
       <div className="flex items-center gap-2">
          <Avatar name={val} size="xs" />
          <span className="text-sm font-medium text-content-primary">{val}</span>
       </div>
    )},
    { key: 'actions', label: 'Actions', align: 'right', render: () => (
       <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={RiEditLine}>Structure</Button>
          <Button variant="icon">
             <RiArrowRightSLine className="w-5 h-5 text-content-tertiary" />
          </Button>
       </div>
    )}
  ];

  return (
    <div className="page-container">
      <PageHeader 
        title="Department Structures" 
        subtitle="Manage nested organizational hierarchy and reporting lines"
      >
        <Button icon={RiOrganizationChart}>New Department</Button>
      </PageHeader>

      <Card>
        <CardHeader>
           <CardTitle>Core Clusters</CardTitle>
           <CardDescription>Major operational departments within OGUN Kitchen CRM</CardDescription>
        </CardHeader>
        <DataTable columns={columns} data={departments} />
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="glass-card p-6">
            <h4 className="section-title mb-4">Organizational Health</h4>
            <div className="flex items-center gap-6">
               <div className="w-24 h-24 rounded-none border-8 border-brand-teal border-t-state-warning flex items-center justify-center text-xl font-bold">
                  85%
               </div>
               <div className="space-y-2 flex-1">
                  <p className="text-sm text-content-secondary line-clamp-2">Efficiency based on departmental target achievement across 5 active clusters.</p>
                  <Button variant="ghost" size="sm" icon={RiInformationLine}>System Diagnostics</Button>
               </div>
            </div>
         </div>
         <div className="glass-card p-6">
            <h4 className="section-title mb-4">Staff Distribution</h4>
            <div className="space-y-3">
               {[
                 { label: 'Management', val: '5%' },
                 { label: 'Operations', val: '45%' },
                 { label: 'Finance', val: '12%' },
                 { label: 'S&M', val: '38%' }
               ].map(row => (
                 <div key={row.label} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-content-tertiary uppercase">
                       <span>{row.label}</span>
                       <span>{row.val}</span>
                    </div>
                    <div className="w-full h-1 bg-surface-input rounded-none overflow-hidden">
                       <div className="h-full bg-brand-teal rounded-none" style={{ width: row.val }} />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
