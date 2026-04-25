import { useState, useEffect } from 'react';
import { RiCustomerServiceLine, RiTimeLine, RiInformationLine, RiCheckDoubleLine, RiBarChartLine, RiPulseLine, RiPieChartLine, RiLoader4Line } from 'react-icons/ri';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, MetricCard, AreaChart, BarChart, PieChart, formatCurrency } from '../../../core';
import Button from '../../../core/components/ui/Button';
import api from '../../../core/api';

export default function ServiceAnalyticsPage() {
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetchAnalytics();
   }, []);

   const fetchAnalytics = async () => {
      try {
         const res = await api.get('/admin/service/analytics');
         setData(res.data?.data);
      } catch (err) {
         console.error('Failed to fetch analytics:', err);
      } finally {
         setLoading(false);
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-[400px]">
            <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
         </div>
      );
   }

   const stats = data?.stats || {};
   const trendData = data?.trendData || [];
   const categoryDist = data?.categoryDist || [];
   const techPerformance = (data?.techPerformance || []).map(t => ({
      name: t.name,
      score: ((t.resolved / t.total) * 100).toFixed(0)
   }));

   return (
      <div className="page-container">
         <PageHeader 
            title="Service Analytics" 
            subtitle="Tracking service performance, customer satisfaction, and technical efficiency"
         >
            <Button icon={RiInformationLine} variant="secondary">Download Report</Button>
         </PageHeader>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard 
               title="Average TAT" 
               value={`${stats.avgResolutionTime || 0} Hrs`} 
               icon={RiTimeLine} 
               description="Avg. hours to resolve"
            />
            <MetricCard 
               title="Active Tickets" 
               value={stats.openRequests || 0} 
               icon={RiPulseLine} 
               description="Currently being handled"
            />
            <MetricCard 
               title="Resolution Rate" 
               value={`${((stats.resolvedRequests / stats.totalRequests) * 100 || 0).toFixed(1)}%`} 
               icon={RiCheckDoubleLine} 
               description="Success completion rate"
            />
            <MetricCard 
               title="Warranty Revenue" 
               value={stats.totalRevenue || 0} 
               format="currency" 
               icon={RiBarChartLine} 
               description="Total from extensions"
            />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
               <h3 className="section-title mb-6">Service Ticket Closure Trend</h3>
               <AreaChart 
                  data={trendData.length > 0 ? trendData : [{ date: 'No Data', tickets: 0 }]} 
                  dataKey="tickets" 
                  xKey="date" 
                  name="Tickets Raised" 
                  height={320} 
                  color="#328D8E"
               />
            </div>
            <div className="glass-card p-6">
               <h3 className="section-title mb-6">Complaint Distribution by Category</h3>
               <PieChart 
                  data={categoryDist.length > 0 ? categoryDist : [{ name: 'None', value: 1 }]} 
                  height={320} 
                  innerRadius={70} 
                  outerRadius={110} 
               />
            </div>
         </div>

         <Card>
            <CardHeader>
               <CardTitle>Technician Efficiency Rankings</CardTitle>
               <CardDescription>Performance of field engineers based on ticket resolution rate</CardDescription>
            </CardHeader>
            <div className="p-6">
               <BarChart 
                  data={techPerformance.length > 0 ? techPerformance : [{ name: 'Unassigned', score: 0 }]} 
                  dataKey="score" 
                  xKey="name" 
                  height={300} 
                  name="Resolution Rate (%)" 
                  color="#E0128A"
               />
            </div>
         </Card>
      </div>
   );
}
