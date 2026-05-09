import api from '../api';

const technicianService = {
  getMyTickets: async () => {
    const response = await api.get('/technician/my-tickets');
    return response.data;
  },

  updateTicketStatus: async (id, data) => {
    const response = await api.patch(`/technician/tickets/${id}/status`, data);
    return response.data;
  },

  requestSpareParts: async (id, parts) => {
    const response = await api.post(`/technician/tickets/${id}/spare-parts`, { parts });
    return response.data;
  },

  resolveTicket: async (id, data) => {
    const response = await api.patch(`/technician/tickets/${id}/resolve`, data);
    return response.data;
  }
};

export default technicianService;
