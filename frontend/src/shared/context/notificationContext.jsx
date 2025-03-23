// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import NotificationService from '@services/notificationService';
import io from 'socket.io-client';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn('useNotifications used outside NotificationProvider');
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      fetchNotifications: () => Promise.resolve([]),
      markAsRead: () => Promise.resolve({}),
      markAllAsRead: () => Promise.resolve({}),
    };
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const socketInstance = io('http://localhost:5000', {
        query: { 
          userId: user.id,
          token: localStorage.getItem('authToken')
        }
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected for notifications');
      });

      socketInstance.on('notification', (newNotification) => {
        console.log('New notification received:', newNotification);
        
        // Add new notification to the list
        setNotifications(prev => [newNotification, ...prev]);
        
        // Update unread count
        if (!newNotification.read) {
          setUnreadCount(prev => prev + 1);
        }
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(socketInstance);

      // Clean up on unmount
      return () => {
        socketInstance.disconnect();
      };
    }
    
    // Clean up previous socket if auth state changes
    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [isAuthenticated, user?.id]);

  // Fetch notifications from the API
  const fetchNotifications = useCallback(async (page = 1, limit = 10) => {
    if (!isAuthenticated) return [];
    
    setLoading(true);
    try {
      const response = await NotificationService.getUserNotifications(page, limit);
      
      if (response.success) {
        setNotifications(response.data?.notifications || []);
        return response.data?.notifications || [];
      } else {
        console.error('Failed to fetch notifications:', response.message);
        return [];
      }
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    
    try {
      const response = await NotificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data?.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated]);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await NotificationService.markAsRead(notificationId);
      
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, message: error.message };
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await NotificationService.markAllAsRead();
      
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        
        // Reset unread count
        setUnreadCount(0);
      }
      
      return response;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, message: error.message };
    }
  }, []);

  // Fetch notifications and unread count when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      // Reset state when not authenticated
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    fetchUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;