import { RiTeamLine, RiCalendarCheckLine, RiWalletLine, RiAlertLine, RiCheckDoubleLine, RiTimeLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, MetricCard, AreaChart, BarChart, DataTable, Badge, Button, formatCurrency } from '../../../core';
import hrData from '../../../data/hr.json';

const attendanceTrend = [
  { "day": "Mon", "present": 48, "onLeave": 4 },
  { "day": "Tue", "present": 50, "onLeave": 2 },
  { "day": "Wed", "present": 45, "onLeave": 7 },
  { "day": "Thu", "present": 49, "onLeave": 3 },
  { "day": "Fri", "present": 51, "onLeave": 1 }
];

export default function HRDashboardPage() {
  const { payrollSummary, employees, leaveRequests } = hrData;
  const pendingLeaves = leaveRequests.filter(r => r.status === 'Requested').length;

  return (
    <div className="page-container">
      <PageHeader 
        title="HR Command Center" 
        subtitle="Manage people operations, payroll cycles, and employee wellness"
      >
        <div className="flex gap-3">
           <Button variant="secondary" icon={RiCalendarCheckLine}>Calendar</Button>
           <Button icon={RiTeamLine}>Onboard Employee</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Staff" value={employees.length} icon={RiTeamLine} change={5} />
        <MetricCard title="Leaves Pending" value={pendingLeaves} icon={RiAlertLine} variant={pendingLeaves > 0 ? 'warning' : 'default'} />
        <MetricCard title="Monthly Payout" value={payrollSummary.totalMonthlyPayable} format="currency" icon={RiWalletLine} />
        <MetricCard title="Next Pay Date" value="May 01" icon={RiTimeLine} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         <div className="lg:col-span-2 glass-card p-5">
            <h3 className="section-title mb-4">Weekly Attendance Pulse</h3>
            <AreaChart data={attendanceTrend} dataKey="present" xKey="day" name="Present Count" height={320} />
         </div>
         <Card>
            <CardHeader>
               <CardTitle>Recent Leave Tickets</CardTitle>
               <CardDescription>Latest inbound time-off applications</CardDescription>
            </CardHeader>
            <div className="p-4 space-y-4">
               {leaveRequests.slice(0, 4).map((req, idx) => (
                 <div key={idx} className="flex items-center gap-3 p-3 rounded-none bg-surface-input/50 border border-border">
                    <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0 text-brand-teal font-bold">
                       {req.employee.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-semibold text-content-primary truncate">{req.employee}</p>
                       <p className="text-[10px] text-content-tertiary font-bold uppercase">{req.type} · {req.days}d</p>
                    </div>
                    <Badge size="xs" variant={req.status === 'Approved' ? 'success' : 'warning'}>{req.status}</Badge>
                 </div>
               ))}
               <Button className="w-full mt-2" variant="ghost" size="sm">View All Requests</Button>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="glass-card p-5">
            <h3 className="section-title mb-6">Staff Distribution by Dept</h3>
            <BarChart 
              data={[
                { name: 'Sales', val: 12 },
                { name: 'Ops', val: 8 },
                { name: 'Finance', val: 5 },
                { name: 'Service', val: 24 },
                { name: 'Logistics', val: 8 }
              ]} 
              dataKey="val" 
              xKey="name" 
              height={250} 
              name="Employees" 
            />
         </div>
         <Card>
            <CardHeader>
               <CardTitle>Active Grievances</CardTitle>
               <CardDescription>Issues reported by field force and staff</CardDescription>
            </CardHeader>
            <div className="p-8 flex flex-col items-center justify-center text-center opacity-40">
               <RiAlertLine className="text-4xl mb-3" />
               <p className="text-xs font-bold uppercase tracking-widest">No critical issues reported</p>
            </div>
         </Card>
      </div>
    </div>
  );
}
