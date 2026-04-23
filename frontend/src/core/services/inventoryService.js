import api from '../api';

const inventoryService = {
  // Categories
  getCategories: async () => {
    const response = await api.get('/admin/categories');
    return response.data;
  },
  createCategory: async (categoryData) => {
    const response = await api.post('/admin/categories', categoryData);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // Products
  getProducts: async () => {
    const response = await api.get('/admin/products');
    return response.data;
  },
  createProduct: async (formData) => {
    const response = await api.post('/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  updateProduct: async (id, formData) => {
    const response = await api.put(`/admin/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },
  getProductDetails: async (id) => {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
  },
  getAlerts: async () => {
    const response = await api.get('/admin/inventory/alerts');
    return response.data;
  },
  getInventoryOverview: async () => {
    const response = await api.get('/admin/inventory/overview');
    return response.data;
  },

  // Orders
  getOrders: async () => {
    const response = await api.get('/admin/orders');
    return response.data;
  },
  updateOrder: async (id, updateData) => {
    const response = await api.patch(`/admin/orders/${id}/status`, updateData);
    return response.data;
  }
};

export default inventoryService;
