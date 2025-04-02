import React from 'react';
import { Box, Typography, Container, Stack, Button } from '@mui/material';
import logo from '../assets/images/logo.png';
import { Grid, Card } from '@mui/material';
import { get3DEffect } from './Landing/theme';
// Import custom hooks
import { useCarousel, useResponsive, useScrollEffect } from './Landing/hook';

// Import data and utility functions
import { carouselData, energyTypes, features, teamMembers, statistics, advisorData } from './Landing/util';
import { CloudSun, Activity, Globe, ThumbsUp, ArrowRight } from 'lucide-react';

// Import design components
import {
  Navbar,
  HeroSection,
  ContentSection,
  CardGrid,
  EnergyTypeCard,
  FeatureCard,
  TeamMemberCard,
  StatCard,
  Footer,
  AdvisorAcknowledgment
} from './Landing/Design';

// Import theme
import { theme } from './Landing/theme';

// Main Landing Page Component
const LandingPage = () => {
  // Get responsive state
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { isScrolled } = useScrollEffect();
  
  // Initialize carousel with navigation functions
  const { 
    currentSlide, 
    goToNextSlide, 
    goToPrevSlide, 
    goToSlide 
  } = useCarousel(carouselData.length, null);

  // Decorative element for the Energy Types section
  const EnergyDecoration = (
    <>
      <Box
        sx={{
          position: 'absolute',
          top: 40,
          right: 40,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(50, 168, 50, 0.05) 0%, rgba(50, 168, 50, 0) 70%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 60,
          left: 80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(50, 168, 50, 0.07) 0%, rgba(50, 168, 50, 0) 70%)',
        }}
      />
    </>
  );

  return (
    <Box sx={{ bgcolor: theme.palette.background.default }}>
      {/* Navbar with login and signup buttons */}
      <Navbar logo={logo} />

      {/* Hero Section with Carousel and 3D Models */}
      <HeroSection
        currentSlide={currentSlide}
        carouselData={carouselData}
        goToNextSlide={goToNextSlide}
        goToPrevSlide={goToPrevSlide}
        goToSlide={goToSlide}
      />

      {/* Energy Types Section */}
      <ContentSection 
        title="Energy Sources We Monitor"
        subtitle="Comprehensive tracking and analysis of diverse renewable energy sources with real-time data collection and advanced analytics"
        bgColor={theme.palette.background.paper}
        decorativeElement={EnergyDecoration}
      >
        <CardGrid 
          items={energyTypes}
          renderItem={(energy) => (
            <EnergyTypeCard energy={energy} />
          )}
        />
      </ContentSection>

      {/* Features Section */}
      <ContentSection
        title="Key Features"
        subtitle="Innovative tools and technologies to optimize renewable energy management and maximize efficiency"
        bgColor={theme.palette.background.subtle}
      >
        <CardGrid 
          items={features}
          renderItem={(feature) => (
            <FeatureCard feature={feature} />
          )}
        />
      </ContentSection>


      {/* Meet the Team Section */}
      <ContentSection
        title="Meet Our Team"
        subtitle="The experts behind EcoPulse's innovative renewable energy solutions bringing decades of combined experience"
        bgColor={theme.palette.background.subtle}
      >
        <CardGrid 
          items={teamMembers}
          renderItem={(member) => (
            <TeamMemberCard member={member} />
          )}
          columns={{ xs: 12, sm: 6, md: 3 }}
        />
      </ContentSection>
      {/* Special Acknowledgment Section */}
      <ContentSection
        title="Special Acknowledgment"
        subtitle="We extend our deepest gratitude to our thesis advisor for her invaluable guidance and support"
        bgColor={theme.palette.background.paper}
      >
        <Box sx={{ mt: 4 }}>
          <AdvisorAcknowledgment advisor={advisorData} />
        </Box>
      </ContentSection>

      {/* Mission and Vision Section */}
      <ContentSection
        title="Mission and Vision"
        subtitle="Guiding principles that drive our innovation and commitment to renewable energy"
        bgColor={theme.palette.background.paper}
      >
        <Grid container spacing={6} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                p: 4,
                borderRadius: 3,
                boxShadow: get3DEffect(2),
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: get3DEffect(4),
                },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '5px',
                  background: theme.palette.primary.main,
                }
              }}
            >
              <Stack spacing={3}>
                <Typography 
                  variant="h4" 
                  fontWeight={600}
                  color={theme.palette.primary.main}
                >
                  Our Mission
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Our mission is to make renewable energy more accessible, reliable, and sustainable for the Philippines. Through EcoPulse, we aim to help communities, energy providers, and policymakers make smarter energy decisions by providing accurate forecasting and practical solutions. By combining local knowledge with innovative technology, we strive to bridge the gap between renewable energy potential and real-world application, ensuring a cleaner and more resilient future for all.  
                </Typography>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                p: 4,
                borderRadius: 3,
                boxShadow: get3DEffect(2),
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: get3DEffect(4),
                },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '5px',
                  background: theme.palette.secondary.main,
                }
              }}
            >
              <Stack spacing={3}>
                <Typography 
                  variant="h4" 
                  fontWeight={600}
                  color={theme.palette.secondary.main}
                >
                  Our Vision
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                We envision a future where every home and business in the Philippines can confidently rely on renewable energy without worrying about shortages or inefficiencies. With EcoPulse, we hope to build a community-driven energy system where people can produce, share, and optimize their energy use effortlessly. Our ultimate goal is to create a sustainable energy landscape that benefits both the environment and the people who depend on it every day.
                </Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </ContentSection>

      {/* Call to Action Section */}
      <Box 
        sx={{ 
          py: 10, 
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.text,
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
            Ready to Optimize Your Renewable Energy?
          </Typography>
          <Typography 
            variant="h6" 
            mb={5} 
            sx={{ 
              opacity: 0.95,
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Join thousands of organizations making a difference with EcoPulse. Start your journey towards a more sustainable future today.
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3}
            justifyContent="center"
          >
            {/* <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#fff',
                color: theme.palette.primary.main,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                },
                transition: 'all 0.3s ease',
              }}
              endIcon={<ArrowRight />}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                color: '#fff',
                borderColor: '#fff',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#fff',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Request Demo
            </Button> */}
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default LandingPage;