import { RiMoneyDollarBoxLine, RiCheckDoubleLine, RiTimeLine, RiAlertLine, RiHistoryLine, RiBarChartLine, RiHandCoinLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, MetricCard, AreaChart, BarChart, DataTable, Badge, Button, formatCurrency } from '../../../core';
import hrData from '../../../data/hr.json';

const payrollHistoryTrend = [
  { "month": "Jan", "payout": 4250000, "deductions": 210000 },
  { "month": "Feb", "payout": 4380000, "deductions": 225000 },
  { "month": "Mar", "payout": 4410000, "deductions": 230000 },
  { "month": "Apr", "payout": 4560000, "deductions": 245000 }
];

export default function PayrollDashboardPage() {
  const { payrollSummary } = hrData;

  return (
    <div className="page-container">
      <PageHeader 
        title="Payroll Command Center" 
        subtitle="Manage salary disbursements, statutory compliance, and overheads"
      >
        <Button icon={RiMoneyDollarBoxLine}>Initiate Payout</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Monthly Payable" value={payrollSummary.totalMonthlyPayable} format="currency" icon={RiHandCoinLine} change={2.1} />
        <MetricCard title="Total Deductions" value={payrollSummary.deductionsTotal} format="currency" icon={RiAlertLine} />
        <MetricCard title="Bonuses Issued" value={payrollSummary.bonusesTotal} format="currency" icon={RiBarChartLine} />
        <MetricCard title="Last Payout Date" value={payrollSummary.lastPaidDate} icon={RiTimeLine} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         <div className="lg:col-span-2 glass-card p-5">
            <h3 className="section-title mb-4">Payroll Disbursement History</h3>
            <AreaChart data={payrollHistoryTrend} dataKey="payout" xKey="month" name="Payout" height={320} />
         </div>
         <Card>
            <CardHeader>
               <CardTitle>Upcoming Milestones</CardTitle>
               <CardDescription>Major milestones in the current pay cycle</CardDescription>
            </CardHeader>
            <div className="p-4 space-y-4">
               {[
                 { label: 'Attendance Lock', date: '25th Apr', status: 'pending' },
                 { label: 'Leave Deductions', date: '28th Apr', status: 'pending' },
                 { label: 'Salary Generation', date: '30th Apr', status: 'pending' },
                 { label: 'Bank Disbursement', date: '01st May', status: 'pending' }
               ].map((step, idx) => (
                 <div key={idx} className="flex items-center gap-3 p-3 rounded-none bg-surface-input/50 border border-border">
                    <div className="w-10 h-10 rounded-none bg-surface-primary flex items-center justify-center flex-shrink-0">
                       <RiCheckDoubleLine className="text-content-tertiary" />
                    </div>
                    <div>
                       <p className="text-sm font-semibold text-content-primary">{step.label}</p>
                       <p className="text-xs text-content-tertiary font-bold">{step.date}</p>
                    </div>
                 </div>
               ))}
               <Button className="w-full mt-2" variant="secondary" icon={RiHistoryLine}>View All Cycles</Button>
            </div>
         </Card>
      </div>

      <div className="glass-card p-5">
         <h3 className="section-title mb-6">Salary Breakdown by Cluster</h3>
         <BarChart 
           data={[
             { name: 'Management', val: 560000 },
             { name: 'Sales', val: 1250000 },
             { name: 'Finance', val: 480000 },
             { name: 'Service', val: 1850000 },
             { name: 'Ops', val: 420000 }
           ]} 
           dataKey="val" 
           xKey="name" 
           layout="horizontal" 
           height={300} 
           name="Amount" 
         />
      </div>
    </div>
  );
}
