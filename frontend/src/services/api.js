import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  }
};

// User API
export const userAPI = {
  getUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/auth/users/${userId}/role`, { role });
    return response.data;
  },

  deactivateUser: async (userId) => {
    const response = await api.put(`/auth/users/${userId}/deactivate`);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getDashboardSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  getManufacturingOrders: async (params = {}) => {
    const response = await api.get('/dashboard/manufacturing-orders', { params });
    return response.data;
  },

  getLowStockProducts: async (threshold = 10) => {
    const response = await api.get('/dashboard/low-stock-products', { 
      params: { threshold } 
    });
    return response.data;
  },

  getKPIs: async (startDate, endDate) => {
    const response = await api.get('/dashboard/kpis', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },
};

// Manufacturing Orders API
export const manufacturingOrderAPI = {
  getManufacturingOrders: async (params = {}) => {
    const response = await api.get('/manufacturing-orders', { params });
    return response.data;
  },

  getManufacturingOrder: async (id) => {
    const response = await api.get(`/manufacturing-orders/${id}`);
    return response.data;
  },

  createManufacturingOrder: async (orderData) => {
    const response = await api.post('/manufacturing-orders', orderData);
    return response.data;
  },

  updateManufacturingOrder: async (id, orderData) => {
    const response = await api.put(`/manufacturing-orders/${id}`, orderData);
    return response.data;
  },

  deleteManufacturingOrder: async (id) => {
    const response = await api.delete(`/manufacturing-orders/${id}`);
    return response.data;
  },
};

// Products API
export const productAPI = {
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// Work Orders API
export const workOrderAPI = {
  getWorkOrders: async (params = {}) => {
    const response = await api.get('/work-orders', { params });
    return response.data;
  },

  getWorkOrder: async (id) => {
    const response = await api.get(`/work-orders/${id}`);
    return response.data;
  },

  createWorkOrder: async (orderData) => {
    const response = await api.post('/work-orders', orderData);
    return response.data;
  },

  updateWorkOrder: async (id, orderData) => {
    const response = await api.put(`/work-orders/${id}`, orderData);
    return response.data;
  },

  deleteWorkOrder: async (id) => {
    const response = await api.delete(`/work-orders/${id}`);
    return response.data;
  },
};

// Work Centers API
export const workCenterAPI = {
  getWorkCenters: async (params = {}) => {
    const response = await api.get('/work-centers', { params });
    return response.data;
  },

  getWorkCenter: async (id) => {
    const response = await api.get(`/work-centers/${id}`);
    return response.data;
  },

  createWorkCenter: async (centerData) => {
    const response = await api.post('/work-centers', centerData);
    return response.data;
  },

  updateWorkCenter: async (id, centerData) => {
    const response = await api.put(`/work-centers/${id}`, centerData);
    return response.data;
  },

  deleteWorkCenter: async (id) => {
    const response = await api.delete(`/work-centers/${id}`);
    return response.data;
  },
};

// BOM API
export const bomAPI = {
  getBOMs: async (params = {}) => {
    const response = await api.get('/boms', { params });
    return response.data;
  },

  getBOM: async (id) => {
    const response = await api.get(`/boms/${id}`);
    return response.data;
  },

  createBOM: async (bomData) => {
    const response = await api.post('/boms', bomData);
    return response.data;
  },

  updateBOM: async (id, bomData) => {
    const response = await api.put(`/boms/${id}`, bomData);
    return response.data;
  },

  deleteBOM: async (id) => {
    const response = await api.delete(`/boms/${id}`);
    return response.data;
  },
};

// Stock Ledger API
export const stockLedgerAPI = {
  getStockLedger: async (params = {}) => {
    const response = await api.get('/stock-ledger', { params });
    return response.data;
  },

  getStockLedgerEntry: async (id) => {
    const response = await api.get(`/stock-ledger/${id}`);
    return response.data;
  },

  createStockLedgerEntry: async (entryData) => {
    const response = await api.post('/stock-ledger', entryData);
    return response.data;
  },

  updateStockLedgerEntry: async (id, entryData) => {
    const response = await api.put(`/stock-ledger/${id}`, entryData);
    return response.data;
  },

  deleteStockLedgerEntry: async (id) => {
    const response = await api.delete(`/stock-ledger/${id}`);
    return response.data;
  },
};

export default api;
