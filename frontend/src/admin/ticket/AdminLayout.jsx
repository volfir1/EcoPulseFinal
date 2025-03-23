import React, { useState, useEffect, useContext } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppIcon } from '@shared/index';
import { useSnackbar } from '@components/toast-notif/ToastNotification';
import AuthContext from '@shared/context/AuthContext';
import ticketService from '../../services/ticketService';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  LayoutDashboard,
  Ticket,
  Settings,
  LogOut,
  User,
  Bell,
  MessageSquare,
  Search
} from 'lucide-react';

const drawerWidth = 280;

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const toast = useSnackbar();

  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [notificationsData, setNotificationsData] = useState([]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await ticketService.getUnreadCount();
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    // Set up interval to check for new tickets
    const interval = setInterval(fetchUnreadCount, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  // Navigation items
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/admin' },
    { name: 'Tickets', icon: <Ticket size={22} />, path: '/admin/tickets' },
    { name: 'Settings', icon: <Settings size={22} />, path: '/admin/settings' },
  ];

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotificationsMenu = (event) => {
    setAnchorElNotifications(event.currentTarget);
    // Fetch notifications
    // This is a placeholder, you would fetch actual data
    setNotificationsData([
      { id: 1, content: 'New ticket has been created', time: '5 min ago' },
      { id: 2, content: 'John replied to ticket #1234', time: '10 min ago' },
      { id: 3, content: 'Ticket #1235 has been resolved', time: '1 hour ago' },
    ]);
  };

  const handleCloseNotificationsMenu = () => {
    setAnchorElNotifications(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Drawer content
  const drawer = (
    <div>
      <Toolbar 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          px: [1, 3],
          py: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AppIcon name="ticket" size={24} style={{ marginRight: '12px' }} />
          <Typography variant="h6" noWrap component="div" fontWeight="bold">
            Support Admin
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List sx={{ px: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)}
              sx={{
                borderRadius: 2,
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: '#F0FDF4',
                  '&:hover': {
                    backgroundColor: '#E5F7EB',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.name === 'Tickets' ? (
                  <Badge badgeContent={unreadCount} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText 
                primary={item.name} 
                primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 'bold' : 'medium' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { sm: open ? `${drawerWidth}px` : 0 },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleMobileDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Search Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F3F4F6',
              borderRadius: 2,
              p: 1,
              mx: 2,
              width: { xs: '100%', md: 300 },
            }}
          >
            <Search size={20} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search tickets..."
              className="bg-transparent border-none outline-none w-full"
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Notification Icon */}
          <Tooltip title="Notifications">
            <IconButton onClick={handleOpenNotificationsMenu} sx={{ mx: 1 }}>
              <Badge badgeContent={notificationsData.length} color="error">
                <Bell size={22} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Box sx={{ flexShrink: 0, ml: 1 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  alt={user?.firstName}
                  src={user?.profilePicture}
                  sx={{ width: 40, height: 40, bgcolor: '#16A34A' }}
                >
                  {user?.firstName?.charAt(0) || 'A'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={() => {
                navigate('/admin/profile');
                handleCloseUserMenu();
              }}>
                <User size={18} style={{ marginRight: 8 }} />
                <Typography textAlign="center">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={() => {
                navigate('/admin/settings');
                handleCloseUserMenu();
              }}>
                <Settings size={18} style={{ marginRight: 8 }} />
                <Typography textAlign="center">Settings</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogOut size={18} style={{ marginRight: 8 }} />
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer - Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleMobileDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Drawer - Desktop */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
          width: open ? drawerWidth : 0,
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        {drawer}
      </Drawer>

      {/* Notifications Menu */}
      <Menu
        sx={{ mt: '45px' }}
        id="notifications-menu"
        anchorEl={anchorElNotifications}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElNotifications)}
        onClose={handleCloseNotificationsMenu}
      >
        <Box sx={{ width: 320, maxWidth: '100%', p: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ p: 1 }}>
            Notifications
          </Typography>
          <Divider />
          {notificationsData.length > 0 ? (
            notificationsData.map((notification) => (
              <MenuItem 
                key={notification.id}
                onClick={handleCloseNotificationsMenu}
                sx={{ 
                  borderRadius: 1,
                  my: 0.5,
                  px: 1,
                  py: 1
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <MessageSquare size={18} style={{ marginRight: 12, marginTop: 4 }} />
                  <Box>
                    <Typography variant="body2">
                      {notification.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.time}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No new notifications
              </Typography>
            </Box>
          )}
          <Divider />
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ cursor: 'pointer', fontWeight: 'medium' }}
            >
              View all notifications
            </Typography>
          </Box>
        </Box>
      </Menu>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: { xs: 7, sm: 8 },
          width: { sm: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;