import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

// Role-specific localStorage key mapping
const ROLE_KEY_MAP = {
  admin: 'admin',
  hr_manager: 'hr',
  service_manager: 'service',
  distributor: 'distributor',
  retailer: 'retailer',
  sales_executive: 'sales',
  customer: 'customer'
};

const getRoleKey = (role) => ROLE_KEY_MAP[role] || role;

export const getTokenKeys = (role, subRole) => {
  // Use subRole for HR and Service to get specific prefixes (hr_token, service_token)
  const keyPrefix = (subRole === 'hr_manager') ? 'hr' : 
                   (subRole === 'service_manager') ? 'service' : 
                   getRoleKey(role);
                   
  return {
    accessToken: `${keyPrefix}_token`,
    refreshToken: `${keyPrefix}_refresh_token`,
    user: `${keyPrefix}_user`,
  };
};

// Find which role is currently logged in by checking all possible keys
const detectStoredSession = () => {
  // URL-based priority — same logic as api.js
  const PATH_ROLE_MAP = {
    '/admin': 'admin',
    '/hr': 'hr_manager',
    '/service-center': 'service_manager',
    '/technician': 'service_manager',
    '/distributor': 'distributor',
    '/retailer': 'retailer',
    '/sales': 'sales_executive',
    '/customer': 'customer',
  };

  const path = window.location.pathname;
  const sortedMap = Object.entries(PATH_ROLE_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [prefix, role] of sortedMap) {
    if (path === prefix || path.startsWith(prefix + '/')) {
      const keys = getTokenKeys(role);
      const storedUser = localStorage.getItem(keys.user);
      const token = localStorage.getItem(keys.accessToken);
      if (storedUser && token) {
        return { userData: JSON.parse(storedUser), role };
      }
    }
  }

  // Fallback: first available session
  const roles = ['admin', 'distributor', 'retailer', 'customer', 'sales_executive'];
  for (const role of roles) {
    const keys = getTokenKeys(role);
    const storedUser = localStorage.getItem(keys.user);
    const token = localStorage.getItem(keys.accessToken);
    if (storedUser && token) {
      return { userData: JSON.parse(storedUser), role };
    }
  }
  return null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = detectStoredSession();
    if (session) {
      setUser(session.userData);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const requestOTP = useCallback(async (email, role) => {
    try {
      const response = await api.post('/auth/request-otp', { email, role });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to request OTP'
      };
    }
  }, []);

  const verifyOTP = useCallback(async (email, otp, role, name = '') => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp, role, name });
      const data = response.data?.data;

      if (!data?.accessToken || !data?.refreshToken || !data?.user) {
        return { success: false, message: 'Invalid response from server. Please try again.' };
      }

      const { user: userData, accessToken, refreshToken } = data;
      const keys = getTokenKeys(userData.role, userData.subRole);


      localStorage.setItem(keys.user, JSON.stringify(userData));
      localStorage.setItem(keys.accessToken, accessToken);
      localStorage.setItem(keys.refreshToken, refreshToken);

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, role: userData.role, user: userData };

    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Verification failed'
      };
    }
  }, []);

  const registerPartner = useCallback(async (payload) => {
    try {
      const response = await api.post('/auth/register', payload);
      return { success: true, message: response.data.message, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  }, []);

  const loginWithPassword = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/admin/login', { email, password });
      const data = response.data?.data;

      if (!data?.accessToken || !data?.refreshToken || !data?.user) {
        return { success: false, message: 'Invalid response from server. Please try again.' };
      }

      const { user: userData, accessToken, refreshToken } = data;
      const keys = getTokenKeys(userData.role);

      localStorage.setItem(keys.user, JSON.stringify(userData));
      localStorage.setItem(keys.accessToken, accessToken);
      localStorage.setItem(keys.refreshToken, refreshToken);

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, role: userData.role };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  }, []);

  const loginTechnician = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/technician/login', { email, password });
      const data = response.data?.data;

      if (!data?.accessToken || !data?.refreshToken || !data?.user) {
        return { success: false, message: 'Invalid response from server.' };
      }

      const { user: userData, accessToken, refreshToken } = data;
      // Technicians use 'service' key prefix (same as service_manager)
      const keys = getTokenKeys(userData.role, 'service_manager');

      localStorage.setItem(keys.user, JSON.stringify(userData));
      localStorage.setItem(keys.accessToken, accessToken);
      localStorage.setItem(keys.refreshToken, refreshToken);

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const role = user?.role;
      if (role) {
        const keys = getTokenKeys(role);
        const refreshToken = localStorage.getItem(keys.refreshToken);
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      // Clear all possible role keys on logout
      ['admin', 'distributor', 'retailer', 'customer', 'sales_executive'].forEach((role) => {
        const keys = getTokenKeys(role);
        localStorage.removeItem(keys.user);
        localStorage.removeItem(keys.accessToken);
        localStorage.removeItem(keys.refreshToken);
      });
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      requestOTP,
      verifyOTP,
      registerPartner,
      loginWithPassword,
      loginTechnician,
      logout
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
