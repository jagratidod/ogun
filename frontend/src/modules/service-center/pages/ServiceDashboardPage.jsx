import { RiCustomerServiceLine, RiToolsLine, RiTimerLine, RiCheckDoubleLine, RiAlertLine, RiUserSettingsLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, MetricCard, AreaChart, BarChart, DataTable, Badge, Button, Avatar } from '../../../core';
import serviceData from '../../../data/service.json';

const ticketResolutionTrend = [
  { "day": "Mon", "resolved": 12, "open": 4 },
  { "day": "Tue", "resolved": 15, "open": 2 },
  { "day": "Wed", "resolved": 10, "open": 7 },
  { "day": "Thu", "resolved": 18, "open": 3 },
  { "day": "Fri", "resolved": 22, "open": 1 }
];

export default function ServiceDashboardPage() {
  const openTickets = serviceData.filter(t => t.status !== 'Closed').length;
  const unassignedTickets = serviceData.filter(t => !t.technician).length;

  return (
    <div className="page-container">
      <PageHeader
        title="Dispatch Center"
        subtitle="Real-time field service monitoring and technician dispatch"
      >
        <div className="flex gap-3">
          <Button variant="secondary" icon={RiToolsLine}>Inventory</Button>
          <Button icon={RiCustomerServiceLine}>New Ticket</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Active Tickets" value={openTickets} icon={RiCustomerServiceLine} change={-2} />
        <MetricCard title="Unassigned" value={unassignedTickets} icon={RiAlertLine} variant={unassignedTickets > 0 ? 'danger' : 'default'} />
        <MetricCard title="Avg Resolution" value="4.2 Hrs" icon={RiTimerLine} />
        <MetricCard title="Field Experts" value="8 Active" icon={RiUserSettingsLine} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="section-title mb-4">Resolution Velocity</h3>
          <AreaChart data={ticketResolutionTrend} dataKey="resolved" xKey="day" name="Tickets Resolved" height={320} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Priority Inbound</CardTitle>
            <CardDescription>Critical tickets requiring immediate dispatch</CardDescription>
          </CardHeader>
          <div className="p-4 space-y-4">
            {serviceData.filter(t => t.priority === 'High').slice(0, 4).map((ticket, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-none bg-surface-input/50 border border-border">
                <div className="w-10 h-10 rounded-none bg-surface-primary flex items-center justify-center flex-shrink-0 text-state-danger border border-border">
                  <RiAlertLine className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-content-primary truncate">{ticket.id} · {ticket.customer}</p>
                  <p className="text-[10px] text-content-tertiary font-bold uppercase">{ticket.product}</p>
                </div>
                <Badge size="xs" variant="danger">HIGH</Badge>
              </div>
            ))}
            <Button className="w-full mt-2" variant="ghost" size="sm">Open Ticket Board</Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="section-title mb-6">Expert Load Distribution</h3>
          <BarChart
            data={[
              { name: 'Ramesh', val: 3 },
              { name: 'Anil', val: 5 },
              { name: 'Suresh', val: 2 },
              { name: 'Karan', val: 4 },
              { name: 'Sunil', val: 1 }
            ]}
            dataKey="val"
            xKey="name"
            height={250}
            name="Active Tickets"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>SLA Compliance</CardTitle>
            <CardDescription>Tickets within resolution time window</CardDescription>
          </CardHeader>
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="text-4xl font-black text-brand-magenta mb-2">94.2%</div>
            <p className="text-[10px] font-black text-content-tertiary uppercase tracking-widest">Global Service Health</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
