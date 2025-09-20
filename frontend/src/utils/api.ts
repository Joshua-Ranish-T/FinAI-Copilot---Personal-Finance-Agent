import axios from 'axios';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration and refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
            { refreshToken }
          );
          
          const { token } = response.data;
          localStorage.setItem('authToken', token);
          api.defaults.headers.Authorization = `Bearer ${token}`;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Handle refresh token failure
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API endpoints
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }
    return response.data;
  },
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
  },
  getUserProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  updateUserProfile: async (profileData: any) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// Dashboard API endpoints
export const dashboardAPI = {
  getOverview: async () => {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },
  getBalance: async () => {
    const response = await api.get('/dashboard/balance');
    return response.data;
  },
  getSpendingInsights: async (timeframe: string = 'month') => {
    const response = await api.get(`/dashboard/spending-insights?timeframe=${timeframe}`);
    return response.data;
  },
  getIncomeInsights: async (timeframe: string = 'month') => {
    const response = await api.get(`/dashboard/income-insights?timeframe=${timeframe}`);
    return response.data;
  },
  getCategoryInsights: async (timeframe: string = 'month') => {
    const response = await api.get(`/dashboard/category-insights?timeframe=${timeframe}`);
    return response.data;
  },
  getRecentTransactions: async (limit: number = 10) => {
    const response = await api.get(`/dashboard/recent-transactions?limit=${limit}`);
    return response.data;
  },
  getFinancialHealth: async () => {
    const response = await api.get('/dashboard/financial-health');
    return response.data;
  },
};

// Transactions API endpoints
export const transactionsAPI = {
  getAll: async (filters: any = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/transactions?${queryParams}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },
  create: async (transactionData: any) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },
  update: async (id: string, transactionData: any) => {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
  categorize: async (id: string, category: string) => {
    const response = await api.post(`/transactions/${id}/categorize`, { category });
    return response.data;
  },
  getSummary: async (startDate: string, endDate: string) => {
    const response = await api.get(
      `/transactions/summary?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },
  export: async (format: 'csv' | 'excel' | 'pdf' = 'csv', filters: any = {}) => {
    const queryParams = new URLSearchParams({
      ...filters,
      format,
    }).toString();
    const response = await api.get(`/transactions/export?${queryParams}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Alerts API endpoints
export const alertsAPI = {
  getAll: async (filters: any = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/alerts?${queryParams}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/alerts/${id}`);
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await api.post(`/alerts/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.post('/alerts/read-all');
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/alerts/${id}`);
    return response.data;
  },
  deleteAllRead: async () => {
    const response = await api.delete('/alerts/delete-all-read');
    return response.data;
  },
  getPreferences: async () => {
    const response = await api.get('/alerts/preferences');
    return response.data;
  },
  updatePreferences: async (preferences: any) => {
    const response = await api.put('/alerts/preferences', preferences);
    return response.data;
  },
};

// Chatbot API endpoints
export const chatbotAPI = {
  sendMessage: async (message: string) => {
    const response = await api.post('/chatbot/query', { message });
    return response.data;
  },
  getConversationHistory: async () => {
    const response = await api.get('/chatbot/history');
    return response.data;
  },
  clearConversation: async () => {
    const response = await api.delete('/chatbot/history');
    return response.data;
  },
};

// Accounts API endpoints
export const accountsAPI = {
  getAll: async () => {
    const response = await api.get('/accounts');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },
  connect: async (accountData: any) => {
    const response = await api.post('/accounts/connect', accountData);
    return response.data;
  },
  disconnect: async (id: string) => {
    const response = await api.delete(`/accounts/${id}/disconnect`);
    return response.data;
  },
  refresh: async (id: string) => {
    const response = await api.post(`/accounts/${id}/refresh`);
    return response.data;
  },
  updateStatus: async (id: string, status: 'active' | 'inactive') => {
    const response = await api.put(`/accounts/${id}/status`, { status });
    return response.data;
  },
};

// Category Rules API endpoints
export const categoryRulesAPI = {
  getAll: async () => {
    const response = await api.get('/category-rules');
    return response.data;
  },
  create: async (ruleData: any) => {
    const response = await api.post('/category-rules', ruleData);
    return response.data;
  },
  update: async (id: string, ruleData: any) => {
    const response = await api.put(`/category-rules/${id}`, ruleData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/category-rules/${id}`);
    return response.data;
  },
  toggleStatus: async (id: string, enabled: boolean) => {
    const response = await api.put(`/category-rules/${id}/status`, { enabled });
    return response.data;
  },
};

// User Preferences API endpoints
export const preferencesAPI = {
  get: async () => {
    const response = await api.get('/preferences');
    return response.data;
  },
  update: async (preferences: any) => {
    const response = await api.put('/preferences', preferences);
    return response.data;
  },
};

// Security API endpoints
export const securityAPI = {
  getSessions: async () => {
    const response = await api.get('/security/sessions');
    return response.data;
  },
  endSession: async (sessionId: string) => {
    const response = await api.delete(`/security/sessions/${sessionId}`);
    return response.data;
  },
  enable2FA: async () => {
    const response = await api.post('/security/2fa/enable');
    return response.data;
  },
  disable2FA: async () => {
    const response = await api.post('/security/2fa/disable');
    return response.data;
  },
  verify2FA: async (code: string) => {
    const response = await api.post('/security/2fa/verify', { code });
    return response.data;
  },
};

export default api;