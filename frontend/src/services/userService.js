// src/services/userService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  console.log('Auth token retrieved:', token ? `${token.substring(0, 15)}...` : 'No token found');
  return token;
};

// Helper function to handle API errors consistently
const handleApiError = (error, functionName) => {
  console.error(`API error in ${functionName}:`, error);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Error response:', error.response.data);
    console.error('Error status:', error.response.status);
    
    return {
      success: false,
      message: error.response.data?.message || `Server error (${error.response.status})`,
      error: error.response.data
    };
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
    return {
      success: false,
      message: 'No response from server. Please check your network connection.',
      error: { type: 'network', details: error.request }
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request setup error:', error.message);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      error: { type: 'setup', details: error.message }
    };
  }
};

export const userService = {
  // Get current user data (NEW METHOD)
  getCurrentUser: async () => {
    try {
      console.log('Fetching current user data...');
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No auth token available for getCurrentUser');
        return null;
      }
      
      // Try to get user from localStorage first
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          const userData = JSON.parse(cachedUser);
          console.log('Retrieved user from localStorage:', userData.id || userData._id);
          
          // Return the cached user since we don't have an API endpoint
          return userData;
        } catch (parseError) {
          console.error('Error parsing user from localStorage:', parseError);
        }
      }
      
      // If we reached here, we couldn't get the user from localStorage
      // Try an API call if you have a dedicated endpoint:
      try {
        const response = await axios.get(`${API_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.user) {
          const userData = response.data.user;
          
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(userData));
          
          return userData;
        } else if (response.data && response.data.success !== false) {
          // If the data is directly in the response
          localStorage.setItem('user', JSON.stringify(response.data));
          return response.data;
        }
      } catch (apiError) {
        console.error('API error in getCurrentUser:', apiError);
        // Fall back to localStorage if API fails
      }
      
      // If everything fails, return null
      return null;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  },
  
  // Update user profile (NEW METHOD)
  updateUserProfile: async (userData) => {
    try {
      console.log('Updating user profile:', userData);
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No auth token available for updateUserProfile');
        return { success: false, message: 'Not authenticated' };
      }
      
      // Handle both cases where userId might be in userData.id or separate
      const userId = userData.id || userData._id;
      if (!userId) {
        return { success: false, message: 'User ID is required' };
      }
      
      const response = await axios.put(
        `${API_URL}/users/${userId}`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success !== false) {
        // Update user in localStorage
        try {
          const cachedUser = localStorage.getItem('user');
          if (cachedUser) {
            const currentUser = JSON.parse(cachedUser);
            const updatedUser = { ...currentUser, ...userData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (storageError) {
          console.error('Error updating user in localStorage:', storageError);
        }
        
        return { 
          success: true, 
          message: 'Profile updated successfully',
          ...response.data
        };
      }
      
      return response.data;
    } catch (error) {
      return handleApiError(error, 'updateUserProfile');
    }
  },

  // Get all users (admin function)
  getAllUsers: async () => {
    try {
      console.log('Fetching all users...');
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No auth token available for getAllUsers');
        return { success: false, users: [] };
      }
      
      const response = await axios.get(`${API_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Debug the response
      console.log('API response status:', response.status);
      
      // Safely access the users array
      if (response.data && response.data.data && Array.isArray(response.data.data.users)) {
        const allUsers = response.data.data.users;
        console.log(`Found ${allUsers.length} total users`);
        
        // Filter out deactivated users client-side
        const activeUsers = allUsers.filter(user => !user.isDeactivated && !user.isAutoDeactivated);
        console.log(`After filtering: ${activeUsers.length} active users`);
        
        return { success: true, users: activeUsers };
      } else if (response.data && Array.isArray(response.data.users)) {
        // Alternative data structure
        const allUsers = response.data.users;
        console.log(`Found ${allUsers.length} total users (alternate structure)`);
        
        // Filter out deactivated users client-side
        const activeUsers = allUsers.filter(user => !user.isDeactivated && !user.isAutoDeactivated);
        console.log(`After filtering: ${activeUsers.length} active users`);
        
        return { success: true, users: activeUsers };
      } else {
        console.warn('Unexpected data structure in getAllUsers:', response.data);
        return { success: true, users: [] };
      }
    } catch (error) {
      return handleApiError(error, 'getAllUsers');
    }
  },

  // Deactivate a user (admin function)
  deactivateUser: async (userId) => {
    try {
      console.log(`Attempting to deactivate user ${userId}...`);
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No auth token available for deactivateUser');
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await axios.post(
        `${API_URL}/auth/admin/deactivate-user`,
        { userId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Deactivation response:', response.data);
      
      // Return standard response format
      return {
        success: true,
        message: response.data.message || 'User successfully deactivated',
        ...response.data
      };
    } catch (error) {
      return handleApiError(error, 'deactivateUser');
    }
  },

  // Restore a deactivated user (admin function)
  restoreUser: async (userId) => {
    try {
      console.log(`Attempting to restore user ${userId}...`);
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No auth token available for restoreUser');
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await axios.post(
        `${API_URL}/auth/reactivate-account`,
        { userId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Restoration response:', response.data);
      
      // Return standard response format
      return {
        success: true,
        message: response.data.message || 'User successfully restored',
        ...response.data
      };
    } catch (error) {
      return handleApiError(error, 'restoreUser');
    }
  },

  // Update user role (admin function)
  updateUserRole: async (userId, newRole) => {
    try {
      console.log(`Updating user ${userId} role to ${newRole}...`);
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No auth token available for updateUserRole');
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await axios.put(
        `${API_URL}/auth/users/${userId}/role`,
        { role: newRole },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Role update response:', response.data);
      
      // Return standard response format
      return {
        success: true,
        message: response.data.message || `User role updated to ${newRole}`,
        ...response.data
      };
    } catch (error) {
      return handleApiError(error, 'updateUserRole');
    }
  },

  // Legacy method for compatibility
  softDeleteUser: async (userId) => {
    console.warn('softDeleteUser is deprecated, use deactivateUser instead');
    return userService.deactivateUser(userId);
  },

  // Add this function inside your userService export
  updateProfile: async (userId, profileData) => {
    try {
      console.log(`Updating profile for user ${userId}...`);
      const token = getAuthToken();

      if (!token) {
        console.warn('No auth token available for updateProfile');
        return { success: false, message: 'Not authenticated' };
      }

      const response = await axios.put(
        `${API_URL}/users/${userId}`, // Matches your backend route (updateUserProfile)
        profileData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Profile update response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'updateProfile');
    }
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    try {
      console.log('Change password request received');
      
      // First check parameter types to catch obvious mistakes
      if (typeof userId !== 'string' || userId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(userId)) {
        console.error(`Incorrect userId parameter: "${userId}"`);
        console.error('The userId parameter must be a 24-character MongoDB ObjectId');
        return { 
          success: false, 
          message: 'Invalid user ID format - must be a MongoDB ObjectId' 
        };
      }
      
      // Validate password params to catch possible parameter order mistakes
      if (!currentPassword || typeof currentPassword !== 'string') {
        console.error('Missing or invalid currentPassword parameter');
        return {
          success: false,
          message: 'Current password is required and must be a string'
        };
      }
      
      if (!newPassword || typeof newPassword !== 'string') {
        console.error('Missing or invalid newPassword parameter');
        return {
          success: false,
          message: 'New password is required and must be a string'
        };
      }
      
      const token = getAuthToken();
      if (!token) {
        console.warn('No auth token available for changePassword');
        return { 
          success: false, 
          message: 'Not authenticated' 
        };
      }

      // Make the API call - route adjusted to match your backend
      const response = await axios.put(
        `${API_URL}/users/${userId}/password`,
        { currentPassword, newPassword },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Password change response:', response.data);
      return response.data;

    } catch (error) {
      return handleApiError(error, 'changePassword');
    }
  },

  getDeactivatedUsers: async () => {
    try {
      console.log('Explicitly fetching deactivated users...');
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No auth token available for getDeactivatedUsers');
        return { success: false, users: [] };
      }

      // First try the dedicated deactivated endpoint (if it exists)
      try {
        const response = await axios.get(
          `${API_URL}/auth/users/deactivated`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        console.log('Deactivated users endpoint response:', {
          status: response.status,
          dataKeys: response.data ? Object.keys(response.data) : 'No data'
        });
        
        if (response.data && response.data.success && response.data.users) {
          console.log(`Found ${response.data.users.length} deactivated users from dedicated endpoint`);
          return response.data;
        }
      } catch (error) {
        console.log('Dedicated deactivated endpoint not available, trying alternative approach');
      }

      // If dedicated endpoint failed, try a post request with query
      try {
        const response = await axios.post(
          `${API_URL}/auth/users/query`,
          {
            // This explicitly asks for deactivated users only
            query: { 
              $or: [
                { isDeactivated: true },
                { isAutoDeactivated: true },
                { status: 'deactivated' },
                { status: 'deleted' },
                { status: 'inactive' }
              ]
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data && response.data.success && response.data.users) {
          console.log(`Found ${response.data.users.length} deactivated users via query endpoint`);
          return response.data;
        }
      } catch (error) {
        console.log('Query endpoint not available, falling back to regular endpoint with parameters');
      }
      
      // Last approach - try regular users endpoint with query parameters
      const response = await axios.get(
        `${API_URL}/auth/users`,
        {
          params: {
            deactivated: true,
            isDeactivated: true,
            includeAll: true,
            _t: Date.now() // Cache busting
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Regular endpoint with parameters response:', {
        status: response.status,
        dataKeys: response.data ? Object.keys(response.data) : 'No data'
      });
      
      let deactivatedUsers = [];
      
      // Extract users from different response formats
      if (response.data && Array.isArray(response.data.users)) {
        deactivatedUsers = response.data.users;
      } else if (response.data && response.data.data && Array.isArray(response.data.data.users)) {
        deactivatedUsers = response.data.data.users;
      } else if (Array.isArray(response.data)) {
        deactivatedUsers = response.data;
      } else {
        console.warn('Unexpected response format for deactivated users');
        
        // Try to find any array in the response
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            console.log(`Found array in response.data.${key}`);
            deactivatedUsers = response.data[key];
            break;
          }
        }
      }
      
      // Filter to ensure we're only getting deactivated users
      const filteredUsers = deactivatedUsers.filter(user => 
        user.isDeactivated === true || 
        user.isAutoDeactivated === true ||
        user.status === 'deactivated' ||
        user.status === 'deleted' ||
        user.status === 'inactive'
      );
      
      console.log(`Found ${filteredUsers.length} deactivated users after filtering`);
      
      return { 
        success: true, 
        users: filteredUsers 
      };
    } catch (error) {
      console.error('Error fetching deactivated users:', error);
      return handleApiError(error, 'getDeactivatedUsers');
    }
  }
};

export default userService;