import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { Suspense } from 'react';
import { ThemeProvider } from '@emotion/react';
import { AppProvider } from '@context/AppContext';
import { Layout, Loader, theme, SnackbarProvider } from '@shared/index.js';
import { userRoutes, moduleRoutes, adminRoutes, errorRoutes } from './routes/routes';
import LandingPage from '../features/LandingPage';
import { Login, Register } from '@features/index';
import PrivateRoute from './routes/PrivateRoute';
import { AuthProvider } from '@context/AuthContext';

// Helper function to create protected routes
const createProtectedRoute = (path, Component, allowedRoles) => (
  <Route
    key={path}
    path={path}
    element={
      <PrivateRoute allowedRoles={allowedRoles}>
        <Layout />
      </PrivateRoute>
    }
  />
);

const App = () => {
  // Keep your routes array for organization
  const routes = [
    // User routes - strictly for users only
    { path: '/dashboard', component: <userRoutes.Dashboard />, roles: ['user'] },
    { path: '/energy-share', component: <userRoutes.EnergySharing />, roles: ['user'] },
    { path: '/help-support', component: <userRoutes.HelpSupport />, roles: ['user'] },
    { path: '/recommendations', component: <userRoutes.Recommendations />, roles: ['user'] },
    { path: '/profile', component: <userRoutes.UserProfile />, roles: ['user'] },
    
    // Module routes - create separate routes for each role
    { path: '/modules/solar', component: <moduleRoutes.Solar />, roles: ['user'] },
    { path: '/modules/wind', component: <moduleRoutes.Wind />, roles: ['user'] },
    { path: '/modules/geothermal', component: <moduleRoutes.Geo />, roles: ['user'] },
    { path: '/modules/hydropower', component: <moduleRoutes.Hydro />, roles: ['user'] },
    { path: '/modules/biomass', component: <moduleRoutes.Biomass />, roles: ['user'] },
    
    // Admin module routes
    { path: '/admin/modules/solar', component: <adminRoutes.SolarAdmin />, roles: ['admin'] },
    { path: '/admin/modules/wind', component: <adminRoutes.WindAdmin/>, roles: ['admin'] },
    { path: '/admin/modules/geothermal', component: <adminRoutes.GeoAdmin />, roles: ['admin'] },
    { path: '/admin/modules/hydropower', component: <adminRoutes.HydroAdmin/>, roles: ['admin'] },
    { path: '/admin/modules/biomass', component: <adminRoutes.BioAdmin />, roles: ['admin'] },
    
    // Admin routes
    { path: '/admin/dashboard', component: <adminRoutes.Dashboard />, roles: ['admin'] },
    { path: '/admin/analytics', component: <adminRoutes.Analytics />, roles: ['admin'] },
    { path: '/admin/users', component: <adminRoutes.UserManagement />, roles: ['admin'] },
    {path: '/admin/profile', component: <adminRoutes.UserProfile />, roles: ['admin']}
  ];


  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <AppProvider>
          <Router>
            <AuthProvider>
              <Suspense fallback={<Loader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected Routes with Layout as parent */}
                  <Route element={<Layout />}>
                    {routes.map(route => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={
                          <PrivateRoute allowedRoles={route.roles}>
                            {route.component}
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
            </AuthProvider>
          </Router>
        </AppProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;