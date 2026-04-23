import api from '../api';

const retailerService = {
  // Get products from assigned distributor
  getDistributorProducts: async () => {
    const response = await api.get('/retailer/distributor-products');
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
  }
};

export default retailerService;
