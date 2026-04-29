import { useState, useEffect } from 'react';
import { RiBarChartLine, RiPieChartLine, RiDownloadLine, RiArrowUpLine, RiArrowDownLine, RiInformationLine, RiPulseLine, RiLoader4Line, RiHistoryLine } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, AreaChart, BarChart, PieChart, MetricCard, formatCurrency, Button } from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function FinancialReportPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/accounts/financial-report');
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch financial report');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
      </div>
    );
  }

  const { metrics, revenueExpenseTrend, expenseBreakdown } = data;

  return (
    <div className="page-container">
      <PageHeader 
        title="Financial Reports" 
        subtitle="Consolidated business performance, profit/loss, and budget tracking"
      >
        <div className="flex gap-2">
            <Button variant="secondary" icon={RiHistoryLine} onClick={fetchReport}>Refresh</Button>
            <Button icon={RiDownloadLine}>Download FY Report</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Monthly Revenue" value={metrics.monthlyRevenue} format="currency" icon={RiPulseLine} />
        <MetricCard title="Monthly Expense" value={metrics.monthlyExpense} format="currency" icon={RiBarChartLine} changeLabel="increased" />
        <MetricCard title="Net Profit" value={metrics.netProfit} format="currency" icon={RiPieChartLine} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
           <h3 className="section-title mb-4">Revenue vs Expense Trend</h3>
           <AreaChart data={revenueExpenseTrend} dataKey="revenue" xKey="name" name="Revenue" height={320} />
        </div>
        <div className="glass-card p-5">
           <h3 className="section-title mb-4">Expense Breakdown</h3>
           <PieChart 
             data={expenseBreakdown} 
             height={320} 
             innerRadius={65} 
             outerRadius={105} 
           />
        </div>
      </div>

      <Card>
        <CardHeader>
           <CardTitle>Profit & Loss Summary (All Time)</CardTitle>
           <CardDescription>Overall performance comparison</CardDescription>
        </CardHeader>
        <div className="p-6">
           <div className="space-y-4 max-w-2xl">
              {[
                 { label: 'Gross Revenue (Total Sales)', val: metrics.totalRevenue, type: 'plus' },
                 { label: 'Operating Expenses (Inc. Payroll)', val: metrics.totalExpense, type: 'minus' },
                 { label: 'Net Profit', val: metrics.totalNetProfit, type: 'final' }
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
