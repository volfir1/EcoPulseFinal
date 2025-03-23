// src/features/user/UserMails.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Tab, 
  Tabs, 
  Chip,
  Divider,
} from '@mui/material';
import { 
  Card, 
  Button, 
  Loader, 
  AppIcon, 
  Searchbar
} from '@shared/index';
import AuthContext from '@shared/context/AuthContext';
import ticketService from '../../../../services/ticketService';
import { formatDate, getStatusColor, getStatusIcon } from './userTicketUtils';

const UserMails = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Tabs for filtering tickets
  const tabs = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];
  
  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        console.log("Fetching user tickets...");
        const response = await ticketService.getUserTickets();
        
        console.log("Full API response:", response);
        
        if (response.success) {
          // Ensure we're accessing the right property
          const ticketData = response.data;
          console.log("Ticket data to be set:", ticketData);
          
          // Check if data is an array, if not, look for nested arrays
          if (Array.isArray(ticketData)) {
            setTickets(ticketData);
          } else if (ticketData && Array.isArray(ticketData.data)) {
            setTickets(ticketData.data);
          } else {
            console.warn("Unexpected data structure:", ticketData);
            setTickets([]); // Set empty array as fallback
          }
        } else {
          setError(response.message || 'Failed to load tickets');
          setTickets([]); // Set empty array on error
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError(err.message || 'Error loading tickets');
        setTickets([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchTickets();
  }, []);
  
  // Filter tickets based on tab and search
  const getFilteredTickets = () => {
    let filtered = [...tickets];
    
    // Debug log to help diagnose
    console.log("Filtering tickets. Total before filter:", tickets.length);
    
    // Filter by tab value
    if (tabValue > 0) {
      const status = tabs[tabValue].toLowerCase().replace(' ', '-');
      filtered = filtered.filter(ticket => ticket.status === status);
      console.log(`Filtered by status '${status}':`, filtered.length);
    }
    
    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(ticket => 
        (ticket.subject && ticket.subject.toLowerCase().includes(search)) || 
        (ticket.ticketNumber && ticket.ticketNumber.toString().includes(search)) ||
        (ticket.category && ticket.category.toLowerCase().includes(search))
      );
      console.log(`Filtered by search '${search}':`, filtered.length);
    }
    
    return filtered;
  };
  
  // Handle ticket click to view details
  const handleTicketClick = (ticketId) => {
    navigate(`/mails/${ticketId}`);
  };
  
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
      <Loader />
    </Box>
  );
  
  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">My Support Tickets</Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AppIcon name="send" />}
          onClick={() => navigate('/help-support')}
        >
          New Ticket
        </Button>
      </Box>
      
      {/* Debug info - can be removed in production */}
      <Box sx={{ mb: 2, p: 2, border: '1px dashed #ccc', display: process.env.NODE_ENV === 'development' ? 'block' : 'none' }}>
        <Typography variant="caption" component="div">Debug: {tickets.length} total tickets</Typography>
        <Typography variant="caption" component="div">
          Auth Token: {localStorage.getItem('authToken') ? '✓ Present' : '✗ Missing'}
        </Typography>
      </Box>
      
      {/* Search and Filters */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { md: 'center' } }}>
        <Box sx={{ width: { xs: '100%', md: '300px' } }}>
          <Searchbar
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </Box>
        
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            minHeight: 48,
            '.MuiTabs-flexContainer': {
              flexWrap: 'wrap'
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab} />
          ))}
        </Tabs>
      </Box>
      
      {/* Tickets List */}
      {error ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <AppIcon name='alert' size={40} color="error" />
          <Typography color="error" variant="h6" mt={2}>{error}</Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            {error?.includes('auth') ? 'Authentication error. Please try logging in again.' : ''}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            startIcon={<AppIcon name="refresh-cw" />}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      ) : getFilteredTickets().length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <AppIcon name="mails" size={40} />
          <Typography variant="h6" mt={2}>No tickets found</Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            {searchTerm 
              ? 'Try adjusting your search criteria' 
              : tabValue > 0 
                ? `You don't have any ${tabs[tabValue].toLowerCase()} tickets` 
                : 'You haven\'t submitted any support tickets yet'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/help-support')}
            startIcon={<AppIcon name="send" />}
            sx={{ mt: 3 }}
          >
            Submit New Ticket
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {getFilteredTickets().map((ticket) => {
            const statusColor = getStatusColor(ticket.status);
            const statusIcon = getStatusIcon(ticket.status);
            
            return (
              <Grid item xs={12} key={ticket._id}>
                <Card.Base
                  variant={statusColor}
                  elevation={1}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { 
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => handleTicketClick(ticket._id)}
                >
                  <Box sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AppIcon name='ticket' size={18} />
                        <Typography variant="h6" fontWeight="medium">
                          {ticket.subject || 'No Subject'}
                        </Typography>
                      </Box>
                      <Chip 
                        label={(ticket.status || 'unknown').toUpperCase().replace('-', ' ')} 
                        color={statusColor}
                        size="small"
                      />
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        mb: 2
                      }}
                    >
                      {ticket.messages && ticket.messages[0]?.content || 'No description available'}
                    </Typography>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="caption" color="text.secondary">
                          <b>Ticket ID:</b> #{ticket.ticketNumber || '------'}
                        </Typography>
                        {ticket.category && (
                          <Chip 
                            label={ticket.category.toUpperCase()} 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                        {ticket.priority && (
                          <Chip 
                            label={ticket.priority.toUpperCase()} 
                            size="small" 
                            color={
                              ticket.priority === 'high' || ticket.priority === 'urgent' 
                                ? 'error' 
                                : ticket.priority === 'medium' 
                                  ? 'warning' 
                                  : 'success'
                            }
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(ticket.updatedAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Card.Base>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default UserMails;