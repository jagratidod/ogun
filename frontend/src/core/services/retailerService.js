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
  }
};

export default retailerService;
