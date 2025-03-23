// src/utils/errorHandling.js

/**
 * Standardized API error handling helper
 * @param {Error} error - The error object from a caught exception
 * @param {string} customMessage - Optional custom message to display
 * @returns {Object} Standardized error object with message, status, and details
 */
export const handleApiError = (error, customMessage = null) => {
    // Default error response
    const errorResponse = {
      message: customMessage || 'An unexpected error occurred',
      status: 500,
      details: null
    };
    
    // No error object
    if (!error) {
      return errorResponse;
    }
  
    // Handle axios errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      errorResponse.status = status;
      
      if (data && data.message) {
        errorResponse.message = data.message;
      } else if (status === 401) {
        errorResponse.message = 'Unauthorized. Please log in again.';
      } else if (status === 403) {
        errorResponse.message = 'Forbidden. You do not have permission to access this resource.';
      } else if (status === 404) {
        errorResponse.message = 'Resource not found.';
      } else if (status >= 500) {
        errorResponse.message = 'Server error. Please try again later.';
      }
      
      if (data) {
        errorResponse.details = data;
      }
    } else if (error.request) {
      // Request made but no response received
      errorResponse.message = 'No response from server. Please check your connection.';
      errorResponse.status = 0;
    } else {
      // Error occurred during request setup
      errorResponse.message = error.message || errorResponse.message;
    }
  
    // Log the error to console
    console.error('API Error:', errorResponse);
    
    return errorResponse;
  };
  
  /**
   * Format an error message for display to the user
   * @param {Object|Error|string} error - The error to format
   * @returns {string} Formatted error message
   */
  export const formatErrorMessage = (error) => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    if (error && error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  };
  
  /**
   * Show error toasts/alerts (can be integrated with your UI notification system)
   * Modify this to use your specific notification system
   * @param {Object|Error|string} error - The error to display
   * @param {Object} options - Options for displaying the notification
   */
  export const showErrorNotification = (error, options = {}) => {
    const message = formatErrorMessage(error);
    
    // If you're using a notification library, connect it here
    // For example with react-toastify:
    // toast.error(message, options);
    
    // For now, just log to console
    console.error('Error Notification:', message);
    
    return message;
  };