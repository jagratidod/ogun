import api from '../api';

const partnerService = {
  // Get all active distributors for registration selection
  getDistributors: async () => {
    const response = await api.get('/auth/distributors');
    return response.data;
  },

  // Get retailers for the logged in distributor
  getMyRetailers: async () => {
    const response = await api.get('/distributor/retailers');
    return response.data;
  },

  // Onboard a new retailer (Distributor side)
  onboardRetailer: async (retailerData) => {
    const response = await api.post('/distributor/retailers', retailerData);
    return response.data;
  },

  // Get distributor inventory/stock
  getInventory: async () => {
    const response = await api.get('/distributor/inventory');
    return response.data;
  },

  // Get orders placed by distributor to Admin
  getDistributorOrders: async () => {
    const response = await api.get('/distributor/my-orders');
    return response.data;
  },

  // Get orders placed by Retailers to this Distributor
  getRetailerOrders: async () => {
    const response = await api.get('/distributor/retailer-orders');
    return response.data;
  }
};

export default partnerService;
