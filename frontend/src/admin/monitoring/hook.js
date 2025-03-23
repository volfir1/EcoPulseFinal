// hooks/useAdmin.js
import { useState, useEffect, useCallback } from 'react';
import AdminService from '../../services/adminService';
import { useAuth } from '@context/AuthContext';
import { toast } from 'react-toastify';

export const useAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, isAdmin } = useAuth();

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) {
      setError('Unauthorized access');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await AdminService.getDashboardSummary();
      
      if (response.success) {
        setDashboardData(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('An error occurred while fetching dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    refreshDashboard: fetchDashboardData
  };
};

export const useActivities = (initialPage = 1, initialLimit = 10) => {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, isAdmin } = useAuth();

  const fetchActivities = useCallback(async (page = pagination.page, limit = pagination.limit) => {
    if (!isAuthenticated || !isAdmin) {
      setError('Unauthorized access');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await AdminService.getAccountActivities(page, limit);
      
      if (response.success) {
        setActivities(response.data.activities);
        setPagination(response.data.pagination);
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch activities');
      }
    } catch (err) {
      setError('An error occurred while fetching activities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, pagination.page, pagination.limit]);

  const markAsRead = useCallback(async (activityId) => {
    try {
      const response = await AdminService.markActivityAsRead(activityId);
      
      if (response.success) {
        setActivities(prevActivities => 
          prevActivities.map(activity => 
            activity.id === activityId ? { ...activity, isRead: true } : activity
          )
        );
        toast.success('Activity marked as read');
        return true;
      } else {
        toast.error(response.message || 'Failed to mark activity as read');
        return false;
      }
    } catch (err) {
      toast.error('An error occurred');
      console.error(err);
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await AdminService.markAllActivitiesAsRead();
      
      if (response.success) {
        setActivities(prevActivities => 
          prevActivities.map(activity => ({ ...activity, isRead: true }))
        );
        toast.success('All activities marked as read');
        return true;
      } else {
        toast.error(response.message || 'Failed to mark all activities as read');
        return false;
      }
    } catch (err) {
      toast.error('An error occurred');
      console.error(err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchActivities(initialPage, initialLimit);
  }, [fetchActivities, initialPage, initialLimit]);

  return {
    activities,
    pagination,
    loading,
    error,
    fetchActivities,
    markAsRead,
    markAllAsRead,
    setPage: (page) => fetchActivities(page, pagination.limit),
    setLimit: (limit) => fetchActivities(pagination.page, limit)
  };
};

export const useNotifications = (initialPage = 1, initialLimit = 10) => {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, isAdmin } = useAuth();

  const fetchNotifications = useCallback(async (page = pagination.page, limit = pagination.limit) => {
    if (!isAuthenticated || !isAdmin) {
      setError('Unauthorized access');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await AdminService.getNotifications(page, limit);
      
      if (response.success) {
        setNotifications(response.data.notifications);
        setPagination(response.data.pagination);
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError('An error occurred while fetching notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, pagination.page, pagination.limit]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await AdminService.markNotificationAsRead(notificationId);
      
      if (response.success) {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === notificationId ? { ...notification, isRead: true } : notification
          )
        );
        toast.success('Notification marked as read');
        return true;
      } else {
        toast.error(response.message || 'Failed to mark notification as read');
        return false;
      }
    } catch (err) {
      toast.error('An error occurred');
      console.error(err);
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await AdminService.markAllNotificationsAsRead();
      
      if (response.success) {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({ ...notification, isRead: true }))
        );
        toast.success('All notifications marked as read');
        return true;
      } else {
        toast.error(response.message || 'Failed to mark all notifications as read');
        return false;
      }
    } catch (err) {
      toast.error('An error occurred');
      console.error(err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchNotifications(initialPage, initialLimit);
  }, [fetchNotifications, initialPage, initialLimit]);

  return {
    notifications,
    pagination,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    setPage: (page) => fetchNotifications(page, pagination.limit),
    setLimit: (limit) => fetchNotifications(pagination.page, limit)
  };
};

export const useAutoDeactivation = () => {
  const [stats, setStats] = useState(null);
  const [inactiveLogins, setInactiveLogins] = useState([]);
  const [loginsPagination, setLoginsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState({
    stats: true,
    logins: true,
    metrics: true
  });
  const [error, setError] = useState({
    stats: null,
    logins: null,
    metrics: null
  });
  const { isAuthenticated, isAdmin } = useAuth();

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) {
      setError(prev => ({ ...prev, stats: 'Unauthorized access' }));
      setLoading(prev => ({ ...prev, stats: false }));
      return;
    }

    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const response = await AdminService.getAutoDeactivationStats();
      
      if (response.success) {
        setStats(response.data);
        setError(prev => ({ ...prev, stats: null }));
      } else {
        setError(prev => ({ ...prev, stats: response.message || 'Failed to fetch stats' }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, stats: 'An error occurred while fetching stats' }));
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, [isAuthenticated, isAdmin]);

  const fetchInactiveLogins = useCallback(async (page = 1, limit = 10, days = 30) => {
    if (!isAuthenticated || !isAdmin) {
      setError(prev => ({ ...prev, logins: 'Unauthorized access' }));
      setLoading(prev => ({ ...prev, logins: false }));
      return;
    }

    try {
      setLoading(prev => ({ ...prev, logins: true }));
      const response = await AdminService.getInactiveAccountLogins(page, limit, days);
      
      if (response.success) {
        setInactiveLogins(response.data.attempts);
        setLoginsPagination(response.data.pagination);
        setError(prev => ({ ...prev, logins: null }));
      } else {
        setError(prev => ({ ...prev, logins: response.message || 'Failed to fetch inactive logins' }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, logins: 'An error occurred while fetching inactive logins' }));
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, logins: false }));
    }
  }, [isAuthenticated, isAdmin]);

  const fetchMetrics = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) {
      setError(prev => ({ ...prev, metrics: 'Unauthorized access' }));
      setLoading(prev => ({ ...prev, metrics: false }));
      return;
    }

    try {
      setLoading(prev => ({ ...prev, metrics: true }));
      const response = await AdminService.getReactivationMetrics();
      
      if (response.success) {
        setMetrics(response.data);
        setError(prev => ({ ...prev, metrics: null }));
      } else {
        setError(prev => ({ ...prev, metrics: response.message || 'Failed to fetch metrics' }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, metrics: 'An error occurred while fetching metrics' }));
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, metrics: false }));
    }
  }, [isAuthenticated, isAdmin]);

  const triggerAutoDeactivation = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) {
      toast.error('Unauthorized access');
      return false;
    }

    try {
      const response = await AdminService.triggerAutoDeactivation();
      
      if (response.success) {
        toast.success('Auto-deactivation process triggered successfully');
        
        // Refresh all data
        fetchStats();
        fetchInactiveLogins();
        fetchMetrics();
        
        return true;
      } else {
        toast.error(response.message || 'Failed to trigger auto-deactivation process');
        return false;
      }
    } catch (err) {
      toast.error('An error occurred');
      console.error(err);
      return false;
    }
  }, [isAuthenticated, isAdmin, fetchStats, fetchInactiveLogins, fetchMetrics]);

  useEffect(() => {
    fetchStats();
    fetchInactiveLogins();
    fetchMetrics();
  }, [fetchStats, fetchInactiveLogins, fetchMetrics]);

  return {
    stats,
    inactiveLogins,
    loginsPagination,
    metrics,
    loading,
    error,
    fetchStats,
    fetchInactiveLogins,
    fetchMetrics,
    triggerAutoDeactivation,
    setLoginsPage: (page) => fetchInactiveLogins(page, loginsPagination.limit, 30),
    setLoginsLimit: (limit) => fetchInactiveLogins(loginsPagination.page, limit, 30),
    setLoginsDays: (days) => fetchInactiveLogins(1, loginsPagination.limit, days)
  };
};

export const useSystemHealth = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, isAdmin } = useAuth();

  const fetchSystemHealth = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) {
      setError('Unauthorized access');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await AdminService.getSystemHealth();
      
      if (response.success) {
        setHealthData(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch system health data');
      }
    } catch (err) {
      setError('An error occurred while fetching system health data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    fetchSystemHealth();
    
    // Refresh system health every 5 minutes
    const interval = setInterval(fetchSystemHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchSystemHealth]);

  return {
    healthData,
    loading,
    error,
    refreshSystemHealth: fetchSystemHealth
  };
};