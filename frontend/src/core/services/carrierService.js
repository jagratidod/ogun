import api from '../api';

const carrierService = {
  getAllCarriers: async () => {
    const response = await api.get('/admin/carriers');
    return response.data;
  },

  createCarrier: async (data) => {
    const response = await api.post('/admin/carriers', data);
    return response.data;
  },

  getCarrierById: async (id) => {
    const response = await api.get(`/admin/carriers/${id}`);
    return response.data;
  },

  updateCarrier: async (id, data) => {
    const response = await api.put(`/admin/carriers/${id}`, data);
    return response.data;
  },

  deleteCarrier: async (id) => {
    const response = await api.delete(`/admin/carriers/${id}`);
    return response.data;
  },

  calculateFreight: async (params) => {
    const response = await api.get('/admin/carriers/rate-engine', { params });
    return response.data;
  }
};

export default carrierService;
