// pages/admin/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNotifications } from '@context/notificationContext';
import { Bell, Shield, AlertCircle, RefreshCw, User, Check, CheckCheck, Trash2, Calendar, Clock } from 'lucide-react';
// import AdminLayout from '@layouts/AdminLayout'; // Adjust this import to match your project structure

const NotificationsPage = () => {
  const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead, fetchUnreadCount } = useNotifications();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    loadNotifications();
  }, [page, limit, filter]);
  
  const loadNotifications = async () => {
    await fetchNotifications(page, limit);
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications(page, limit);
    await fetchUnreadCount();
    setIsRefreshing(false);
  };
  
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    await fetchUnreadCount();
  };
  
  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
    await fetchUnreadCount();
  };
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return notification.read === false;
    if (filter === 'read') return notification.read === true;
    return true;
  });
  
  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'account_recovery':
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      case 'security_alert':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'admin_notification':
        return <Shield className="w-5 h-5 text-purple-600" />;
      case 'system_notification':
        return <Bell className="w-5 h-5 text-gray-600" />;
      case 'account_deactivated':
        return <User className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown time';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={loading || !notifications.some(n => !n.read)}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <span className="text-sm text-gray-500">Filter:</span>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-gray-200 font-medium' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${filter === 'unread' ? 'bg-blue-600 text-white font-medium' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${filter === 'read' ? 'bg-gray-200 font-medium' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setFilter('read')}
          >
            Read
          </button>
        </div>
      </div>
      
      {/* Notifications list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Bell className="w-12 h-12 mb-4 text-gray-400" />
          <p className="text-lg">No notifications found</p>
          <p className="text-sm">
            {filter === 'all' ? "You don't have any notifications yet." : 
             filter === 'unread' ? "You don't have any unread notifications." : 
             "You don't have any read notifications."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <li 
                key={notification._id} 
                className={`p-4 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-blue-800'}`}>
                        {notification.title || 'Notification'}
                      </h3>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(notification.timestamp || notification.createdAt)}
                        </div>
                        
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="p-1 rounded hover:bg-gray-200 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                      {notification.message || 'No message content'}
                    </p>
                    
                    {notification.priority === 'high' && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          High Priority
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Pagination */}
      {!loading && filteredNotifications.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Showing {filteredNotifications.length} notifications
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(page > 1 ? page - 1 : 1)}
              disabled={page === 1}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md"
            >
              Next
            </button>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="p-1 text-sm bg-white border border-gray-300 rounded-md"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;