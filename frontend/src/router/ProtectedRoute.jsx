import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../core/context/AuthContext';
import { SUB_ROLES } from '../core/utils/constants';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-brand-teal border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Determine where to redirect based on the intended destination
    const path = location.pathname;
    if (path.startsWith('/admin')) return <Navigate to="/admin/login" replace />;
    if (path.startsWith('/distributor')) return <Navigate to="/distributor/login" replace />;
    if (path.startsWith('/retailer')) return <Navigate to="/retailer/login" replace />;
    if (path.startsWith('/customer')) return <Navigate to="/customer/login" replace />;
    return <Navigate to="/login" replace />;
  }

  // Role checking
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Sub-role permission checking (for Admins)
  if (user?.role === 'admin' && user?.subRole !== SUB_ROLES.SUPER_ADMIN) {
    const path = location.pathname;
    const permissions = user?.permissions || [];
    
    // Define route section mapping
    const sectionToPermission = {
      '/admin/hr': 'hr',
      '/admin/payroll': 'payroll',
      '/admin/leaves': 'leaves',
      '/admin/inventory': 'inventory',
      '/admin/orders': 'orders',
      '/admin/distributors': 'distributors',
      '/admin/retailers': 'retailers',
      '/admin/customers': 'customers',
      '/admin/service': 'service',
      '/admin/content': 'content',
      '/admin/reports': 'reports',
      '/admin/rewards': 'rewards',
      '/admin/accounts': 'accounts',
      '/admin/rbac': 'rbac',
    };

    // Find if the current path requires a specific permission
    const requiredSection = Object.keys(sectionToPermission).find(s => path.startsWith(s));
    const requiredPermission = sectionToPermission[requiredSection];

    if (requiredPermission && !permissions.includes(requiredPermission)) {
      return <Navigate to="/admin/unauthorized" replace />;
    }
  }

  return children;
}
