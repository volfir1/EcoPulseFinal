// src/hooks/useUserManagement.js
import { useState, useEffect, useCallback } from 'react';
import { userService } from '@services/userService';
import authService from '@services/authService';
import { userManagementData } from './data'; // Make sure this path is correct
import axios from 'axios';
export const useUserManagement = () => {
  const [data, setData] = useState({
    usersList: [],
    deletedUsers: [],
    statistics: {
      totalUsers: '0',
      activeUsers: '0',
      newUsers: '0',
      verifiedUsers: '0',
      deletedUsers: '0',
      inactiveUsers: '0' // Added inactiveUsers to initial state
    },
    activityData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  // Function to refresh the data
  const refreshData = useCallback(() => {
    console.log('Refreshing user management data...');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('=== STARTING USER DATA FETCH ===');
        setLoading(true);
        setError(null);
  
        // Initialize data containers
        let users = [];
        let deletedUsers = [];
        let statistics = {};
        let activityData = [];
        
        // STEP 1: Fetch active users
        console.log('Fetching active users...');
        const activeResponse = await userService.getAllUsers();
        console.log('Active users response:', activeResponse);
        
        if (!activeResponse || !activeResponse.success) {
          console.error('Failed to fetch active users:', activeResponse?.message || 'Unknown error');
          throw new Error(`Active users fetch failed: ${activeResponse?.message || 'Unknown error'}`);
        }
        
        users = activeResponse?.users || [];
        console.log(`Successfully fetched ${users.length} active users`);
        
        // STEP 2: Fetch deactivated users with direct query
        console.log('Fetching deactivated users with direct query...');
        try {
          // First try the specialized endpoint for deactivated users
          const deactivatedResponse = await userService.getDeactivatedUsers();
          console.log('Deactivated users direct query response:', deactivatedResponse);
          
          if (deactivatedResponse.success && deactivatedResponse.users && deactivatedResponse.users.length > 0) {
            // Use the directly queried deactivated users
            deletedUsers = deactivatedResponse.users;
            console.log(`Successfully fetched ${deletedUsers.length} deactivated users with direct query`);
          } else {
            // Fallback to the previous method of filtering from all users
            console.log('Direct query returned no results, trying to filter from all users...');
            
            // Get all users from API
            const allResponse = await axios.get(
              `${API_URL}/auth/users`, 
              {
                params: {
                  all: true,
                  includeDeleted: true,
                  includeDeactivated: true,
                  _t: Date.now()
                },
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
              }
            );
            
            console.log('All users response status:', allResponse.status);
            
            // Extract users array from response
            let allUsers = [];
            if (allResponse.data?.data?.users && Array.isArray(allResponse.data.data.users)) {
              allUsers = allResponse.data.data.users;
            } else if (allResponse.data?.users && Array.isArray(allResponse.data.users)) {
              allUsers = allResponse.data.users;
            } else if (Array.isArray(allResponse.data)) {
              allUsers = allResponse.data;
            } else {
              console.warn('Unexpected data structure in all users response:', 
                          Object.keys(allResponse.data || {}));
              throw new Error('Could not extract users from API response');
            }
            
            console.log(`Found ${allUsers.length} total users from API`);
            
            // Debug output to examine the first few users
            if (allUsers.length > 0) {
              console.log('Sample of first 3 users:', allUsers.slice(0, 3).map(u => ({
                id: u._id || u.id,
                email: u.email,
                isDeactivated: u.isDeactivated,
                isAutoDeactivated: u.isAutoDeactivated,
                status: u.status
              })));
              
              // Get all possible property names to better understand user objects
              const allProperties = new Set();
              allUsers.forEach(user => {
                Object.keys(user).forEach(key => allProperties.add(key));
              });
              console.log('All possible user properties:', [...allProperties].sort());
            }
            
            // Expanded check for various deactivation indicators
            deletedUsers = allUsers.filter(user => {
              const isDeactivated = user.isDeactivated === true;
              const isAutoDeactivated = user.isAutoDeactivated === true;
              const hasDeletedStatus = user.status === 'deleted' || user.status === 'deactivated';
              const isInactive = user.status === 'inactive';
              const hasDeactivationDate = user.deactivatedAt || user.deletedAt;
              
              // Expanded check to find any potential deactivation signals
              const result = isDeactivated || isAutoDeactivated || hasDeletedStatus || 
                            isInactive || hasDeactivationDate;
              
              if (result) {
                console.log(`Found deactivated user: ${user.email}`, {
                  isDeactivated, isAutoDeactivated, hasDeletedStatus, isInactive, hasDeactivationDate
                });
              }
              
              return result;
            });
            
            console.log(`Identified ${deletedUsers.length} deactivated/inactive users after filtering`);
          }
          
          // Calculate statistics
          const activeUsersCount = users.filter(user => user.lastLogin).length;
          const inactiveUsersCount = users.length - activeUsersCount;
          const newUsers = users.filter(user => {
            const joinDate = new Date(user.createdAt);
            const now = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            return joinDate >= thirtyDaysAgo;
          }).length;
          const verifiedUsers = users.filter(user => user.isVerified).length;
          
          statistics = {
            totalUsers: (users.length + deletedUsers.length).toLocaleString(),
            activeUsers: activeUsersCount.toLocaleString(),
            inactiveUsers: (inactiveUsersCount + deletedUsers.length).toLocaleString(),
            newUsers: newUsers.toLocaleString(),
            verifiedUsers: verifiedUsers.toLocaleString(),
            deletedUsers: deletedUsers.length.toLocaleString()
          };
          
          // STEP 3: Generate activity data
          console.log('Generating activity data...');
          // Group by date and count logins
          const loginsByDate = {};
          const now = new Date();
          
          // Initialize the last 7 days
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            loginsByDate[dateString] = { 
              date: dateString,
              totalVisits: 0,
              activeUsers: 0,
              newUsers: 0
            };
          }
          
          // Combine active and deactivated users for activity data
          const allUsers = [...users, ...deletedUsers];
          
          // Count logins for each date using all users
          allUsers.forEach(user => {
            if (user.lastLogin) {
              const loginDate = new Date(user.lastLogin);
              const dateString = loginDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              
              // Only count if it's within the last 7 days
              if (loginsByDate[dateString]) {
                loginsByDate[dateString].totalVisits++;
                loginsByDate[dateString].activeUsers++;
              }
            }
            
            // Count new users per day
            if (user.createdAt) {
              const createdDate = new Date(user.createdAt);
              const dateString = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              
              // Only count if it's within the last 7 days
              if (loginsByDate[dateString]) {
                loginsByDate[dateString].newUsers++;
              }
            }
          });
          
          activityData = Object.values(loginsByDate);
          console.log('Activity data generated:', activityData.length, 'days');
          
        } catch (deactivatedError) {
          console.error('Error fetching deactivated users:', deactivatedError);
          // Continue with just active users
          console.warn('Continuing with only active users');
          deletedUsers = [];
          
          // Basic statistics without deactivated users
          const activeUsersCount = users.filter(user => user.lastLogin).length;
          const inactiveUsersCount = users.length - activeUsersCount;
          
          statistics = {
            totalUsers: users.length.toLocaleString(),
            activeUsers: activeUsersCount.toLocaleString(),
            inactiveUsers: inactiveUsersCount.toLocaleString(),
            newUsers: '0',
            verifiedUsers: '0',
            deletedUsers: '0'
          };
          
          // Fallback activity data
          activityData = userManagementData.activityData;
        }
        
        // STEP 4: Format users for UI display
        console.log('Formatting user data for UI...');
        const formatUserList = (userList, isDeactivated = false) => {
          if (!Array.isArray(userList)) {
            console.error('Expected users to be an array but got:', typeof userList);
            return [];
          }
          
          return userList.map(user => {
            // Use optional chaining and nullish coalescing for safety
            const firstName = user?.firstName || '';
            const lastName = user?.lastName || '';
            const formattedName = user?.name || `${firstName} ${lastName}`.trim() || 'Unnamed User';
            
            // Determine user status
            let status = 'unknown';
            if (isDeactivated || user?.isDeactivated === true || user?.isAutoDeactivated === true) {
              status = 'deactivated';
            } else if (user?.status === 'inactive') {
              status = 'inactive';
            } else if (user?.status) {
              status = user.status;
            } else if (user?.isVerified === false) {
              status = 'unverified';
            } else if (user?.lastLogin) {
              status = 'active';
            } else {
              status = 'inactive';
            }
            
            // Ensure proper ID format - MongoDB ObjectIds are 24 char hex strings
            const id = user?._id || user?.id || 'unknown-id';
            
            return {
              id: id,
              name: formattedName,
              email: user?.email || 'no-email',
              role: user?.role || 'user',
              status: status,
              lastActive: user?.lastActive || user?.lastLogin || user?.updatedAt || new Date(),
              isDeactivated: isDeactivated || user?.isDeactivated === true || 
                            user?.isAutoDeactivated === true || user?.status === 'inactive',
              createdAt: user?.createdAt || new Date(),
              deactivatedAt: user?.deactivatedAt || user?.deletedAt || user?.autoDeactivatedAt || null
            };
          });
        };
        
        const formattedUsers = formatUserList(users);
        const formattedDeletedUsers = formatUserList(deletedUsers, true);
        
        console.log(`Formatted ${formattedUsers.length} active users and ${formattedDeletedUsers.length} deleted users`);
        
        // STEP 5: Update state with fetched data
        console.log('Updating state with fetched data...');
        setData({
          usersList: formattedUsers,
          deletedUsers: formattedDeletedUsers,
          statistics,
          activityData
        });
        
        console.log('=== USER DATA FETCH COMPLETED SUCCESSFULLY ===');
        
      } catch (error) {
        console.error('Critical error in fetchUsers:', error);
        setError(error.message || 'An error occurred while fetching user data');
        
        // Fallback to mock data as last resort
        console.warn('Falling back to mock data due to critical error');
        setData(userManagementData);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [refreshTrigger]);

  // User deactivation function (renamed from handleSoftDeleteUser)
  const handleDeactivateUser = async (userId) => {
    try {
      // Call the service function
      const result = await userService.deactivateUser(userId);

      if (result.success) {
        // Move the user from active to deactivated list
        const userToDeactivate = data.usersList.find(user => user.id === userId);
        if (userToDeactivate) {
          const deactivatedUser = {
            ...userToDeactivate,
            status: 'deactivated',
            isDeactivated: true,
            deactivatedAt: new Date().toISOString()
          };

          // Update state
          setData(prev => ({
            ...prev,
            usersList: prev.usersList.filter(user => user.id !== userId),
            deletedUsers: [...prev.deletedUsers, deactivatedUser],
            statistics: {
              ...prev.statistics,
              activeUsers: (parseInt(prev.statistics.activeUsers.replace(/,/g, ''), 10) - 1).toLocaleString(),
              deletedUsers: (parseInt(prev.statistics.deletedUsers.replace(/,/g, ''), 10) + 1).toLocaleString(),
              inactiveUsers: (parseInt(prev.statistics.inactiveUsers?.replace(/,/g, '') || '0', 10) + 1).toLocaleString()
            }
          }));
        }

        return { success: true, message: "User successfully deactivated" };
      } else {
        throw new Error(result.message || 'Failed to deactivate user');
      }
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      return {
        success: false,
        error: { message: error.message || 'Failed to deactivate user' }
      };
    }
  };

  // Function to restore a deleted user
  const handleRestoreUser = async (userId) => {
    try {
      const result = await userService.restoreUser(userId);

      if (result.success) {
        // Move the user from deleted to active list
        const userToRestore = data.deletedUsers.find(user => user.id === userId);
        if (userToRestore) {
          const restoredUser = {
            ...userToRestore,
            status: 'active',
            isDeactivated: false,
            lastActive: new Date().toISOString()
          };

          // Update state
          setData(prev => ({
            ...prev,
            deletedUsers: prev.deletedUsers.filter(user => user.id !== userId),
            usersList: [...prev.usersList, restoredUser],
            statistics: {
              ...prev.statistics,
              totalUsers: (parseInt(prev.statistics.totalUsers.replace(/,/g, ''), 10) + 1).toLocaleString(),
              deletedUsers: (parseInt(prev.statistics.deletedUsers.replace(/,/g, ''), 10) - 1).toLocaleString(),
              inactiveUsers: (parseInt(prev.statistics.inactiveUsers?.replace(/,/g, '') || '0', 10) - 1).toLocaleString()
            }
          }));
        }

        return { success: true, message: "User successfully restored" };
      } else {
        throw new Error(result.message || 'Failed to restore user');
      }
    } catch (error) {
      console.error('Failed to restore user:', error);
      return {
        success: false,
        error: { message: error.message || 'Failed to restore user' }
      };
    }
  };

  // Function to send account recovery link to deactivated user
  const handleSendRecoveryLink = async (email) => {
    try {
      // Use the authService to send recovery link
      const result = await authService.requestAccountRecovery(email);

      if (result.success) {
        return { success: true, message: "Recovery link sent successfully" };
      } else {
        throw new Error(result.message || 'Failed to send recovery link');
      }
    } catch (error) {
      console.error('Failed to send recovery link:', error);
      return {
        success: false,
        error: { message: error.message || 'Failed to send recovery link' }
      };
    }
  };

  // Function to send password reset link
  const handleSendPasswordResetLink = async (email) => {
    try {
      // Use the authService to send password reset link
      const result = await authService.forgotPassword(email);

      if (result.success) {
        return { success: true, message: "Password reset link sent successfully" };
      } else {
        throw new Error(result.message || 'Failed to send password reset link');
      }
    } catch (error) {
      console.error('Failed to send password reset link:', error);
      return {
        success: false,
        error: { message: error.message || 'Failed to send password reset link' }
      };
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await userService.updateUserRole(userId, newRole);

      if (response.success) {
        // Update local state with formatted date
        setData(prev => ({
          ...prev,
          usersList: prev.usersList.map(user =>
            user.id === userId ? {
              ...user,
              role: newRole,
              lastActive: new Date().toISOString() // Format date as ISO string
            } : user
          )
        }));
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      return {
        success: false,
        error: { message: error.message || 'Failed to update user role' }
      };
    }
  };

  return {
    data,
    setData,
    loading,
    error,
    selectedUser,
    setSelectedUser,
    handleDeactivateUser,
    handleRestoreUser,
    handleSendRecoveryLink,
    handleSendPasswordResetLink,
    updateUserRole,
    refreshData
  };
};