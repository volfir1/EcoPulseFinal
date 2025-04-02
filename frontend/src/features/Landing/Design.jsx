import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  Stack,
  Typography,
  Divider,
  Avatar,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { theme, get3DEffect } from './theme';
import { getColorWithOpacity } from './util';
import { useScrollEffect } from './hook';
import SolarPanel3DScene from './SOLAR/SolarPanel3dScene';
import WindTurbine3DScene from './WIND/WindTurbine3dScene';
import HydroPower3DScene from './HYDRO/Hydro3dScene';
import { Download } from 'lucide-react';
// Enhanced Navbar with scroll effect and animations
export const Navbar = ({ logo }) => {
  const { isScrolled } = useScrollEffect();
 

  return (
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        width: '100%',
        zIndex: 1000,
        bgcolor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        borderBottom: isScrolled ? `1px solid ${theme.palette.primary.main}20` : 'none',
        py: isScrolled ? 1.5 : 2,
        transition: 'all 0.3s ease',
        backdropFilter: isScrolled ? 'blur(8px)' : 'none',
      }}
    >
      <Container maxWidth="lg">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  component="img"
                  src={logo}
                  alt="EcoPulse Logo"
                  sx={{
                    height: isScrolled ? 35 : 40,
                    transition: 'height 0.3s ease',
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    color: isScrolled ? theme.palette.primary.main : 'white',
                    fontWeight: 600,
                    textShadow: isScrolled ? 'none' : '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  EcoPulse
                </Typography>
              </Stack>
            </Link>
            
            {/* Download Link */}
            <Link to="/download" style={{ textDecoration: 'none' }}>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 0.7,
                  borderRadius: 6,
                  ml: 2,
                  bgcolor: isScrolled ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.15)',
                  color: isScrolled ? theme.palette.text.primary : 'white',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: isScrolled ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.25)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <Download size={16} style={{ marginRight: '6px' }} />
                Download App
              </Box>
            </Link>
          </Stack>

          <Stack direction="row" spacing={3}>
            <Button
              component={Link}
              to="/login"
              sx={{
                color: isScrolled ? theme.palette.primary.main : 'white',
                borderColor: isScrolled ? theme.palette.primary.main : 'white',
                border: '1px solid',
                textShadow: isScrolled ? 'none' : '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: isScrolled ? `${theme.palette.primary.main}10` : 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }
              }}
            >
              Login
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              sx={{
                bgcolor: isScrolled ? theme.palette.primary.main : 'rgba(255,255,255,0.9)',
                color: isScrolled ? theme.palette.primary.text : theme.palette.primary.main,
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                '&:hover': {
                  bgcolor: isScrolled ? theme.palette.primary.dark : 'rgba(255,255,255,1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                }
              }}
            >
              Sign Up
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

// Enhanced Hero Section with 3D Model integration
export const HeroSection = ({
  currentSlide,
  carouselData,
  goToPrevSlide,
  goToNextSlide,
  goToSlide
}) => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.subtle} 100%)`,
      }}
    >
      {/* Hero Background with overlay */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(30, 58, 30, 0.4)',
            zIndex: 1
          }
        }}
      >
        <Box
          component="img"
          src={carouselData[currentSlide].image}
          alt={carouselData[currentSlide].title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'all 0.7s ease-in-out'
          }}
        />
      </Box>

      {/* Hero Content */}
      <Container
        sx={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          pt: 18,
          pb: 8,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Grid
          container
          spacing={6}
          alignItems="center"
        >
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              <Typography
                variant="h1"
                sx={{
                  color: '#fff',
                  fontSize: { xs: '3rem', md: '4.5rem' },
                  fontWeight: 700,
                  lineHeight: 1.2,
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}
              >
                {carouselData[currentSlide].title}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: 'rgba(255,255,255,0.95)',
                  maxWidth: 600,
                  textShadow: '0 1px 8px rgba(0,0,0,0.2)',
                }}
              >
                {carouselData[currentSlide].description}
              </Typography>
              
              <Button
  variant="contained"
  endIcon={<ArrowRight />}
  onClick={() => navigate('/register')}
  sx={{
    bgcolor: theme.palette.primary.main,
    color: theme.palette.primary.text,
    width: 'fit-content',
    px: 4,
    py: 1.5,
    borderRadius: 2,
    boxShadow: '0 4px 20px rgba(50, 168, 50, 0.4)',
    '&:hover': {
      bgcolor: theme.palette.primary.dark,
      boxShadow: '0 6px 25px rgba(50, 168, 50, 0.5)',
      transform: 'translateY(-3px)',
    },
    transition: 'all 0.3s ease',
  }}
>
  Join Now
</Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                height: 350
              }}
            >
              {/* 3D-style element based on the current slide */}

              {currentSlide === 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    height: 350
                  }}
                >
                  <HydroPower3DScene />
                  <Card
                    sx={{
                      position: 'absolute',
                      bottom: -30,
                      right: -30,
                      width: 200,
                      p: 2,
                      borderRadius: 2,
                      boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                      bgcolor: 'rgba(255,255,255,0.95)',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                      {carouselData[currentSlide].details}
                    </Typography>
                  </Card>
                </Box>
              )}

              {currentSlide === 1 && ( // For solar energy slide
                <Box
                  sx={{
                    width: '100%',
                    height: 500,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <SolarPanel3DScene />
                  <Card
                    sx={{
                      position: "absolute",
                      bottom: "-30px",
                      right: "20px",
                      width: "200px",
                      bgcolor: 'rgba(255,255,255,0.98)',
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      p: 2
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.primary,
                        fontSize: '0.9rem',
                        lineHeight: 1.5
                      }}
                    >
                      {carouselData[currentSlide].details}
                    </Typography>
                  </Card>
                </Box>
              )}

              {currentSlide === 2 && (
                <Box
                  sx={{
                    width: '100%',
                    height: 500,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <WindTurbine3DScene />
                  <Card
                    sx={{
                      position: "absolute",
                      bottom: "-30px",
                      right: "20px",
                      width: "200px",
                      bgcolor: 'rgba(255,255,255,0.98)',
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      p: 2
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.primary,
                        fontSize: '0.9rem',
                        lineHeight: 1.5
                      }}
                    >
                      {carouselData[currentSlide].details}
                    </Typography>
                  </Card>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Carousel Navigation Dots */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2
        }}
      >
        {carouselData.map((_, index) => (
          <Box
            key={index}
            onClick={() => goToSlide(index)}
            sx={{
              width: currentSlide === index ? 24 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: currentSlide === index
                ? theme.palette.primary.main
                : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: currentSlide === index
                  ? theme.palette.primary.main
                  : 'rgba(255,255,255,0.8)'
              }
            }}
          />
        ))}
      </Stack>

      {/* Carousel Controls */}
      <IconButton
        onClick={goToPrevSlide}
        sx={{
          position: 'absolute',
          left: { xs: 8, md: 24 },
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#fff',
          bgcolor: 'rgba(50, 168, 50, 0.15)',
          zIndex: 2,
          '&:hover': {
            bgcolor: 'rgba(50, 168, 50, 0.25)',
            transform: 'translateY(-50%) scale(1.1)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        <ChevronLeft />
      </IconButton>
      <IconButton
        onClick={goToNextSlide}
        sx={{
          position: 'absolute',
          right: { xs: 8, md: 24 },
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#fff',
          bgcolor: 'rgba(50, 168, 50, 0.15)',
          zIndex: 2,
          '&:hover': {
            bgcolor: 'rgba(50, 168, 50, 0.25)',
            transform: 'translateY(-50%) scale(1.1)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        <ChevronRight />
      </IconButton>
    </Box>
  );
};

// Enhanced Content Section component
export const ContentSection = ({ title, subtitle, bgColor, children, decorativeElement = null, withDivider = true }) => {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: bgColor || theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Optional decorative background elements */}
      {decorativeElement && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          {decorativeElement}
        </Box>
      )}

      <Container sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={6}>
          <Box
            sx={{
              textAlign: 'center',
              mx: 'auto',
              mb: 4
            }}
          >
            <Typography
              variant="h3"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 700,
                mb: 3,
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '60%',
                  height: '4px',
                  bottom: '-12px',
                  left: '20%',
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '4px',
                }
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.secondary,
                  maxWidth: 800,
                  mx: 'auto',
                  mt: 4,
                  mb: 2,
                  fontWeight: 400,
                  lineHeight: 1.6
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ mt: 4 }}>
            {children}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
// Card Grid for displaying items in a grid layout
export const CardGrid = ({ items, renderItem, columns = { xs: 12, sm: 6, md: 4 } }) => (
  <Grid container spacing={4}>
    {items.map((item, index) => (
      <Grid item {...columns} key={index}>
        {renderItem(item, index)}
      </Grid>
    ))}
  </Grid>
);

// Enhanced Energy Type Card component with 3D effects
export const EnergyTypeCard = ({ energy }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: '100%',
        borderRadius: 3,
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isHovered ? 'translateY(-12px) scale(1.03)' : 'translateY(0) scale(1)',
        boxShadow: isHovered ? get3DEffect(4) : get3DEffect(1),
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${energy.color}, ${getColorWithOpacity(energy.color, 0.7)})`,
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scaleX(1)' : 'scaleX(0.3)',
        },
        bgcolor: theme.palette.background.paper,
      }}
    >
      <CardContent sx={{ p: 4, height: '100%' }}>
        <Stack
          spacing={3}
          alignItems="center"
          sx={{ height: '100%' }}
        >
          <Box
            sx={{
              p: 3,
              borderRadius: '50%',
              bgcolor: getColorWithOpacity(energy.color, 0.15),
              color: energy.color,
              transform: isHovered ? 'scale(1.2) rotate(10deg)' : 'scale(1) rotate(0deg)',
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: isHovered ?
                `0 10px 20px ${getColorWithOpacity(energy.color, 0.25)}` :
                'none'
            }}
          >
            {energy.icon}
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              textAlign: 'center',
            }}
          >
            {energy.type}
          </Typography>

          <Typography
            variant="body1"
            align="center"
            sx={{
              color: theme.palette.text.secondary,
              flexGrow: 1,
            }}
          >
            {energy.description}
          </Typography>

          <Button
            variant="text"
            endIcon={
              <ArrowRight
                size={18}
                style={{
                  transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                  transition: 'transform 0.3s ease'
                }}
              />
            }
            sx={{
              color: energy.color,
              fontWeight: 500,
              '&:hover': {
                bgcolor: getColorWithOpacity(energy.color, 0.1),
              },
              mt: 'auto',
              alignSelf: 'flex-start',
              opacity: isHovered ? 1 : 0.8,
              transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
              transition: 'all 0.3s ease',
            }}
          >
            Learn More
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Enhanced Feature Card component with 3D effects
export const FeatureCard = ({ feature }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: '100%',
        borderRadius: 3,
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isHovered ? 'translateY(-12px)' : 'translateY(0)',
        boxShadow: isHovered ? get3DEffect(4) : get3DEffect(1),
        overflow: 'hidden',
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${isHovered ? theme.palette.primary.light + '30' : 'transparent'}`,
      }}
    >
      <CardContent sx={{ p: 4, height: '100%' }}>
        <Stack spacing={3} sx={{ height: '100%' }}>
          <Box
            sx={{
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '20%',
              bgcolor: `${theme.palette.primary.main}15`,
              transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: isHovered ? `0 8px 20px ${theme.palette.primary.main}30` : 'none',
            }}
          >
            {feature.icon}
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                width: isHovered ? '100%' : '0%',
                height: '2px',
                bottom: '-4px',
                left: 0,
                bgcolor: theme.palette.primary.main,
                transition: 'width 0.3s ease',
                borderRadius: '2px',
              }
            }}
          >
            {feature.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.7,
              flexGrow: 1
            }}
          >
            {feature.description}
          </Typography>

          <Button
            variant="text"
            endIcon={<ArrowRight />}
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 500,
              '&:hover': {
                bgcolor: `${theme.palette.primary.main}15`,
              },
              alignSelf: 'flex-start',
              mt: 'auto',
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
              transition: 'all 0.3s ease',
            }}
          >
            Learn More
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};


export const StatCard = ({ value, label, icon }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        bgcolor: theme.palette.background.paper,
        borderRadius: 4,
        boxShadow: isHovered ? get3DEffect(4) : get3DEffect(1),
        p: 4,
        width: { xs: '100%', sm: 240 },
        textAlign: 'center',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isHovered ? 'translateY(-12px)' : 'translateY(0)',
        border: `1px solid ${isHovered ? theme.palette.primary.light + '30' : 'transparent'}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '150%',
          height: '150%',
          background: `radial-gradient(circle, ${theme.palette.primary.main}10 0%, transparent 70%)`,
          top: isHovered ? '-25%' : '-50%',
          left: '-25%',
          opacity: isHovered ? 0.8 : 0,
          transition: 'all 0.5s ease',
        }
      }}
    >
      <Stack alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            color: theme.palette.primary.main,
            mb: 1,
            transform: isHovered ? 'scale(1.2) rotate(10deg)' : 'scale(1)',
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h3"
          fontWeight={700}
          sx={{
            color: theme.palette.text.primary,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: isHovered ? '80%' : '0',
              height: '4px',
              bottom: '-8px',
              left: '10%',
              backgroundColor: theme.palette.primary.main,
              borderRadius: '2px',
              transition: 'width 0.3s ease',
            }
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: isHovered ? 500 : 400,
            transition: 'all 0.3s ease',
          }}
        >
          {label}
        </Typography>
      </Stack>
    </Box>
  );
};

// Enhanced Footer component with dark green theme
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        py: 8,
        bgcolor: theme.palette.secondary.main,
        color: '#fff',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
        }
      }}
    >
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight={600}>
                EcoPulse
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ maxWidth: 300 }}>
                Pioneering renewable energy monitoring and optimization solutions for a sustainable future. Together, we can make a difference.
              </Typography>
              <Stack direction="row" spacing={2} mt={2}>
                <IconButton
                  sx={{
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-3px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Linkedin size={20} />
                </IconButton>
                <IconButton
                  sx={{
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-3px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Github size={20} />
                </IconButton>
                <IconButton
                  sx={{
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-3px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Mail size={20} />
                </IconButton>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Navigation
            </Typography>
            <Stack spacing={2}>
              <Link
                to="/"
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  display: 'block',
                  position: 'relative',
                  width: 'fit-content',
                  paddingBottom: '2px'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                className="footer-link"
              >
                Home
              </Link>
              <Link
                to="/about"
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  display: 'block',
                  position: 'relative',
                  width: 'fit-content',
                  paddingBottom: '2px'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                className="footer-link"
              >
                About
              </Link>
              <Link
                to="/contact"
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  display: 'block',
                  position: 'relative',
                  width: 'fit-content',
                  paddingBottom: '2px'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                className="footer-link"
              >
                Contact
              </Link>
            </Stack>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Resources
            </Typography>
            <Stack spacing={2}>
              <Link
                to="/blog"
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  display: 'block',
                  position: 'relative',
                  width: 'fit-content',
                  paddingBottom: '2px'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                className="footer-link"
              >
                Blog
              </Link>
              <Link
                to="/docs"
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  display: 'block',
                  position: 'relative',
                  width: 'fit-content',
                  paddingBottom: '2px'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                className="footer-link"
              >
                Documentation
              </Link>
              <Link
                to="/faqs"
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  display: 'block',
                  position: 'relative',
                  width: 'fit-content',
                  paddingBottom: '2px'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                className="footer-link"
              >
                FAQs
              </Link>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            {/* <Typography variant="h6" fontWeight={600} mb={3}>
              Subscribe to Newsletter
            </Typography> */}
            <Stack spacing={2}>
              {/* <Stack direction="row" spacing={1}>
                <Box
                  component="input"
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: 2,
                    border: 'none',
                    outline: 'none',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    '&::placeholder': {
                      color: 'rgba(255,255,255,0.5)'
                    },
                    '&:focus': {
                      boxShadow: `0 0 0 2px ${theme.palette.primary.main}`
                    }
                  }}
                  placeholder="Your email"
                />
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: theme.palette.primary.light,
                      transform: 'translateY(-3px)'
                    },
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 10px ${theme.palette.primary.main}50`
                  }}
                >
                  Subscribe
                </Button>
              </Stack> */}
              <Typography variant="caption" color="rgba(255,255,255,0.5)" mt={1}>
                We respect your privacy. No spam, ever.
              </Typography>
            </Stack>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography variant="body2" color="rgba(255,255,255,0.5)">
            © {currentYear} EcoPulse. All rights reserved.
          </Typography>
          {/* <Stack direction="row" spacing={3}>
            <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.875rem' }}>
              Privacy Policy
            </Link>
            <Link to="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.875rem' }}>
              Terms of Service
            </Link>
          </Stack> */}
        </Stack>
      </Container>
    </Box>
  );
};

// Enhanced Team Member Card component with 3D effects
// Enhanced Team Member Card component with 3D effects
export const TeamMemberCard = ({ member }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isHovered ?
          'translateY(-12px) scale(1.02) perspective(800px) rotateY(2deg)' :
          'translateY(0) scale(1) perspective(800px) rotateY(0deg)',
        boxShadow: isHovered ? get3DEffect(4) : get3DEffect(1),
        position: 'relative'
      }}
    >
      {/* Image container with overlay */}
      <Box
        sx={{
          height: 260,
          overflow: 'hidden',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '30%',
            background: `linear-gradient(to top, ${theme.palette.background.paper}, transparent)`,
            opacity: isHovered ? 0.5 : 0.7,
            transition: 'opacity 0.3s ease',
          }
        }}
      >
        <Box
          component="img"
          src={member.image}
          alt={member.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />

        {/* Floating Role Badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: isHovered ? 20 : 10,
            right: isHovered ? 20 : 10,
            bgcolor: theme.palette.primary.main,
            color: 'white',
            py: 1,
            px: 2,
            borderRadius: 5,
            fontWeight: 500,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            zIndex: 2,
          }}
        >
          {member.role}
        </Box>
      </Box>

      {/* Content */}
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              transition: 'color 0.3s ease',
              color: isHovered ? theme.palette.primary.main : theme.palette.text.primary
            }}
          >
            {member.name}
          </Typography>

          <Divider sx={{
            borderColor: isHovered ? theme.palette.primary.main + '40' : 'rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }} />

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              mb: 2,
              lineHeight: 1.6
            }}
          >
            {member.bio}
          </Typography>

          {/* Social links */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              transition: 'all 0.3s ease',
              transform: isHovered ? 'translateY(0)' : 'translateY(5px)',
              opacity: isHovered ? 1 : 0.7
            }}
          >
            <IconButton
              size="small"
              sx={{
                color: '#0077b5',
                '&:hover': {
                  bgcolor: 'rgba(0, 119, 181, 0.1)',
                  transform: 'translateY(-3px)'
                },
                transition: 'transform 0.2s ease'
              }}
              component="a"
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
             
            </IconButton>
            <IconButton
              size="small"
              sx={{
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: `${theme.palette.primary.main}15`,
                  transform: 'translateY(-3px)'
                },
                transition: 'transform 0.2s ease'
              }}
            >
              
            </IconButton>
           
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export const AdvisorAcknowledgment = ({ advisor }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isHovered ?
          'translateY(-12px) scale(1.02) perspective(800px) rotateY(2deg)' :
          'translateY(0) scale(1) perspective(800px) rotateY(0deg)',
        boxShadow: isHovered ? get3DEffect(4) : get3DEffect(1),
        position: 'relative',
        bgcolor: theme.palette.background.paper,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '5px',
          height: '100%',
          background: theme.palette.primary.main,
          opacity: isHovered ? 1 : 0.8,
          transition: 'opacity 0.3s ease',
        }
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={0}>
        {/* Image container with overlay */}
        <Box
          sx={{
            width: { xs: '100%', md: '40%' },
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              right: 0,
              top: 0,
              width: '30%',
              height: '100%',
              background: `linear-gradient(to left, ${theme.palette.background.paper}, transparent)`,
              opacity: isHovered ? 0.5 : 0.7,
              transition: 'opacity 0.3s ease',
              display: { xs: 'none', md: 'block' }
            }
          }}
        >
          <Box
            component="img"
            src={advisor.image}
            alt={advisor.name}
            sx={{
              width: '100%',
              height: { xs: 300, md: '100%' },
              objectFit: 'cover',
              transition: 'transform 0.6s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />

          {/* Floating Role Badge */}
          <Box
            sx={{
              position: 'absolute',
              bottom: isHovered ? 20 : 10,
              left: isHovered ? 20 : 10,
              bgcolor: theme.palette.primary.main,
              color: 'white',
              py: 1,
              px: 2,
              borderRadius: 5,
              fontWeight: 500,
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              zIndex: 2,
            }}
          >
            {advisor.role}
          </Box>
        </Box>

        {/* Content */}
        <CardContent 
          sx={{ 
            p: 4, 
            width: { xs: '100%', md: '60%' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  transition: 'color 0.3s ease',
                  color: theme.palette.primary.main,
                  mb: 1
                }}
              >
                Special Acknowledgment
              </Typography>
              
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 600,
                  transition: 'color 0.3s ease',
                  color: isHovered ? theme.palette.primary.main : theme.palette.text.primary
                }}
              >
                {advisor.name}
              </Typography>
            </Box>

            <Divider sx={{
              borderColor: isHovered ? theme.palette.primary.main + '40' : 'rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }} />

            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                lineHeight: 1.8,
                fontSize: '1.1rem'
              }}
            >
              {advisor.acknowledgment}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontStyle: 'italic',
                color: theme.palette.text.secondary,
                mt: 2
              }}
            >
              {advisor.quote}
            </Typography>

            {/* Social links */}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                transition: 'all 0.3s ease',
                transform: isHovered ? 'translateY(0)' : 'translateY(5px)',
                opacity: isHovered ? 1 : 0.7,
                mt: 2
              }}
            >
              {advisor.socialLinks && advisor.socialLinks.map((link, index) => (
                <IconButton
                  key={index}
                  size="small"
                  sx={{
                    color: link.color || theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: `${link.hoverColor || theme.palette.primary.main}15`,
                      transform: 'translateY(-3px)'
                    },
                    transition: 'transform 0.2s ease'
                  }}
                  component="a"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.icon}
                </IconButton>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Stack>
    </Card>
  );
};