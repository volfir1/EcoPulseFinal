import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, useEffect, useState } from 'react';
import { ThemeProvider } from '@emotion/react';
import { AppProvider } from '@context/AppContext';
import { Layout, Loader, theme, SnackbarProvider } from '@shared/index.js';
import { userRoutes, moduleRoutes, adminRoutes, errorRoutes, publicRoutes } from './routes/routes';
import PrivateRoute from './routes/PrivateRoute';
import { AuthProvider, useAuth } from '@context/AuthContext';
import DevToolbar from '@config/DevToolbar.jsx';
import authService from '@services/authService';
// Import the ProfileProvider
import { ProfileProvider } from '@context/ProfileContext';

// Create an inner component to use hooks within the auth provider context
const AppContent = () => {
  const { setUser, setIsAuthenticated } = useAuth();
  const [isRedirectCheckLoading, setIsRedirectCheckLoading] = useState(true);

  // Protected routes array for organization
  const protectedRoutes = [
    // User routes - strictly for users only
    { path: '/dashboard', component: <userRoutes.Dashboard />, roles: ['user'] },
    { path: '/energy-share', component: <userRoutes.EnergySharing />, roles: ['user'] },
    { path: '/help-support', component: <userRoutes.HelpSupport />, roles: ['user'] },
    { path: '/recommendations', component: <userRoutes.Recommendations />, roles: ['user'] },
    { path: '/profile', component: <userRoutes.UserProfile />, roles: ['user'] },
    { path: '/mails', component: <userRoutes.UserMails />, roles: ['user'] },
    { path: '/mails/:ticketId', component: <userRoutes.TicketConversation />, roles: ['user'] },
    { path: '/mails', component: <userRoutes.UserMails />, roles: ['user'] },


    // Module routes - create separate routes for each role
    { path: '/modules/solar', component: <moduleRoutes.Solar />, roles: ['user'] },
    { path: '/modules/wind', component: <moduleRoutes.Wind />, roles: ['user'] },
    { path: '/modules/geothermal', component: <moduleRoutes.Geo />, roles: ['user'] },
    { path: '/modules/hydropower', component: <moduleRoutes.Hydro />, roles: ['user'] },
    { path: '/modules/biomass', component: <moduleRoutes.Biomass />, roles: ['user'] },

    // Admin module routes
    { path: '/admin/modules/solar', component: <adminRoutes.SolarAdmin />, roles: ['admin'] },
    { path: '/admin/modules/wind', component: <adminRoutes.WindAdmin />, roles: ['admin'] },
    { path: '/admin/modules/geothermal', component: <adminRoutes.GeoAdmin />, roles: ['admin'] },
    { path: '/admin/modules/hydropower', component: <adminRoutes.HydroAdmin />, roles: ['admin'] },
    { path: '/admin/modules/biomass', component: <adminRoutes.BioAdmin />, roles: ['admin'] },
    { path: '/admin/modules/input', component: <adminRoutes.Input />, roles: ['admin'] },
    { path: '/admin/modules/add', component: <adminRoutes.AddRecord />, roles: ['admin'] },

    // Admin routes
    { path: '/admin/dashboard', component: <adminRoutes.Dashboard />, roles: ['admin'] },
    { path: '/admin/analytics', component: <adminRoutes.Analytics />, roles: ['admin'] },
    { path: '/admin/users', component: <adminRoutes.UserManagement />, roles: ['admin'] },
    { path: '/admin/profile', component: <adminRoutes.UserProfile />, roles: ['admin'] },
    { path: '/admin/monitor', component: <adminRoutes.AdminMonitor />, roles: ['admin'] },
    // Ticket management routes
    { path: '/admin/tickets', component: <adminRoutes.TicketDashboard />, roles: ['admin'] },
    { path: '/admin/tickets/:id', component: <adminRoutes.AdminDetailView />, roles: ['admin'] },
    { path: '/admin/ticket', component: <adminRoutes.AdminTicket />, roles: ['admin'] },
    { path: '/admin/peer', component: <adminRoutes.Peer />, roles: ['admin'] },
    { path: '/admin/recommendation', component: <adminRoutes.Recommendations />, roles: ['admin'] }
  ];

  // Check for Google redirect result on app initialization
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        setIsRedirectCheckLoading(true);
        console.log('Checking for Google redirect authentication result...');

        // Get the redirect result from Firebase
        const result = await authService.getRedirectResult();

        // If we have a successful result, handle the authentication
        if (result && result.success && result.user) {
          console.log('Successfully signed in with Google redirect');

          // Force the user to be verified
          const verifiedUser = {
            ...result.user,
            isVerified: true
          };

          // Update authentication state
          setUser(verifiedUser);
          setIsAuthenticated(true);

          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify(verifiedUser));

          // Store the token if available
          if (result.token) {
            localStorage.setItem('authToken', result.token);
          }

          // Redirect to the appropriate dashboard based on role
          const redirectPath = verifiedUser.role === 'admin' ? '/admin/dashboard' : '/dashboard';

          // Check if there was a saved redirect URL before the authentication
          const savedPath = sessionStorage.getItem('authRedirectUrl');
          if (savedPath) {
            window.location.href = savedPath;
            sessionStorage.removeItem('authRedirectUrl');
          } else {
            window.location.href = redirectPath;
          }
        }
      } catch (error) {
        console.error('Error checking redirect result:', error);
        // Don't show error UI here - it's normal to not have a redirect result
      } finally {
        setIsRedirectCheckLoading(false);
      }
    };

    checkRedirectResult();
  }, [setUser, setIsAuthenticated]);

  // Show loader while checking for redirect result
  if (isRedirectCheckLoading) {
    return <Loader />;
  }

  return (
    <>
      <DevToolbar />
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public routes that don't require authentication */}
          <Route path="/" element={<publicRoutes.LandingPage />} />
          <Route path="/login" element={<publicRoutes.Login />} />
          <Route path="/register" element={<publicRoutes.Register />} />
          <Route path="/verify-email" element={<publicRoutes.VerifyEmail />} />
          <Route path="/forgot-password" element={<publicRoutes.ForgotPassword />} />
          <Route path="/reset-password" element={<publicRoutes.ResetPassword />} />
          <Route path="/onboarding" element={<publicRoutes.Onboarding />} />
          {/* Account deactivation and recovery routes */}
          <Route path="/account-deactivated" element={<publicRoutes.AccountDeactivated />} />
          <Route path="/reactivate-account" element={<publicRoutes.ReactivateAccount />} />
          <Route path="/download" element={<publicRoutes.DownloadApp/>} />

          {/* Add redirect from /reactivate-account to /recover-account */}
          <Route
            path="/reactivate-account"
            element={<Navigate to={(location) => `/reactivate-account${location.search}`} replace />}
          />


          {/* Protected Routes wrapped in Layout and ProfileProvider for profile-related features */}
          <Route element={<Layout />}>
            {protectedRoutes.map(route => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <PrivateRoute allowedRoles={route.roles}>
                    {/* Wrap profile-related routes with ProfileProvider */}
                    {route.path.includes('profile') ? (
                      <ProfileProvider>
                        {route.component}
                      </ProfileProvider>
                    ) : (
                      route.component
                    )}
                  </PrivateRoute>
                }
              />
            ))}
          </Route>

          {/* Error Routes */}
          <Route path="*" element={<errorRoutes.NotFound />} />
          <Route path="/404" element={<errorRoutes.NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

// Main App component
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <AppProvider>
          <Router>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </Router>
        </AppProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;