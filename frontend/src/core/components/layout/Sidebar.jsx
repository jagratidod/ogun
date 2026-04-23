import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { classNames } from '../../utils/helpers';
import { useSidebarContext } from '../../context/SidebarContext';
import { APP_NAME, SUB_ROLES } from '../../utils/constants';
import { useAuthContext } from '../../context/AuthContext';
import {
  RiDashboardLine, RiShieldKeyholeLine, RiBox3Line, RiShoppingCartLine,
  RiMoneyDollarCircleLine, RiTeamLine, RiWalletLine, RiCalendarCheckLine,
  RiTrophyLine, RiTruckLine, RiStore2Line, RiUserLine,
  RiCustomerServiceLine, RiBarChartBoxLine, RiSettings3Line,
  RiImage2Line,
  RiArrowLeftSLine, RiArrowRightSLine, RiArrowDownSLine,
  RiMenuLine, RiCloseLine
} from 'react-icons/ri';

const adminNav = [
  { label: 'Dashboard', icon: RiDashboardLine, path: '/admin' },
  {
    label: 'Access Control', icon: RiShieldKeyholeLine, permission: 'rbac', children: [
      { label: 'Roles', path: '/admin/rbac/roles' },
      { label: 'Permissions', path: '/admin/rbac/permissions' },
      { label: 'Users', path: '/admin/rbac/users' },
    ],
  },
  {
    label: 'Inventory', icon: RiBox3Line, permission: 'inventory', children: [
      { label: 'Products', path: '/admin/inventory/products' },
      { label: 'Stock Overview', path: '/admin/inventory/stock' },
      { label: 'Stock Alerts', path: '/admin/inventory/alerts' },
    ],
  },
  {
    label: 'Orders', icon: RiShoppingCartLine, permission: 'orders', children: [
      { label: 'All Orders', path: '/admin/orders' },
      { label: 'Restock Requests', path: '/admin/orders/restock' },
      { label: 'Order Flow', path: '/admin/orders/flow' },
    ],
  },
  {
    label: 'Accounts', icon: RiMoneyDollarCircleLine, permission: 'accounts', children: [
      { label: 'Ledger', path: '/admin/accounts/ledger' },
      { label: 'Invoices', path: '/admin/accounts/invoices' },
      { label: 'Payments', path: '/admin/accounts/payments' },
      { label: 'Financial Report', path: '/admin/accounts/reports' },
    ],
  },
  {
    label: 'HR', icon: RiTeamLine, permission: 'hr', children: [
      { label: 'Employees', path: '/admin/hr/employees' },
      { label: 'Offer Letters', path: '/admin/hr/offer-letters' },
      { label: 'Departments', path: '/admin/hr/departments' },
    ],
  },
  {
    label: 'Payroll', icon: RiWalletLine, permission: 'payroll', children: [
      { label: 'Dashboard', path: '/admin/payroll' },
      { label: 'Process Salary', path: '/admin/payroll/process' },
      { label: 'Payslips', path: '/admin/payroll/payslips' },
      { label: 'Deductions', path: '/admin/payroll/deductions' },
    ],
  },
  {
    label: 'Leaves', icon: RiCalendarCheckLine, permission: 'leaves', children: [
      { label: 'Requests', path: '/admin/leaves' },
      { label: 'Calendar', path: '/admin/leaves/calendar' },
    ],
  },
  {
    label: 'Rewards', icon: RiTrophyLine, permission: 'rewards', children: [
      { label: 'Dashboard', path: '/admin/rewards' },
      { label: 'Target Config', path: '/admin/rewards/targets' },
      { label: 'Points History', path: '/admin/rewards/history' },
    ],
  },
  { label: 'Distributors', icon: RiTruckLine, path: '/admin/distributors', permission: 'distributors' },
  { label: 'Retailers', icon: RiStore2Line, path: '/admin/retailers', permission: 'retailers' },
  { label: 'Customers', icon: RiUserLine, path: '/admin/customers', permission: 'customers' },
  {
    label: 'Service', icon: RiCustomerServiceLine, permission: 'service', children: [
      { label: 'Requests', path: '/admin/service' },
      { label: 'Analytics', path: '/admin/service/analytics' },
    ],
  },
  {
    label: 'Content', icon: RiImage2Line, permission: 'content', children: [
      { label: 'Social Grid', path: '/admin/content/social-grid' },
    ],
  },
  { label: 'Reports', icon: RiBarChartBoxLine, path: '/admin/reports', permission: 'reports' },
  { label: 'Settings', icon: RiSettings3Line, path: '/admin/settings' },
];

const distributorNav = [
  { label: 'Dashboard', icon: RiDashboardLine, path: '/distributor' },
  { label: 'Marketplace', icon: RiStore2Line, path: '/distributor/marketplace' },
  { label: 'My Stock', icon: RiBox3Line, path: '/distributor/stock' },
  {
    label: 'Orders', icon: RiShoppingCartLine, children: [
      { label: 'My Orders', path: '/distributor/my-orders' },
      { label: 'Retailer Requests', path: '/distributor/orders' },
      { label: 'History', path: '/distributor/orders/history' },
    ],
  },
  { label: 'My Retailers', icon: RiUserLine, path: '/distributor/retailers' },
  {
    label: 'Accounts', icon: RiMoneyDollarCircleLine, children: [
      { label: 'Ledger', path: '/distributor/accounts' },
      { label: 'Payments', path: '/distributor/accounts/payments' },
    ],
  },
  { label: 'Rewards', icon: RiTrophyLine, path: '/distributor/rewards' },
  { label: 'Analytics', icon: RiBarChartBoxLine, path: '/distributor/analytics' },
  { label: 'Settings', icon: RiSettings3Line, path: '/distributor/settings' },
];

export function getNavItems(role, subRole, permissions) {
  if (role === 'admin') {
    if (subRole === SUB_ROLES.SUPER_ADMIN) return adminNav;
    return adminNav.filter(item => {
      // If no permission is required (e.g., Dashboard, Settings), show it
      if (!item.permission) return true;
      // Otherwise check if it's in the user's permissions
      return (permissions || []).includes(item.permission);
    });
  }
  if (role === 'distributor') return distributorNav;
  return [];
}

function NavItem({ item, isCollapsed }) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const isActive = hasChildren
    ? item.children.some((c) => location.pathname === c.path)
    : location.pathname === item.path;

  if (hasChildren) {
    const isOpen = isExpanded || isActive;
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isOpen)}
          className={classNames(
            'nav-item w-full',
            isActive && 'text-brand-teal'
          )}
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <RiArrowDownSLine className={classNames('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180')} />
            </>
          )}
        </button>
        {isOpen && !isCollapsed && (
          <div className="ml-8 mt-1 space-y-0.5 animate-slide-down">
            {item.children.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                className={({ isActive: active }) => classNames(
                  'block px-3 py-2 text-sm rounded-none transition-colors duration-200',
                  active ? 'text-brand-teal bg-brand-teal/10' : 'text-content-secondary hover:text-content-primary hover:bg-surface-hover'
                )}
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      end={item.path === '/admin' || item.path === '/distributor'}
      className={({ isActive: active }) => classNames(
        'nav-item',
        active && 'nav-item-active'
      )}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export default function Sidebar({ role = 'admin' }) {
  const { user } = useAuthContext();
  const { isCollapsed, toggle, isMobileOpen, closeMobile } = useSidebarContext();
  const navItems = getNavItems(user?.role, user?.subRole, user?.permissions);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeMobile} />
      )}

      <aside className={classNames(
        'glass-sidebar flex flex-col h-screen sticky top-0 z-50 transition-all duration-300',
        isCollapsed ? 'w-[72px]' : 'w-[260px]',
        'hidden lg:flex',
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="OGUN" className="w-8 h-8 object-contain" />
              <span className="font-bold text-content-primary">{APP_NAME}</span>
            </div>
          )}
          <button onClick={toggle} className="p-1.5 rounded-none text-content-tertiary hover:bg-surface-hover hover:text-content-primary transition-colors">
            {isCollapsed ? <RiArrowRightSLine className="w-5 h-5" /> : <RiArrowLeftSLine className="w-5 h-5" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {navItems.map((item, idx) => (
            <NavItem key={item.label + idx} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-border space-y-3">
            <div className="flex flex-col items-center gap-1.5">
               <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest bg-brand-teal/5 px-3 py-1 border border-brand-teal/20">
                 {user?.subRole ? user.subRole.replace('_', ' ') : user?.role || 'Guest'}
               </span>
            </div>
            <p className="text-xs text-content-tertiary text-center">© 2026 OGUN CRM</p>
          </div>
        )}
      </aside>

      {/* Mobile sidebar */}
      <aside className={classNames(
        'fixed inset-y-0 left-0 z-50 w-[260px] glass-sidebar flex flex-col transition-transform duration-300 lg:hidden',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="OGUN" className="w-8 h-8 object-contain" />
            <span className="font-bold text-content-primary">{APP_NAME}</span>
          </div>
          <button onClick={closeMobile} className="p-1.5 rounded-none text-content-tertiary hover:bg-surface-hover">
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {navItems.map((item, idx) => (
            <NavItem key={item.label + idx} item={item} isCollapsed={false} />
          ))}
        </nav>
      </aside>
    </>
  );
}
