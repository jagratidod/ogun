import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Detect the active role's token keys from localStorage
const getActiveTokenKeys = () => {
  const roles = ['admin', 'distributor', 'retailer', 'customer'];
  for (const role of roles) {
    const token = localStorage.getItem(`${role}_token`);
    if (token) {
      return {
        accessKey: `${role}_token`,
        refreshKey: `${role}_refresh_token`,
        userKey: `${role}_user`,
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
        window.location.href = '/login';
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
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
