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
    },

    getShipments: async () => {
        const response = await api.get('/distributor/shipments');
        return response.data;
    },

    getOutboundShipments: async () => {
        const response = await api.get('/distributor/shipments/outbound');
        return response.data;
    },

    createShipment: async (data) => {
        const response = await api.post('/distributor/shipments/dispatch', data);
        return response.data;
    },

    getRetailers: async () => {
        const response = await api.get('/distributor/retailers');
        return response.data;
    }
};

export default distributorService;
