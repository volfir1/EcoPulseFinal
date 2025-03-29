// RenderDrawer.jsx
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import React from 'react';
import { useTheme } from '@emotion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { elements } from '../ui/colors';

const RenderDrawerItem = ({ item, open, openSubMenu, handleSubMenu, currentPath }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    if (!item) return null;

    // Check if current item or any of its children is active
    const isActive = currentPath === item.path;
    const hasActiveChild = item.children?.some(child => currentPath === child.path);
    
    // Default theme green color
    const themeGreen = '#238636';
    
    // Determine the color to use for highlighting based on segment
    const getHighlightColor = (segment) => {
        // For parent items like "Modules", use the default green
        if (segment === 'modules') return themeGreen;
        
        // For specific renewable energy types, use their respective colors
        switch (segment) {
            case 'solar': return elements.solar;
            case 'wind': return elements.wind;
            case 'geothermal': return elements.geothermal;
            case 'hydropower': return elements.hydropower;
            case 'biomass': return elements.biomass;
            default: return themeGreen;
        }
    };
    
    const highlightColor = getHighlightColor(item.segment);
    
    // Calculate light background color (20% opacity version of the highlight color)
    const getBackgroundColor = (color) => {
        return color.startsWith('#') ? `${color}33` : color; // Add 33 for ~20% opacity in hex
    };
    
    // Active state styles
    const activeStyles = isActive ? {
        backgroundColor: getBackgroundColor(highlightColor),
        borderLeft: `3px solid ${highlightColor}`,
        paddingLeft: open ? 2.2 : 2.2,
        '&:hover': {
            backgroundColor: getBackgroundColor(highlightColor).replace('33', '4D'), // Slightly darker on hover
        }
    } : {};
    
    // Parent with active child styles
    const activeParentStyles = hasActiveChild ? {
        color: themeGreen,
    } : {};

    const handleItemClick = (e) => {
        e.stopPropagation();
        if (item.path && !item.children) {
            navigate(item.path);
        } else if (item.children) {
            // Always toggle the submenu when clicked
            handleSubMenu(item.segment);
        }
    };

    if (item.kind === 'header') {
        return open ? (
            <ListItem 
                key={item.segment} 
                sx={{ 
                    py: 2, 
                    px: 3, 
                    color: theme.palette.text.secondary
                }}
            >
                <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                        fontSize: 12,
                        fontWeight: 'medium',
                        lineHeight: '20px',
                        color: 'inherit'
                    }}
                />
            </ListItem>
        ) : null;
    }

    if (item.kind === 'divider') {
        return open ? (
            <ListItem 
                key={item.segment}
                sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    my: 1 
                }}
            />
        ) : null;
    }

    const hasChildren = item.children && item.children.length > 0;
    // Modify the isExpanded logic - use the openSubMenu state directly
    const isExpanded = openSubMenu[item.segment] || false;

    return (
        <React.Fragment key={item.segment}>
            <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                    sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                        },
                        ...activeStyles,
                        ...activeParentStyles
                    }}
                    onClick={handleItemClick}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                            color: isActive ? highlightColor : (hasActiveChild ? themeGreen : 'inherit'),
                        }}
                    >
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText
                        primary={item.title}
                        sx={{ 
                            opacity: open ? 1 : 0,
                            display: open ? 'block' : 'none',
                            '& .MuiTypography-root': {
                                color: isActive ? highlightColor : (hasActiveChild ? themeGreen : 'inherit'),
                            }
                        }}
                    />
                    {hasChildren && open && (
                        isExpanded ? <ExpandLess /> : <ExpandMore />
                    )}
                </ListItemButton>
            </ListItem>

            {hasChildren && (
                <Collapse 
                    in={open && isExpanded} 
                    timeout="auto" 
                    unmountOnExit
                >
                    <List component="div" disablePadding>
                        {item.children.map((child) => {
                            const isChildActive = currentPath === child.path;
                            const childHighlightColor = getHighlightColor(child.segment);
                            
                            return (
                                <ListItemButton
                                    key={child.segment}
                                    sx={{
                                        pl: 4,
                                        py: 1,
                                        transition: 'all 0.2s ease',
                                        borderLeft: isChildActive ? `3px solid ${childHighlightColor}` : 'none',
                                        paddingLeft: isChildActive ? 3.7 : 4,
                                        backgroundColor: isChildActive ? getBackgroundColor(childHighlightColor) : 'transparent',
                                        '&:hover': {
                                            backgroundColor: isChildActive ? 
                                                getBackgroundColor(childHighlightColor).replace('33', '4D') : 
                                                theme.palette.action.hover,
                                        }
                                    }}
                                    onClick={() => navigate(child.path)}
                                >
                                    <ListItemIcon sx={{
                                        color: isChildActive ? childHighlightColor : 'inherit'
                                    }}>
                                        {child.icon}
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={child.title}
                                        primaryTypographyProps={{
                                            fontSize: 14,
                                            color: isChildActive ? childHighlightColor : 'inherit'
                                        }}
                                    />
                                </ListItemButton>
                            );
                        })}
                    </List>
                </Collapse>
            )}
        </React.Fragment>
    );
};

// This is the component that will be used to render the navigation items
const NavigationItems = React.memo(({ navigationData, open, openSubMenu, handleSubMenu, currentPath }) => {
    // If currentPath is not provided, get it from useLocation
    const location = useLocation();
    const path = currentPath || location.pathname;
    
    if (!navigationData) return null;
    
    return (
      <>
        {navigationData.map((item) => (
          <RenderDrawerItem
            key={item.segment}
            item={item}
            open={open}
            openSubMenu={openSubMenu}
            handleSubMenu={handleSubMenu}
            currentPath={path}
          />
        ))}
      </>
    );
});

export default NavigationItems;