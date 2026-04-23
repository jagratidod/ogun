import api from '../api';

const marketplaceService = {
  getAvailableProducts: async () => {
    const response = await api.get('/distributor/browse-products');
    return response.data;
  },
  placeOrder: async (orderData) => {
    const response = await api.post('/distributor/place-order', orderData);
    return response.data;
  },
  getMyOrders: async () => {
    const response = await api.get('/distributor/my-orders');
    return response.data;
  }
};

export default marketplaceService;
