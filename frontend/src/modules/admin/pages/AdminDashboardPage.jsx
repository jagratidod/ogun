import { useNavigate } from 'react-router-dom';
import {
  RiShoppingCartLine, RiMoneyDollarCircleLine, RiTruckLine, RiStore2Line,
  RiAlertLine, RiCustomerServiceLine, RiArrowRightLine, RiTimeLine,
  RiCheckboxCircleLine, RiErrorWarningLine, RiUserAddLine, RiTrophyLine,
  RiGroupLine, RiCalendarLine, RiWalletLine
} from 'react-icons/ri';
import MetricCard from '../../../core/components/charts/MetricCard';
import AreaChartComponent from '../../../core/components/charts/AreaChart';
import BarChartComponent from '../../../core/components/charts/BarChart';
import PieChartComponent from '../../../core/components/charts/PieChart';
import Badge from '../../../core/components/ui/Badge';
import Button from '../../../core/components/ui/Button';
import PageHeader from '../../../core/components/layout/PageHeader';
import { formatCurrency, formatRelativeTime } from '../../../core/utils/formatters';
import { usePermissions } from '../../../core';
import dashboardData from '../../../data/adminDashboard.json';

const { metrics, salesTrend, topDistributors, topRetailers, salesByCategory, recentActivity, lowStockAlerts, pendingRequests } = dashboardData;

const activityIcons = {
  order: RiShoppingCartLine,
  restock: RiTruckLine,
  service: RiCustomerServiceLine,
  stock: RiAlertLine,
  payment: RiMoneyDollarCircleLine,
  hr: RiUserAddLine,
  reward: RiTrophyLine,
};

const activityColors = {
  placed: 'text-state-info',
  approved: 'text-state-success',
  assigned: 'text-brand-teal',
  warning: 'text-state-warning',
  completed: 'text-state-success',
  active: 'text-state-success',
  closed: 'text-content-tertiary',
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { canAccess, isSuperAdmin, user } = usePermissions();

  return (
    <div className="page-container">
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name || 'Admin'}. Here's your business overview.`}
      >
        {canAccess('accounts') && (
          <Button icon={RiArrowRightLine} onClick={() => navigate('/admin/accounts/reports')}>Financial Pulse</Button>
        )}
      </PageHeader>

      {/* ── Metric Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(canAccess('orders') || canAccess('accounts')) && (
          <div className="cursor-pointer" onClick={() => navigate('/admin/orders')}>
            <MetricCard
              title="Today's Sales"
              value={metrics.totalSalesToday.value}
              change={metrics.totalSalesToday.change}
              format="currency"
              icon={RiMoneyDollarCircleLine}
            />
          </div>
        )}
        {canAccess('orders') && (
          <div className="cursor-pointer" onClick={() => navigate('/admin/orders')}>
            <MetricCard
              title="Total Orders"
              value={metrics.totalOrders.value}
              change={metrics.totalOrders.change}
              icon={RiShoppingCartLine}
            />
          </div>
        )}
        {canAccess('distributors') && (
          <div className="cursor-pointer" onClick={() => navigate('/admin/distributors')}>
            <MetricCard
              title="Active Distributors"
              value={metrics.activeDistributors.value}
              change={metrics.activeDistributors.change}
              icon={RiTruckLine}
            />
          </div>
        )}
        {canAccess('retailers') && (
          <div className="cursor-pointer" onClick={() => navigate('/admin/retailers')}>
            <MetricCard
              title="Active Retailers"
              value={metrics.activeRetailers.value}
              change={metrics.activeRetailers.change}
              icon={RiStore2Line}
            />
          </div>
        )}
        {/* HR Metrics for HR Managers */}
        {canAccess('hr') && !isSuperAdmin && (
          <>
            <div className="cursor-pointer" onClick={() => navigate('/admin/hr/employees')}>
              <MetricCard
                title="Total Employees"
                value="452"
                change="+12"
                icon={RiGroupLine}
              />
            </div>
            <div className="cursor-pointer" onClick={() => navigate('/admin/leaves')}>
              <MetricCard
                title="On Leave Today"
                value="14"
                change="-2"
                icon={RiCalendarLine}
              />
            </div>
          </>
        )}
        {canAccess('payroll') && !isSuperAdmin && (
          <div className="cursor-pointer" onClick={() => navigate('/admin/payroll')}>
            <MetricCard
              title="Payroll Disbursed"
              value="84.2"
              format="percentage"
              icon={RiWalletLine}
            />
          </div>
        )}
      </div>

      {/* ── Charts Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Trend */}
        {(canAccess('reports') || canAccess('orders')) && (
          <div className="lg:col-span-2 glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="section-title">Sales Trend</h3>
                <p className="text-sm text-content-secondary mt-0.5">Last 12 months revenue</p>
              </div>
              <span className="text-sm font-semibold text-brand-teal">{formatCurrency(metrics.totalSalesMonth.value)} this month</span>
            </div>
            <AreaChartComponent data={salesTrend} dataKey="sales" xKey="month" name="Revenue" height={280} />
          </div>
        )}

        {/* Sales by Category */}
        {canAccess('inventory') && (
          <div className="glass-card p-5">
            <h3 className="section-title mb-4">Sales by Category</h3>
            <PieChartComponent data={salesByCategory} height={280} innerRadius={55} outerRadius={90} />
          </div>
        )}
      </div>

      {/* ── Top Performers ─────────────────────────────────── */}
      {(canAccess('distributors') || canAccess('retailers')) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Distributors */}
          {canAccess('distributors') && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">Top Distributors</h3>
                <button 
                  onClick={() => navigate('/admin/distributors')}
                  className="text-sm text-brand-teal hover:text-brand-teal-light flex items-center gap-1 transition-colors"
                >
                  View all <RiArrowRightLine className="w-4 h-4" />
                </button>
              </div>
              <BarChartComponent data={topDistributors} dataKey="sales" xKey="name" layout="horizontal" height={250} name="Sales" />
            </div>
          )}

          {/* Top Retailers */}
          {canAccess('retailers') && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">Top Retailers</h3>
                <button 
                  onClick={() => navigate('/admin/retailers')}
                  className="text-sm text-brand-teal hover:text-brand-teal-light flex items-center gap-1 transition-colors"
                >
                  View all <RiArrowRightLine className="w-4 h-4" />
                </button>
              </div>
              <BarChartComponent data={topRetailers} dataKey="sales" xKey="name" layout="horizontal" height={250} color="#E0128A" name="Sales" />
            </div>
          )}
        </div>
      )}

      {/* ── Bottom Row: Activity, Alerts, Requests ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity - Accessible to all but filtered by content later maybe */}
        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-[380px] overflow-y-auto scrollbar-hide">
            {recentActivity
              .filter(item => isSuperAdmin || canAccess(item.type))
              .map((item) => {
                const Icon = activityIcons[item.type] || RiTimeLine;
                return (
                  <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-none hover:bg-surface-hover/50 transition-colors">
                    <div className={`w-8 h-8 rounded-none flex items-center justify-center flex-shrink-0 bg-surface-input ${activityColors[item.status] || 'text-content-secondary'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-content-primary leading-snug">{item.message}</p>
                      <p className="text-xs text-content-tertiary mt-0.5">{formatRelativeTime(item.time)}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Low Stock Alerts */}
        {canAccess('inventory') && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Low Stock Alerts</h3>
              <span className="badge-danger">{lowStockAlerts.length} items</span>
            </div>
            <div className="space-y-3">
              {lowStockAlerts.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-none bg-surface-input/50 border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-content-primary">{item.name}</p>
                    <p className="text-xs text-content-tertiary">{item.sku} · {item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${item.stock <= 5 ? 'text-state-danger' : 'text-state-warning'}`}>
                      {item.stock} left
                    </p>
                    <p className="text-xs text-content-tertiary">min: {item.minStock}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Requests */}
        {canAccess('orders') && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Pending Requests</h3>
              <span className="badge-warning">{pendingRequests.filter(r => r.status === 'requested').length} pending</span>
            </div>
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-none bg-surface-input/50 border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-content-primary">{req.id}</p>
                    <p className="text-xs text-content-tertiary">{req.retailer} · {req.items} items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-content-primary">{formatCurrency(req.total)}</p>
                    <Badge status={req.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
