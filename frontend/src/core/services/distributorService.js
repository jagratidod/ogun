import api from '../api';

const distributorService = {
    // Retailer Orders
    getRetailerOrders: async () => {
        const response = await api.get('/distributor/retailer-orders');
        return response.data;
    },
    
    updateRetailerOrderStatus: async (id, status) => {
        const response = await api.patch(`/distributor/retailer-orders/${id}/status`, { status });
        return response.data;
    }
};

export default distributorService;
