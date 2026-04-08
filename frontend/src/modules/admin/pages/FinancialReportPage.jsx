import { RiBarChartLine, RiPieChartLine, RiDownloadLine, RiArrowUpLine, RiArrowDownLine, RiInformationLine, RiPulseLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, AreaChart, BarChart, PieChart, MetricCard, formatCurrency, Button } from '../../../core';
import accountsData from '../../../data/accounts.json';

const revenueExpenseTrend = [
  { "month": "Jan", "revenue": 8500000, "expense": 6200000 },
  { "month": "Feb", "revenue": 9200000, "expense": 6800000 },
  { "month": "Mar", "revenue": 10500000, "expense": 7100000 },
  { "month": "Apr", "revenue": 12560000, "expense": 8450000 }
];

export default function FinancialReportPage() {
  const { financials } = accountsData;

  return (
    <div className="page-container">
      <PageHeader 
        title="Financial Reports" 
        subtitle="Consolidated business performance, profit/loss, and budget tracking"
      >
        <Button icon={RiDownloadLine}>Download FY Report</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Monthly Revenue" value={financials.monthlyRevenue} format="currency" icon={RiPulseLine} change={15.4} />
        <MetricCard title="Monthly Expense" value={financials.monthlyExpense} format="currency" icon={RiBarChartLine} change={8.2} changeLabel="increased" />
        <MetricCard title="Net Profit" value={financials.netProfit} format="currency" icon={RiPieChartLine} change={24.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
           <h3 className="section-title mb-4">Revenue vs Expense Trend</h3>
           <AreaChart data={revenueExpenseTrend} dataKey="revenue" xKey="month" name="Revenue" height={320} />
        </div>
        <div className="glass-card p-5">
           <h3 className="section-title mb-4">Expense Breakdown</h3>
           <PieChart 
             data={[
               { name: 'Salary', value: 4500000 },
               { name: 'Rent', value: 1200000 },
               { name: 'Marketing', value: 850000 },
               { name: 'Ops', value: 1900000 }
             ]} 
             height={320} 
             innerRadius={65} 
             outerRadius={105} 
           />
        </div>
      </div>

      <Card>
        <CardHeader>
           <CardTitle>Profit & Loss Summary</CardTitle>
           <CardDescription>Fiscal year to date performance comparison</CardDescription>
        </CardHeader>
        <div className="p-6">
           <div className="space-y-4 max-w-2xl">
              {[
                 { label: 'Gross Revenue (Total Sales)', val: 42560000, type: 'plus' },
                 { label: 'Cost of Goods Sold (COGS)', val: 18450000, type: 'minus' },
                 { label: 'Gross Profit', val: 24110000, type: 'total' },
                 { label: 'Operating Expenses', val: 12450000, type: 'minus' },
                 { label: 'Marketing & Sales Spends', val: 3200000, type: 'minus' },
                 { label: 'Net Operating Income', val: 8460000, type: 'total' },
                 { label: 'Taxes & Compliance', val: 1522000, type: 'minus' },
                 { label: 'Net Result', val: 6938000, type: 'final' }
              ].map((row, idx) => (
                 <div key={idx} className={`flex items-center justify-between p-3 rounded-none ${
                    row.type === 'total' ? 'bg-surface-elevated font-semibold' : 
                    row.type === 'final' ? 'bg-brand-teal text-white font-bold' : 
                    'bg-surface-input/50'
                 }`}>
                    <span className="text-sm">{row.label}</span>
                    <span className={`text-sm ${
                       row.type === 'plus' ? 'text-state-success' : 
                       row.type === 'minus' ? 'text-state-danger text-opacity-80' : 
                       ''
                    }`}>
                       {row.type === 'minus' ? '-' : ''} {formatCurrency(row.val)}
                    </span>
                 </div>
              ))}
           </div>
        </div>
      </Card>
    </div>
  );
}
