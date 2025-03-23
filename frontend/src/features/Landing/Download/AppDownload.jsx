import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Stack, 
  Button, 
  Card, 
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery
} from '@mui/material';
import { theme, get3DEffect } from '../theme';
import { 
  Smartphone, 
  Tablet, 
  QrCode, 
  Download, 
  Check, 
  ArrowRight, 
  Apple, 
  Globe 
} from 'lucide-react';
import { Navbar, Footer } from '../Design';
import logo from '../../../assets/images/logo.png';

const AppDownloadPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Fix for the theme breakpoints issue
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(min-width:601px) and (max-width:960px)');
  
  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // App features
  const appFeatures = [
    {
      title: "Real-time Energy Monitoring",
      description: "Track your renewable energy production and consumption in real-time with intuitive visualizations and dashboards."
    },
    {
      title: "Smart Notifications",
      description: "Receive alerts and notifications about energy production peaks, maintenance needs, and optimization suggestions."
    },
    {
      title: "Energy Forecasting",
      description: "Access AI-powered predictions about future energy production based on weather forecasts and historical data."
    },
    {
      title: "Community Insights",
      description: "Compare your energy usage with similar households and discover opportunities to improve efficiency."
    }
  ];

  // Device compatibility
  const deviceCompatibility = [
    { device: "iOS 12+", icon: <Apple size={20} /> },
    { device: "Android 8+", icon: <Smartphone size={20} /> },
    { device: "iPad & Tablets", icon: <Tablet size={20} /> },
    { device: "Web Browser", icon: <Globe size={20} /> }
  ];

  return (
    <Box sx={{ bgcolor: theme?.palette?.background?.default || '#fff', minHeight: '100vh' }}>
      {/* Navbar */}
      <Navbar logo={logo} />
      
      {/* Hero Section */}
      <Box 
        sx={{ 
          pt: { xs: 10, md: 12 }, 
          pb: { xs: 8, md: 10 },
          background: `linear-gradient(135deg, ${theme?.palette?.primary?.dark || '#2a7d2a'} 0%, ${theme?.palette?.primary?.main || '#32a832'} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography 
                  variant="h2" 
                  fontWeight={700}
                  sx={{ 
                    mb: 2,
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  }}
                >
                  EcoPulse Mobile
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 4, 
                    fontWeight: 400,
                    opacity: 0.9,
                    maxWidth: 500
                  }}
                >
                  Renewable energy monitoring and optimization at your fingertips
                </Typography>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2}
                  sx={{ mb: 4 }}
                >
                
                </Stack>
                
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <Card
                  sx={{
                    width: { xs: '100%', sm: 350 },
                    height: { xs: 'auto', sm: 500 },
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 15px 50px rgba(0,0,0,0.3)',
                    transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      zIndex: 1,
                      background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                      pointerEvents: 'none'
                    }
                  }}
                >
                  {/* Placeholder for mobile app screenshot */}
                  <Box 
  sx={{ 
    width: '100%', 
    height: '100%', 
    bgcolor: '#1E293B',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '24px',
    padding: '12px'
  }}
>
  {/* Phone Frame Notch */}
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '40%',
      height: '24px',
      bgcolor: '#1E293B',
      borderBottomLeftRadius: '12px',
      borderBottomRightRadius: '12px',
      zIndex: 2
    }}
  />
  
  {/* App Screenshot */}
  <Box
    component="img"
    src="/public/mobile-show.jpg" // Add your app screenshot image here
    alt="EcoPulse Mobile App"
    onError={(e) => {
      e.target.onerror = null;
      e.target.style.display = 'none';
      e.target.nextElementSibling.style.display = 'flex';
    }}
    sx={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'top center',
      borderRadius: '20px'
    }}
  />

  {/* Fallback Content */}
  <Box 
    sx={{ 
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      display: 'none',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      p: 3,
      textAlign: 'center',
      color: 'white'
    }}
  >
    <Smartphone size={80} strokeWidth={1.5} />
    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
      EcoPulse Mobile
    </Typography>
    <Typography variant="body2" sx={{ opacity: 0.7 }}>
      App preview coming soon
    </Typography>
  </Box>
</Box>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Download Section with QR Code */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h3" fontWeight={600} sx={{ mb: 3 }}>
                Download Our Mobile App
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: theme?.palette?.text?.secondary || '#666', fontSize: '1.1rem' }}>
                Scan the QR code with your mobile device to download EcoPulse directly. 
                Monitor your renewable energy systems, receive real-time alerts, and optimize your energy efficiency on the go.
              </Typography>
              
              <Box 
                sx={{ 
                  mb: 4, 
                  p: 3, 
                  bgcolor: theme?.palette?.background?.paper || '#fff',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.1)'
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <QrCode size={20} style={{ marginRight: '8px' }} />
                  Scan to Download
                </Typography>
                <List>
                  <ListItem sx={{ px: 1, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Check size={18} color={theme?.palette?.success?.main || '#4caf50'} />
                    </ListItemIcon>
                    <ListItemText primary="Open your device camera" />
                  </ListItem>
                  <ListItem sx={{ px: 1, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Check size={18} color={theme?.palette?.success?.main || '#4caf50'} />
                    </ListItemIcon>
                    <ListItemText primary="Point at the QR code" />
                  </ListItem>
                  <ListItem sx={{ px: 1, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Check size={18} color={theme?.palette?.success?.main || '#4caf50'} />
                    </ListItemIcon>
                    <ListItemText primary="Tap the notification to download" />
                  </ListItem>
                </List>
              </Box>
              
              <Divider sx={{ my: 4 }} />
              
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Compatible Devices
              </Typography>
              <Grid container spacing={2}>
                {deviceCompatibility.map((item, index) => (
                  <Grid item xs={6} key={index}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(0,0,0,0.02)',
                        border: '1px solid',
                        borderColor: 'rgba(0,0,0,0.06)'
                      }}
                    >
                      <Box sx={{ mr: 1.5, color: theme?.palette?.primary?.main || '#32a832' }}>
                        {item.icon}
                      </Box>
                      <Typography variant="body2" fontWeight={500}>
                        {item.device}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card
                sx={{
                  width: 280,
                  height: 280,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  borderRadius: 3,
                  boxShadow: get3DEffect ? get3DEffect(3) : '0 12px 24px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: get3DEffect ? get3DEffect(5) : '0 16px 32px rgba(0,0,0,0.2)',
                  },
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: 'white',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '5px',
                    background: theme?.palette?.primary?.main || '#32a832',
                  }
                }}
              >
                {/* QR Code Placeholder */}
                <Box 
                  sx={{ 
                    width: 200, 
                    height: 200, 
                    bgcolor: '#000', 
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <QrCode size={150} color="white" />
                </Box>
                <Typography variant="subtitle2" textAlign="center" color={theme?.palette?.text?.secondary || '#666'}>
                  Scan to download EcoPulse
                </Typography>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
      
      {/* App Features Section */}
      <Box sx={{ bgcolor: theme?.palette?.background?.subtle || '#f5f5f5', py: 8 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            fontWeight={600} 
            textAlign="center"
            sx={{ mb: 2 }}
          >
            App Features
          </Typography>
          <Typography 
            variant="body1" 
            textAlign="center" 
            sx={{ 
              mb: 6, 
              maxWidth: 700, 
              mx: 'auto',
              color: theme?.palette?.text?.secondary || '#666'
            }}
          >
            Experience the power of renewable energy management in your hands with these powerful features
          </Typography>
          
          <Grid container spacing={4}>
            {appFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: get3DEffect ? get3DEffect(2) : '0 8px 16px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: get3DEffect ? get3DEffect(4) : '0 12px 24px rgba(0,0,0,0.15)',
                    },
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <Typography 
                    variant="h5" 
                    fontWeight={600}
                    sx={{ mb: 2, color: theme?.palette?.primary?.main || '#32a832' }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1">
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Call to Action */}
      <Box 
        sx={{ 
          py: 8, 
          bgcolor: theme?.palette?.primary?.main || '#32a832',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at top right, rgba(91, 192, 91, 0.8) 0%, rgba(50, 168, 50, 0) 50%)',
            zIndex: 0
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at bottom left, rgba(38, 125, 38, 0.8) 0%, rgba(50, 168, 50, 0) 50%)',
            zIndex: 0
          }
        }}
      >
        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h3" 
            fontWeight={700} 
            mb={3}
            sx={{
              textShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
          >
            Start Optimizing Today
          </Typography>
          <Typography 
            variant="h6" 
            mb={5} 
            sx={{ 
              opacity: 0.95,
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Download the EcoPulse app and join the renewable energy revolution. Take control of your energy production and consumption like never before.
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowRight />}
            sx={{
              bgcolor: 'white',
              color: theme?.palette?.primary?.main || '#32a832',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Download Now
          </Button>
        </Container>
      </Box>
      
      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default AppDownloadPage;