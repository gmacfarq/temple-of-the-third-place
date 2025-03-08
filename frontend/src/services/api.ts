import axios from 'axios';
import { ApiError } from '../types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache', // Prevent browser caching
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface SubscriptionData {
  status: 'active' | 'expired' | 'pending';
  expiryDate: string;
  type: 'monthly' | 'yearly';
}

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  register: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    birthDate?: string;
    phoneNumber?: string;
    membershipType?: string;
  }) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },
  registerPrivileged: async (data: { firstName: string; lastName: string; email: string; role: string }) => {
    const requestData = {
      email: data.email.toLowerCase().trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      password: 'DefaultPass123!',
      role: data.role
    };
    const response = await api.post('/api/auth/register-privileged', requestData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  }
};

export const members = {
  getAll: async () => {
    const response = await api.get('/api/members');
    return response.data;
  },
  create: async (data: { firstName: string; lastName: string; email: string }) => {
    const requestData = {
      email: data.email.toLowerCase().trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      password: 'DefaultPass123!',
      role: 'member'
    };
    console.log('Sending request:', requestData);
    try {
      const response = await api.post('/api/auth/register-privileged', requestData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', {
        status: (error as ApiError).response?.status,
        data: (error as ApiError).response?.data,
        message: (error as ApiError).message
      });
      throw error;
    }
  },
  delete: async (id: number) => {
    const response = await api.delete(`/api/members/${id}`);
    return response.data;
  },
  update: async (id: number, data: { firstName?: string; lastName?: string; email?: string }) => {
    const response = await api.put(`/api/members/${id}`, data);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/api/members/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/api/members/stats');
    return response.data;
  },
  checkIn: async (id: number) => {
    const response = await api.put(`/api/members/${id}/checkin`);
    return response.data;
  },
  getCheckIns: async (id: number) => {
    const response = await api.get(`/api/members/${id}/check-ins`);
    return response.data;
  },
  deleteCheckIn: async (checkInId: number) => {
    const response = await api.delete(`/api/members/check-ins/${checkInId}`);
    return response.data;
  },
  updateSubscription: async (id: number, data: SubscriptionData) => {
    const response = await api.put(`/api/members/${id}/subscription`, data);
    return response.data;
  },
  getRecentCheckIns: async () => {
    const response = await api.get('/api/members/recent-checkins');
    return response.data;
  },
  updateProfile: async (id: number, data: {
    firstName: string;
    lastName: string;
    email: string;
    birthDate?: string;
    phoneNumber?: string;
    membershipType?: 'Exploratory' | 'Starter' | 'Lovely';
  }) => {
    const response = await api.put(`/api/members/${id}`, data);
    return response.data;
  },
  updateMembership: async (id: number, data: {
    membershipType: 'Exploratory' | 'Starter' | 'Lovely';
    membershipStatus: 'Pending' | 'Active' | 'Expired';
    expirationDate?: string;
  }) => {
    const response = await api.put(`/api/members/${id}/membership`, data);
    return response.data;
  }
};

export const sacraments = {
  getAll: async () => {
    const response = await api.get('/api/sacraments');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/api/sacraments/${id}`);
    return response.data;
  },
  create: async (data: {
    name: string;
    type: string;
    strain: string;
    description: string;
    numStorage: number;
    suggestedDonation: number;
    lowInventoryThreshold: number;
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
    strain?: string;
    description?: string;
    numStorage?: number;
    numActive?: number;
    suggestedDonation?: number;
    lowInventoryThreshold?: number;
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
    type: string;
    items: Array<{
      sacramentId: number;
      quantity: number;
      amount: number;
    }>;
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
    type: 'to_active' | 'to_storage' | 'add_storage' | 'remove_storage';
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
  },
  transfer: async (data: {
    sacramentId: number;
    quantity: number;
    direction: string;
  }) => {
    const response = await api.post('/api/inventory/transfer', data);
    return response.data;
  },
  remove: async (data: {
    sacramentId: number;
    quantity: number;
  }) => {
    const response = await api.post('/api/inventory/remove', data);
    return response.data;
  }
};

export default api;