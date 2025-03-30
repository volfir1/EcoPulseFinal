import React, { useState, useMemo } from 'react'; // Added useMemo
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
  Edit, // Edit icon imported but not used in the provided code logic, keep if needed elsewhere
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
  Person // Person icon imported but not used in provided code logic, keep if needed elsewhere
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { format, isValid, parseISO } from 'date-fns'; // Import date-fns functions if needed, or use built-in Date

// Enhanced UsersList Component with Responsive Adjustments
export const UsersList = ({ 
  users = [], // Default to empty array
  deletedUsers = [], // Default to empty array
  handleEdit, // Keep prop even if unused in provided snippet
  handleDeactivateUser,
  handleSendRecovery, 
  handleSendPasswordReset, 
  updateUserRole 
}) => {
  // --- State variables (largely unchanged) ---
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuUser, setMenuUser] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [roleChangeDetails, setRoleChangeDetails] = useState({ userId: null, userName: '', currentRole: '', newRole: '', confirmationPhrase: '' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', confirmText: '', action: null });
  const [loadingStates, setLoadingStates] = useState({ deactivate: false, recover: false, resetPassword: false, roleChange: false });
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearSearch, setShowClearSearch] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({ status: 'all', createdAfter: '', createdBefore: '', lastActiveAfter: '', lastActiveBefore: '' });
  const [roleFilter, setRoleFilter] = useState('all');

  // --- Helper Functions (optimized date formatting) ---
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'; // Return N/A instead of 'Never' for clarity
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString; // Handle both ISO strings and Date objects
      if (isValid(date)) {
        // Use a more standard and potentially shorter format
        return format(date, 'MMM d, yyyy HH:mm'); 
      }
      return 'Invalid Date';
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  // --- Event Handlers (largely unchanged, focusing on logic) ---
  const handleMenuOpen = (event, user) => { setAnchorEl(event.currentTarget); setMenuUser(user); };
  const handleMenuClose = () => { setAnchorEl(null); setMenuUser(null); };
  const handleRoleDialogClose = () => { setRoleDialogOpen(false); setConfirmText(''); };
  const handleTabChange = (event, newValue) => { setTabValue(newValue); setPage(0); };
  const handleChangePage = (event, newPage) => { setPage(newPage); };
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
  const handleSearchChange = (event) => { const query = event.target.value; setSearchQuery(query); setShowClearSearch(query.length > 0); setPage(0); };
  const clearSearch = () => { setSearchQuery(''); setShowClearSearch(false); };
  const toggleAdvancedSearch = () => { setShowAdvancedSearch(prev => !prev); if (showAdvancedSearch) clearAdvancedFilters(); setPage(0); }; // Clear filters when hiding
  const handleAdvancedFilterChange = (field, value) => { setAdvancedFilters(prev => ({ ...prev, [field]: value })); setPage(0); };
  const clearAdvancedFilters = () => { setAdvancedFilters({ status: 'all', createdAfter: '', createdBefore: '', lastActiveAfter: '', lastActiveBefore: '' }); setPage(0); }; // Reset page on clear

  const handleRoleChangeRequest = (newRole) => {
    // ... (Role change logic - unchanged) ...
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
  
  const handleConfirmRoleChange = async () => {
    // ... (Confirm role change logic - unchanged) ...
      if (confirmText !== roleChangeDetails.confirmationPhrase) {
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, roleChange: true }));
      const result = await updateUserRole(roleChangeDetails.userId, roleChangeDetails.newRole);
      if (result.success) {
        handleRoleDialogClose();
      } else { console.error('Failed to update role:', result.error); }
    } catch (error) { console.error('Error updating user role:', error); } 
    finally { setLoadingStates(prev => ({ ...prev, roleChange: false })); }
  };

  // Confirmation dialog openers (unchanged logic)
  const openDeactivateConfirm = (userId, userName) => {
    const isValidObjectId = userId && typeof userId === 'string' && /^[0-9a-fA-F]{24}$/.test(userId);
    if (!isValidObjectId) { /* ... error handling ... */ 
          console.error(`Invalid userId format: ${userId}.`);
           setConfirmDialog({ open: true, title: 'Error', message: `Invalid user ID format. Cannot perform action.`, confirmText: 'OK', action: () => {} });
          return;
      }
    setConfirmDialog({ open: true, title: 'Confirm User Deactivation', message: `Deactivate "${userName}"? They can be reactivated later.`, confirmText: 'Deactivate', 
      action: async () => { setLoadingStates(prev => ({ ...prev, deactivate: true })); try { await handleDeactivateUser(userId); } finally { setLoadingStates(prev => ({ ...prev, deactivate: false })); } }
    });
  };
  const openSendRecoveryConfirm = (email, userName) => { 
    setConfirmDialog({ open: true, title: 'Send Recovery Link', message: `Send recovery link to "${userName}" (${email})?`, confirmText: 'Send Recovery Link', 
      action: async () => { setLoadingStates(prev => ({ ...prev, recover: true })); try { await handleSendRecovery(email); } finally { setLoadingStates(prev => ({ ...prev, recover: false })); } }
    }); 
  };
  const openSendPasswordResetConfirm = (email, userName) => { 
    setConfirmDialog({ open: true, title: 'Send Password Reset Link', message: `Send password reset link to "${userName}" (${email})?`, confirmText: 'Send Reset Link', 
      action: async () => { setLoadingStates(prev => ({ ...prev, resetPassword: true })); try { await handleSendPasswordReset(email); } finally { setLoadingStates(prev => ({ ...prev, resetPassword: false })); } }
    });
  };
  const handleConfirmAction = async () => { if (confirmDialog.action) { await confirmDialog.action(); } setConfirmDialog({ ...confirmDialog, open: false }); };
  
  // --- Memoized Filtering and Data Preparation ---
  
  // Memoize unique statuses to avoid recalculation on every render
  const uniqueStatuses = useMemo(() => {
    const allUsers = [...(users || []), ...(deletedUsers || [])];
    const statuses = new Set(allUsers.map(user => user?.status).filter(Boolean)); // Filter out null/undefined statuses
    return ['all', ...Array.from(statuses)];
  }, [users, deletedUsers]);
  
  // Memoize filtered users to optimize performance
  const filteredUsers = useMemo(() => {
    const sourceList = tabValue === 0 ? (users || []) : (deletedUsers || []);

    const roleFiltered = (tabValue === 0 && roleFilter !== 'all') 
      ? sourceList.filter(user => user.role === roleFilter)
      : sourceList;

    const searchFiltered = roleFiltered.filter(user => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) || 
        user.role?.toLowerCase().includes(query) ||
        user.status?.toLowerCase().includes(query)
      );
    });

    const advancedFiltered = searchFiltered.filter(user => {
      if (!showAdvancedSearch) return true;
      try { // Add try-catch for date comparisons
        if (advancedFilters.status !== 'all' && user.status !== advancedFilters.status) return false;
        
        const userCreatedAt = user.createdAt ? new Date(user.createdAt) : null;
        const userLastActive = user.lastActive ? new Date(user.lastActive) : null;

        if (advancedFilters.createdAfter && userCreatedAt) {
            if (userCreatedAt < new Date(advancedFilters.createdAfter)) return false;
        }
        if (advancedFilters.createdBefore && userCreatedAt) {
             // Add 1 day to make the comparison inclusive of the selected end date
            const beforeDate = new Date(advancedFilters.createdBefore);
            beforeDate.setDate(beforeDate.getDate() + 1); 
            if (userCreatedAt >= beforeDate) return false;
        }
        if (advancedFilters.lastActiveAfter && userLastActive) {
            if (userLastActive < new Date(advancedFilters.lastActiveAfter)) return false;
        }
        if (advancedFilters.lastActiveBefore && userLastActive) {
             const beforeDate = new Date(advancedFilters.lastActiveBefore);
             beforeDate.setDate(beforeDate.getDate() + 1);
            if (userLastActive >= beforeDate) return false;
        }
      } catch (e) {
        console.error("Date filtering error:", e);
        return false; // Exclude if dates are invalid
      }
      return true;
    });
    
    return advancedFiltered;

  }, [users, deletedUsers, tabValue, roleFilter, searchQuery, showAdvancedSearch, advancedFilters]);

  const paginatedUsers = useMemo(() => {
      return filteredUsers.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
      );
  }, [filteredUsers, page, rowsPerPage]);

  const searchResultsCount = useMemo(() => {
      if (searchQuery.trim() || showAdvancedSearch) {
          const count = filteredUsers.length;
          return `${count} ${count === 1 ? 'match' : 'matches'}`;
      }
      return null;
  }, [filteredUsers, searchQuery, showAdvancedSearch]);


  // --- Avatar Helper Functions (unchanged) ---
  const stringToColor = (string = '') => { /* ... */ 
    let hash = 0;
    for (let i = 0; i < string.length; i++) { hash = string.charCodeAt(i) + ((hash << 5) - hash); }
    let color = '#';
    for (let i = 0; i < 3; i++) { const value = (hash >> (i * 8)) & 0xff; color += `00${value.toString(16)}`.slice(-2); }
    return color;
  };
  const getInitials = (name = '') => { /* ... */ 
      if (!name) return '?';
    const names = name.split(' ');
    return names.length > 1 && names[0] && names[1]
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  // --- Render ---
  return (
    <Box sx={{ mt: { xs: 2, md: 4 }, px: { xs: 1, sm: 0 } }}> {/* Responsive margin and padding */}
      
      {/* --- Top Header Area --- */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, // Align center on larger screens
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on xs
        gap: 2 // Add gap for spacing when wrapped or stacked
      }}>
        {/* Left side - Title and Role Filters */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: { xs: '100%', sm: 'auto'} }}> {/* Stack title/filters on xs */}
           <Typography variant="h6" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem'} }}>
              Users Management
           </Typography>
           {/* Role filter buttons */}
           {tabValue === 0 && (
             <Stack 
                direction="row" 
                spacing={1} 
                flexWrap="wrap" // Allow filters to wrap
                useFlexGap // Better spacing for wrapped items
              >
               <Button variant={roleFilter === 'all' ? 'contained' : 'outlined'} size="small" onClick={() => setRoleFilter('all')}>All</Button>
               <Button variant={roleFilter === 'admin' ? 'contained' : 'outlined'} size="small" onClick={() => setRoleFilter('admin')} color="primary" startIcon={<AdminPanelSettings sx={{ fontSize: 18 }} />}>Admins</Button>
               <Button variant={roleFilter === 'user' ? 'contained' : 'outlined'} size="small" onClick={() => setRoleFilter('user')} color="info" startIcon={<People sx={{ fontSize: 18 }} />}>Users</Button>
             </Stack>
           )}
        </Box>
        
        {/* Right side - Advanced Search Toggle */}
        <Button
          variant="text" color="primary" size="small" onClick={toggleAdvancedSearch}
          endIcon={showAdvancedSearch ? <Clear /> : <FilterList />}
          sx={{ alignSelf: { xs: 'flex-end', sm: 'center'} }} // Align button correctly when stacked
        >
          {showAdvancedSearch ? 'Hide Filters' : 'Advanced Filters'}
        </Button>
      </Box>
      
      {/* --- Advanced Search Panel --- */}
      <Collapse in={showAdvancedSearch}>
        <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 2 }} elevation={1}>
          <Grid container spacing={2} alignItems="center">
            {/* Use responsive grid sizing */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={advancedFilters.status} onChange={(e) => handleAdvancedFilterChange('status', e.target.value)} label="Status">
                  {uniqueStatuses.map(status => (
                    <MenuItem key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.5}>
              <TextField label="Created After" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} value={advancedFilters.createdAfter} onChange={(e) => handleAdvancedFilterChange('createdAfter', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.5}>
              <TextField label="Created Before" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} value={advancedFilters.createdBefore} onChange={(e) => handleAdvancedFilterChange('createdBefore', e.target.value)} />
            </Grid>
            {/* Show Last Active only for Active Users tab */}
            {tabValue === 0 && (
              <>
                <Grid item xs={12} sm={6} md={4} lg={2.5}>
                  <TextField label="Last Active After" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} value={advancedFilters.lastActiveAfter} onChange={(e) => handleAdvancedFilterChange('lastActiveAfter', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2.5}>
                  <TextField label="Last Active Before" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} value={advancedFilters.lastActiveBefore} onChange={(e) => handleAdvancedFilterChange('lastActiveBefore', e.target.value)} />
                </Grid>
              </>
            )}
            {/* Clear button alignment */}
            <Grid item xs={12} md={tabValue === 0 ? 4 : 12} lg={2} container justifyContent={{xs: 'flex-start', md: "flex-end"}}>
                <Button variant="outlined" color="secondary" size="small" onClick={clearAdvancedFilters} startIcon={<Clear />}>Clear Filters</Button>
            </Grid>
          </Grid>
          {/* Active Filters Display (unchanged logic, uses Chip) */}
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                 {Object.entries(advancedFilters).map(([key, value]) => {
                   if (!value || value === 'all') return null;
                   let label = '';
                   try { // Add try-catch for date formatting
                       switch (key) {
                           case 'status': label = `Status: ${value}`; break;
                           case 'createdAfter': label = `Created > ${format(parseISO(value), 'MM/dd/yy')}`; break;
                           case 'createdBefore': label = `Created < ${format(parseISO(value), 'MM/dd/yy')}`; break;
                           case 'lastActiveAfter': label = `Active > ${format(parseISO(value), 'MM/dd/yy')}`; break;
                           case 'lastActiveBefore': label = `Active < ${format(parseISO(value), 'MM/dd/yy')}`; break;
                           default: return null;
                       }
                   } catch (e) { label = `Invalid Filter`;}
                   return <Chip key={key} label={label} onDelete={() => handleAdvancedFilterChange(key, key === 'status' ? 'all' : '')} size="small" color="primary" variant="outlined"/>;
                 })}
           </Box>
        </Paper>
      </Collapse>
      
      {/* --- Tabs and Search Section --- */}
      <Box sx={{ 
         borderBottom: 1, borderColor: 'divider', mb: 2, 
         display: 'flex', 
         // Stack on xs, row on sm+
         flexDirection: { xs: 'column', sm: 'row' }, 
         justifyContent: 'space-between',
         alignItems: { sm: 'center' } // Align center vertically when in a row
      }}>
          {/* Tabs take available space on larger screens, full width on smaller */}
         <Tabs value={tabValue} onChange={handleTabChange} sx={{ width: { xs: '100%', sm: 'auto' } }}
             variant="scrollable" // Make tabs scrollable if they overflow horizontally
             scrollButtons="auto" // Show scroll buttons automatically
             allowScrollButtonsMobile
              TabIndicatorProps={{ style: { height: '3px', backgroundColor: tabValue === 0 ? '#1b5e20' : '#d32f2f' }, }}
         >
              <Tab label="Active Users" icon={<CheckCircle />} iconPosition="start" sx={{ fontWeight: tabValue === 0 ? 'bold' : 'normal', color: tabValue === 0 ? '#1b5e20' : 'inherit' }} />
              <Tab label="Deactivated Users" icon={<Block />} iconPosition="start" sx={{ fontWeight: tabValue === 1 ? 'bold' : 'normal', color: tabValue === 1 ? '#d32f2f' : 'inherit' }} />
          </Tabs>
          
           {/* Search field - occupies remaining space or full width */}
           <Box sx={{ 
                display: 'flex', alignItems: 'center', 
                // Full width on xs with margin top, specific width/margin left on sm+
                width: { xs: '100%', sm: 'auto' }, 
                minWidth: { sm: '300px' },
                maxWidth: { sm: '400px' },
                mt: { xs: 1.5, sm: 0 },
                ml: { sm: 2 },
                mb: { xs: 1, sm: 0 } // Margin bottom on xs when stacked
             }}>
                <TextField placeholder={`Search ${tabValue === 0 ? 'active' : 'deactivated'}...`} variant="outlined" size="small" fullWidth value={searchQuery} onChange={handleSearchChange}
                     InputProps={{
                          startAdornment: (<InputAdornment position="start"><Search color="action" /></InputAdornment>),
                          endAdornment: (<Fade in={showClearSearch}><InputAdornment position="end"><IconButton size="small" onClick={clearSearch}><Clear fontSize="small" /></IconButton></InputAdornment></Fade>)
                     }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px' } }}
                />
                 {searchResultsCount && ( <Chip label={searchResultsCount} size="small" color="primary" sx={{ ml: 1, flexShrink: 0 }} /> )} {/* Ensure chip doesn't shrink */}
           </Box>
      </Box>
      
      {/* --- Users Table Section --- */}
       {/* Add horizontal scroll for the table container on smaller screens */}
       <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid rgba(224, 224, 224, 1)', borderRadius: '4px' }}> 
          <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}> {/* Remove border/elevation from container itself */}
                <Table sx={{ minWidth: 800 }}> {/* Set a minimum width for the table to ensure horizontal scroll activates meaningfully */}
                <TableHead sx={{ backgroundColor: tabValue === 0 ? '#f5f5f5' : '#ffebee' }}>
                     <TableRow>
                         {/* Apply whiteSpace for cells likely to contain longer text or needing consistent layout */}
                         <TableCell sx={{ width: '60px', padding: '8px' }}>Profile</TableCell>
                         <TableCell sx={{ whiteSpace: 'nowrap' }}>Name</TableCell>
                         <TableCell sx={{ whiteSpace: 'nowrap' }}>Email</TableCell>
                         <TableCell>Role</TableCell>
                         <TableCell>Status</TableCell>
                         {tabValue === 1 && (<TableCell sx={{ whiteSpace: 'nowrap' }}>Deactivated At</TableCell>)}
                         <TableCell sx={{ whiteSpace: 'nowrap' }}>{tabValue === 0 ? 'Last Active' : 'Created At'}</TableCell>
                         <TableCell align="right" sx={{ whiteSpace: 'nowrap', width: '150px' }}>Actions</TableCell> {/* Give actions a reasonable fixed width */}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paginatedUsers.length > 0 ? (
                       paginatedUsers.map((user) => (
                           <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, bgcolor: tabValue === 0 && user.role === 'admin' ? 'rgba(27, 94, 32, 0.04)' : tabValue === 1 ? 'rgba(211, 47, 47, 0.04)' : 'transparent' }} hover >
                             <TableCell sx={{ padding: '8px' }}>
                                 {user.profileImage ? ( <Avatar src={user.profileImage} alt={user.name} sx={{ width: 40, height: 40 }}/> ) : ( <Avatar sx={{ width: 40, height: 40, bgcolor: stringToColor(user.name) }}>{getInitials(user.name)}</Avatar> )}
                             </TableCell>
                             <TableCell>{user.name}</TableCell>
                             <TableCell>{user.email}</TableCell>
                             <TableCell><Chip label={user.role} color={user.role === 'admin' ? 'primary' : 'default'} size="small" sx={{ bgcolor: user.role === 'admin' ? '#1b5e20' : 'default', color: user.role === 'admin' ? 'white' : 'inherit', fontWeight: 500 }} /></TableCell>
                             <TableCell><Chip label={user.status} color={ user.status === 'active' ? 'success' : user.status === 'deleted' || user.status === 'deactivated' ? 'error' : 'warning' } size="small" sx={{ bgcolor: user.status === 'active' ? '#4caf50' : user.status === 'deleted' || user.status === 'deactivated' ? '#d32f2f' : '#ff9800', color: 'white', fontWeight: 500 }} /></TableCell>
                             {tabValue === 1 && ( <TableCell>{formatDate(user.deactivatedAt || user.deletedAt)}</TableCell> )}
                             <TableCell>{formatDate(tabValue === 0 ? user.lastActive : user.createdAt)}</TableCell>
                             <TableCell align="right" sx={{ padding: '0 8px' }}> {/* Reduce padding slightly in actions cell */}
                                   {/* Action buttons - Keep concise, use Tooltips */}
                                   {tabValue === 0 ? (
                                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                          <Tooltip title="Reset Password"><IconButton size="small" onClick={() => openSendPasswordResetConfirm(user.email, user.name)} color="primary" disabled={loadingStates.resetPassword}><LockReset fontSize="small" /></IconButton></Tooltip>
                                          <Tooltip title="Deactivate User"><IconButton size="small" onClick={() => openDeactivateConfirm(user.id, user.name)} color="error" disabled={loadingStates.deactivate}><Delete fontSize="small" /></IconButton></Tooltip>
                                          <Tooltip title="More"><IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}><MoreVert fontSize="small" /></IconButton></Tooltip>
                                     </Box>
                                   ) : (
                                       <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                         <Tooltip title="Send Reactivation Link"><IconButton size="small" onClick={() => openSendRecoveryConfirm(user.email, user.name)} color="warning" disabled={loadingStates.recover}><MailOutline fontSize="small" /></IconButton></Tooltip>
                                       </Box>
                                   )}
                             </TableCell>
                           </TableRow>
                       ))
                    ) : (
                         <TableRow>
                            <TableCell colSpan={tabValue === 0 ? 7 : 8} align="center" sx={{ py: 4 }}>
                                 <Typography variant="body1" color="textSecondary">
                                      {searchQuery.trim() || Object.values(advancedFilters).some(v => v && v !== 'all')
                                         ? `No ${tabValue === 0 ? 'active' : 'deactivated'} users found matching filters`
                                         : tabValue === 0 ? "No active users found" : "No deactivated users found"}
                                 </Typography>
                                 {(searchQuery.trim() || Object.values(advancedFilters).some(v => v && v !== 'all')) && (
                                      <Button variant="text" color="primary" onClick={() => { clearSearch(); clearAdvancedFilters(); setRoleFilter('all'); }} sx={{ mt: 1 }}>Clear All Filters</Button>
                                 )}
                           </TableCell>
                       </TableRow>
                    )}
                </TableBody>
               </Table>
           </TableContainer>
      </Box> {/* End of horizontal scroll box */}
      
      {/* --- Pagination --- */}
      {filteredUsers.length > 0 && ( // Only show pagination if there are users to paginate
         <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]} component="div" count={filteredUsers.length} rowsPerPage={rowsPerPage} page={page}
              onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
              // Make pagination labels slightly smaller on xs screens
              sx={{ '.MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel, .MuiTablePagination-select, .MuiTablePagination-actions': { fontSize: { xs: '0.75rem', sm: '0.875rem' } } }}
         />
      )}
      
      {/* --- Menus and Dialogs (no layout changes needed, MUI handles dialog responsiveness) --- */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
         {menuUser && menuUser.role !== 'admin' && (<MenuItem onClick={() => handleRoleChangeRequest('admin')}><AdminPanelSettings fontSize="small" sx={{ mr: 1 }} />Make Admin</MenuItem>)}
         {menuUser && menuUser.role === 'admin' && (<MenuItem onClick={() => handleRoleChangeRequest('user')}><People fontSize="small" sx={{ mr: 1 }} />Remove Admin</MenuItem>)}
      </Menu>
      
      <Dialog open={roleDialogOpen} onClose={handleRoleDialogClose} maxWidth="xs" fullWidth> {/* Use maxWidth */}
        <DialogTitle>{roleChangeDetails.newRole === 'admin' ? 'Grant Admin' : 'Remove Admin'}</DialogTitle>
        <DialogContent>
             <DialogContentText sx={{ mb: 2 }}>{roleChangeDetails.newRole === 'admin' ? `Grant admin privileges to ${roleChangeDetails.userName}?` : `Remove admin privileges from ${roleChangeDetails.userName}?`}</DialogContentText>
             <DialogContentText sx={{ mb: 2, fontWeight: 'bold' }}>Type to confirm: <span style={{ color: '#1b5e20', fontStyle: 'italic' }}>{roleChangeDetails.confirmationPhrase}</span></DialogContentText>
             <TextField autoFocus fullWidth value={confirmText} onChange={(e) => setConfirmText(e.target.value)} error={confirmText !== '' && confirmText !== roleChangeDetails.confirmationPhrase} helperText={confirmText !== '' && confirmText !== roleChangeDetails.confirmationPhrase ? "Text doesn't match" : null} />
         </DialogContent>
         <DialogActions>
             <Button onClick={handleRoleDialogClose} disabled={loadingStates.roleChange}>Cancel</Button>
             <Button onClick={handleConfirmRoleChange} color="primary" variant="contained" disabled={confirmText !== roleChangeDetails.confirmationPhrase || loadingStates.roleChange} startIcon={loadingStates.roleChange ? <CircularProgress size={16} color="inherit" /> : null}>{loadingStates.roleChange ? 'Processing...' : 'Confirm'}</Button>
         </DialogActions>
      </Dialog>
      
       <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({...confirmDialog, open: false})} maxWidth="xs" fullWidth>
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          <DialogContent><DialogContentText>{confirmDialog.message}</DialogContentText></DialogContent>
           <DialogActions>
               <Button onClick={() => setConfirmDialog({...confirmDialog, open: false})} disabled={ loadingStates.deactivate || loadingStates.recover || loadingStates.resetPassword }>Cancel</Button>
               <Button variant="contained" color={ confirmDialog.confirmText === 'Deactivate' ? 'error' : confirmDialog.confirmText === 'Send Recovery Link' ? 'warning' : 'primary' } onClick={handleConfirmAction} disabled={ loadingStates.deactivate || loadingStates.recover || loadingStates.resetPassword } startIcon={ (confirmDialog.confirmText === 'Deactivate' && loadingStates.deactivate) || (confirmDialog.confirmText === 'Send Recovery Link' && loadingStates.recover) || (confirmDialog.confirmText === 'Send Reset Link' && loadingStates.resetPassword) ? <CircularProgress size={16} color="inherit" /> : null }>
                 {(confirmDialog.confirmText === 'Deactivate' && loadingStates.deactivate) || (confirmDialog.confirmText === 'Send Recovery Link' && loadingStates.recover) || (confirmDialog.confirmText === 'Send Reset Link' && loadingStates.resetPassword) ? 'Processing...' : confirmDialog.confirmText}
               </Button>
           </DialogActions>
       </Dialog>
    </Box>
  );
};

// --- PropTypes (Add default values) ---
UsersList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired, name: PropTypes.string.isRequired, email: PropTypes.string.isRequired, role: PropTypes.string.isRequired, status: PropTypes.string.isRequired,
    lastActive: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]), createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]), profileImage: PropTypes.string
  })),
  deletedUsers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired, name: PropTypes.string.isRequired, email: PropTypes.string.isRequired, role: PropTypes.string.isRequired, status: PropTypes.string.isRequired,
    deletedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]), deactivatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]), createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]), profileImage: PropTypes.string
  })),
  handleEdit: PropTypes.func,
  handleDeactivateUser: PropTypes.func.isRequired, 
  handleSendRecovery: PropTypes.func.isRequired,
  handleSendPasswordReset: PropTypes.func.isRequired,
  updateUserRole: PropTypes.func.isRequired
};

UsersList.defaultProps = {
    users: [],
    deletedUsers: [],
    handleEdit: () => {}, // Provide a no-op default if optional
};


export default UsersList;