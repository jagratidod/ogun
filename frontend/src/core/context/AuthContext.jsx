import { createContext, useContext, useState, useCallback } from 'react';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

const MOCK_USERS = {
  [ROLES.ADMIN]: {
    id: 'USR001',
    name: 'Vikram Sharma',
    email: 'vikram@ogun.in',
    role: ROLES.ADMIN,
    avatar: null,
    department: 'Management',
  },
  [ROLES.DISTRIBUTOR]: {
    id: 'DST001',
    name: 'Arjun Patel',
    email: 'arjun@ogun.in',
    role: ROLES.DISTRIBUTOR,
    avatar: null,
    region: 'West India',
    city: 'Mumbai',
  },
  [ROLES.RETAILER]: {
    id: 'RET001',
    name: 'Priya Menon',
    email: 'priya@ogun.in',
    role: ROLES.RETAILER,
    avatar: null,
    storeName: 'Priya Kitchen World',
    city: 'Bangalore',
  },
  [ROLES.CUSTOMER]: {
    id: 'CST001',
    name: 'Rahul Verma',
    email: 'rahul@gmail.com',
    role: ROLES.CUSTOMER,
    avatar: null,
    phone: '+91 98765 43210',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback((role) => {
    const mockUser = MOCK_USERS[role];
    if (mockUser) {
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('crm_role', role);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('crm_role');
  }, []);

  const switchRole = useCallback((role) => {
    login(role);
  }, [login]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
