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
  },

  createShipmentFromOrder: async (data) => {
    const response = await api.post('/logistics/shipments', data);
    return response.data;
  },

  addPackagingDetails: async (id, data) => {
    const response = await api.patch(`/logistics/shipments/${id}/packaging`, data);
    return response.data;
  },

  selectCarrier: async (id, data) => {
    const response = await api.patch(`/logistics/shipments/${id}/carrier`, data);
    return response.data;
  },

  dispatchShipment: async (id) => {
    const response = await api.patch(`/logistics/shipments/${id}/dispatch`);
    return response.data;
  },

  addTrackingUpdate: async (id, data) => {
    const response = await api.post(`/logistics/shipments/${id}/tracking`, data);
    return response.data;
  },

  confirmDelivery: async (id, data) => {
    const response = await api.patch(`/logistics/shipments/${id}/deliver`, data);
    return response.data;
  },

  getPackagingQueue: async () => {
    const response = await api.get('/logistics/packaging-queue');
    return response.data;
  },

  getDispatchQueue: async () => {
    const response = await api.get('/logistics/dispatch-queue');
    return response.data;
  },

  getPublicTracking: async (identifier) => {
    const response = await api.get(`/logistics/public/track/${identifier}`);
    return response.data;
  }
};

export default logisticsService;

