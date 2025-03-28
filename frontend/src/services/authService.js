import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult as firebaseGetRedirectResult
} from 'firebase/auth';
import { auth } from '../features/auth/firebase/firebase';
import api, { nodeApi } from './api'; // Import both API instances

let currentAuthRequest = null;

const authService = {
  register: async (userData) => {
    try {
      const response = await nodeApi.post('/auth/register', userData);
      
      // Return data needed for verification
      return { 
        success: true, 
        user: response.data.user,
        userId: response.data.user?.id || response.data.userId,
        requireVerification: true,  // Always require verification for new registrations
        message: response.data.message 
      };
    } catch (error) {
      console.error("Registration Error:", error.message);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      
      const response = await nodeApi.post('/auth/login', { email, password });
      
      // Log the response data
      console.log('Parsed login response:', response.data);
  
      // Store token if available
      if (response.data.user?.accessToken) {
        localStorage.setItem('authToken', response.data.user.accessToken);
      }
  
      // CRITICAL: Log and normalize verification status to prevent undefined values
      console.log('Original verification status:', {
        userIsVerified: response.data.user?.isVerified,
        requireVerification: response.data.requireVerification
      });
  
      // Normalize the response to ensure verification status is always a boolean
      const normalizedResponse = {
        success: true,
        user: {
          ...response.data.user,
          // Force isVerified to be a boolean based on requireVerification
          isVerified: response.data.requireVerification === true ? false : (response.data.user?.isVerified === true)
        },
        // Only include requireVerification if it's explicitly true
        ...(response.data.requireVerification === true && { requireVerification: true })
      };
  
      console.log('Normalized login response:', normalizedResponse);
      return normalizedResponse;
    } catch (error) {
      console.error('Login error in authService:', error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Improved logout that properly clears all auth data
  logout: async () => {
    try {
      // First clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      
      // Then try to sign out from Firebase if applicable
      try {
        await auth.signOut();
      } catch (firebaseError) {
        console.warn('Firebase signout error:', firebaseError);
        // Continue with logout even if Firebase fails
      }

      // Finally clear cookies via server
      await nodeApi.post('/auth/logout');

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      // Even if server logout fails, we've already cleared local storage
      return { success: true, warning: error.message };
    }
  },

  // Improved checkAuthStatus with better error handling and offline support
  checkAuthStatus: async (signal) => {
    try {
      // Check if we have a stored user first - critical for offline support
      const storedUser = localStorage.getItem('user');
      let userData = null;
      
      if (storedUser) {
        try {
          userData = JSON.parse(storedUser);
          console.log('Using stored user data while verifying auth');
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
      
      // Abort previous request if any
      if (currentAuthRequest) {
        currentAuthRequest.abort();
      }

      // Get token from localStorage
      const localToken = localStorage.getItem('authToken');
      
      if (!localToken) {
        console.warn('No auth token available');
        return { 
          success: false, 
          error: 'No auth token',
          // Return temporary user data if available
          ...(userData && { tempUser: userData })
        };
      }

      // Check network connection first
      if (!navigator.onLine) {
        console.warn('Network appears offline - using cached user data');
        return { 
          success: userData != null,
          user: userData,
          offline: true
        };
      }

      console.log('Verifying auth with server');
      
      // Create a new controller for this request
      const controller = signal ? { signal } : new AbortController();
      if (!signal) {
        currentAuthRequest = controller;
        signal = controller.signal;
      }
      
      const response = await nodeApi.get('/auth/verify', {
        headers: {
          "Authorization": `Bearer ${localToken}`
        },
        signal
      });

      // Clear current request reference if this is it
      if (currentAuthRequest?.signal === signal) {
        currentAuthRequest = null;
      }

      // Check for token refresh header
      const newToken = response.headers['x-new-token'];
      if (newToken) {
        console.log('Received new token from server');
        localStorage.setItem('authToken', newToken);
      }

      const data = response.data;

      // Handle successful verification
      if (data.success && data.user) {
        console.log('Auth verified successfully');
        
        // Ensure the user has a role set
        if (!data.user.role) {
          data.user.role = userData?.role || 'user';
        }
        
        // Store updated user data
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return { success: true, user: data.user };
      }
      
      // Fallback to stored user data if server didn't return a user
      if (userData && (!data.user)) {
        console.warn('Server did not return user data but we have stored data');
        return { 
          success: true, 
          user: userData,
          warning: 'Using stored user data'
        };
      }
      
      return { success: false, error: 'Invalid response' };
    } catch (error) {
      console.error('Auth check error:', error);
      
      // For abort errors, just return quietly
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return { aborted: true };
      }
      
      // For network errors with stored data, use the stored data
      const storedUser = localStorage.getItem('user');
      if ((error.name === 'TypeError' && error.message.includes('network')) || 
          error.code === 'ERR_NETWORK') {
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            return { 
              success: true, 
              user: userData, 
              offline: true,
              warning: 'Using cached data due to network error'
            };
          } catch (e) {
            console.error('Error parsing stored user during offline fallback:', e);
          }
        }
      }

      // If token expired but we have refresh capability, try to refresh
      if (error.response?.status === 401 && error.response?.data?.requireRefresh) {
        try {
          console.log('Attempting token refresh');
          const refreshResult = await authService.refreshToken();
          if (refreshResult.success) {
            // If refresh succeeded, return the user data
            const storedUser = localStorage.getItem('user');
            const userData = storedUser ? JSON.parse(storedUser) : null;
            return { success: true, user: refreshResult.user || userData };
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }

      return { success: false, error: error.message };
    }
  },

  // Add token refresh functionality
  refreshToken: async () => {
    try {
      // First check if we have a stored user
      const storedUser = localStorage.getItem('user');
      let userData = null;
      
      if (storedUser) {
        try {
          userData = JSON.parse(storedUser);
        } catch (e) {
          console.error('Error parsing stored user during refresh:', e);
        }
      }
      
      console.log('Attempting to refresh auth token');
      const response = await nodeApi.post('/auth/refresh-token');
      const data = response.data;
      
      if (data.accessToken) {
        localStorage.setItem('authToken', data.accessToken);
        
        // If server returned updated user data, use it
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          return { success: true, user: data.user };
        }
        
        // Otherwise return the stored user data
        return { success: true, user: userData };
      }
      
      return { success: false, error: 'No token received' };
    } catch (error) {
      console.error("Token refresh error:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  // Initiate Google Auth to get email before completing sign-in
  initiateGoogleAuth: async () => {
    try {
      console.log('Starting Google auth initiation');
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({ prompt: 'select_account' });
      
      // Get user info from Google but don't complete sign-in yet
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log('Google auth initiation successful:', user.email);
      
      if (!user.email) {
        throw new Error('Failed to get email from Google');
      }
      
      return {
        success: true,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        uid: user.uid
      };
    } catch (error) {
      console.error("Google Auth Initiation Error:", error);
      
      if (error.code) {
        const errorMessages = {
          'auth/popup-closed-by-user': "Sign-in was cancelled",
          'auth/popup-blocked': "Sign-in popup was blocked. Please enable popups",
          'auth/cancelled-popup-request': "Sign-in was cancelled",
          'auth/account-exists-with-different-credential': "Account exists with different sign-in method"
        };
        throw new Error(errorMessages[error.code] || error.message || "Failed to sign in with Google");
      }
      
      throw error;
    }
  },

  // Enhanced googleSignIn method
  googleSignIn: async () => {
    try {
      console.log('Starting Google sign-in with popup');
      
      const provider = new GoogleAuthProvider();
      // Minimize scopes to reduce consent screens
      provider.addScope('email');
      
      // Attempt popup sign in
      const result = await signInWithPopup(auth, provider);
      
      // Process credentials
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      
      console.log('Google sign-in successful with Firebase:', user.email);
      
      // Format the user object
      const formattedUser = {
        id: user.uid,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        photoURL: user.photoURL,
        isVerified: user.emailVerified,
        role: 'user', // Default role, can be updated after checking with backend
        accessToken: token
      };
      
      // Call your backend API to register/login the user and get proper role
      try {
        const idToken = await user.getIdToken();
        
        console.log('Calling backend with Google auth data');
        const apiResponse = await nodeApi.post('/auth/google-signin', {
          idToken,
          email: user.email,
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
        
        const apiData = apiResponse.data;
        
        // Handle deactivated account scenario
        if (apiData.isDeactivated) {
          console.log('Account is deactivated:', apiData);
          
          return {
            success: false,
            isDeactivated: true,
            email: apiData.email || user.email,
            message: apiData.message || "This account has been deactivated. A recovery link has been sent to your email."
          };
        }
        
        // Handle verification requirement
        if (apiData.requireVerification) {
          console.log('Account requires verification:', apiData);
          
          return {
            success: false,
            requireVerification: true,
            userId: apiData.userId,
            email: apiData.user?.email || user.email,
            message: apiData.message || "Please verify your email to complete sign-in."
          };
        }
        
        if (apiData.success) {
          // Update with server-provided data (roles, etc)
          return {
            success: true,
            user: { ...formattedUser, ...apiData.user },
            token: apiData.token || token
          };
        } else {
          // Got a non-success response but not one of our special cases
          throw new Error(apiData.message || "Google sign-in failed on the server");
        }
      } catch (apiError) {
        console.error('Backend API error during Google signin:', apiError);
        
        // Special handling for email exists error (likely deactivated account)
        if (apiError.response?.status === 400 && 
            apiError.response?.data?.message?.includes('email already exists')) {
          
          console.log('Received "email already exists" error - this may be a deactivated account');
          
          // Return a special format that the frontend can handle
          throw new Error('Error creating account - email already exists');
        }
        
        // Rethrow the error to be handled by the calling function
        throw apiError;
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      
      // Handle specific error types
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked. Please enable popups');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Another sign-in is already in progress');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many sign-in attempts. Please try again later');
      } else {
        throw error;
      }
    }
  },
  
  googleSignInWithRedirect: async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Add scopes if needed
      provider.addScope('profile');
      provider.addScope('email');
      
      // Set custom parameters
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Save current URL for redirecting back after authentication
      sessionStorage.setItem('authRedirectUrl', window.location.pathname);
      
      // Start redirect flow
      await signInWithRedirect(auth, provider);
      
      // This function won't return anything immediately as it redirects away
      return { success: true, redirectStarted: true };
    } catch (error) {
      console.error('Google Sign-In Redirect Error:', error);
      throw error;
    }
  },

  getRedirectResult: async () => {
    try {
      console.log('Checking for Google sign-in redirect result');
      
      const result = await firebaseGetRedirectResult(auth);
      
      if (!result) {
        // No redirect result - this is normal if user didn't just complete a redirect flow
        console.log('No redirect result found');
        return { success: false, user: null };
      }
      
      console.log('Google redirect sign-in successful');
      
      // Process credentials
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      
      // Format the user object
      const formattedUser = {
        id: user.uid,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        photoURL: user.photoURL,
        isVerified: user.emailVerified,
        role: 'user', // Default role, can be updated after checking with backend
        accessToken: token
      };
      
      // Call your backend API to register/login the user and get proper role
      try {
        const idToken = await user.getIdToken();
        const apiResponse = await nodeApi.post('/auth/google-signin', {
          idToken: idToken,
          email: user.email,
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
        
        const apiData = apiResponse.data;
        
        // Handle deactivated account scenario
        if (apiData.isDeactivated) {
          console.log('Account is deactivated:', apiData);
          
          return {
            success: false,
            isDeactivated: true,
            email: apiData.email || user.email,
            message: apiData.message || "This account has been deactivated. A recovery link has been sent to your email."
          };
        }
        
        // Handle verification requirement
        if (apiData.requireVerification) {
          console.log('Account requires verification:', apiData);
          
          return {
            success: false,
            requireVerification: true,
            userId: apiData.userId,
            email: apiData.user?.email || user.email,
            message: apiData.message || "Please verify your email to complete sign-in."
          };
        }
        
        if (apiData.success) {
          // Update with server-provided data (roles, etc)
          return {
            success: true,
            user: { ...formattedUser, ...apiData.user },
            token: apiData.token || token
          };
        }
      } catch (apiError) {
        console.error('Backend API error during Google redirect result:', apiError);
        // Continue with frontend-only flow as fallback
      }
      
      // Return user data even if backend call failed
      return {
        success: true,
        user: formattedUser,
        token: token
      };
    } catch (error) {
      console.error('Get Redirect Result Error:', error);
      
      if (error.code === 'auth/null-auth-credential') {
        // This isn't actually an error - just means there's no pending redirect
        return { success: false, user: null };
      }
      
      throw error;
    }
  },
  
  // Email verification function
  verifyEmail: async (userId, verificationCode) => {
    try {
      console.log('AuthService: Verifying email with:', { userId, verificationCode });
      
      const response = await nodeApi.post('/auth/verify-email', { 
        userId, 
        verificationCode 
      });
  
      const data = response.data;
      
      // Log what we're getting from backend
      console.log('Backend verification response:', data);
      
      // Check if the expected fields are present
      if (!data.token && !data.user?.accessToken) {
        console.warn('API response missing token:', data);
      }
      
      if (!data.user) {
        console.warn('API response missing user data:', data);
      }
      
      // Match exactly what your backend returns
      return {
        success: true,
        user: data.user,
        // Don't create a separate token property since backend doesn't
        // include one - that could cause confusion
        message: data.message || 'Email verified successfully'
      };
    } catch (error) {
      console.error("Verification Error:", error.message);
      throw error;
    }
  },

  resendVerificationCode: async (userId) => {
    if (!userId) throw new Error("User ID is required");

    try {
      console.log('Sending resend verification request:', {
        userId,
        url: '/auth/resend-verification'
      });

      const response = await nodeApi.post('/auth/resend-verification', { userId });
      return {
        success: true,
        message: response.data.message || "Verification code sent successfully"
      };
    } catch (error) {
      console.error("Resend verification error:", {
        error,
        userId,
        message: error.message
      });
      
      if (error.response) {
        switch (error.response.status) {
          case 404:
            throw new Error("User not found");
          case 429:
            throw new Error("Too many requests. Please wait before trying again");
          default:
            throw new Error(error.response.data?.message || "Failed to resend verification code");
        }
      }
      
      throw error;
    }
  },

  forgotPassword: async (email) => {
    if (!email) throw new Error("Email is required");
  
    try {
      console.log('Sending password reset request:', {
        email,
        url: '/auth/forgot-password'
      });
  
      const response = await nodeApi.post('/auth/forgot-password', { email });
  
      return {
        success: true,
        message: response.data.message || "If that email address is in our database, we will send a password reset link."
      };
    } catch (error) {
      console.error("Forgot password error:", {
        error,
        message: error.message
      });
      throw error;
    }
  },

  resetPassword: async (token, newPassword) => {
    if (!token || !newPassword) {
      throw new Error("Reset token and new password are required");
    }
  
    try {
      console.log('Sending reset password request:', {
        token: token.substring(0, 5) + '...',  // Only log part of the token for security
        url: '/auth/reset-password'
      });
  
      const response = await nodeApi.post('/auth/reset-password', {
        token,
        newPassword
      });
  
      // Handle successful password reset
      if (response.data.accessToken) {
        localStorage.setItem('authToken', response.data.accessToken);
      }
  
      return {
        success: true,
        user: response.data.user || {},
        message: response.data.message || "Password has been successfully reset"
      };
    } catch (error) {
      console.error("Reset password error:", {
        error,
        message: error.message
      });
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            throw new Error(error.response.data.message || "Invalid or expired reset token");
          default:
            throw new Error(error.response.data.message || "Failed to reset password");
        }
      }
      
      throw error;
    }
  },
  
  forceVerifyUser: (userData) => {
    if (!userData) return null;
    
    console.log('Force-verifying user:', userData);
    
    // Create a new object with forced verification
    const verifiedUser = {
      ...userData,
      isVerified: true,
      verificationStatus: 'verified'
    };
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(verifiedUser));
    
    // Return the modified user
    return verifiedUser;
  },
  
  directLogin: async (email, password) => {
    try {
      console.log('Using direct login bypass for:', email);
      
      // First call the normal login endpoint
      const response = await nodeApi.post('/auth/login', { email, password });
      const data = response.data;
      
      // Handle login errors
      if (!data.user) {
        throw new Error("Invalid server response - missing user data");
      }
      
      // Store the token regardless
      if (data.user.accessToken) {
        localStorage.setItem('authToken', data.user.accessToken);
      }
      
      // Force the user to be verified
      const forceVerifiedUser = {
        ...data.user,
        isVerified: true,
        verificationStatus: 'verified'
      };
      
      console.log('Created force-verified user:', forceVerifiedUser);
      
      // Store the verified user
      localStorage.setItem('user', JSON.stringify(forceVerifiedUser));
      
      // Return success with the verified user
      return { 
        success: true, 
        user: forceVerifiedUser,
        message: "Login successful"
      };
    } catch (error) {
      console.error('Direct login error:', error);
      throw error;
    }
  },
  
  // Account deactivation function
  deactivateAccount: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await nodeApi.post('/auth/deactivate-account', {}, {
        headers: { 
          "Authorization": `Bearer ${token}`
        }
      });

      // Clear all auth data on successful deactivation
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      
      return {
        success: true,
        message: response.data.message || "Account successfully deactivated"
      };
    } catch (error) {
      console.error("Account deactivation error:", error);
      throw error;
    }
  },

  // Request account recovery function
  requestAccountRecovery: async (email) => {
    try {
      // Update the endpoint from 'request-recovery' to 'request-reactivation'
      await nodeApi.post('/auth/request-reactivation', { email });

      // For security, we always return a success message
      return {
        success: true,
        message: "If your account exists and is deactivated, a reactivation email has been sent."
      };
    } catch (error) {
      console.error("Recovery request error:", error);
      // Return a generic message to prevent email enumeration
      return {
        success: false,
        message: "We encountered an issue processing your request. Please try again later."
      };
    }
  },

  // Recover account using token function
  recoverAccount: async (token) => {
    try {
      if (!token) {
        throw new Error("Reactivation token is required");
      }

      console.log('Sending account reactivation request:', {
        token: token.substring(0, 5) + '...',
      });

      const response = await nodeApi.post('/auth/reactivate-account', {
        token: token.trim()
      });

      const data = response.data;

      // Handle successful reactivation
      if (data.accessToken) {
        localStorage.setItem('authToken', data.accessToken);
      }

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return {
        success: true,
        user: data.user || null,
        message: data.message || "Account reactivated successfully"
      };
    } catch (error) {
      console.error("Account reactivation error:", error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          expired: true,
          message: "Reactivation token has expired. Please request a new one."
        };
      }
      
      return {
        success: false,
        error: true,
        message: error.response?.data?.message || error.message || "Failed to reactivate account",
        debug: process.env.NODE_ENV === 'development' ? {
          errorType: error.name,
          errorMessage: error.message,
          stack: error.stack
        } : undefined
      };
    }
  },

  // Check if account is deactivated during login
  checkDeactivatedAccount: async (email) => {
    try {
      // This will always return success for security reasons
      // The server won't reveal if an account exists or is deactivated
      const response = await nodeApi.post('/auth/check-deactivated', { email });
      
      return {
        success: true,
        isDeactivated: response.data.isDeactivated || false,
        message: response.data.message,
        lockoutRemaining: response.data.lockoutRemaining
      };
    } catch (error) {
      console.error("Deactivation check error:", error);
      return { success: false, isDeactivated: false };
    }
  },

  checkAccountStatus: async (email) => {
    try {
      if (!email) {
        throw new Error("Email is required");
      }
      
      console.log('Checking account status for:', email);
      
      const response = await nodeApi.post('/auth/check-account-status', { email });
      
      return {
        success: response.data.success,
        exists: response.data.exists || false,
        isActive: response.data.isActive || false,
        isAutoDeactivated: response.data.isAutoDeactivated || false,
        deactivatedAt: response.data.deactivatedAt || null,
        tokenExpired: response.data.tokenExpired || false,
        message: response.data.message || "Account status check completed"
      };
    } catch (error) {
      console.error("Account status check error:", error);
      throw error;
    }
  },

  requestReactivation: async (email) => {
    try {
      if (!email) {
        throw new Error("Email is required");
      }
      
      console.log('Requesting reactivation for:', email);
      
      // Send reactivation request to the server
      const response = await nodeApi.post('/auth/request-reactivation', 
        { email },
        {
          headers: { 
            "x-client-type": "web" // Add client identifier
          }
        }
      );
      
      console.log("Reactivation request succeeded:", response.data);
      
      // For security, always return success message for confirmed requests
      return {
        success: true,
        requested: true,
        message: response.data.message || "If your account exists and is deactivated, a reactivation email has been sent."
      };
    } catch (error) {
      console.error("Reactivation request error:", error);
      
      // Return descriptive error for frontend handling
      return {
        success: false,
        error: true,
        message: error.response?.data?.message || error.message || "We encountered an issue processing your request. Please try again later.",
        serverError: error.response ? true : false
      };
    }
  }
};

export default authService;