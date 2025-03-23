import React from "react";
import { Menu, MenuItem, Avatar, ListItemIcon, Divider, Typography, Box } from "@mui/material";
import { AppIcon } from "../ui/icons";
import { useNavigate } from "react-router-dom";
import { Logout, Dashboard, Settings, HelpOutline } from "@mui/icons-material";
import { useAuth } from "@context/AuthContext";

export default function NavMenu({ anchorEl, open, onClose }) {
  const navigate = useNavigate();
  const { logout, user, hasRole } = useAuth();
  
  // Check if user is admin
  const isAdmin = hasRole('admin');
  
  // Get the appropriate avatar URL - prioritize avatarUrl, fallback to avatar
  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      return user.avatarUrl;
    }
    
    if (user?.avatar) {
      // If avatar looks like a URL, use it directly
      if (user.avatar.includes('http') || user.avatar.includes('cloudinary')) {
        return user.avatar;
      }
      
      // If it's a default avatar reference (e.g., "avatar-5")
      if (user.avatar.startsWith('avatar-')) {
        const avatarNumber = user.avatar.replace('avatar-', '');
        return `/avatars/${avatarNumber}.svg`;
      }
      
      // Otherwise, use as is
      return user.avatar;
    }
    
    // Fallback to placeholder
    return "/api/placeholder/32/32";
  };

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      id="account-menu"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            p: 0.5,
            minWidth: 200,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      {/* User info section */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
          {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.email || 'user@example.com'}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 0.5 }} />
      
      {/* Profile option */}
      <MenuItem 
        onClick={() => handleNavigate(isAdmin ? '/admin/profile' : '/profile')}
        sx={{ 
          py: 1,
          px: 2,
          gap: 1.5
        }}
      >
        <Avatar src={getAvatarUrl()} /> My Profile
      </MenuItem>
      
      {/* Admin Dashboard option - only visible for admins */}
      {isAdmin && (
        <MenuItem 
          onClick={() => handleNavigate('/admin/dashboard')}
          sx={{ 
            py: 1,
            px: 2,
            gap: 1.5
          }}
        >
          <ListItemIcon>
            <Dashboard fontSize="small" />
          </ListItemIcon>
          Admin Dashboard
        </MenuItem>
      )}
      
      {/* Account Settings */}
      <MenuItem 
        onClick={() => handleNavigate(isAdmin ? '/admin/settings' : '/settings')}
        sx={{ 
          py: 1,
          px: 2,
          gap: 1.5
        }}
      >
        <ListItemIcon>
          <Settings fontSize="small" />
        </ListItemIcon>
        Account Settings
      </MenuItem>
      
      {/* Help & Support - ONLY shown for non-admin users */}
      {!isAdmin && (
        <MenuItem 
          onClick={() => handleNavigate('/help-support')}
          sx={{ 
            py: 1,
            px: 2,
            gap: 1.5
          }}
        >
          <ListItemIcon>
            <HelpOutline fontSize="small" />
          </ListItemIcon>
          Help & Support
        </MenuItem>
      )}
      
      <Divider sx={{ my: 1 }} />
      
      {/* Logout option */}
      <MenuItem 
        onClick={handleLogout}
        sx={{ 
          py: 1,
          px: 2,
          gap: 1.5,
          color: 'error.main'
        }}
      >
        <Logout fontSize="small" />
        Logout
      </MenuItem>
    </Menu>
  );
}