import api from '../api';

const queryService = {
  // Distributor methods
  getDistributorQueries: async () => {
    const response = await api.get('/distributor/product-queries');
    return response.data;
  },
  
  updateDistributorQueryStatus: async (id, data) => {
    const response = await api.patch(`/distributor/product-queries/${id}/status`, data);
    return response.data;
  },

  // Admin methods
  getAdminQueries: async () => {
    const response = await api.get('/admin/product-queries');
    return response.data;
  },

  updateAdminQueryStatus: async (id, data) => {
    const response = await api.patch(`/admin/product-queries/${id}/status`, data);
    return response.data;
  }
};

export default queryService;
