// src/services/ticketService.js - Updated routes

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Standardize token retrieval
const getAuthToken = () => {
  return localStorage.getItem('authToken') || 
         localStorage.getItem('accessToken') || 
         localStorage.getItem('token');
};

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    const customError = {
      success: false,
      message: error.response?.data?.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data
    };
    return Promise.reject(customError);
  }
);

// Helper to normalize API responses
const normalizeResponse = (response) => {
  // Check if response exists and has data
  if (!response || !response.data) {
    return { success: false, data: [] };
  }
  
  // Handle different response structures
  if (response.data.success !== undefined) {
    // Response already has success field, return it with data field
    return {
      success: response.data.success,
      data: response.data.data || [],
      message: response.data.message
    };
  } else {
    // Simple data response
    return {
      success: true,
      data: response.data
    };
  }
};

const ticketService = {
  // Create a new ticket
  createTicket: async (ticketData) => {
    try {
      console.log("Creating ticket with data:", ticketData);
      const response = await axiosInstance.post('/ticket', ticketData);
      return normalizeResponse(response);
    } catch (error) {
      console.error('Ticket creation error:', error);
      throw error;
    }
  },

  // Get tickets for logged-in user
  getUserTickets: async () => {
    try {
      console.log("Fetching user tickets...");
      const response = await axiosInstance.get('/ticket/user');
      console.log("User tickets API response:", response);
      const result = normalizeResponse(response);
      console.log("Normalized user tickets:", result);
      return result;
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      throw error;
    }
  },

  // Get all tickets (admin only)
  getAllTickets: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axiosInstance.get(`/ticket/all${queryString}`);
      return normalizeResponse(response);
    } catch (error) {
      console.error('Error fetching all tickets:', error);
      throw error;
    }
  },

  // Get ticket statistics
  getTicketStats: async () => {
    try {
      const response = await axiosInstance.get('/ticket/stats');
      return normalizeResponse(response);
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      // Return default stats object on error
      return { 
        success: false, 
        data: {
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
          unassigned: 0
        },
        message: error.message || 'Failed to fetch ticket stats'
      };
    }
  },

  // Get specific ticket
  getTicket: async (id) => {
    try {
      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Invalid ticket ID');
      }
      
      console.log(`Fetching ticket with ID ${id}`);
      const response = await axiosInstance.get(`/ticket/${id}`);
      return normalizeResponse(response);
    } catch (error) {
      console.error(`Error fetching ticket ${id}:`, error);
      throw error;
    }
  },

  // Update ticket status
  updateTicketStatus: async (id, status) => {
    try {
      if (!id || !status) {
        throw new Error('Ticket ID and status are required');
      }
      
      const response = await axiosInstance.put(`/ticket/${id}/status`, { status });
      return normalizeResponse(response);
    } catch (error) {
      console.error(`Error updating ticket ${id} status:`, error);
      throw error;
    }
  },

  // Reply to ticket
  replyToTicket: async (id, content) => {
    try {
      if (!id || !content) {
        throw new Error('Ticket ID and content are required');
      }
      
      const response = await axiosInstance.post(`/ticket/${id}/reply`, { content });
      return normalizeResponse(response);
    } catch (error) {
      console.error(`Error replying to ticket ${id}:`, error);
      throw error;
    }
  },

  // Assign ticket
  assignTicket: async (id, adminId) => {
    try {
      if (!id || !adminId) {
        throw new Error('Ticket ID and admin ID are required');
      }
      
      const response = await axiosInstance.put(`/ticket/${id}/assign`, { adminId });
      return normalizeResponse(response);
    } catch (error) {
      console.error(`Error assigning ticket ${id}:`, error);
      throw error;
    }
  },

  // Delete ticket
  deleteTicket: async (id) => {
    try {
      if (!id) {
        throw new Error('Ticket ID is required');
      }
      
      await axiosInstance.delete(`/ticket/${id}`);
      return { success: true, message: 'Ticket deleted successfully' };
    } catch (error) {
      console.error(`Error deleting ticket ${id}:`, error);
      throw error;
    }
  },
  
  // Get admin users for assignment
  getAdmins: async () => {
    try {
      const response = await axiosInstance.get('/ticket/admins');
      return normalizeResponse(response);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch admin users',
        data: []
      };
    }
  }
};

export default ticketService;