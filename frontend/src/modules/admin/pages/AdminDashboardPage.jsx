import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiShoppingCartLine, RiMoneyDollarCircleLine, RiTruckLine, RiStore2Line,
  RiAlertLine, RiCustomerServiceLine, RiArrowRightLine, RiTimeLine,
  RiUserAddLine, RiGroupLine, RiLoader4Line, RiToolsLine
} from 'react-icons/ri';
import MetricCard from '../../../core/components/charts/MetricCard';
import AreaChartComponent from '../../../core/components/charts/AreaChart';
import BarChartComponent from '../../../core/components/charts/BarChart';
import Badge from '../../../core/components/ui/Badge';
import Button from '../../../core/components/ui/Button';
import PageHeader from '../../../core/components/layout/PageHeader';
import { formatCurrency, formatRelativeTime } from '../../../core/utils/formatters';
import { usePermissions } from '../../../core';
import api from '../../../core/api';

const activityIcons = {
  order: RiShoppingCartLine,
  service: RiCustomerServiceLine,
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { canAccess, isSuperAdmin, user } = usePermissions();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="w-10 h-10 text-brand-teal animate-spin" />
      </div>
    );
  }

  const m = data?.metrics || {};
  const salesTrend = data?.salesTrend || [];
  const topDistributors = data?.topDistributors || [];
  const topRetailers = data?.topRetailers || [];
  const lowStockAlerts = data?.lowStockAlerts || [];
  const pendingRequests = data?.pendingRequests || [];
  const recentActivity = data?.recentActivity || [];

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {(canAccess('orders') || canAccess('accounts')) && (
          <div className="cursor-pointer" onClick={() => navigate('/admin/orders')}>
            <MetricCard title="Today's Revenue" value={m.todayRevenue ?? 0} format="currency" icon={RiMoneyDollarCircleLine} />
          </div>
        )}
        {canAccess('orders') && (
          <div className="cursor-pointer" onClick={() => navigate('/admin/orders')}>
            <MetricCard title="Total Orders" value={m.totalOrders ?? 0} icon={RiShoppingCartLine} />
          </div>
        )}
        {canAccess('distributors') && (
          <div className="cursor-pointer" onClick={() => navigate('/admin/distributors')}>
            <MetricCard title="Active Distributors" value={m.activeDistributors ?? 0} icon={RiTruckLine} />
          </div>
        )}
        {canAccess('retailers') && (
          <div className="cursor-pointer" onClick={() => navigate('/admin/retailers')}>
            <MetricCard title="Active Retailers" value={m.activeRetailers ?? 0} icon={RiStore2Line} />
          </div>
        )}
        {canAccess('customers') && (
          <div className="cursor-pointer" onClick={() => navigate('/admin/customers')}>
            <MetricCard title="Total Customers" value={m.totalCustomers ?? 0} icon={RiGroupLine} />
          </div>
        )}
        {canAccess('service') && (
          <div className="cursor-pointer" onClick={() => navigate('/admin/service')}>
            <MetricCard
              title="Open Service Tickets"
              value={m.openServiceRequests ?? 0}
              icon={RiCustomerServiceLine}
              variant={m.openServiceRequests > 0 ? 'warning' : 'default'}
            />
          </div>
        )}
        {canAccess('service') && m.pendingTechnicians > 0 && (
          <div className="cursor-pointer" onClick={() => navigate('/admin/technicians')}>
            <MetricCard
              title="Pending Technicians"
              value={m.pendingTechnicians}
              icon={RiToolsLine}
              variant="danger"
            />
          </div>
        )}
      </div>

      {/* ── Sales Trend ─────────────────────────────────────── */}
      {(canAccess('reports') || canAccess('orders')) && salesTrend.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title">Sales Trend</h3>
              <p className="text-sm text-content-secondary mt-0.5">Last 6 months revenue</p>
            </div>
            <span className="text-sm font-semibold text-brand-teal">{formatCurrency(m.monthRevenue ?? 0)} this month</span>
          </div>
          <AreaChartComponent data={salesTrend} dataKey="sales" xKey="month" name="Revenue" height={260} />
        </div>
      )}

      {/* ── Top Performers ─────────────────────────────────── */}
      {(canAccess('distributors') || canAccess('retailers')) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {canAccess('distributors') && topDistributors.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">Top Distributors</h3>
                <button onClick={() => navigate('/admin/distributors')} className="text-sm text-brand-teal flex items-center gap-1">
                  View all <RiArrowRightLine className="w-4 h-4" />
                </button>
              </div>
              <BarChartComponent data={topDistributors} dataKey="sales" xKey="name" layout="horizontal" height={220} name="Sales" />
            </div>
          )}
          {canAccess('retailers') && topRetailers.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">Top Retailers</h3>
                <button onClick={() => navigate('/admin/retailers')} className="text-sm text-brand-teal flex items-center gap-1">
                  View all <RiArrowRightLine className="w-4 h-4" />
                </button>
              </div>
              <BarChartComponent data={topRetailers} dataKey="sales" xKey="name" layout="horizontal" height={220} color="#E0128A" name="Sales" />
            </div>
          )}
        </div>
      )}

      {/* ── Bottom Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Activity */}
        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-content-tertiary italic text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto scrollbar-hide">
              {recentActivity.map((item) => {
                const Icon = activityIcons[item.type] || RiTimeLine;
                return (
                  <div key={item.id} className="flex items-start gap-3 p-2.5 hover:bg-surface-hover/50 transition-colors">
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-surface-input text-content-secondary">
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
          )}
        </div>

        {/* Low Stock Alerts */}
        {canAccess('inventory') && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Low Stock Alerts</h3>
              {lowStockAlerts.length > 0 && (
                <span className="badge-danger">{lowStockAlerts.length} items</span>
              )}
            </div>
            {lowStockAlerts.length === 0 ? (
              <p className="text-sm text-content-tertiary italic text-center py-8">All stock levels healthy</p>
            ) : (
              <div className="space-y-3">
                {lowStockAlerts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-surface-input/50 border border-border/50">
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
            )}
          </div>
        )}

        {/* Pending Orders */}
        {canAccess('orders') && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Pending Orders</h3>
              {pendingRequests.length > 0 && (
                <span className="badge-warning">{pendingRequests.length} pending</span>
              )}
            </div>
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-content-tertiary italic text-center py-8">No pending orders</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-surface-input/50 border border-border/50">
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
