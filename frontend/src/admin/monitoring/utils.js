// utils/adminUtils.js
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { saveAs } from 'file-saver';

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string
 * @returns {string} Formatted date
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy h:mm a') => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Get relative time (e.g., "2 days ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time
 */
export const getRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid date';
  }
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toLocaleString();
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === undefined || value === null) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Get color class based on percentage value
 * @param {number} percentage - Percentage value
 * @returns {string} CSS class name
 */
export const getPercentageColorClass = (percentage) => {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-green-500';
  if (percentage >= 40) return 'text-yellow-500';
  if (percentage >= 20) return 'text-orange-500';
  return 'text-red-500';
};

/**
 * Get status color class
 * @param {string} status - Status value
 * @returns {string} CSS class name
 */
export const getStatusColorClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'text-green-600';
    case 'inactive':
      return 'text-gray-500';
    case 'auto-deactivated':
      return 'text-orange-500';
    case 'deleted':
      return 'text-red-500';
    default:
      return 'text-gray-700';
  }
};

/**
 * Get status badge class
 * @param {string} status - Status value
 * @returns {string} CSS class name for badge
 */
export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'auto-deactivated':
      return 'bg-orange-100 text-orange-800';
    case 'deleted':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Download blob as file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename
 */
export const downloadBlob = (blob, filename) => {
  saveAs(blob, filename);
};

/**
 * Export data as CSV
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Filename
 */
export const exportToCsv = (data, filename) => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that need quotes (strings with commas, quotes, or newlines)
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value === null || value === undefined ? '' : value;
      }).join(',')
    )
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, filename);
};

/**
 * Get activity type icon class
 * @param {string} activityType - Type of activity
 * @returns {string} Icon class
 */
export const getActivityIconClass = (activityType) => {
  switch (activityType?.toLowerCase()) {
    case 'login':
      return 'fa-sign-in-alt';
    case 'logout':
      return 'fa-sign-out-alt';
    case 'profile_update':
      return 'fa-user-edit';
    case 'settings_change':
      return 'fa-cog';
    case 'password_reset':
      return 'fa-key';
    case 'account_created':
      return 'fa-user-plus';
    case 'account_deactivated':
      return 'fa-user-minus';
    case 'account_reactivated':
      return 'fa-user-check';
    default:
      return 'fa-circle';
  }
};

/**
 * Helper function to handle errors
 * @param {Error} error - Error object
 * @returns {Object} Standardized error response
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {
      success: false,
      message: error.response.data?.message || 'Server error',
      status: error.response.status
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      success: false,
      message: 'No response from server',
      status: 0
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      success: false,
      message: error.message || 'An error occurred',
      status: 0
    };
  }
};

/**
 * Create date range for reports
 * @param {string} range - Predefined range ('today', 'week', 'month', 'year')
 * @returns {Object} Start and end dates
 */
export const createDateRange = (range) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case 'today':
      return {
        startDate: today,
        endDate: now
      };
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      return {
        startDate: weekStart,
        endDate: now
      };
    case 'month':
      const monthStart = new Date(today);
      monthStart.setMonth(today.getMonth() - 1);
      return {
        startDate: monthStart,
        endDate: now
      };
    case 'year':
      const yearStart = new Date(today);
      yearStart.setFullYear(today.getFullYear() - 1);
      return {
        startDate: yearStart,
        endDate: now
      };
    default:
      return {
        startDate: today,
        endDate: now
      };
  }
};