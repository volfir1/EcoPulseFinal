import React from 'react';
import { Card as MuiCard, CardContent, CardHeader, CardActions, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from '../ui/colors';

// Styled Card component
const StyledCard = styled(MuiCard)(({ theme, variant = 'default', elevation = 1 }) => {
  const variants = {
    default: {
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.shape.borderRadius * 2,
    },
    solar: {
      backgroundColor: theme.palette.background.paper,
      borderLeft: `4px solid ${theme.palette.elements.solar}`,
      borderRadius: theme.shape.borderRadius * 2,
    },
    wind: {
      backgroundColor: theme.palette.background.paper,
      borderLeft: `4px solid ${theme.palette.elements.wind}`,
      borderRadius: theme.shape.borderRadius * 2,
    },
    hydro: {
      backgroundColor: theme.palette.background.paper,
      borderLeft: `4px solid ${theme.palette.elements.hydropower}`,
      borderRadius: theme.shape.borderRadius * 2,
    },
    geo: {
      backgroundColor: theme.palette.background.paper,
      borderLeft: `4px solid ${theme.palette.elements.geothermal}`,
      borderRadius: theme.shape.borderRadius * 2,
    },
    biomass: {
      backgroundColor: theme.palette.background.paper,
      borderLeft: `4px solid ${theme.palette.elements.biomass}`,
      borderRadius: theme.shape.borderRadius * 2,
    },
    success: {
      backgroundColor: theme.palette.background.paper,
      borderLeft: `4px solid ${theme.palette.success.main}`,
      borderRadius: theme.shape.borderRadius * 2,
    },
    warning: {
      backgroundColor: theme.palette.background.paper,
      borderLeft: `4px solid ${theme.palette.warning.main}`,
      borderRadius: theme.shape.borderRadius * 2,
    },
    error: {
      backgroundColor: theme.palette.background.paper,
      borderLeft: `4px solid ${theme.palette.error.main}`,
      borderRadius: theme.shape.borderRadius * 2,
    },
    outlined: {
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius * 2,
    },
    gradient: {
      background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
      borderRadius: theme.shape.borderRadius * 2,
    }
  };

  return {
    ...variants[variant],
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[elevation + 1],
    }
  };
});

// Styled Card Header
const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  padding: theme.spacing(3),
  '& .MuiCardHeader-title': {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  '& .MuiCardHeader-subheader': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  }
}));

// Styled Card Content
const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  }
}));

// Styled Card Actions
const StyledCardActions = styled(CardActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  justifyContent: 'flex-end',
}));

// Statistic Display
const StatisticDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

// Main Card Component
const BaseCard = ({
  variant = 'default',
  elevation = 1,
  title,
  subheader,
  action,
  children,
  className,
  stats,
  footer,
  ...props
}) => {
  return (
    <StyledCard variant={variant} elevation={elevation} className={className} {...props}>
      {(title || subheader || action) && (
        <StyledCardHeader
          title={title}
          subheader={subheader}
          action={action}
        />
      )}

      <StyledCardContent>
        {stats && (
          <StatisticDisplay>
            <Typography 
              variant="h3" 
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 'bold' 
              }}
            >
              {stats.value}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary 
              }}
            >
              {stats.label}
            </Typography>
          </StatisticDisplay>
        )}
        {children}
      </StyledCardContent>

      {footer && (
        <StyledCardActions>
          {footer}
        </StyledCardActions>
      )}
    </StyledCard>
  );
};

// Exporting named variants
const Card = {
  Base: (props) => <BaseCard variant="default" {...props} />,
  Outlined: (props) => <BaseCard variant="outlined" {...props} />,
  Solar: (props) => <BaseCard variant="solar" {...props} />,
  Wind: (props) => <BaseCard variant="wind" {...props} />,
  Hydro: (props) => <BaseCard variant="hydro" {...props} />,
  Geo: (props) => <BaseCard variant="geo" {...props} />,
  Biomass: (props) => <BaseCard variant="biomass" {...props} />,
  Success: (props) => <BaseCard variant="success" {...props} />,
  Warning: (props) => <BaseCard variant="warning" {...props} />,
  Error: (props) => <BaseCard variant="error" {...props} />,
  Gradient: (props) => <BaseCard variant="gradient" {...props} />,
};

export default Card;