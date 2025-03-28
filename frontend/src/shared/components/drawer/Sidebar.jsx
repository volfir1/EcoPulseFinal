//Sidebar.jsx
import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import { USER_NAVIGATION, ADMIN_NAVIGATION } from './data';
import NavigationItems from './renderDrawer';
import useDrawer from './useDrawer';
import RenderDrawer from './renderDrawer';
import Logo from '../ui/logo';
import { useLocation } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { 
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  SwipeableDrawer,
  Fab,
  useScrollTrigger,
  Zoom,
  Tooltip,
} from '@mui/material';
import { Logout, Menu as MenuIcon } from '@mui/icons-material';

// Constants
const DRAWER_WIDTH = 240;
const MOBILE_DRAWER_WIDTH = '85%';
const TABLET_DRAWER_WIDTH = 260;

// Styled components for desktop drawer
const openedMixin = (theme) => ({
  width: DRAWER_WIDTH,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.down('sm')]: {
    width: 0,
    padding: 0,
  },
});

const StyledDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: DRAWER_WIDTH,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
    [theme.breakpoints.down('sm')]: {
      display: 'none', // Hide permanent drawer on mobile
    },
  }),
);

// Extracted reusable styles
const scrollableListStyles = {
  flex: 1,
  overflowY: 'auto',
  pb: 7,
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none'
  },
  msOverflowStyle: 'none'
};

const logoutContainerStyles = {
  position: 'sticky',
  bottom: 0,
  width: '100%',
  bgcolor: 'background.paper',
  borderTop: '1px solid',
  borderColor: 'divider',
  zIndex: 1
};

const logoutButtonStyles = {
  minHeight: 48,
  px: 2.5,
  transition: 'all 0.2s ease',
  '&:hover': { backgroundColor: 'action.hover' }
};

// Hamburger button for closed drawer
const ClosedDrawerMenuButton = ({ onClick, open }) => {
  if (open) return null;
  
  return (
    <Tooltip title="Expand menu" placement="right">
      <IconButton
        onClick={onClick}
        sx={{
          position: 'fixed',
          top: 16,
          left: 12,
          zIndex: 1200,
          bgcolor: 'background.paper',
          boxShadow: 1,
          '&:hover': {
            bgcolor: 'action.hover',
          },
          display: { xs: 'none', sm: 'flex' }
        }}
        size="small"
      >
        <MenuIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

// Mobile fab button
const FloatingMenuButton = ({ onClick }) => {
  const theme = useTheme();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  return (
    <Zoom in={!trigger}>
      <Fab
        color="primary"
        aria-label="open menu"
        onClick={onClick}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: theme.zIndex.drawer + 1,
        }}
        size="medium"
      >
        <MenuIcon />
      </Fab>
    </Zoom>
  );
};

// Memoized logout button component


const Sidebar = () => {
  const { open, openSubMenu, handleDrawer, handleSubMenu } = useDrawer();
  const location = useLocation();
  const theme = useTheme();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // State for mobile drawer
  const [mobileOpen, setMobileOpen] = React.useState(false);
  
  // Handle mobile drawer toggle
  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const navigationData = React.useMemo(() => {
    const isAdminPath = location.pathname.includes('/admin');
    return isAdminPath ? ADMIN_NAVIGATION : USER_NAVIGATION;
  }, [location.pathname]);

  const mainContainerStyles = React.useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '100vh'
  }), []);

  // Mobile drawer content
  const drawerContent = (
    <Box sx={mainContainerStyles}>
      <Logo open={isMobile ? true : open} onToggle={isMobile ? handleMobileDrawerToggle : handleDrawer} />
      
      <List sx={scrollableListStyles}>
      <NavigationItems 
  navigationData={navigationData}
  open={isMobile ? true : open}
  openSubMenu={openSubMenu}
  handleSubMenu={handleSubMenu}
  currentPath={location.pathname} // Add this line
/>
      </List>
      
    
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Hamburger menu button when drawer is closed */}
      <ClosedDrawerMenuButton onClick={handleDrawer} open={open} />
      
      {/* Desktop/Tablet Drawer */}
      <StyledDrawer variant="permanent" open={open}>
        {drawerContent}
      </StyledDrawer>
      
      {/* Mobile Drawer */}
      {isMobile && (
        <>
          <SwipeableDrawer
            variant="temporary"
            open={mobileOpen}
            onOpen={() => setMobileOpen(true)}
            onClose={() => setMobileOpen(false)}
            ModalProps={{
              keepMounted: true, // Better mobile performance
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { 
                width: MOBILE_DRAWER_WIDTH,
                boxSizing: 'border-box',
              },
            }}
          >
            {drawerContent}
          </SwipeableDrawer>
          
          {/* Floating menu button for mobile */}
          <FloatingMenuButton onClick={handleMobileDrawerToggle} />
        </>
      )}
      
      {/* Tablet temporary drawer - appears when drawer is closed */}
      {isTablet && !open && (
        <MuiDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': { 
              width: TABLET_DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </MuiDrawer>
      )}
    </Box>
  );
};

export default React.memo(Sidebar);