import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
  Tooltip,
  Tab,
  Tabs,
  InputAdornment,
  Fade,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Collapse,
  CircularProgress,
  Stack,
  Avatar,
  TablePagination
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  People, 
  AdminPanelSettings,
  Block,
  CheckCircle,
  LockReset,
  MailOutline,
  MoreVert,
  Search,
  Clear,
  FilterList,
  Person
} from '@mui/icons-material';
import PropTypes from 'prop-types';

export const UsersList = ({ 
  users, 
  deletedUsers, 
  handleEdit, 
  handleDeactivateUser,
  handleSendRecovery, 
  handleSendPasswordReset, 
  updateUserRole 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuUser, setMenuUser] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [roleChangeDetails, setRoleChangeDetails] = useState({
    userId: null,
    userName: '',
    currentRole: '',
    newRole: '',
    confirmationPhrase: ''
  });
  
  // Action confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: '',
    action: null
  });

  // Loading states for different actions
  const [loadingStates, setLoadingStates] = useState({
    deactivate: false,
    recover: false,
    resetPassword: false,
    roleChange: false
  });

  // Table tabs
  const [tabValue, setTabValue] = useState(0);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearSearch, setShowClearSearch] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    status: 'all',
    createdAfter: '',
    createdBefore: '',
    lastActiveAfter: '',
    lastActiveBefore: ''
  });
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };
    
  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setMenuUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUser(null);
  };

  const handleRoleChangeRequest = (newRole) => {
    handleMenuClose();
    
    const confirmationPhrase = newRole === 'admin' 
      ? `make ${menuUser.name} admin` 
      : `remove admin from ${menuUser.name}`;
    
    setRoleChangeDetails({
      userId: menuUser.id,
      userName: menuUser.name,
      currentRole: menuUser.role,
      newRole,
      confirmationPhrase
    });
    
    setRoleDialogOpen(true);
  };

  const handleRoleDialogClose = () => {
    setRoleDialogOpen(false);
    setConfirmText('');
  };

  const handleConfirmRoleChange = async () => {
    if (confirmText !== roleChangeDetails.confirmationPhrase) {
      return;
    }

    try {
      // Set loading state
      setLoadingStates(prev => ({ ...prev, roleChange: true }));
      
      const result = await updateUserRole(roleChangeDetails.userId, roleChangeDetails.newRole);
      
      if (result.success) {
        handleRoleDialogClose();
      } else {
        console.error('Failed to update role:', result.error);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({ ...prev, roleChange: false }));
    }
  };
  
  // Handle deactivate confirmation
  const openDeactivateConfirm = (userId, userName) => {
    // Validate the userId is a valid MongoDB ObjectId
    const isValidObjectId = userId && typeof userId === 'string' && /^[0-9a-fA-F]{24}$/.test(userId);
    
    if (!isValidObjectId) {
      console.error(`Invalid userId format: ${userId}. Expected 24-character hex string.`);
      // Show a user-friendly error
      setConfirmDialog({
        open: true,
        title: 'Error',
        message: `Unable to deactivate user. The ID format is invalid. This may occur when using test data.`,
        confirmText: 'OK',
        action: () => {} // No action, just close the dialog
      });
      return;
    }
    
    setConfirmDialog({
      open: true,
      title: 'Confirm User Deactivation',
      message: `Are you sure you want to deactivate the user "${userName}"? This action can be reversed later by sending a recovery link.`,
      confirmText: 'Deactivate',
      action: async () => {
        setLoadingStates(prev => ({ ...prev, deactivate: true }));
        try {
          await handleDeactivateUser(userId);
        } finally {
          setLoadingStates(prev => ({ ...prev, deactivate: false }));
        }
      }
    });
  };

  // Handle send recovery link confirmation
  const openSendRecoveryConfirm = (email, userName) => {
    setConfirmDialog({
      open: true,
      title: 'Send Recovery Link',
      message: `Are you sure you want to send a recovery link to "${userName}" (${email})?`,
      confirmText: 'Send Recovery Link',
      action: async () => {
        setLoadingStates(prev => ({ ...prev, recover: true }));
        try {
          await handleSendRecovery(email);
        } finally {
          setLoadingStates(prev => ({ ...prev, recover: false }));
        }
      }
    });
  };

  // Handle send password reset link confirmation
  const openSendPasswordResetConfirm = (email, userName) => {
    setConfirmDialog({
      open: true,
      title: 'Send Password Reset Link',
      message: `Are you sure you want to send a password reset link to "${userName}" (${email})?`,
      confirmText: 'Send Reset Link',
      action: async () => {
        setLoadingStates(prev => ({ ...prev, resetPassword: true }));
        try {
          await handleSendPasswordReset(email);
        } finally {
          setLoadingStates(prev => ({ ...prev, resetPassword: false }));
        }
      }
    });
  };
  
  // Handle confirm dialog actions
  const handleConfirmAction = async () => {
    if (confirmDialog.action) {
      await confirmDialog.action();
    }
    setConfirmDialog({ ...confirmDialog, open: false });
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0); // Reset to first page when changing tabs
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // To filter users
  const [roleFilter, setRoleFilter] = useState('all');

  // Search handling functions
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setShowClearSearch(query.length > 0);
    setPage(0); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowClearSearch(false);
  };

  const toggleAdvancedSearch = () => {
    setShowAdvancedSearch(prev => !prev);
    if (!showAdvancedSearch) {
      setPage(0); // Reset to first page when showing advanced search
    }
  };

  const handleAdvancedFilterChange = (field, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0); // Reset to first page when changing filters
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      status: 'all',
      createdAfter: '',
      createdBefore: '',
      lastActiveAfter: '',
      lastActiveBefore: ''
    });
  };

  // Get unique status values for dropdown
  const getUniqueStatuses = () => {
    const allUsers = [...users, ...deletedUsers];
    const statuses = new Set(allUsers.map(user => user.status));
    return ['all', ...Array.from(statuses)].filter(status => status !== 'all');
  };

  // Filtering functions
  const filterBySearch = (usersList) => {
    if (!searchQuery.trim()) {
      return usersList;
    }

    const query = searchQuery.toLowerCase().trim();
    return usersList.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) || 
      user.role.toLowerCase().includes(query) ||
      user.status.toLowerCase().includes(query)
    );
  };

  const applyAdvancedFilters = (usersList) => {
    if (!showAdvancedSearch) {
      return usersList;
    }
    
    return usersList.filter(user => {
      // Status filter
      if (advancedFilters.status !== 'all' && user.status !== advancedFilters.status) {
        return false;
      }
      
      // Created date filters
      if (advancedFilters.createdAfter) {
        const createdDate = new Date(user.createdAt);
        const filterDate = new Date(advancedFilters.createdAfter);
        if (createdDate < filterDate) {
          return false;
        }
      }
      
      if (advancedFilters.createdBefore) {
        const createdDate = new Date(user.createdAt);
        const filterDate = new Date(advancedFilters.createdBefore);
        if (createdDate > filterDate) {
          return false;
        }
      }
      
      // Last active filters
      if (advancedFilters.lastActiveAfter && user.lastActive) {
        const lastActiveDate = new Date(user.lastActive);
        const filterDate = new Date(advancedFilters.lastActiveAfter);
        if (lastActiveDate < filterDate) {
          return false;
        }
      }
      
      if (advancedFilters.lastActiveBefore && user.lastActive) {
        const lastActiveDate = new Date(user.lastActive);
        const filterDate = new Date(advancedFilters.lastActiveBefore);
        if (lastActiveDate > filterDate) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Apply all filters to get the final displayed users
  const filterUsers = (usersList) => {
    // First apply role filter (only for active users)
    const roleFiltered = tabValue === 0 && roleFilter !== 'all' 
      ? usersList.filter(user => user.role === roleFilter)
      : usersList;
    
    // Then apply search filter
    const searchFiltered = filterBySearch(roleFiltered);
    
    // Finally apply advanced filters
    return applyAdvancedFilters(searchFiltered);
  };

  // Get the filtered users for display
  const filteredActiveUsers = filterUsers(users);
  const filteredDeactivatedUsers = filterUsers(deletedUsers);
  const filteredUsers = tabValue === 0 ? filteredActiveUsers : filteredDeactivatedUsers;
  
  // Apply pagination to the filtered users
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Search count for results
  const searchResultsCount = searchQuery.trim() || showAdvancedSearch
    ? `${filteredUsers.length} ${filteredUsers.length === 1 ? 'match' : 'matches'}`
    : null;
    
  // Function to generate avatar color based on user name
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  };
  
  // Function to generate avatar from name (if profile image not available)
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* Top Header Area with Title and Role Filter Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap'
      }}>
        {/* Left side - Title and Filter Buttons */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <Typography variant="h6" sx={{ mr: 2 }}>
            Users Management
          </Typography>
          
          {/* Role filter buttons now beside the title */}
          {tabValue === 0 && (
            <Stack direction="row" spacing={1}>
              <Button 
                variant={roleFilter === 'all' ? 'contained' : 'outlined'} 
                size="small" 
                onClick={() => setRoleFilter('all')}
              >
                All Users
              </Button>
              <Button 
                variant={roleFilter === 'admin' ? 'contained' : 'outlined'} 
                size="small" 
                onClick={() => setRoleFilter('admin')}
                color="primary"
              >
                <AdminPanelSettings sx={{ mr: 0.5, fontSize: 18 }} />
                Admins
              </Button>
              <Button 
                variant={roleFilter === 'user' ? 'contained' : 'outlined'} 
                size="small" 
                onClick={() => setRoleFilter('user')}
                color="info"
              >
                <People sx={{ mr: 0.5, fontSize: 18 }} />
                Regular Users
              </Button>
            </Stack>
          )}
        </Box>
        
        {/* Right side - Advanced Search Toggle */}
        <Button
          variant="text"
          color="primary"
          size="small"
          onClick={toggleAdvancedSearch}
          endIcon={showAdvancedSearch ? <Clear /> : <FilterList />}
        >
          {showAdvancedSearch ? 'Hide Advanced Filters' : 'Advanced Filters'}
        </Button>
      </Box>
      
      {/* Search Bar - Now positioned above the table */}
     

      {/* Advanced search panel */}
      <Collapse in={showAdvancedSearch}>
        <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={advancedFilters.status}
                  onChange={(e) => handleAdvancedFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  {getUniqueStatuses().map(status => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Created After"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={advancedFilters.createdAfter}
                onChange={(e) => handleAdvancedFilterChange('createdAfter', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Created Before"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={advancedFilters.createdBefore}
                onChange={(e) => handleAdvancedFilterChange('createdBefore', e.target.value)}
              />
            </Grid>
            
            {tabValue === 0 && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Last Active After"
                    type="date"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={advancedFilters.lastActiveAfter}
                    onChange={(e) => handleAdvancedFilterChange('lastActiveAfter', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Last Active Before"
                    type="date"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={advancedFilters.lastActiveBefore}
                    onChange={(e) => handleAdvancedFilterChange('lastActiveBefore', e.target.value)}
                  />
                </Grid>
              </>
            )}
            
            <Grid item container justifyContent="flex-end" xs={12} sm={tabValue === 0 ? 6 : 12} md={tabValue === 0 ? 3 : 6}>
              <Button 
                variant="outlined" 
                color="secondary" 
                size="small"
                onClick={clearAdvancedFilters}
                startIcon={<Clear />}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
          
          {/* Active filters display */}
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(advancedFilters).map(([key, value]) => {
              if (!value || value === 'all') return null;
              
              let label = '';
              switch (key) {
                case 'status':
                  label = `Status: ${value}`;
                  break;
                case 'createdAfter':
                  label = `Created after: ${new Date(value).toLocaleDateString()}`;
                  break;
                case 'createdBefore':
                  label = `Created before: ${new Date(value).toLocaleDateString()}`;
                  break;
                case 'lastActiveAfter':
                  label = `Last active after: ${new Date(value).toLocaleDateString()}`;
                  break;
                case 'lastActiveBefore':
                  label = `Last active before: ${new Date(value).toLocaleDateString()}`;
                  break;
                default:
                  return null;
              }
              
              return (
                <Chip
                  key={key}
                  label={label}
                  onDelete={() => handleAdvancedFilterChange(key, key === 'status' ? 'all' : '')}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              );
            })}
          </Box>
        </Paper>
      </Collapse>
      
      {/* Tabs and Search in same container with proper alignment */}
<Box sx={{ 
  borderBottom: 1, 
  borderColor: 'divider',
  mb: 2,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}}>
  {/* Tabs on the left */}
  <Tabs 
    value={tabValue} 
    onChange={handleTabChange}
    sx={{ flexGrow: 1 }}
    TabIndicatorProps={{
      style: {
        height: '3px',
        backgroundColor: tabValue === 0 ? '#1b5e20' : '#d32f2f'
      },
    }}
  >
    <Tab 
      label="Active Users" 
      icon={<CheckCircle />} 
      iconPosition="start"
      sx={{ 
        fontWeight: tabValue === 0 ? 'bold' : 'normal',
        color: tabValue === 0 ? '#1b5e20' : 'inherit'
      }} 
    />
    <Tab 
      label="Deactivated Users" 
      icon={<Block />}
      iconPosition="start"
      sx={{ 
        fontWeight: tabValue === 1 ? 'bold' : 'normal',
        color: tabValue === 1 ? '#d32f2f' : 'inherit'
      }} 
    />
  </Tabs>

  {/* Search field on the right */}
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center',
    minWidth: '300px',
    maxWidth: '400px',
    ml: 2
  }}>
    <TextField
      placeholder={`Search ${tabValue === 0 ? 'active' : 'deactivated'} users...`}
      variant="outlined"
      size="small"
      fullWidth
      value={searchQuery}
      onChange={handleSearchChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search color="action" />
          </InputAdornment>
        ),
        endAdornment: (
          <Fade in={showClearSearch}>
            <InputAdornment position="end">
              <IconButton 
                size="small" 
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <Clear fontSize="small" />
              </IconButton>
            </InputAdornment>
          </Fade>
        )
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '20px',
        }
      }}
    />
    {searchResultsCount && (
      <Chip 
        label={searchResultsCount} 
        size="small" 
        color="primary" 
        sx={{ ml: 1 }}
      />
    )}
  </Box>
</Box>
      
      {/* Users Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
        <Table>
          <TableHead sx={{ backgroundColor: tabValue === 0 ? '#f5f5f5' : '#ffebee' }}>
            <TableRow>
              <TableCell width="60px">Profile</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              {tabValue === 1 && (
                <TableCell>Deactivated At</TableCell>
              )}
              <TableCell>{tabValue === 0 ? 'Last Active' : 'Created At'}</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow 
                  key={user.id} 
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    bgcolor: tabValue === 0 && user.role === 'admin' ? 'rgba(27, 94, 32, 0.04)' : 
                            tabValue === 1 ? 'rgba(211, 47, 47, 0.04)' : 'transparent'
                  }}
                >
                  <TableCell>
                    {user.profileImage ? (
                      <Avatar 
                        src={user.profileImage} 
                        alt={user.name}
                        sx={{ width: 40, height: 40 }}
                      />
                    ) : (
                      <Avatar 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: stringToColor(user.name) 
                        }}
                      >
                        {getInitials(user.name)}
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role}
                      color={user.role === 'admin' ? 'primary' : 'default'}
                      size="small"
                      sx={{ 
                        bgcolor: user.role === 'admin' ? '#1b5e20' : 'transparent',
                        color: user.role === 'admin' ? 'white' : 'inherit',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.status}
                      color={
                        user.status === 'active' ? 'success' : 
                        user.status === 'deleted' || user.status === 'deactivated' ? 'error' : 
                        'warning'
                      }
                      size="small"
                      sx={{ 
                        bgcolor: 
                          user.status === 'active' ? '#4caf50' : 
                          user.status === 'deleted' || user.status === 'deactivated' ? '#d32f2f' :
                          '#ff9800',
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  {tabValue === 1 && (
                    <TableCell>{formatDate(user.deactivatedAt || user.deletedAt)}</TableCell>
                  )}
                  <TableCell>{formatDate(tabValue === 0 ? user.lastActive : user.createdAt)}</TableCell>
                  <TableCell align="right">
  {tabValue === 0 ? (
    // Actions for active users
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      {/* Password Reset Button - Only for active users */}
      <Tooltip title="Send Password Reset Link">
        <IconButton 
          size="small" 
          onClick={() => openSendPasswordResetConfirm(user.email, user.name)}
          color="primary"
          sx={{ mx: 0.5 }}
          disabled={loadingStates.resetPassword}
        >
          <LockReset fontSize="small" />
        </IconButton>
      </Tooltip>
      
      {/* Deactivate User Button */}
      <Tooltip title="Deactivate User">
        <IconButton 
          size="small" 
          onClick={() => openDeactivateConfirm(user.id, user.name)}
          color="error"
          sx={{ mx: 0.5 }}
          disabled={loadingStates.deactivate}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Tooltip>
      
      {/* More actions menu */}
      <Tooltip title="More actions">
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, user)}
          sx={{ mx: 0.5 }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  ) : (
    // Actions for deactivated users - ONLY recovery link
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      <Tooltip title="Send Reactivation Link">
        <IconButton 
          size="small" 
          onClick={() => openSendRecoveryConfirm(user.email, user.name)}
          color="warning"
          disabled={loadingStates.recover}
        >
          <MailOutline fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  )}
</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tabValue === 0 ? 7 : 8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    {searchQuery.trim() || Object.values(advancedFilters).some(v => v !== 'all' && v !== '')
                      ? `No ${tabValue === 0 ? 'active' : 'deactivated'} users found matching your filters`
                      : tabValue === 0 
                        ? "No active users found" 
                        : "No deactivated users found"
                    }
                  </Typography>
                  {(searchQuery.trim() || Object.values(advancedFilters).some(v => v !== 'all' && v !== '')) && (
                    <Button 
                      variant="text" 
                      color="primary" 
                      onClick={() => {
                        clearSearch();
                        clearAdvancedFilters();
                      }}
                      sx={{ mt: 1 }}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
        labelRowsPerPage="Rows per page:"
      />
      
      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {/* Make Admin option */}
        {menuUser && menuUser.role !== 'admin' && (
          <MenuItem onClick={() => handleRoleChangeRequest('admin')}>
            <AdminPanelSettings fontSize="small" sx={{ mr: 1 }} />
            Make Admin
          </MenuItem>
        )}
        {menuUser && menuUser.role === 'admin' && (
          <MenuItem onClick={() => handleRoleChangeRequest('user')}>
            <People fontSize="small" sx={{ mr: 1 }} />
            Remove Admin Privileges
          </MenuItem>
        )}
      </Menu>
      
      {/* Role Change Confirmation Dialog */}
      <Dialog open={roleDialogOpen} onClose={handleRoleDialogClose}>
        <DialogTitle>
          {roleChangeDetails.newRole === 'admin' ? 'Grant Admin Privileges' : 'Remove Admin Privileges'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {roleChangeDetails.newRole === 'admin' 
              ? `You are about to grant admin privileges to ${roleChangeDetails.userName}. This will give them full access to manage users and system settings.` 
              : `You are about to remove admin privileges from ${roleChangeDetails.userName}.`}
          </DialogContentText>
          <DialogContentText sx={{ mb: 2, fontWeight: 'bold' }}>
            To confirm, please type: <span style={{ color: '#1b5e20' }}>{roleChangeDetails.confirmationPhrase}</span>
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            error={confirmText !== '' && confirmText !== roleChangeDetails.confirmationPhrase}
            helperText={confirmText !== '' && confirmText !== roleChangeDetails.confirmationPhrase 
              ? "Text doesn't match" 
              : null}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRoleDialogClose} disabled={loadingStates.roleChange}>Cancel</Button>
          <Button 
            onClick={handleConfirmRoleChange} 
            color="primary"
            variant="contained"
            disabled={confirmText !== roleChangeDetails.confirmationPhrase || loadingStates.roleChange}
            startIcon={loadingStates.roleChange ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {loadingStates.roleChange ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Action Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({...confirmDialog, open: false})}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({...confirmDialog, open: false})} disabled={
            loadingStates.deactivate || loadingStates.recover || loadingStates.resetPassword
          }>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color={
              confirmDialog.confirmText === 'Deactivate' ? 'error' : 
              confirmDialog.confirmText === 'Send Recovery Link' ? 'warning' :
              'primary'
            }
            onClick={handleConfirmAction}
            disabled={
              loadingStates.deactivate || loadingStates.recover || loadingStates.resetPassword
            }
            startIcon={
              (confirmDialog.confirmText === 'Deactivate' && loadingStates.deactivate) ||
              (confirmDialog.confirmText === 'Send Recovery Link' && loadingStates.recover) ||
              (confirmDialog.confirmText === 'Send Reset Link' && loadingStates.resetPassword) 
                ? <CircularProgress size={16} color="inherit" /> 
                : null
            }
          >
            {(confirmDialog.confirmText === 'Deactivate' && loadingStates.deactivate) ||
             (confirmDialog.confirmText === 'Send Recovery Link' && loadingStates.recover) ||
             (confirmDialog.confirmText === 'Send Reset Link' && loadingStates.resetPassword) 
              ? 'Processing...' 
              : confirmDialog.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// PropTypes validation
UsersList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    lastActive: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    profileImage: PropTypes.string // Optional profile image URL
  })).isRequired,
  deletedUsers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    deletedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    deactivatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    profileImage: PropTypes.string // Optional profile image URL
  })),
  handleEdit: PropTypes.func,
  handleDeactivateUser: PropTypes.func.isRequired, 
  handleSendRecovery: PropTypes.func.isRequired,
  handleSendPasswordReset: PropTypes.func.isRequired,
  updateUserRole: PropTypes.func.isRequired
};

export default UsersList;