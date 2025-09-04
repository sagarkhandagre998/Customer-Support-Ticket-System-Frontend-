
import axios from 'axios';
import { User, Ticket, Comment, Attachment, TicketFormData, CommentFormData, LoginFormData, LoginResponse, RegisterFormData, TicketFilters, DashboardStats, Notification } from '@/types';
import { DEMO_USERS, DEMO_TICKETS, getTicketsByUserRole, getDashboardStatsByUserRole } from './demoData';

// Debug function to check API configuration
export const debugAPI = () => {
  console.log('🔍 API Debug Information:');
  console.log('Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080');
  console.log('Current token:', localStorage.getItem('token'));
  console.log('Token type:', localStorage.getItem('token')?.startsWith('demo-token-') ? 'Demo Token' : 'Real Token');
  console.log('API instance baseURL:', api.defaults.baseURL);
  console.log('API timeout:', api.defaults.timeout);
  console.log('Upload API timeout:', uploadApi.defaults.timeout);
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for general requests
});

// Create axios instance for file uploads with longer timeout
const uploadApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 120000, // 2 minutes timeout for file uploads
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !token.startsWith('demo-token-')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging for requests
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });
    
    // In development, also log to help with debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Development Error - This should trigger Next.js error overlay');
      console.error('Full error object:', error);
    }
    
    return Promise.reject(error);
  }
);

// Request interceptor for upload API
uploadApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Upload API - Token:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (token && !token.startsWith('demo-token-')) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Upload API - Authorization header set');
    } else {
      console.log('Upload API - No valid token found');
    }
    
    console.log('Upload API - Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('Upload API - Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle different error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('demoUserId');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.error('Access forbidden');
    } else if (error.response?.status === 404) {
      // Not found
      console.error('Resource not found');
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error occurred');
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      console.error('Request timeout');
    } else if (!error.response) {
      // Network error (no response)
      console.error('Network error - check if backend is running');
    }
    
    return Promise.reject(error);
  }
);

// Response interceptor for upload API with better error handling
uploadApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Upload API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      console.error('Upload request timeout - file may be too large or backend is slow');
    } else if (error.response?.status === 413) {
      console.error('File too large');
    } else if (error.response?.status === 415) {
      console.error('Unsupported file type');
    } else if (!error.response) {
      console.error('Upload network error - check if backend is running');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (data: LoginFormData): Promise<LoginResponse> => {
    console.log('API: Making login request to /login with data:', data);
    try {
      const response = await api.post('auth/login', data);
      console.log('API: Login response received:', response.data);
      console.log('API: Response status:', response.status);
      console.log('API: Response headers:', response.headers);
      
      // Check if response.data is empty or undefined
      if (!response.data || Object.keys(response.data).length === 0) {
        console.error('API: Empty response data received');
        console.error('API: Full response object:', response);
      }
      
      return response.data;
    } catch (error) {
      console.error('API: Login request failed:', error);
      throw error;
    }
  },
  
  register: async (data: RegisterFormData) => {
    const response = await api.post('auth/register', data);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('auth/logout');
    return response.data;
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('auth/me');
    return response.data;
  },
};



// Tickets API
export const ticketsAPI = {
  getAll: async (): Promise<Ticket[]> => {
    try {
      const response = await api.get('/tickets');
      return response.data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // Fallback to demo data if backend fails
      const token = localStorage.getItem('token');
      if (token?.startsWith('demo-token-')) {
        const demoUserId = localStorage.getItem('demoUserId');
        const demoUser = DEMO_USERS.find(user => user.id === demoUserId);
        if (demoUser) {
          return getTicketsByUserRole(demoUser.role, demoUser.id);
        }
      }
      throw error;
    }
  },
  
  getById: async (id: string): Promise<Ticket> => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },
  
  create: async (data: TicketFormData): Promise<Ticket> => {
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('description', data.description);
    formData.append('priority', data.priority);
    if (data.category) formData.append('category', data.category);
    
    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    
    // Use uploadApi for file uploads with longer timeout
    const response = await uploadApi.post('/tickets/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  update: async (id: string, data: Partial<Ticket>): Promise<Ticket> => {
    const response = await api.put(`/tickets/${id}`, data);
    return response.data;
  },
  
  updateStatus: async (id: string, status: Ticket['status']): Promise<Ticket> => {
    const response = await api.patch(`/tickets/${id}/status`, { status });
    return response.data;
  },
  
  assign: async (id: string, assigneeId: string): Promise<Ticket> => {
    const response = await api.patch(`/tickets/${id}/assign`, { assigneeId });
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tickets/${id}`);
  },
  
  rate: async (id: string, rating: number, feedback?: string): Promise<Ticket> => {
    const response = await api.post(`/tickets/${id}/rate`, { rating, feedback });
    return response.data;
  },
};

// Comments API
export const commentsAPI = {
  getByTicketId: async (ticketId: string): Promise<Comment[]> => {
    const response = await api.get(`/comments/${ticketId}`);
    return response.data;
  },
  
  create: async (ticketId: string, data: CommentFormData): Promise<Comment> => {
    const response = await api.post(`/comments/${ticketId}`, data);
    return response.data;
  },
  
  update: async (id: string, data: CommentFormData): Promise<Comment> => {
    const response = await api.put(`/comments/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/comments/${id}`);
  },
};

// Attachments API
export const attachmentsAPI = {
  upload: async (ticketId: string, files: File[]): Promise<Attachment[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    // Use uploadApi for file uploads with longer timeout
    const response = await uploadApi.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/attachments/${id}`);
  },
  
  download: async (id: string): Promise<Blob> => {
    const response = await api.get(`/attachments/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get('/dashboard/stats/my');
      return response.data;
    } catch (error) {
      // Fallback to demo data
      const token = localStorage.getItem('token');
      if (token?.startsWith('demo-token-')) {
        const demoUserId = localStorage.getItem('demoUserId');
        const demoUser = DEMO_USERS.find(user => user.id === demoUserId);
        if (demoUser) {
          return getDashboardStatsByUserRole(demoUser.role, demoUser.id);
        }
      }
      throw error;
    }
  },
  
  getMyTickets: async (): Promise<Ticket[]> => {
    try {
      const response = await api.get('tickets/my-tickets');
      return response.data;
    } catch (error) {
      // Fallback to demo data
      const token = localStorage.getItem('token');
      if (token?.startsWith('demo-token-')) {
        const demoUserId = localStorage.getItem('demoUserId');
        const demoUser = DEMO_USERS.find(user => user.id === demoUserId);
        if (demoUser) {
          return getTicketsByUserRole(demoUser.role, demoUser.id);
        }
      }
      throw error;
    }
  },
  
  getAssignedTickets: async (): Promise<Ticket[]> => {
    try {
      const response = await api.get('/dashboard/assigned-tickets');
      return response.data;
    } catch (error) {
      // Fallback to demo data
      const token = localStorage.getItem('token');
      if (token?.startsWith('demo-token-')) {
        const demoUserId = localStorage.getItem('demoUserId');
        const demoUser = DEMO_USERS.find(user => user.id === demoUserId);
        if (demoUser) {
          return DEMO_TICKETS.filter(ticket => ticket.assignee?.id === demoUserId);
        }
      }
      throw error;
    }
  },
};

// Admin API - for admin users to manage all users and tickets
export const adminAPI = {
  // User Management
  getAllUsers: async (): Promise<User[]> => {
    try {
      console.log('🔵 Fetching all users from /admin/users');
      const response = await api.get('/admin/users');
      console.log('✅ Users fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch users:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Full error object:', error);
      
      // Fallback to demo data
      console.log('🔄 Falling back to demo users data');
      const token = localStorage.getItem('token');
      if (token?.startsWith('demo-token-')) {
        return DEMO_USERS;
      }
      throw error;
    }
  },
  
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  
  createUser: async (data: Omit<RegisterFormData, 'confirmPassword'> & { role: User['role'] }): Promise<User> => {
    try {
      console.log('🔵 Creating user with data:', data);
      console.log('🔵 API endpoint: /admin/users');
      console.log('🔵 Full URL will be:', `${api.defaults.baseURL}/admin/users`);
      
      // Transform the data to match backend expectations
      const requestData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: {
          name: data.role // Convert string role to role object
        }
      };
      
      console.log('🔵 Request payload:', JSON.stringify(requestData, null, 2));
      console.log('🔵 API instance config:', {
        baseURL: api.defaults.baseURL,
        timeout: api.defaults.timeout,
        headers: api.defaults.headers
      });
      
      const response = await api.post('/admin/users', requestData);
      
      console.log('✅ User created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to create user:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      console.error('❌ Full error object:', error);
      console.error('❌ Error config:', error.config);
      
      // Show detailed error in toast
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to create user';
      
      // Re-throw the original error to trigger Next.js error overlay
      console.error('🚨 Re-throwing error to trigger Next.js error overlay');
      throw error;
    }
  },
  
  
  
  deleteUser: async (id: string): Promise<void> => {
    try {
      console.log('🔵 Deleting user:', id);
      await api.delete(`/admin/users/${id}`);
      console.log('✅ User deleted successfully');
    } catch (error: any) {
      console.error('❌ Failed to delete user:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to delete user';
      
      throw new Error(`Delete User Error: ${errorMessage} (Status: ${error.response?.status || 'Unknown'})`);
    }
  },
  
  updateUserRole: async (id: string, role: User['role']): Promise<User> => {
    try {
      // Ensure role is a string, not an object
      const roleName = typeof role === 'string' ? role : (role as any)?.name || 'ROLE_USER';
      console.log('🔵 Updating user role:', { userId: id, role, roleName });
      const response = await api.put(`/admin/users/${id}/role?roleName=${encodeURIComponent(roleName)}`);
      console.log('✅ User role updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to update user role:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Full error object:', error);
      throw error;
    }
  },
  


  // Ticket Management
  getAllTickets: async (): Promise<Ticket[]> => {
    try {
      const response = await api.get('/admin/tickets');
      return response.data;
    } catch (error) {
      console.error('Error fetching all tickets:', error);
      // Fallback to demo data
      const token = localStorage.getItem('token');
      if (token?.startsWith('demo-token-')) {
        return DEMO_TICKETS;
      }
      throw error;
    }
  },
  
  getTicketById: async (id: string): Promise<Ticket> => {
    const response = await api.get(`/admin/tickets/${id}`);
    return response.data;
  },
  
  updateTicket: async (id: string, data: Partial<Ticket>): Promise<Ticket> => {
    const response = await api.put(`/admin/tickets/${id}`, data);
    return response.data;
  },
  
  updateTicketStatus: async (id: string, status: Ticket['status']): Promise<Ticket> => {
    const response = await api.patch(`/admin/tickets/${id}/status?status=${encodeURIComponent(status)}`);
    return response.data;
  },
  
  assignTicket: async (id: string, assigneeId: string): Promise<Ticket> => {
    const response = await api.patch(`/admin/tickets/${id}/assign?userId=${encodeURIComponent(assigneeId)}`);
    return response.data;
  },
  
  deleteTicket: async (id: string): Promise<void> => {
    await api.delete(`/admin/tickets/${id}`);
  },
  
  
  // Get tickets by user
  getTicketsByUser: async (userId: string): Promise<Ticket[]> => {
    try {
      const response = await api.get(`/admin/users/${userId}/tickets`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      // Fallback to demo data
      const token = localStorage.getItem('token');
      if (token?.startsWith('demo-token-')) {
        return DEMO_TICKETS.filter(ticket => ticket.ownerId === userId);
      }
      throw error;
    }
  },
  
  // Get assigned tickets for a user
  getAssignedTicketsByUser: async (userId: string): Promise<Ticket[]> => {
    try {
      const response = await api.get(`/admin/users/${userId}/assigned-tickets`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned tickets:', error);
      // Fallback to demo data
      const token = localStorage.getItem('token');
      if (token?.startsWith('demo-token-')) {
        return DEMO_TICKETS.filter(ticket => ticket.assignee?.id === userId);
      }
      throw error;
    }
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },
  
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },
  
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};

export default api;
