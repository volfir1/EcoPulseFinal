import React from 'react';
import { Button } from '@mui/material';
import theme from '../ui/colors';

// Button variants based on theme colors
const buttonStyles = {
  // Primary Buttons
  primary: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.text,
    '&:hover': {
      backgroundColor: theme.palette.hovers.primary,
    }
  },
  primaryOutlined: {
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    '&:hover': {
      borderColor: theme.palette.hovers.primary,
      backgroundColor: `${theme.palette.primary.main}10`,
    }
  },

  // Secondary Buttons
  secondary: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.text,
    '&:hover': {
      backgroundColor: theme.palette.hovers.secondary,
    }
  },
  secondaryOutlined: {
    color: theme.palette.secondary.main,
    borderColor: theme.palette.secondary.main,
    '&:hover': {
      borderColor: theme.palette.hovers.secondary,
      backgroundColor: `${theme.palette.secondary.main}10`,
    }
  },

  // Energy Type Specific Buttons
  solar: {
    backgroundColor: theme.palette.elements.solar,
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.elements.solar,
      filter: 'brightness(0.9)',
    }
  },
  wind: {
    backgroundColor: theme.palette.elements.wind,
    color: '#ffffff',
    '&:hover': {
      backgroundColor: theme.palette.elements.wind,
      filter: 'brightness(0.9)',
    }
  },
  geothermal: {
    backgroundColor: theme.palette.elements.geothermal,
    color: '#ffffff',
    '&:hover': {
      backgroundColor: theme.palette.elements.geothermal,
      filter: 'brightness(0.9)',
    }
  },
  hydropower: {
    backgroundColor: theme.palette.elements.hydropower,
    color: '#ffffff',
    '&:hover': {
      backgroundColor: theme.palette.elements.hydropower,
      filter: 'brightness(0.9)',
    }
  },
  biomass: {
    backgroundColor: theme.palette.elements.biomass,
    color: '#ffffff',
    '&:hover': {
      backgroundColor: theme.palette.elements.biomass,
      filter: 'brightness(0.9)',
    }
  },

  // State Buttons
  success: {
    backgroundColor: theme.palette.success.main,
    color: '#ffffff',
    '&:hover': {
      backgroundColor: theme.palette.hovers.success,
    }
  },
  warning: {
    backgroundColor: theme.palette.warning.main,
    color: '#ffffff',
    '&:hover': {
      backgroundColor: theme.palette.hovers.warning,
    }
  },
  error: {
    backgroundColor: theme.palette.error.main,
    color: '#ffffff',
    '&:hover': {
      backgroundColor: theme.palette.hovers.error,
    }
  }
};

// Size variations
const sizeStyles = {
  small: {
    padding: '6px 16px',
    fontSize: '0.875rem',
  },
  medium: {
    padding: '8px 20px',
    fontSize: '1rem',
  },
  large: {
    padding: '10px 24px',
    fontSize: '1.125rem',
  }
};

const CustomButton = ({
  variant = 'primary',
  size = 'medium',
  outlined = false,
  disabled = false,
  fullWidth = false,
  children,
  onClick,
  startIcon,
  endIcon,
  className,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = outlined ? `${variant}Outlined` : variant;
    return {
      ...buttonStyles[baseStyle],
      ...sizeStyles[size],
      borderRadius: 8,
      textTransform: 'none',
      fontWeight: 500,
      ...(outlined && {
        border: '2px solid',
        '&:hover': {
          border: '2px solid',
        }
      }),
      ...(disabled && {
        opacity: 0.6,
        pointerEvents: 'none'
      })
    };
  };

  return (
    <Button
      variant={outlined ? 'outlined' : 'contained'}
      disabled={disabled}
      fullWidth={fullWidth}
      onClick={onClick}
      startIcon={startIcon}
      endIcon={endIcon}
      className={className}
      sx={getButtonStyle()}
      {...props}
    >
      {children}
    </Button>
  );
};

export default CustomButton;