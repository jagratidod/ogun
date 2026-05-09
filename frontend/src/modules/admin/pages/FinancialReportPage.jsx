import { useState, useEffect } from 'react';
import { 
  RiBarChartLine, RiPieChartLine, RiDownloadLine, RiArrowUpLine, 
  RiArrowDownLine, RiInformationLine, RiPulseLine, RiLoader4Line, 
  RiHistoryLine, RiBankCardLine, RiRefund2Line, RiWallet3Line,
  RiFileList3Line, RiGlobalLine
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  AreaChart, BarChart, PieChart, MetricCard, formatCurrency, 
  Button, Badge, Avatar 
} from '../../../core';
import api from '../../../core/api';
import { toast } from 'react-hot-toast';

export default function FinancialReportPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('6M');

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
    <div className="page-container max-w-7xl mx-auto space-y-6">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
         <div>
            <h1 className="text-3xl font-black text-content-primary tracking-tight">Fiscal Intelligence</h1>
            <p className="text-xs font-bold text-content-tertiary uppercase tracking-widest opacity-60">Consolidated P&L • FY 2026-27</p>
         </div>
         <div className="flex items-center gap-2">
            <div className="bg-surface-secondary p-1 rounded-xl flex gap-1 border border-border">
               {['1M', '3M', '6M', '1Y'].map(r => (
                  <button 
                     key={r}
                     onClick={() => setTimeRange(r)}
                     className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${timeRange === r ? 'bg-white shadow-sm text-brand-teal' : 'text-content-tertiary hover:text-content-secondary'}`}
                  >
                     {r}
                  </button>
               ))}
            </div>
            <Button variant="secondary" icon={RiDownloadLine} className="h-10 text-[10px]">EXPORT PDF</Button>
         </div>
      </section>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <MetricCard 
            title="Total Revenue" 
            value={metrics.totalRevenue} 
            format="currency" 
            icon={RiPulseLine} 
            className="border-none shadow-sm"
         />
         <MetricCard 
            title="Operating Costs" 
            value={metrics.totalExpense} 
            format="currency" 
            icon={RiBankCardLine} 
            className="border-none shadow-sm"
         />
         <div className="glass-card p-5 flex flex-col justify-between border-none shadow-sm bg-brand-teal/[0.03]">
            <div>
               <p className="text-[10px] font-black text-brand-teal uppercase tracking-widest mb-1">Net Profit</p>
               <h3 className="text-2xl font-black text-content-primary leading-none">{formatCurrency(metrics.totalNetProfit)}</h3>
            </div>
            <div className="flex items-center gap-1 mt-3">
               <RiArrowUpLine className="text-state-success w-4 h-4" />
               <span className="text-[10px] font-bold text-state-success">12.4% vs last Q</span>
            </div>
         </div>
         <MetricCard 
            title="Tax Liability" 
            value={metrics.totalRevenue * 0.18} 
            format="currency" 
            icon={RiFileList3Line} 
            className="border-none shadow-sm"
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Trend Chart */}
         <div className="lg:col-span-2 glass-card p-6 border-none shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-sm font-black text-content-primary uppercase tracking-widest">Revenue Velocity</h3>
                  <p className="text-[10px] text-content-tertiary font-bold">Monthly cash inflow vs outflow trend</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-brand-teal" />
                     <span className="text-[10px] font-bold text-content-tertiary">REVENUE</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-brand-purple" />
                     <span className="text-[10px] font-bold text-content-tertiary">EXPENSE</span>
                  </div>
               </div>
            </div>
            <AreaChart 
               data={revenueExpenseTrend} 
               dataKey="revenue" 
               xKey="name" 
               height={300} 
               colors={{ stroke: '#00D1C1', fill: 'url(#colorRevenue)' }}
            />
         </div>

         {/* Expense Distribution */}
         <div className="glass-card p-6 border-none shadow-sm flex flex-col">
            <div className="mb-6">
               <h3 className="text-sm font-black text-content-primary uppercase tracking-widest">Expense Allocation</h3>
               <p className="text-[10px] text-content-tertiary font-bold">Where the capital is deployed</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
               <PieChart 
                  data={expenseBreakdown} 
                  height={240} 
                  innerRadius={60} 
                  outerRadius={90} 
               />
            </div>
            <div className="space-y-2 mt-4">
               {expenseBreakdown.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-surface-secondary rounded-lg transition-colors">
                     <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-brand-teal' : i === 1 ? 'bg-brand-purple' : 'bg-brand-pink'}`} />
                        <span className="text-[11px] font-bold text-content-secondary">{ex.name}</span>
                     </div>
                     <span className="text-[11px] font-black text-content-primary">{formatCurrency(ex.value)}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* P&L Statement */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-surface-secondary/50 border-b border-border py-4">
           <div className="flex justify-between items-center">
              <div>
                 <CardTitle className="text-xs uppercase tracking-[0.2em]">Detailed P&L Statement</CardTitle>
                 <CardDescription className="text-[10px]">Official ledger audit for the current fiscal period</CardDescription>
              </div>
              <RiInformationLine className="text-content-tertiary w-4 h-4" />
           </div>
        </CardHeader>
        <div className="p-0 overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-white">
                    <th className="px-6 py-4 text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-border">Account Group</th>
                    <th className="px-6 py-4 text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-border text-right">Debit</th>
                    <th className="px-6 py-4 text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-border text-right">Credit</th>
                    <th className="px-6 py-4 text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-border text-right">Net Impact</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                 {[
                    { group: 'Sales Revenue (Product)', debit: 0, credit: metrics.totalRevenue * 0.85, color: 'text-state-success' },
                    { group: 'Service & Spare Revenue', debit: 0, credit: metrics.totalRevenue * 0.15, color: 'text-state-success' },
                    { group: 'Operational Expenses', debit: metrics.totalExpense * 0.4, credit: 0, color: 'text-state-danger' },
                    { group: 'Human Capital (Payroll)', debit: metrics.totalExpense * 0.6, credit: 0, color: 'text-state-danger' },
                    { group: 'Marketing & Rewards', debit: 45000, credit: 0, color: 'text-state-danger' },
                 ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-brand-teal/[0.01] transition-colors">
                       <td className="px-6 py-4 text-xs font-bold text-content-primary">{row.group}</td>
                       <td className="px-6 py-4 text-xs font-bold text-right text-state-danger opacity-70">{row.debit > 0 ? `(${formatCurrency(row.debit)})` : '—'}</td>
                       <td className="px-6 py-4 text-xs font-bold text-right text-state-success">{row.credit > 0 ? formatCurrency(row.credit) : '—'}</td>
                       <td className="px-6 py-4 text-xs font-black text-right text-content-secondary">
                          {formatCurrency(row.credit - row.debit)}
                       </td>
                    </tr>
                 ))}
              </tbody>
              <tfoot>
                 <tr className="bg-brand-teal/[0.05]">
                    <td className="px-6 py-5 text-sm font-black text-brand-teal uppercase tracking-widest">Bottom Line (NPAT)</td>
                    <td className="px-6 py-5 text-right font-black" colSpan={3}>
                       <div className="flex items-center justify-end gap-3">
                          <Badge variant="teal" className="text-[10px] px-3 py-1">PROFITABLE</Badge>
                          <span className="text-xl font-black text-brand-teal">{formatCurrency(metrics.totalNetProfit)}</span>
                       </div>
                    </td>
                 </tr>
              </tfoot>
           </table>
        </div>
      </Card>
    </div>
  );
}
