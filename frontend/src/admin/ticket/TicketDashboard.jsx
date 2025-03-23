import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketService from '../../services/ticketService';
import { useSnackbar } from '@components/toast-notif/ToastNotification';
import { AppIcon } from '@shared/index';
import { 
  Typography, 
  Box, 
  Avatar, 
  LinearProgress, 
  Button, 
  Chip, 
  Divider, 
  Paper 
} from '@mui/material';
import { 
  BarChart4,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Ticket,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tickets: {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      unassigned: 0
    },
    resolution: {
      rate: 0,
      change: 0
    }
  });
  const [recentTickets, setRecentTickets] = useState([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch ticket stats
        const statsResponse = await ticketService.getTicketStats();
        if (statsResponse.data) {
          setStats(prev => ({
            ...prev,
            tickets: {
              total: statsResponse.data.total || 0,
              open: statsResponse.data.open || 0,
              inProgress: statsResponse.data.inProgress || 0,
              resolved: statsResponse.data.resolved || 0,
              closed: statsResponse.data.closed || 0,
              unassigned: statsResponse.data.unassigned || 0
            },
           
          }));
        }
        
        // Fetch recent tickets
        const recentResponse = await ticketService.getAllTickets();
        setRecentTickets(recentResponse.data.slice(0, 5)); // Get latest 5 tickets
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        enqueueSnackbar('Failed to load dashboard data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [enqueueSnackbar]);
  
  // Get status color
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

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Status card component
  const StatusCard = ({ label, value, color, bgColor }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center justify-center h-full">
      <Typography variant="h5" fontWeight="bold" style={{ color }}>
        {value}
      </Typography>
      <Typography variant="body2" style={{ color }}>
        {label}
      </Typography>
    </div>
  );

  // Stat card component
  const StatCard = ({ title, value, icon, iconBg, iconColor, changeValue, changeType }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Typography variant="body2" color="text.secondary" className="mb-1">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {value}
          </Typography>
          {changeValue && (
            <div className="flex items-center mt-1">
              {changeType === 'increase' ? (
                <ArrowUpRight size={16} className="text-green-500 mr-1" />
              ) : (
                <ArrowDownRight size={16} className="text-red-500 mr-1" />
              )}
              <Typography variant="caption" color={changeType === 'increase' ? 'success.main' : 'error.main'}>
                {changeValue}%
              </Typography>
            </div>
          )}
        </div>
        <Avatar
          sx={{
            backgroundColor: iconBg,
            color: iconColor,
            width: 40,
            height: 40
          }}
        >
          {icon}
        </Avatar>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RefreshCw className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          User Tickets
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage support ticket metrics and activity
        </Typography>
      </div>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Tickets Card */}
        <StatCard 
          title="Total Tickets" 
          value={stats.tickets.total} 
          icon={<Ticket size={20} />} 
          iconBg="rgba(21, 101, 192, 0.1)" 
          iconColor="#1565C0" 
        />
        
        {/* Open Tickets Card */}
        <StatCard 
          title="Open Tickets" 
          value={stats.tickets.open} 
          icon={<AlertTriangle size={20} />} 
          iconBg="rgba(26, 115, 232, 0.1)" 
          iconColor="#1A73E8" 
        />
        {/* Unassigned Tickets Card */}
        <StatCard 
          title="Unassigned" 
          value={stats.tickets.unassigned} 
          icon={<Users size={20} />} 
          iconBg="rgba(229, 57, 53, 0.1)" 
          iconColor="#E53935" 
        />
      </div>
      
      {/* Ticket Status and Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Ticket Status Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h6" fontWeight="bold">
                Tickets by Status
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/admin/ticket')}
              >
                View All
              </Button>
            </div>
            
            {/* Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <Typography variant="h5" fontWeight="bold" color="#1A73E8">
                  {stats.tickets.open}
                </Typography>
                <Typography variant="body2" color="#1A73E8">
                  Open
                </Typography>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <Typography variant="h5" fontWeight="bold" color="#F29D41">
                  {stats.tickets.inProgress}
                </Typography>
                <Typography variant="body2" color="#F29D41">
                  In Progress
                </Typography>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <Typography variant="h5" fontWeight="bold" color="#34A853">
                  {stats.tickets.resolved}
                </Typography>
                <Typography variant="body2" color="#34A853">
                  Resolved
                </Typography>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <Typography variant="h5" fontWeight="bold" color="#E53935">
                  {stats.tickets.unassigned}
                </Typography>
                <Typography variant="body2" color="#E53935">
                  Unassigned
                </Typography>
              </div>
            </div>
            
            {/* Progress Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Typography variant="body2" fontWeight="medium">
                    Open Tickets
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {stats.tickets.open} / {stats.tickets.total}
                  </Typography>
                </div>
                <LinearProgress 
                  variant="determinate" 
                  value={(stats.tickets.open / stats.tickets.total) * 100}
                  sx={{ 
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(26, 115, 232, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#1A73E8'
                    }
                  }}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Typography variant="body2" fontWeight="medium">
                    In Progress Tickets
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {stats.tickets.inProgress} / {stats.tickets.total}
                  </Typography>
                </div>
                <LinearProgress 
                  variant="determinate" 
                  value={(stats.tickets.inProgress / stats.tickets.total) * 100}
                  sx={{ 
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(242, 157, 65, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#F29D41'
                    }
                  }}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Typography variant="body2" fontWeight="medium">
                    Resolved Tickets
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {stats.tickets.resolved} / {stats.tickets.total}
                  </Typography>
                </div>
                <LinearProgress 
                  variant="determinate" 
                  value={(stats.tickets.resolved / stats.tickets.total) * 100}
                  sx={{ 
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(52, 168, 83, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#34A853'
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity Section */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 h-full">
            <Typography variant="h6" fontWeight="bold" className="mb-4">
              Recent Activity
            </Typography>
            
            {recentTickets.length > 0 ? (
              <div className="space-y-1">
                {recentTickets.map((ticket, index) => (
                  <React.Fragment key={ticket._id}>
                    <div 
                      className="py-3 flex items-start hover:bg-gray-50 rounded-md px-2 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/tickets/${ticket._id}`)}
                    >
                      <Avatar
                        src={ticket.user?.profilePicture}
                        className="mr-3"
                        sx={{ width: 36, height: 36 }}
                      >
                        {ticket.user?.firstName?.charAt(0) || ticket.user?.email?.charAt(0)}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Typography variant="body2" fontWeight="medium" noWrap className="max-w-full">
                            {ticket.subject}
                          </Typography>
                          <Chip
                            label={ticket.status.replace('-', ' ')}
                            size="small"
                            sx={{
                              ...getStatusColor(ticket.status),
                              textTransform: 'capitalize',
                              fontWeight: 'medium',
                              fontSize: '0.65rem',
                              height: 20
                            }}
                          />
                        </div>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(ticket.updatedAt)}
                        </Typography>
                      </div>
                    </div>
                    {index < recentTickets.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center py-10">
                <Typography variant="body2" color="text.secondary">
                  No recent activity
                </Typography>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;