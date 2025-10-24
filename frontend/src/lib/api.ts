import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from '@/hooks/use-toast';
import { getMenuItems } from '@/lib/syncData';
import {
  mockUsers,
  mockMenuItems,
  mockOrders,
  mockStaff,
  mockPromotions,
  mockMembers,
  mockOwnerStats
} from '@/data/mockData';

// Mock API base URL (will be replaced with real API)
const API_BASE_URL = 'https://api.mockrestaurant.com';

// Mock mode flag - set to false when connecting to real API
const USE_MOCK_DATA = true;

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized - Token expired or invalid
      if (status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('mock_auth_user');
        toast({
          variant: 'destructive',
          title: 'Session expired',
          description: 'Please login again.',
        });
        window.location.href = '/login';
      }

      // Handle 403 Forbidden - Insufficient permissions
      if (status === 403) {
        toast({
          variant: 'destructive',
          title: 'Access denied',
          description: 'You do not have permission to access this resource.',
        });
      }

      // Handle 500 Internal Server Error
      if (status >= 500) {
        toast({
          variant: 'destructive',
          title: 'Server error',
          description: 'Something went wrong. Please try again later.',
        });
      }
    }

    return Promise.reject(error);
  }
);

// ============= API Methods =============
// All data operations go through these methods
// When ready to connect to real API, update implementations here

// Helper to simulate API delay
const mockDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ============= Auth API =============
export const authApi = {
  login: async (email: string, password: string) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const users = JSON.parse(localStorage.getItem('mock_users') || JSON.stringify(mockUsers));
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (!user) throw new Error('Invalid credentials');
      return { data: user };
    }
    return apiClient.post('/auth/login', { email, password });
  },

  register: async (email: string, password: string, name: string) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const users = JSON.parse(localStorage.getItem('mock_users') || JSON.stringify(mockUsers));
      const newUser = {
        id: String(Date.now()),
        email,
        password,
        name,
        role: 'owner',
        avatar: undefined,
      };
      users.push(newUser);
      localStorage.setItem('mock_users', JSON.stringify(users));
      return { data: newUser };
    }
    return apiClient.post('/auth/register', { email, password, name });
  },

  logout: async () => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return { data: { success: true } };
    }
    return apiClient.post('/auth/logout');
  },
};

// ============= Menu API =============
export const menuApi = {
  getAll: async (branchId?: string) => {
    if (USE_MOCK_DATA) {
      await mockDelay();

      // Use the new sync utility
      const menuItems = getMenuItems(branchId);

      console.log('API - Branch ID:', branchId);
      console.log('API - Menu items found:', menuItems);

      return { data: menuItems };
    }
    return apiClient.get('/menu', { params: { branchId } });
  },

  getById: async (id: string) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const item = mockMenuItems.find(m => m.id === id);
      if (!item) throw new Error('Menu item not found');
      return { data: item };
    }
    return apiClient.get(`/menu/${id}`);
  },

  create: async (menuData: any) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return { data: { ...menuData, id: String(Date.now()) } };
    }
    return apiClient.post('/menu', menuData);
  },

  update: async (id: string, menuData: any) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return { data: { ...menuData, id } };
    }
    return apiClient.put(`/menu/${id}`, menuData);
  },

  delete: async (id: string) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return { data: { success: true } };
    }
    return apiClient.delete(`/menu/${id}`);
  },
};

// ============= Order API =============
export const orderApi = {
  getAll: async (branchId?: string) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return { data: mockOrders };
    }
    return apiClient.get('/orders', { params: { branchId } });
  },

  getById: async (id: string) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const order = mockOrders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      return { data: order };
    }
    return apiClient.get(`/orders/${id}`);
  },

  create: async (orderData: any) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return { data: { ...orderData, id: String(Date.now()), status: 'pending' } };
    }
    return apiClient.post('/orders', orderData);
  },

  update: async (id: string, orderData: any) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return { data: { ...orderData, id } };
    }
    return apiClient.put(`/orders/${id}`, orderData);
  },
};

// ============= Staff API =============
export const staffApi = {
  getAll: async (branchId?: string) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return { data: branchId ? mockStaff.filter(s => s.branchId === branchId) : mockStaff };
    }
    return apiClient.get('/staff', { params: { branchId } });
  },

  getById: async (id: string) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const staff = mockStaff.find(s => s.id === id);
      if (!staff) throw new Error('Staff not found');
      return { data: staff };
    }
    return apiClient.get(`/staff/${id}`);
  },

  create: async (staffData: any) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return { data: { ...staffData, id: String(Date.now()) } };
    }
    return apiClient.post('/staff', staffData);
  },

  update: async (id: string, staffData: any) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return { data: { ...staffData, id } };
    }
    return apiClient.put(`/staff/${id}`, staffData);
  },

  delete: async (id: string) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return { data: { success: true } };
    }
    return apiClient.delete(`/staff/${id}`);
  },
};

// ============= Restaurant API (for staff login) =============
export const restaurantApi = {
  getAll: async () => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      // This is deprecated - use the new restaurantApi from @/api/restaurantApi
      return { data: [] };
    }
    return apiClient.get('/restaurants');
  },
};

// ============= Stats API =============
export const statsApi = {
  getOwnerStats: async () => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return { data: mockOwnerStats };
    }
    return apiClient.get('/stats/owner');
  },

  getBranchStats: async (branchId: string) => {
    if (USE_MOCK_DATA) {
      await mockDelay();
      return { data: mockOwnerStats };
    }
    return apiClient.get(`/stats/branch/${branchId}`);
  },
};

export default apiClient;
