import api from '../api';

const retailerService = {
  // Get ALL admin products enriched with distributor's stock data
  getAdminCatalog: async () => {
    const response = await api.get('/retailer/admin-catalog');
    return response.data;
  },

  // Get retailer's own inventory
  getMyInventory: async () => {
    const response = await api.get('/retailer/inventory');
    return response.data;
  },

  updateInventoryItem: async (id, data) => {
    const response = await api.patch(`/retailer/inventory/${id}`, data);
    return response.data;
  },

  // Shipments
  getShipments: async () => {
    const response = await api.get('/retailer/shipments');
    return response.data;
  },

  receiveShipment: async (id) => {
    const response = await api.patch(`/retailer/shipments/${id}/receive`);
    return response.data;
  },

  // Product Queries
  createProductQuery: async (data) => {
    const response = await api.post('/retailer/product-queries', data);
    return response.data;
  },

  getMyQueries: async () => {
    const response = await api.get('/retailer/product-queries');
    return response.data;
  },

  // Orders
  placeOrder: async (data) => {
    const response = await api.post('/retailer/orders', data);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/retailer/orders');
    return response.data;
  },

  // Sales (POS)
  createSale: async (data) => {
    const response = await api.post('/retailer/sales', data);
    return response.data;
  },

  getSaleHistory: async () => {
    const response = await api.get('/retailer/sales');
    return response.data;
  },

  getSaleDetail: async (id) => {
    const response = await api.get(`/retailer/sales/${id}`);
    return response.data;
  },

  // Rewards & Loyalty
  getRewardData: async () => {
    const response = await api.get('/rewards/my-rewards');
    return response.data;
  },

  requestRedemption: async (data) => {
    const response = await api.post('/rewards/redemptions/request', data);
    return response.data;
  }
};


export default retailerService;
