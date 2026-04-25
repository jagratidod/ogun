import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Detect the active role's token keys from localStorage
const ROLE_KEY_MAP = { sales_executive: 'sales' };
const getRoleKey = (role) => ROLE_KEY_MAP[role] || role;

// Map URL path prefix → role, so the right token is always used
// even when multiple roles are logged in simultaneously
const PATH_ROLE_MAP = {
  '/admin': 'admin',
  '/hr': 'admin',
  '/service-center': 'admin',
  '/distributor': 'distributor',
  '/retailer': 'retailer',
  '/sales': 'sales_executive',
  '/customer': 'customer',
};

const getActiveTokenKeys = () => {
  // 1. Try to infer role from current URL path — use exact segment match
  const path = window.location.pathname;
  // Sort by prefix length descending so more specific paths match first
  const sortedMap = Object.entries(PATH_ROLE_MAP).sort((a, b) => b[0].length - a[0].length);

  for (const [prefix, role] of sortedMap) {
    // Match /admin, /admin/*, but NOT /administrator etc.
    if (path === prefix || path.startsWith(prefix + '/')) {
      const key = getRoleKey(role);
      const token = localStorage.getItem(`${key}_token`);
      if (token) {
        return {
          accessKey: `${key}_token`,
          refreshKey: `${key}_refresh_token`,
          userKey: `${key}_user`,
          role,
        };
      }
    }
  }

  // 2. Fallback: first available token
  const roles = ['admin', 'distributor', 'retailer', 'customer', 'sales_executive'];
  for (const role of roles) {
    const key = getRoleKey(role);
    const token = localStorage.getItem(`${key}_token`);
    if (token) {
      return {
        accessKey: `${key}_token`,
        refreshKey: `${key}_refresh_token`,
        userKey: `${key}_user`,
        role,
      };
    }
  }
  return null;
};

// Request interceptor for adding the bearer token
api.interceptors.request.use(
  (config) => {
    const keys = getActiveTokenKeys();
    if (keys) {
      config.headers.Authorization = `Bearer ${localStorage.getItem(keys.accessKey)}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const keys = getActiveTokenKeys();
      if (!keys) {
        const path = window.location.pathname;
        if (path.startsWith('/sales')) window.location.href = '/sales/login';
        else window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const refreshToken = localStorage.getItem(keys.refreshKey);
        const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem(keys.accessKey, accessToken);
        localStorage.setItem(keys.refreshKey, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        // Refresh token expired — clear this role's keys and redirect
        if (keys) {
          localStorage.removeItem(keys.accessKey);
          localStorage.removeItem(keys.refreshKey);
          localStorage.removeItem(keys.userKey);
        }
        // Redirect to role-specific login
        const roleLoginMap = {
          admin: '/admin/login',
          distributor: '/distributor/login',
          retailer: '/retailer/login',
          sales_executive: '/sales/login',
          customer: '/customer/login',
        };
        window.location.href = roleLoginMap[keys?.role] || '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
