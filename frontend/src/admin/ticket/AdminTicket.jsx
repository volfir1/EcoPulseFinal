import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '@shared/context/AuthContext';
import ticketService from '../../services/ticketService';
import { useSnackbar } from '@components/toast-notif/ToastNotification';
import Card from '@components/cards/cards';
import { AppIcon } from '@shared/index';
import { Tabs, Tab, Box, Typography, Badge, Chip, Avatar } from '@mui/material';
import { DataTable } from '@shared/index';

const AdminTicketDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    unassigned: 0
  });
  const [filterOptions, setFilterOptions] = useState({
    status: '',
    category: '',
    assigned: ''
  });

  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const toast = useSnackbar();

  // Check if user is admin
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'admin') {
      toast.error('You do not have access to this page');
      navigate('/');
    }
  }, [isAuthenticated, user, navigate, toast]);

  // Fetch tickets with filters
  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const filters = {};
      if (filterOptions.status) filters.status = filterOptions.status;
      if (filterOptions.category) filters.category = filterOptions.category;
      if (filterOptions.assigned) filters.assigned = filterOptions.assigned;
  
      const response = await ticketService.getAllTickets(filters);
      
      // Pre-process the data to ensure no objects will be rendered directly
      const processedTickets = response.data.map(ticket => ({
        ...ticket,
        // Store original objects in separate properties with underscore prefix
        _userData: ticket.user,
        _assignedData: ticket.assignedTo,
        
        // Convert any potential objects to strings
        user: typeof ticket.user === 'object' ? 
          (ticket.user?.firstName && ticket.user?.lastName ? 
            `${ticket.user.firstName} ${ticket.user.lastName}` : 
            (ticket.user?.email || 'Unknown User')) : 
          (ticket.user || 'Unknown User'),
        
        assignedTo: typeof ticket.assignedTo === 'object' ?
          (ticket.assignedTo?.firstName && ticket.assignedTo?.lastName ?
            `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` :
            'Unnamed Admin') :
          null,
          
        // Ensure these are strings
        status: String(ticket.status || 'unknown'),
        priority: String(ticket.priority || 'unknown')
      }));
      
      setTickets(processedTickets);
      
      // Count stats based on processed tickets
      const stats = {
        total: processedTickets.length,
        open: processedTickets.filter(ticket => ticket.status === 'open').length,
        inProgress: processedTickets.filter(ticket => ticket.status === 'in-progress').length,
        resolved: processedTickets.filter(ticket => ticket.status === 'resolved').length,
        closed: processedTickets.filter(ticket => ticket.status === 'closed').length,
        unassigned: processedTickets.filter(ticket => !ticket._assignedData).length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error(error.message || 'Failed to fetch tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // Fetch ticket stats
    const fetchStats = async () => {
      try {
        const response = await ticketService.getTicketStats();
        if (response.data) {
          setStats(prev => ({
            ...prev,
            ...response.data
          }));
        }
      } catch (error) {
        console.error('Error fetching ticket stats:', error);
      }
    };
    fetchStats();
  }, [filterOptions]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Update filters based on tab
    const newFilters = { ...filterOptions };
    
    switch (newValue) {
      case 0: // All
        newFilters.status = '';
        break;
      case 1: // Open
        newFilters.status = 'open';
        break;
      case 2: // In Progress
        newFilters.status = 'in-progress';
        break;
      case 3: // Resolved
        newFilters.status = 'resolved';
        break;
      case 4: // Closed
        newFilters.status = 'closed';
        break;
      case 5: // Unassigned
        newFilters.assigned = 'unassigned';
        break;
      case 6: // My Tickets
        newFilters.assigned = 'me';
        break;
      default:
        break;
    }
    
    setFilterOptions(newFilters);
  };

  const handleViewTicket = (ticketId) => {
    navigate(`/admin/tickets/${ticketId}`);
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return { bg: '#EEF7FF', color: '#1A73E8' };
      case 'in-progress':
        return { bg: '#FFF7E0', color: '#F29D41' };
      case 'resolved':
        return { bg: '#E7F7ED', color: '#34A853' };
      case 'closed':
        return { bg: '#F2F2F2', color: '#5F6368' };
      default:
        return { bg: '#F2F2F2', color: '#5F6368' };
    }
  };

  // Get priority chip color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return { bg: '#E7F7ED', color: '#34A853' };
      case 'medium':
        return { bg: '#FFF7E0', color: '#F29D41' };
      case 'high':
        return { bg: '#FFEBEE', color: '#E53935' };
      case 'urgent':
        return { bg: '#7F1D1D', color: '#FFFFFF' };
      default:
        return { bg: '#F2F2F2', color: '#5F6368' };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  // Define columns for data table
  const columns = [
    {
      id: 'ticketNumber',
      header: 'Ticket #',
      accessorKey: 'ticketNumber',
      cell: (info) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 'bold',
            color: info.row.original.isRead?.byAdmin ? 'text.secondary' : 'primary.main',
            cursor: 'pointer'
          }}
          onClick={() => handleViewTicket(info.row.original._id)}
        >
          #{info.getValue()}
          {!info.row.original.isRead?.byAdmin && (
            <Badge
              sx={{
                display: 'inline-block',
                width: 8,
                height: 8,
                backgroundColor: '#FF3B30',
                borderRadius: '50%',
                ml: 1
              }}
            />
          )}
        </Typography>
      )
    },
    {
      id: 'subject',
      header: 'Subject',
      accessorKey: 'subject',
      cell: (info) => (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 250,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            cursor: 'pointer'
          }}
          onClick={() => handleViewTicket(info.row.original._id)}
        >
          {info.getValue()}
        </Typography>
      )
    },
    {
        id: 'user',
        header: 'Customer',
        accessorKey: 'user', // Now using pre-processed string 
        cell: (info) => {
          const rowData = info.row.original;
          const userData = rowData._userData || {};
          const initial = userData.firstName
            ? userData.firstName.charAt(0).toUpperCase()
            : userData.email
              ? userData.email.charAt(0).toUpperCase()
              : '?';
          
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={userData.profilePicture || ''}
                sx={{ width: 24, height: 24, mr: 1 }}
              >
                {!userData.profilePicture && initial}
              </Avatar>
              <Typography variant="body2">
                {info.getValue()} {/* Now guaranteed to be a string */}
              </Typography>
            </Box>
          );
        }
      },
      
    {
      id: 'category',
      header: 'Category',
      accessorKey: 'category',
      cell: (info) => (
        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
          {info.getValue()}
        </Typography>
      )
    },
    {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        cell: (info) => {
          // Add a type check to ensure status is a string
          const status = typeof info.getValue() === 'string' ? info.getValue() : 'unknown';
          const { bg, color } = getStatusColor(status);
          return (
            <Chip
              label={status.replace('-', ' ')}
              sx={{
                backgroundColor: bg,
                color: color,
                textTransform: 'capitalize',
                fontWeight: 'medium',
                fontSize: '0.75rem'
              }}
              size="small"
            />
          );
        }
      },
      {
        id: 'priority',
        header: 'Priority',
        accessorKey: 'priority',
        cell: (info) => {
          // Add a type check to ensure priority is a string
          const priority = typeof info.getValue() === 'string' ? info.getValue() : 'unknown';
          const { bg, color } = getPriorityColor(priority);
          return (
            <Chip
              label={priority}
              sx={{
                backgroundColor: bg,
                color: color,
                textTransform: 'capitalize',
                fontWeight: 'medium',
                fontSize: '0.75rem'
              }}
              size="small"
            />
          );
        }
      },
      {
        id: 'assignedTo',
        header: 'Assigned To',
        accessorKey: 'assignedTo', // Now using pre-processed string or null
        cell: (info) => {
          const rowData = info.row.original;
          const admin = rowData._assignedData;
          
          return admin ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={admin.profilePicture || ''}
                sx={{ width: 24, height: 24, mr: 1 }}
              >
                {admin.firstName ? admin.firstName.charAt(0) : '?'}
              </Avatar>
              <Typography variant="body2">
                {info.getValue()} {/* Now guaranteed to be a string */}
              </Typography>
            </Box>
          ) : (
            <Chip
              label="Unassigned"
              sx={{
                backgroundColor: '#F2F2F2',
                color: '#5F6368',
                fontSize: '0.75rem'
              }}
              size="small"
            />
          );
        }
      },
    {
        id: 'updatedAt',
        header: 'Last Updated',
        accessorKey: 'updatedAt',
        cell: (info) => {
          const dateValue = info.getValue();
          return (
            <Typography variant="body2">
              {dateValue ? formatDate(dateValue) : 'N/A'}
            </Typography>
          );
        }
      }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Ticket Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and respond to customer support tickets
        </Typography>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <Card.Base
          stats={{
            value: stats.total,
            label: 'Total Tickets'
          }}
        />
        <Card.Success
          stats={{
            value: stats.open,
            label: 'Open Tickets'
          }}
        />
        <Card.Warning
          stats={{
            value: stats.inProgress,
            label: 'In Progress'
          }}
        />
        <Card.Wind
          stats={{
            value: stats.resolved,
            label: 'Resolved'
          }}
        />
        <Card.Outlined
          stats={{
            value: stats.closed,
            label: 'Closed'
          }}
        />
        <Card.Error
          stats={{
            value: stats.unassigned,
            label: 'Unassigned'
          }}
        />
      </div>

      {/* Ticket Filter Tabs */}
      <Card.Base className="mb-6">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 3,
              fontWeight: 500,
            },
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AppIcon name="ticket" size={18} sx={{ mr: 1 }} />
                <span>All Tickets</span>
                <Chip 
                  label={stats.total} 
                  size="small" 
                  sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} 
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span>Open</span>
                <Chip 
                  label={stats.open} 
                  size="small" 
                  sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} 
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span>In Progress</span>
                <Chip 
                  label={stats.inProgress}
                  size="small" 
                  sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} 
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span>Resolved</span>
                <Chip 
                  label={stats.resolved} 
                  size="small" 
                  sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} 
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span>Closed</span>
                <Chip 
                  label={stats.closed} 
                  size="small" 
                  sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} 
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span>Unassigned</span>
                <Chip 
                  label={stats.unassigned} 
                  size="small" 
                  sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} 
                />
              </Box>
            } 
          />
          <Tab label="My Tickets" />
        </Tabs>
      </Card.Base>

      {/* Tickets Table */}
      <Card.Base>
        <DataTable
          columns={columns}
          data={tickets}
          loading={isLoading}
          pagination
          initialState={{
            pagination: {
              pageSize: 10,
            },
            sorting: [
              {
                id: 'updatedAt',
                desc: true
              }
            ]
          }}
        />
      </Card.Base>
    </div>
  );
};

export default AdminTicketDashboard;