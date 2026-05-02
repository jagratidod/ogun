import api from '../api';

const logisticsService = {
  getStats: async () => {
    const response = await api.get('/logistics/stats');
    return response.data;
  },

  getAllShipments: async (params) => {
    const response = await api.get('/logistics/shipments', { params });
    return response.data;
  },

  getOrderPipeline: async () => {
    const response = await api.get('/logistics/orders');
    return response.data;
  },

  getTrackingInfo: async (id) => {
    const response = await api.get(`/logistics/tracking/${id}`);
    return response.data;
  },

  updateShipmentStatus: async (id, data) => {
    const response = await api.patch(`/logistics/shipments/${id}/status`, data);
    return response.data;
  },

  assignAgent: async (id, agentId) => {
    const response = await api.patch(`/logistics/shipments/${id}/assign`, { agentId });
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/logistics/analytics');
    return response.data;
  },

  getRestockRequests: async () => {
    const response = await api.get('/logistics/restock');
    return response.data;
  },

  getAgents: async () => {
    const response = await api.get('/logistics/agents');
    return response.data;
  },
  
  onboardAgent: async (data) => {
    const response = await api.post('/logistics/agents', data);
    return response.data;
  }
};

export default logisticsService;
