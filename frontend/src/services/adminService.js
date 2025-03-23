// services/adminService.js
import axios from 'axios';
import { handleApiError } from '../utils/errorHandling'; // Use your existing adminUtils instead

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api';
const ADMIN_URL = `${API_BASE_URL}/admin`;

// Helper function to get auth headers from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  };
};

export const AdminService = {
  // Dashboard summary
  getDashboardSummary: async () => {
    try {
      const response = await axios.get(`${ADMIN_URL}/dashboard`, getAuthHeaders());
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Activities
  getAccountActivities: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${ADMIN_URL}/activities`, {
        ...getAuthHeaders(),
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  markActivityAsRead: async (activityId) => {
    try {
      const response = await axios.patch(`${ADMIN_URL}/activities/${activityId}/read`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  markAllActivitiesAsRead: async () => {
    try {
      const response = await axios.patch(`${ADMIN_URL}/activities/read-all`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Notifications
  getNotifications: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${ADMIN_URL}/notifications`, {
        ...getAuthHeaders(),
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await axios.patch(`${ADMIN_URL}/notifications/${notificationId}/read`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      const response = await axios.patch(`${ADMIN_URL}/notifications/read-all`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Reports
  getActivityReport: async (startDate, endDate, format = 'json') => {
    try {
      const response = await axios.get(`${ADMIN_URL}/reports/activity`, {
        ...getAuthHeaders(),
        params: { startDate, endDate, format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Auto-deactivation
  getAutoDeactivationStats: async () => {
    try {
      const response = await axios.get(`${ADMIN_URL}/auto-deactivation/stats`, getAuthHeaders());
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getInactiveAccountLogins: async (page = 1, limit = 10, days = 30) => {
    try {
      const response = await axios.get(`${ADMIN_URL}/inactive-account-logins`, {
        ...getAuthHeaders(),
        params: { page, limit, days }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getReactivationMetrics: async () => {
    try {
      const response = await axios.get(`${ADMIN_URL}/reports/reactivation-metrics`, getAuthHeaders());
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  triggerAutoDeactivation: async () => {
    try {
      const response = await axios.post(`${ADMIN_URL}/auto-deactivation/trigger`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getSystemHealth: async () => {
    try {
      const response = await axios.get(`${ADMIN_URL}/system-health`, getAuthHeaders());
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

export default AdminService;