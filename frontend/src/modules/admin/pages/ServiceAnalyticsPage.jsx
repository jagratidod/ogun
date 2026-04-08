import { RiCustomerServiceLine, RiTimeLine, RiInformationLine, RiCheckDoubleLine, RiBarChartLine, RiPulseLine, RiPieChartLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, MetricCard, AreaChart, BarChart, PieChart, formatCurrency } from '../../../core';
import Button from '../../../core/components/ui/Button';

const closureTrend = [
  { "month": "Jan", "tickets": 142 },
  { "month": "Feb", "tickets": 156 },
  { "month": "Mar", "tickets": 182 },
  { "month": "Apr", "tickets": 168 }
];

export default function ServiceAnalyticsPage() {
  return (
    <div className="page-container">
      <PageHeader 
        title="Service Analytics" 
        subtitle="Tracking service performance, customer satisfaction, and technical efficiency"
      >
        <Button icon={RiInformationLine} variant="secondary">Download Q Report</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Average TAT" value="1.8 Days" icon={RiTimeLine} change={-12.5} changeLabel="improved" />
        <MetricCard title="Resolution Rate" value="94.2%" icon={RiCheckDoubleLine} change={2.1} />
        <MetricCard title="NPS Score" value="8.4" icon={RiPulseLine} change={4.5} />
        <MetricCard title="Service Revenue" value={4560000} format="currency" icon={RiBarChartLine} change={15.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="glass-card p-6">
            <h3 className="section-title mb-6">Service Ticket Closure Trend</h3>
            <AreaChart data={closureTrend} dataKey="tickets" xKey="month" name="Resolved" height={320} />
         </div>
         <div className="glass-card p-6">
            <h3 className="section-title mb-6">Complaint Distribution by Product</h3>
            <PieChart 
              data={[
                { name: 'Mixer Grinders', value: 450 },
                { name: 'Induction Cooktops', value: 320 },
                { name: 'Chimneys', value: 150 },
                { name: 'Water Purifiers', value: 210 },
                { name: 'Air Fryers', value: 85 }
              ]} 
              height={320} 
              innerRadius={70} 
              outerRadius={110} 
            />
         </div>
      </div>

      <Card>
         <CardHeader>
            <CardTitle>Technician Efficiency Rankings</CardTitle>
            <CardDescription>Top field engineers based on customer feedback and TAT</CardDescription>
         </CardHeader>
         <div className="p-6">
            <BarChart 
               data={[
                  { name: 'Ramesh Kumar', val: 98 },
                  { name: 'Suresh Pal', val: 94 },
                  { name: 'Karan Varma', val: 91 },
                  { name: 'Manoj Singh', val: 88 },
                  { name: 'Arjun Das', val: 85 }
               ]} 
               dataKey="val" 
               xKey="name" 
               height={300} 
               name="Efficiency Score" 
            />
         </div>
      </Card>
    </div>
  );
}
