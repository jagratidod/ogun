import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('crm_user');
    const token = localStorage.getItem('access_token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
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
      const { user: userData, accessToken, refreshToken } = response.data.data;

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('crm_user', JSON.stringify(userData));
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      return { success: true, role: userData.role };
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
      const { user: userData, accessToken, refreshToken } = response.data.data;

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('crm_user', JSON.stringify(userData));
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      return { success: true, role: userData.role };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('crm_user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      requestOTP,
      verifyOTP,
      registerPartner,
      loginWithPassword,
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
