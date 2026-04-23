import { useAuthContext } from '../context/AuthContext';
import { SUB_ROLES } from '../utils/constants';

/**
 * Hook to manage role-based and sub-role-based permissions
 */
export function usePermissions() {
  const { user } = useAuthContext();

  const isSuperAdmin = user?.subRole === SUB_ROLES.SUPER_ADMIN;
  const permissions = user?.permissions || [];

  /**
   * Check if user has specific permission
   */
  const hasPermission = (permission) => {
    if (isSuperAdmin || permissions.includes('all')) return true;
    return permissions.includes(permission);
  };

  /**
   * Check if user can access a specific section (utility for dashboard/nav)
   */
  const canAccess = (section) => {
    return hasPermission(section);
  };

  return {
    user,
    isSuperAdmin,
    permissions,
    hasPermission,
    canAccess
  };
}
