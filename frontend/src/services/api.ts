import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
};

export const members = {
  getAll: async () => {
    const response = await api.get('/api/members');
    return response.data;
  },
  create: async (data: { firstName: string; lastName: string; email: string }) => {
    const response = await api.post('/api/members', data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/api/members/${id}`);
    return response.data;
  },
  update: async (id: number, data: { firstName?: string; lastName?: string; email?: string }) => {
    const response = await api.put(`/api/members/${id}`, data);
    return response.data;
  },
};

export const sacraments = {
  getAll: async () => {
    const response = await api.get('/api/sacraments');
    return response.data;
  },
  create: async (data: {
    name: string;
    type: string;
    description: string;
    numStorage: number;
    suggestedDonation: number;
  }) => {
    const response = await api.post('/api/sacraments', data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/api/sacraments/${id}`);
    return response.data;
  },
  update: async (id: number, data: {
    name?: string;
    type?: string;
    description?: string;
    numStorage?: number;
    suggestedDonation?: number;
  }) => {
    const response = await api.put(`/api/sacraments/${id}`, data);
    return response.data;
  },
};

export const donations = {
  getAll: async () => {
    const response = await api.get('/api/donations');
    return response.data;
  },
  create: async (data: {
    memberId: number;
    sacramentId: number;
    amount: number;
    notes?: string;
  }) => {
    const response = await api.post('/api/donations', data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/api/donations/${id}`);
    return response.data;
  },
  getMemberDonations: async (memberId: number) => {
    const response = await api.get(`/api/donations/member/${memberId}`);
    return response.data;
  }
};

export const inventory = {
  getHistory: async () => {
    const response = await api.get('/api/inventory/history');
    return response.data;
  },
  getAudits: async () => {
    const response = await api.get('/api/inventory/audits');
    return response.data;
  },
  getAlerts: async () => {
    const response = await api.get('/api/inventory/alerts');
    return response.data;
  },
  recordTransfer: async (data: {
    sacramentId: number;
    quantity: number;
    type: 'in' | 'out';
    notes?: string;
  }) => {
    const response = await api.post('/api/inventory/transfer', data);
    return response.data;
  },
  recordAudit: async (data: {
    sacramentId: number;
    actualQuantity: number;
    notes?: string;
  }) => {
    const response = await api.post('/api/inventory/audit', data);
    return response.data;
  }
};

export default api;