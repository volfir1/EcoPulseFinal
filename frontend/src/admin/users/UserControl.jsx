// src/pages/UserManagement/UserControl.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab,
  Snackbar,
  Alert, 
  CircularProgress,
  Container // Import Container for potentially better max-width control
} from '@mui/material';
// Assuming UserDashboard and UsersList are correctly imported from their relative paths
import { UserDashboard } from './UserDashboard'; 
import { UsersList } from './UserList'; 
import { useUserManagement } from './userManageHook'; 
// Assuming Loader components are correctly imported
import { Loader, useLoader } from '@shared/index'; 

// Main User Management Component
export default function UserControl() {
  const [tabIndex, setTabIndex] = useState(0);
  const loader = useLoader(); // Using custom loader hook
  const { 
    data, loading, selectedUser, setSelectedUser, 
    handleSendRecoveryLink, handleSendPasswordResetLink,
    updateUserRole, handleDeactivateUser, refreshData
  } = useUserManagement();
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Effect to manage loading state via loader hook
  useEffect(() => {
    // Ensure loader and setLoading are available before calling
    if (loader && typeof loader.setLoading === 'function') {
      loader.setLoading(loading);
    }
  }, [loading, loader]);
  
  // Debugging effect (keep if useful during development)
  useEffect(() => {
    console.log('UserControl data status:', data ? 'Loaded' : 'Not loaded');
    // Add more specific logs if needed
  }, [data]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleEditUser = (user) => {
    console.log('Edit user:', user); // Keep for debugging or future implementation
    setSelectedUser(user);
  };

  // --- Action Handlers (with loading state managed by loader hook if possible) ---

  const executeAction = async (actionFn, args, successMessage, errorMessagePrefix) => {
     if (loader && typeof loader.setLoading === 'function') loader.setLoading(true);
     try {
         const result = await actionFn(...args);
         if (result.success) {
             setSnackbar({ open: true, message: successMessage, severity: 'success' });
             // Refresh data on successful actions that modify user state
             if (actionFn === handleDeactivateUser || actionFn === handleSendRecoveryLink || actionFn === updateUserRole) {
                await refreshData(); // Refresh data after action
             }
         } else {
             setSnackbar({ open: true, message: result.error?.message || `${errorMessagePrefix}: Unknown error`, severity: 'error' });
         }
         return result; // Return result for potential further checks
     } catch (error) {
         console.error(`Error during ${errorMessagePrefix}:`, error);
         setSnackbar({ open: true, message: `An error occurred during ${errorMessagePrefix}`, severity: 'error' });
         return { success: false, error: error }; // Return standard error format
     } finally {
         if (loader && typeof loader.setLoading === 'function') loader.setLoading(false);
     }
  };

  const handleUserDeactivation = (userId) => {
     executeAction(handleDeactivateUser, [userId], 'User successfully deactivated', 'deactivation');
  };

  const handleSendRecovery = (email) => {
     executeAction(handleSendRecoveryLink, [email], 'Reactivation link sent', 'sending recovery link');
  };
  
  const handleSendPasswordReset = (email) => {
     executeAction(handleSendPasswordResetLink, [email], 'Password reset link sent', 'sending password reset');
  };

  const handleRoleUpdate = (userId, newRole) => {
     executeAction(updateUserRole, [userId, newRole], `User role updated to ${newRole}`, 'updating role');
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Check if data is still loading AND empty (initial load state)
  const isInitialLoading = loading && (!data || (!data.usersList?.length && !data.deletedUsers?.length));

  // Fallback Loading UI
  if (isInitialLoading) {
    // Prefer custom Loader if available
    return loader?.Loader ? (
      <Loader fullPage message="Loading user management..." />
    ) : (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)', p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading user data...</Typography>
      </Box>
    );
  }

  // Ensure data has default empty arrays/objects for safety downstream
  const safeData = {
    statistics: {
        totalUsers: '0', activeUsers: '0', newUsers: '0', verifiedUsers: '0', deletedUsers: '0', inactiveUsers: '0',
        ...(data?.statistics || {}) // Spread actual stats over defaults
    },
    usersList: data?.usersList || [],
    deletedUsers: data?.deletedUsers || [],
    activityData: data?.activityData || []
  };
   // Recalculate inactive users robustly after potentially spreading defaults
   safeData.statistics.inactiveUsers = (
       parseInt(safeData.statistics.totalUsers.replace(/,/g, '') || '0') - 
       parseInt(safeData.statistics.activeUsers.replace(/,/g, '') || '0')
   ).toString();


  return (
    // Use Container for centered content with max-width, or Box for full width
    // Container might be better for typical app layouts
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}> 
    {/* Removed 'top: 100'. Use responsive padding (py). */}
    {/* Or use Box sx={{ p: { xs: 1, sm: 2, md: 3 } }} if full width needed */}
      
      <Typography 
        variant="h5" 
        component="h1" 
        fontWeight="medium" 
        // Responsive font size and margin bottom
        sx={{ 
          mb: { xs: 2, md: 3 },
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } 
        }}
      >
        User Management
      </Typography>
      
      {/* Optional: Show alert if data loading finished but is empty */}
      {!isInitialLoading && !safeData.usersList?.length && !safeData.deletedUsers?.length && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No users found in the system.
        </Alert>
      )}
      
      {/* --- Tabs --- */}
      <Box sx={{ 
         borderBottom: 1, borderColor: 'divider', 
         mb: { xs: 2, md: 3 }, // Responsive margin below tabs
         width: '100%', // Ensure Box takes full width for Tabs
      }}>
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange}
          // Centered looks good on wider screens with few tabs
          centered 
          // variant="scrollable" // Good practice, handles overflow
          // allowScrollButtonsMobile // Ensure buttons appear on mobile if needed
          TabIndicatorProps={{ style: { height: '3px', backgroundColor: '#1b5e20' }, }}
          sx={{ 
            // Allow tabs to shrink if needed on very small screens
             '& .MuiTab-root': { minWidth: { xs: 80, sm: 120 } } // Adjust minWidth as needed
          }} 
        >
          <Tab 
            label="DASHBOARD" 
            sx={{ fontWeight: tabIndex === 0 ? 'bold' : 'normal', color: tabIndex === 0 ? '#1b5e20' : 'inherit' }} 
            id="user-management-tab-0"
            aria-controls="user-management-panel-0"
          />
          <Tab 
            label="USERS LIST" 
            sx={{ fontWeight: tabIndex === 1 ? 'bold' : 'normal', color: tabIndex === 1 ? '#1b5e20' : 'inherit' }} 
            id="user-management-tab-1"
            aria-controls="user-management-panel-1"
          />
        </Tabs>
      </Box>
      
      {/* --- Tab Panels --- */}
      {/* Render conditionally, ensure proper ARIA attributes */}
      <Box 
        role="tabpanel"
        hidden={tabIndex !== 0}
        id="user-management-panel-0"
        aria-labelledby="user-management-tab-0"
      >
         {tabIndex === 0 && ( <UserDashboard data={safeData} /> )}
      </Box>
      <Box 
        role="tabpanel"
        hidden={tabIndex !== 1}
        id="user-management-panel-1"
        aria-labelledby="user-management-tab-1"
      >
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
      </Box>

      {/* --- Notifications (Snackbar) --- */}
      <Snackbar
        open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Center might be better on mobile
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}  
        </Alert>
      </Snackbar>
      
      {/* Optional: Add custom loading overlay if provided by hook */}
      {loader?.LoadingOverlay && <loader.LoadingOverlay />}
    </Container> // End Container or Box
  );
}