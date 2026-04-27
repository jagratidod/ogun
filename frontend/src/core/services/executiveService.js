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
  },
  
  // Service Management
  getServiceTickets: async () => {
    const response = await api.get('/sales-executive/service-tickets');
    return response.data;
  },
  
  updateTicketStatus: async (id, status, note) => {
    const response = await api.patch(`/sales-executive/service-tickets/${id}/status`, { status, note });
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


export default executiveService;
