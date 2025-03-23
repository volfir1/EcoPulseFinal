// src/pages/UserManagement/UserControl.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab,
  Snackbar,
  Alert, 
  CircularProgress
} from '@mui/material';
import { UserDashboard } from './UserDashboard';
import { UsersList } from './UserList';
import { useUserManagement } from './userManageHook';
import { Loader, useLoader } from '@shared/index';

// Main User Management Component
export default function UserControl() {
  const [tabIndex, setTabIndex] = useState(0);
  
  // Store the entire loader hook result
  const loader = useLoader();
  
  const { 
    data, 
    loading, 
    selectedUser, 
    setSelectedUser, 
    handleSendRecoveryLink,
    handleSendPasswordResetLink,
    updateUserRole,
    handleDeactivateUser,
    refreshData
  } = useUserManagement();
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Update loading state for the loader when our loading state changes
  useEffect(() => {
    if (loader && typeof loader.setLoading === 'function') {
      loader.setLoading(loading);
    }
  }, [loading, loader]);
  
  // Add useEffect to log data status for debugging
  useEffect(() => {
    console.log('UserControl data:', data);
    console.log('UsersList available:', data?.usersList?.length || 0);
    console.log('DeletedUsers available:', data?.deletedUsers?.length || 0);
    
    // Debug inactive users
    if (data?.statistics) {
      console.log('Inactive users count:', data.statistics.inactiveUsers);
    }
  }, [data]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleEditUser = (user) => {
    console.log('Edit user:', user);
    setSelectedUser(user);
  };

  const handleUserDeactivation = async (userId) => {
    // Use loader if available, otherwise handle loading state manually
    if (loader && typeof loader.setLoading === 'function') {
      loader.setLoading(true);
    }
    
    try {
      const result = await handleDeactivateUser(userId);
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'User has been successfully deactivated',
          severity: 'success'
        });
        
        // Refresh data after deactivation to get updated counts
        refreshData();
      } else {
        setSnackbar({
          open: true,
          message: result.error?.message || 'Failed to deactivate user',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error in deactivating user:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while deactivating the user',
        severity: 'error'
      });
    } finally {
      if (loader && typeof loader.setLoading === 'function') {
        loader.setLoading(false);
      }
    }
  };

  const handleSendRecovery = async (email) => {
    if (loader && typeof loader.setLoading === 'function') {
      loader.setLoading(true);
    }
    
    try {
      const result = await handleSendRecoveryLink(email);
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Reactivation link has been sent to the user',
          severity: 'success'
        });
        
        // Refresh data after sending recovery link
        refreshData();
      } else {
        setSnackbar({
          open: true,
          message: result.error?.message || 'Failed to send reactivation link',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error in sending recovery link:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while sending reactivation link',
        severity: 'error'
      });
    } finally {
      if (loader && typeof loader.setLoading === 'function') {
        loader.setLoading(false);
      }
    }
  };

  const handleSendPasswordReset = async (email) => {
    if (loader && typeof loader.setLoading === 'function') {
      loader.setLoading(true);
    }
    
    try {
      const result = await handleSendPasswordResetLink(email);
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Password reset link has been sent to the user',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: result.error?.message || 'Failed to send password reset link',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error in sending password reset:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while sending password reset link',
        severity: 'error'
      });
    } finally {
      if (loader && typeof loader.setLoading === 'function') {
        loader.setLoading(false);
      }
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    if (loader && typeof loader.setLoading === 'function') {
      loader.setLoading(true);
    }
    
    try {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        setSnackbar({
          open: true,
          message: `User role has been updated to ${newRole}`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: result.error?.message || 'Failed to update user role',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error in updating user role:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while updating user role',
        severity: 'error'
      });
    } finally {
      if (loader && typeof loader.setLoading === 'function') {
        loader.setLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Make sure we're checking data existence properly
  const isDataEmpty = !data || !data.usersList || data.usersList.length === 0;

  // Use Loader component if available, otherwise fall back to CircularProgress
  if (loading && isDataEmpty) {
    return (
      loader && typeof loader.Loader === 'function' ? (
        <Loader fullPage message="Loading user data..." />
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      )
    );
  }

  // Ensure the data structure includes default empty arrays if data is missing
  const safeData = {
    ...data,
    usersList: data?.usersList || [],
    deletedUsers: data?.deletedUsers || [],
    statistics: {
      ...(data?.statistics || {}),
      totalUsers: data?.statistics?.totalUsers || '0',
      activeUsers: data?.statistics?.activeUsers || '0',
      newUsers: data?.statistics?.newUsers || '0',
      verifiedUsers: data?.statistics?.verifiedUsers || '0',
      deletedUsers: data?.statistics?.deletedUsers || '0',
      // Use the inactiveUsers count from statistics if available
      inactiveUsers: data?.statistics?.inactiveUsers || 
                    // Fall back to calculated value if not present
                    (parseInt(data?.statistics?.totalUsers || 0) - 
                     parseInt(data?.statistics?.activeUsers || 0)).toString()
    },
    activityData: data?.activityData || []
  };

  return (
    <Box sx={{ p: 2, maxWidth: '100%', top: 100 }}>
      <Typography variant="h5" component="h1" fontWeight="medium" sx={{ mb: 2 }}>
        User Management
      </Typography>
      
      {/* Display data status for debugging */}
      {isDataEmpty && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No user data available. This could be a data fetching issue or empty database.
        </Alert>
      )}
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange}
          TabIndicatorProps={{
            style: {
              height: '3px',
              backgroundColor: '#1b5e20'
            },
          }}
        >
          <Tab 
            label="DASHBOARD" 
            sx={{ 
              fontWeight: tabIndex === 0 ? 'bold' : 'normal',
              color: tabIndex === 0 ? '#1b5e20' : 'inherit'
            }} 
          />
          <Tab 
            label="USERS LIST" 
            sx={{ 
              fontWeight: tabIndex === 1 ? 'bold' : 'normal',
              color: tabIndex === 1 ? '#1b5e20' : 'inherit'
            }} 
          />
        </Tabs>
      </Box>
      
      {/* Tab Panels */}
      {tabIndex === 0 && (
        <UserDashboard data={safeData} />
      )}
      
      {tabIndex === 1 && (
        <UsersList 
          users={safeData.usersList} 
          deletedUsers={safeData.deletedUsers}
          handleEdit={handleEditUser}
          handleDeactivateUser={handleUserDeactivation}
          handleSendRecovery={handleSendRecovery} 
          handleSendPasswordReset={handleSendPasswordReset} 
          updateUserRole={handleRoleUpdate}
        />
      )}

      {/* Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}  
        </Alert>
      </Snackbar>
      
      {/* Add loading overlay if available */}
      {loader && loader.LoadingOverlay && <loader.LoadingOverlay />}
    </Box>
  );
}