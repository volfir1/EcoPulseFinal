import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import { USER_NAVIGATION, ADMIN_NAVIGATION} from './data';
import NavigationItems from './renderDrawer';
import useDrawer from './useDrawer';
import RenderDrawer from './renderDrawer';
import Logo from '../ui/logo';
import { useLocation } from 'react-router-dom';
import { 
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Logout } from '@mui/icons-material';

// Constants
const DRAWER_WIDTH = 240;

// Styled components moved outside
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

// Memoized logout button component
const LogoutButton = React.memo(({ open }) => (
  <ListItemButton 
    sx={{
      ...logoutButtonStyles,
      justifyContent: open ? 'initial' : 'center',
    }}
    onClick={() => console.log('Logout clicked')}
  >
    <ListItemIcon sx={{
      minWidth: 0,
      mr: open ? 3 : 'auto',
      justifyContent: 'center',
    }}>
    
    </ListItemIcon>
    <ListItemText
      primary="Logout"
      sx={{ opacity: open ? 1 : 0 }}
    />
  </ListItemButton>
));

// Memoized navigation items

const Sidebar = () => {
  const { open, openSubMenu, handleDrawer, handleSubMenu } = useDrawer();
  const location = useLocation();
  
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


  return (
    <Box sx={{ display: 'flex' }}>
      <StyledDrawer variant="permanent" open={open}>
        <Box sx={mainContainerStyles}>
          <Logo open={open} onToggle={handleDrawer} />
          
          <List sx={scrollableListStyles}>
            <NavigationItems 
              navigationData={navigationData}
              open={open}
              openSubMenu={openSubMenu}
              handleSubMenu={handleSubMenu}
            />
          </List>

        
        </Box>
      </StyledDrawer>
    </Box>
  );
};

export default React.memo(Sidebar);