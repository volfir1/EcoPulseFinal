import React from 'react';
import { Box, IconButton } from '@mui/material';
import { ChevronLeft, Menu } from '@mui/icons-material';
import { useTheme } from '@emotion/react';
import logo from '@assets/images/logo.png';  // Using ?url with Vite

const Logo = ({ open, onToggle }) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        ...theme.mixins.toolbar,
        padding: theme.spacing(0, 1),
      }}
    >
      {/* Logo Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>  
        <img 
          src={logo}
          alt="EcoPulse Logo"
          style={{
            width: 50,
            height: 50,
            objectFit: 'contain',
            fontWeight: 'bold'
          }}
        />
        {open && <span style={{
          fontSize: 20,
          color: theme.palette.primary.main,
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          opacity: open ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}>EcoPulse</span>}
      </Box>

      {/* Toggle Button */}
      <IconButton onClick={onToggle}>
        {open ? <ChevronLeft /> : <Menu />}
      </IconButton>
    </Box>
  );
};

export default Logo;