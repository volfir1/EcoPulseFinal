// RenderDrawer.jsx
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import React from 'react';
import { useTheme } from '@emotion/react';
import { useNavigate } from 'react-router-dom';

const RenderDrawerItem = ({ item, open, openSubMenu, handleSubMenu }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    if (!item) return null;

    const handleItemClick = (e) => {
        e.stopPropagation();
        if (item.path && !item.children) {
            navigate(item.path);
        } else if (item.children) {
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
    const isExpanded = openSubMenu[item.segment] || false;

    return (
        <React.Fragment key={item.segment}>
            <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                    sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                        }
                    }}
                    onClick={handleItemClick}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                        }}
                    >
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText
                        primary={item.title}
                        sx={{ 
                            opacity: open ? 1 : 0,
                            display: open ? 'block' : 'none'
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
                        {item.children.map((child) => (
                            <ListItemButton
                                key={child.segment}
                                sx={{
                                    pl: 4,
                                    py: 1,
                                    '&:hover': {
                                        backgroundColor: theme.palette.action.hover,
                                    }
                                }}
                                onClick={() => navigate(child.path)}
                            >
                                <ListItemIcon>{child.icon}</ListItemIcon>
                                <ListItemText 
                                    primary={child.title}
                                    primaryTypographyProps={{
                                        fontSize: 14
                                    }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Collapse>
            )}
        </React.Fragment>
    );
};

// This is the component that will be used to render the navigation items
const NavigationItems = React.memo(({ navigationData, open, openSubMenu, handleSubMenu }) => {
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
          />
        ))}
      </>
    );
});


export default NavigationItems;