// src/contexts/AuthContext.jsx - Fixed with improved verification check

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '@config/configIndex';
import authService from '../../services/authService';

// Create the Auth Context
const AuthContext = createContext(null);

// Export the context directly for advanced use cases
export default AuthContext;

// Hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('useAuth used outside AuthProvider - returning fallback auth');
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: () => console.error('Auth not initialized'),
      logout: () => console.error('Auth not initialized'),
      register: () => console.error('Auth not initialized'),
      googleSignIn: () => console.error('Auth not initialized'),
      verifyEmail: () => console.error('Auth not initialized'),
      resendVerificationCode: () => console.error('Auth not initialized'),
      hasRole: () => false,
      getUserRole: () => 'user'
    };
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => {
    // Development mode check
    if (CONFIG.SKIP_AUTH && process.env.NODE_ENV === 'development') {
      console.log('Development mode with SKIP_AUTH: Using mock user');
      return {
        id: 'dev-user-id',
        firstName: 'Development',
        lastName: 'User',
        email: 'dev@example.com',
        role: CONFIG.DEFAULT_ROLE || 'admin',
        isVerified: true
      };
    }
    
    // Initialize user from localStorage on component mount
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (CONFIG.SKIP_AUTH && process.env.NODE_ENV === 'development') {
      return true;
    }
    return localStorage.getItem('user') ? true : false;
  });
  
  const [isLoading, setIsLoading] = useState(() => {
    return !(CONFIG.SKIP_AUTH && process.env.NODE_ENV === 'development');
  });
  
  const [error, setError] = useState(null);
  const [authCheckInProgress, setAuthCheckInProgress] = useState(false);
  const authCheckTimerRef = useRef(null);
  // For the error in original code
  const [setAuthError] = useState(null);
  const [setIsAutoDeactivated] = useState(false);
  const [setRecoveryEmail] = useState('');
  const [setDeactivationInfo] = useState(null);
  // If toast is used in this component but not defined, define it
  const toast = {
    info: (msg) => console.log('INFO:', msg),
    error: (msg) => console.error('ERROR:', msg),
    success: (msg) => console.log('SUCCESS:', msg),
    warning: (msg) => console.warn('WARNING:', msg)
  };

  // ADD THE NEW useEffect RIGHT HERE, after all state variables
  useEffect(() => {
    // Temporary fix to handle development mode auth skipping
    if (CONFIG.SKIP_AUTH && process.env.NODE_ENV === 'development') {
      // Force set the dev user and auth token in localStorage
      const mockUser = {
        id: 'dev-user-id',
        firstName: 'Development',
        lastName: 'User',
        email: 'dev@example.com',
        role: CONFIG.DEFAULT_ROLE || 'admin',
        isVerified: true
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'dev-mock-token');
      
      // Set state directly
      setUser(mockUser);
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, []); // Empty dependency array - run once on mount

  // Improved redirectToUserDashboard function with better logging and error handling
  const redirectToUserDashboard = (userData = user) => {
    console.log('Redirecting based on user role:', userData?.role);
    
    if (!userData) {
      console.warn('Cannot redirect: No user data provided');
      return;
    }
    
    if (userData.role === 'admin') {
      console.log('User is admin, redirecting to admin dashboard');
      navigate('/admin/dashboard');
    } else {
      console.log('User is not admin, redirecting to user dashboard');
      navigate('/dashboard');
    }
  };

  // Define verifyAuth outside useEffect so it can be used elsewhere
  const verifyAuth = async () => {
    // Add this check at the very top and ensure it returns early
    if (CONFIG.SKIP_AUTH && process.env.NODE_ENV === 'development') {
      setIsLoading(false);
      return;
    }
    
    // Don't check auth for public routes
    const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
    const isPublicPath = publicPaths.some(path => window.location.pathname.startsWith(path));
    
    if (isPublicPath) {
      setIsLoading(false);
      return;
    }
  
    // IMPORTANT: Check for both token AND user before redirecting
    const hasAuthToken = !!localStorage.getItem('authToken');
    const hasUserData = !!localStorage.getItem('user');
  
    // If we have user data but no authentication check is in progress, use the stored data temporarily
    if (hasUserData && !authCheckInProgress && !isAuthenticated) {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
  
    // Handle cases without auth token
    if (!hasAuthToken) {
      if (!isPublicPath) {
        // Only redirect if we don't have user data either
        if (!hasUserData) {
          console.log('No auth token or user data found, redirecting to login');
          navigate('/login', { replace: true });
        } else {
          // We have user data but no token - try to refresh the token instead of redirecting
          console.log('Missing auth token but found user data - attempting to refresh');
          try {
            // You'll need an endpoint for token refresh
            const refreshResult = await authService.refreshToken();
            if (refreshResult.success) {
              return; // Successfully refreshed, don't redirect
            }
          } catch (error) {
            console.warn('Token refresh failed:', error);
            // Continue with verification to see if we're still authenticated
          }
        }
      }
      
      setIsLoading(false);
      return;
    }
  
    // Prevent multiple simultaneous checks
    if (authCheckInProgress) {
      setIsLoading(false);
      return;
    }
  
    setAuthCheckInProgress(true);
    console.log('Verifying authentication status');
  
    try {
      const result = await authService.checkAuthStatus();
      console.log('Auth verification result:', result);
      
      if (result.success && result.user) {
        // Set user and auth state
        setUser(result.user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(result.user));
      } else if (result.requireRelogin) {
        // Session expired, need to login again
        console.log('Session expired, redirecting to login');
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        
        if (!isPublicPath) {
          navigate('/login', { 
            state: { 
              message: 'Your session has expired. Please log in again.',
              from: window.location.pathname
            }
          });
        }
      } else {
        // Auth failed but don't immediately redirect - check if we have valid user data
        console.warn('Auth check failed but not requiring re-login');
        if (!hasUserData) {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
          
          if (!isPublicPath) {
            navigate('/login');
          }
        }
      }
    } catch (err) {
      console.error('Auth verification error:', err);
      // Don't clear state or redirect on network errors - this keeps the UI working during connection issues
      if (err.name !== 'AbortError' && !navigator.onLine) {
        console.log('Network appears offline - not clearing auth state');
      } else {
        // Only clear state for other types of errors
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        
        if (!isPublicPath) {
          navigate('/login');
        }
      }
    } finally {
      setIsLoading(false);
      setAuthCheckInProgress(false);
    }
  };

  // Verify authentication with the server on component mount
  useEffect(() => {
    if (CONFIG.SKIP_AUTH && process.env.NODE_ENV === 'development') {
      setIsLoading(false);
      return;
    }
    
    // Run the initial auth check
    verifyAuth();
    
    // Set up interval for periodic checks
    const interval = setInterval(verifyAuth, 5 * 60 * 1000); // Check every 5 minutes
    
    // Cleanup function
    return () => {
      clearInterval(interval);
      if (authCheckTimerRef.current) {
        clearTimeout(authCheckTimerRef.current);
      }
    };
  }, [navigate]);

  // Fixed login function for AuthContext
  const login = async (email, password) => {
    if (CONFIG.SKIP_AUTH && process.env.NODE_ENV === 'development') {
      console.log('Development mode: Login bypassed');
      const mockUser = {
        id: 'dev-user-id',
        firstName: 'Development',
        lastName: 'User',
        email: email || 'dev@example.com',
        role: CONFIG.DEFAULT_ROLE || 'admin',
        isVerified: true
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'dev-mock-token'); // Add mock token
      redirectToUserDashboard(mockUser);
      return { success: true, user: mockUser };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Calling authService.login for', email);
      const result = await authService.login(email, password);
      console.log('Login result in AuthContext:', result);
      
      if (!result.success || !result.user) {
        const errorMessage = (result.message || '').includes('User not found') 
          ? 'Account not found. Please register first.'
          : result.message || 'Login failed. Please try again.';
        console.log('Login failed:', errorMessage);
        
        return { 
          success: false, 
          message: errorMessage 
        };
      }
  
      // FIX: Create an explicit verification check with default to true if not specified
      const isUserVerified = result.requireVerification !== true;
      
      console.log('Verification check in AuthContext:', {
        user: result.user.email,
        isVerified: result.user.isVerified,
        requireVerification: result.requireVerification,
        determinedStatus: isUserVerified
      });
      
      if (isUserVerified) {
        // User is verified - create a normalized user object
        const verifiedUser = {
          ...result.user,
          isVerified: true  // Force isVerified to be true
        };
        
        console.log('Setting verified user in context:', verifiedUser);
        
        // Update state
        setUser(verifiedUser);
        setIsAuthenticated(true);
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(verifiedUser));
        if (result.user.accessToken) {
          localStorage.setItem('authToken', result.user.accessToken);
        }
        
        // Return consistent result
        return { 
          success: true, 
          user: verifiedUser 
        };
      } else {
        // Explicitly handle verification requirement
        console.log('User requires verification, returning requireVerification flag');
        return { 
          success: true, 
          user: result.user,
          requireVerification: true
        };
      }
    } catch (err) {
      console.error('Login error in AuthContext:', err);
      setError(err.message);
      
      return {
        success: false,
        message: err.message
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function with verification
  const register = async (userData) => {
    if (CONFIG.SKIP_AUTH && process.env.NODE_ENV === 'development') {
      console.log('Development mode: Registration bypassed');
      navigate('/login', { 
        state: { message: 'Development mode: Registration successful! Please log in.' }
      });
      
      return { success: true };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        if (result.requireVerification) {
          // If verification is required, redirect to verification page
          navigate(`/verify-email`, { 
            state: { userId: result.userId, email: userData.email } 
          });
        } else {
          // Traditional flow - redirect to login
          navigate('/login', { 
            state: { message: 'Registration successful! Please log in.' }
          });
        }
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Improved googleSignIn function with proper verification checking and fixed error handling
  const googleSignIn = async () => {
    if (CONFIG.SKIP_AUTH && process.env.NODE_ENV === 'development') {
      console.log('Development mode: Google sign-in bypassed');
      const mockUser = {
        id: 'dev-user-id',
        firstName: 'Development',
        lastName: 'User',
        email: 'dev-google@example.com',
        role: CONFIG.DEFAULT_ROLE || 'admin',
        isVerified: true
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'dev-mock-token');
      
      redirectToUserDashboard(mockUser);
      
      return { success: true, user: mockUser };
    }
    
    setIsLoading(true);
    setError(null);
  
    try {
      console.log('Starting Google sign-in process in AuthContext');
      
      // Direct single-step sign-in
      const result = await authService.googleSignIn();
      console.log('Google sign-in result:', result);
  
      // Handle case where we get invalid response
      if (!result) {
        throw new Error('Invalid response from Google sign-in service');
      }
  
      // Handle deactivated accounts
      if (result.isDeactivated || result.isAutoDeactivated) {
        console.log('Account is deactivated:', result);
        
        toast.info("Your account has been deactivated. A reactivation link has been sent to your email.");
        
        navigate('/login', {
          state: {
            email: result.email,
            isDeactivated: true,
            isAutoDeactivated: result.isAutoDeactivated || false,
            message: "Your account has been deactivated. Reactivation link sent to your email."
          },
          replace: true
        });
        
        return {
          success: false,
          isDeactivated: true,
          isAutoDeactivated: result.isAutoDeactivated || false,
          email: result.email,
          message: "Account deactivated. Please check your email for reactivation instructions."
        };
      }
  
      // Handle verification requirement
      if (result.requireVerification) {
        console.log('Account requires verification:', result);
        
        const userEmail = result.email || (result.user && result.user.email);
        const userId = result.userId || (result.user && result.user.id);
        
        if (!userId || !userEmail) {
          console.error("Missing userId or email for verification redirection", result);
          toast.error("Verification error. Please try logging in again.");
          throw new Error("Missing user details for verification");
        }
        
        // Show a toast message about the verification email
        toast.info("A verification email has been sent. Please check your inbox to complete sign-in.");
        
        navigate('/verify-email', {
          state: {
            userId: userId,
            email: userEmail,
            provider: 'google',
            returnTo: '/dashboard'
          }
        });
        
        return result;
      }
  
      // Normal successful login
      if (result.success && result.user) {
        const verifiedUser = {
          ...result.user,
          isVerified: true
        };
  
        setUser(verifiedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(verifiedUser));
        
        if (result.user.accessToken || result.token) {
          localStorage.setItem('authToken', result.user.accessToken || result.token);
        }
  
        toast.success(result.message || 'Google sign-in successful');
        redirectToUserDashboard(verifiedUser);
        return { success: true, user: verifiedUser };
      }
  
      // Handle unusual response format
      throw new Error(result.message || 'Google sign-in failed with an unexpected response format');
  
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      // Check for deactivation info in error response data
      if (error.response?.data?.isDeactivated || error.response?.data?.message?.includes('deactivated')) {
        const email = error.response.data.email || '';
        const isAuto = error.response.data.isAutoDeactivated || false;
        
        console.log('Account deactivation detected in error response:', {
          email,
          isAuto
        });
        
        toast.info("Your account has been deactivated. A reactivation link has been sent to your email.");
        
        navigate('/login', {
          state: {
            email,
            isDeactivated: true,
            isAutoDeactivated: isAuto,
            message: "Your account has been deactivated. Reactivation link sent to your email."
          },
          replace: true
        });
        
        return {
          success: false,
          isDeactivated: true,
          isAutoDeactivated: isAuto,
          email,
          message: "Account deactivated. Please check your email for reactivation instructions."
        };
      }
      
      // Handle common Firebase Auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        toast.info('Sign-in was cancelled');
        if (typeof setAuthError === 'function') {
          setAuthError('Sign-in was cancelled. Please try again.');
        }
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Sign-in popup was blocked. Please enable popups or use redirect sign-in.');
        if (typeof setAuthError === 'function') {
          setAuthError('Browser blocked the popup. Please enable popups or use redirect sign-in.');
        }
        
        // Show redirect option automatically
        if (typeof setShowRedirectOption === 'function') {
          setShowRedirectOption(true);
        }
      } else {
        // Direct error handling for other errors
        const errorMessage = error?.message || 'Authentication failed';
        if (typeof setAuthError === 'function') {
          setAuthError(errorMessage);
        }
        toast.error(errorMessage);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Email verification function
  const verifyEmail = async (userId, verificationCode) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('AuthContext: Calling verifyEmail with:', { userId, verificationCode });
      const result = await authService.verifyEmail(userId, verificationCode);
      
      // Add debugging to check what's coming back
      console.log('Verification response:', result);
      console.log('Token available?', result.user?.accessToken || 'NO TOKEN');
      
      if (result.success && result.user) {
        // Update user in context
        setUser(result.user);
        setIsAuthenticated(true);
        
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        console.log('User saved to localStorage:', result.user);
        
        // Important: Store auth token in localStorage - 
        // Your backend includes it in the user object
        if (result.user.accessToken) {
          localStorage.setItem('authToken', result.user.accessToken);
          console.log('Token saved from user.accessToken:', result.user.accessToken);
        } else {
          console.warn('No accessToken found in user object');
        }
        
        // Verify storage was successful
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        console.log('Storage verification:', {
          tokenSaved: !!storedToken,
          userSaved: !!storedUser
        });
      }
      
      return result;
    } catch (err) {
      console.error('Auth context verifyEmail error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const resendVerificationCode = async (userId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.resendVerificationCode(userId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

// Improved logout function for AuthContext.jsx

const logout = async () => {
  try {
    console.log("Initiating logout process...");
    
    // 1. Clear React state first for responsive UI
    setUser(null);
    setIsAuthenticated(false);
    
    console.log("Cleared auth state");
    
    // 2. Clear localStorage items
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    
    console.log("Cleared localStorage");
    
    // 3. Try to clear cookies from client side (may not work for httpOnly)
    // Include ALL possible combinations to ensure it works
    const cookieNames = ['token', 'refreshToken', 'authToken'];
    const domains = [window.location.hostname, '', null];
    const paths = ['/', '/admin', '/dashboard', ''];
    
    for (const name of cookieNames) {
      for (const domain of domains) {
        for (const path of paths) {
          // Create expiration date in the past
          const expireDate = new Date();
          expireDate.setTime(expireDate.getTime() - 1000);
          
          // Basic cookie deletion
          document.cookie = `${name}=; expires=${expireDate.toUTCString()}; path=${path}`;
          
          // With domain
          if (domain) {
            document.cookie = `${name}=; expires=${expireDate.toUTCString()}; path=${path}; domain=${domain}`;
          }
          
          // Try all sameSite values
          ['strict', 'lax', 'none'].forEach(sameSite => {
            [true, false].forEach(secure => {
              // Basic sameSite cookie
              document.cookie = `${name}=; expires=${expireDate.toUTCString()}; path=${path}; sameSite=${sameSite}${sameSite === 'none' ? '; secure' : ''}`;
              
              // With domain
              if (domain) {
                document.cookie = `${name}=; expires=${expireDate.toUTCString()}; path=${path}; domain=${domain}; sameSite=${sameSite}${sameSite === 'none' ? '; secure' : ''}`;
              }
            });
          });
        }
      }
    }
    
    console.log("Attempted to clear cookies client-side");
    
    // 4. Call the backend logout service to clear server-side cookies
    try {
      console.log("Calling backend logout endpoint");
      const result = await authService.logout();
      console.log("Backend logout response:", result);
    } catch (apiError) {
      console.error("Backend logout API error:", apiError);
      // Continue with logout even if API fails
    }
    
    // 5. Final cleanup - force a page reload if needed
    // This ensures all components are re-rendered with the logged-out state
    
    // Navigate to login page
    console.log("Navigating to login page");
    navigate('/login', { replace: true });
    
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    
    // Even on error, clear local state
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    
    // Try to navigate anyway
    navigate('/login', { replace: true });
    
    return { success: false, error: error.message };
  }
};

  // Helper functions for roles
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  const getUserRole = () => {
    return user?.role || 'user';
  };

  // Create the context value
  const contextValue = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    googleSignIn,
    verifyEmail,
    resendVerificationCode,
    verifyAuth,
    hasRole,
    getUserRole,
    redirectToUserDashboard,
    isDevelopmentMode: CONFIG.SKIP_AUTH && process.env.NODE_ENV === 'development'
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};