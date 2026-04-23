import api from '../api';

const executiveService = {
  // Dashboard stats
  getStats: async () => {
    const response = await api.get('/sales-executive/stats');
    return response.data;
  },

  // Get onboarded retailers
  getMyRetailers: async () => {
    const response = await api.get('/sales-executive/retailers');
    return response.data;
  },

  // Onboard new retailer
  onboardRetailer: async (data) => {
    const response = await api.post('/sales-executive/retailers', data);
    return response.data;
  },

  // Place order for retailer
  placeOrder: async (orderData) => {
    const response = await api.post('/sales-executive/orders', orderData);
    return response.data;
  },

  // Browse products
  getProducts: async () => {
    const response = await api.get('/sales-executive/products');
    return response.data;
  }
};

export default executiveService;
