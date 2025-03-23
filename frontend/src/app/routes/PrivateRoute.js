import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { Loader } from '@shared/index.js';
import { CONFIG } from '@config/configIndex';

const PrivateRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // List of public routes that should not be protected
  const publicPaths = ['/', '/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];

  // Allow access to public routes
  if (publicPaths.includes(location.pathname)) {
    return children;
  }

  // Show loader while checking authentication
  if (isLoading) {
    return <Loader />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Role-based access check
  const userRole = user.role || 'user';
  const hasRequiredRole = allowedRoles.length === 0 || allowedRoles.includes(userRole);

  if (!hasRequiredRole) {
    return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return children;
};


export default PrivateRoute;