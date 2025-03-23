// services/notificationService.js
import axios from 'axios';

const API_URL = "http://localhost:5000/api/notifications";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

const NotificationService = {
  // Get user notifications
  getUserNotifications: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}`, {
        ...getAuthHeaders(),
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch notifications',
        data: { notifications: [] }
      };
    }
  },

  // Get unread notification count
  getUnreadCount: async () => {
    try {
      const response = await axios.get(`${API_URL}/unread-count`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return {
        success: false,
        data: { count: 0 },
        message: error.response?.data?.message || 'Failed to fetch unread count'
      };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/${notificationId}/read`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark notification as read'
      };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await axios.patch(
        `${API_URL}/read-all`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark all notifications as read'
      };
    }
  },

  // Create a special notification (like inactive account login attempt)
  createSpecialNotification: async (notificationData) => {
    try {
      // This endpoint should be secured on the backend to ensure only valid notifications are created
      const response = await axios.post(
        `${API_URL}/special`,
        notificationData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating special notification:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create notification'
      };
    }
  },

  // Create a test notification (development only)
  createTestNotification: async (data = {}) => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Test notifications are only available in development mode');
      return { success: false, message: 'Not available in production' };
    }
    
    try {
      const response = await axios.post(
        `${API_URL}/test`,
        {
          type: data.type || 'system_notification',
          title: data.title || 'Test Notification',
          message: data.message || 'This is a test notification'
        },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating test notification:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create test notification'
      };
    }
  }
};

export default NotificationService;