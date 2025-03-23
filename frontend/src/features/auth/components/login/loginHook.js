// Refactored loginHook.js with improved modularity and organization

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import * as Yup from 'yup';
import { useSnackbar } from '@shared/index';
import authService from '@services/authService';

export const useLogin = () => {
  const { login: contextLogin, googleSignIn: contextGoogleSignIn, setUser, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useSnackbar();
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [showRedirectOption, setShowRedirectOption] = useState(false);
  const [isAutoDeactivated, setIsAutoDeactivated] = useState(false);
  const [deactivationInfo, setDeactivationInfo] = useState(null);

  // Validation configuration
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
  });

  const initialValues = {
    email: '',
    password: ''
  };

  // Helper functions
  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  
  const showSuccessToast = (userData) => {
    toast.success(`Welcome back, ${userData.firstName || 'User'}!`);
  };

  const showErrorToast = (error) => {
    console.error('Auth error:', error);
    const errorMessage = error?.message || 'Authentication failed';
    setAuthError(errorMessage);
    toast.error(errorMessage);
  };

  // Store user data in localStorage and context
  const storeUserData = (user, accessToken) => {
    const verifiedUser = {
      ...user,
      isVerified: true
    };
    
    localStorage.setItem('user', JSON.stringify(verifiedUser));
    
    if (accessToken || user.accessToken) {
      localStorage.setItem('authToken', accessToken || user.accessToken);
    }
    
    setUser(verifiedUser);
    setIsAuthenticated(true);
    
    return verifiedUser;
  };

  // Handle navigation based on user role
  const navigateAfterAuth = (user) => {
    const targetPath = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    navigate(targetPath, { replace: true });
  };

  // Reactivation handlers
  const navigateToReactivation = (email, hasError = false) => {
    navigate('/reactivate-account', { 
      state: { 
        email,
        isAutoDeactivated: true,
        hasError,
        message: hasError 
          ? "We encountered an issue sending the reactivation email. Please try requesting a new one."
          : "A reactivation link has been sent to your email."
      },
      replace: true
    });
  };

  const navigateToLoginWithDeactivationInfo = (email) => {
    navigate('/login', { 
      state: { 
        email,
        isAutoDeactivated: true,
        message: "Your account has been automatically deactivated due to inactivity. A reactivation link has been sent to your email."
      },
      replace: true
    });
  };

  const handleAutoDeactivatedAccount = async (email) => {
    console.log('Handling auto-deactivated account:', email);
    
    setIsAutoDeactivated(true);
    setRecoveryEmail(email);
    
    // Show a pending notification
    toast.info("Account deactivated due to inactivity. Sending reactivation email...");
    
    try {
      // Enhanced logging
      console.log('Sending reactivation request to server...');
      const result = await authService.requestReactivation(email);
      console.log('Reactivation request response:', result);
      
      if (result.success) {
        // Success case - navigate to login with clear message
        toast.success("Reactivation email sent successfully. Please check your inbox.");
        
        // Navigate with clear state info
        navigate('/login', { 
          state: { 
            email,
            isAutoDeactivated: true,
            emailSent: true, // Add clear indication that email was sent
            message: "Your account has been automatically deactivated due to inactivity. A reactivation link has been sent to your email."
          },
          replace: true
        });
      } else {
        // Error case - navigate to reactivation page where user can retry
        toast.error(result.message || "Problem sending reactivation email. Please try again.");
        
        navigate('/reactivate-account', { 
          state: { 
            email,
            isAutoDeactivated: true,
            emailSent: false,
            hasError: true,
            errorMessage: result.message,
            message: "We encountered an issue sending the reactivation email. You can request a new one below."
          },
          replace: true
        });
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Critical error in auto-deactivated account flow:', error);
      
      toast.error("An unexpected error occurred. Please try again.");
      
      navigate('/reactivate-account', { 
        state: { 
          email,
          isAutoDeactivated: true,
          hasError: true,
          emailSent: false,
          message: "We encountered a technical issue. Please try requesting a new reactivation email."
        },
        replace: true
      });
    } finally {
      // Make sure loading state is reset
      setIsLoading(false);
    }
  };

  const handleDeactivatedAccount = async (email, statusCheck) => {
    setDeactivationInfo({
      email,
      deactivatedAt: statusCheck.deactivatedAt,
      tokenExpired: statusCheck.tokenExpired
    });

    setIsAutoDeactivated(true);
    setRecoveryEmail(email);
    toast.info("Account deactivated due to inactivity. Reactivation link sent.");

    const reactivationResult = await authService.requestReactivation(email);

    if (reactivationResult.success) {
      navigateToLoginWithDeactivationInfo(email);
    } else {
      navigateToReactivation(email, true);
    }
  };

  const handleReactivatedAccount = async (result) => {
    if (!result.user) {
      toast.error('Invalid server response');
      return;
    }

    const userData = storeUserData(result.user);
    toast.success("Account reactivated. Welcome back!");
    navigateAfterAuth(userData);
  };

  const handleRequestReactivation = async () => {
    if (!recoveryEmail) {
      toast.error("Email is required");
      return;
    }
    
    startLoading();
    
    try {
      const result = await authService.requestReactivation(recoveryEmail);
      
      if (result.success) {
        toast.success("Reactivation email sent. Please check your inbox and follow the instructions.");
        navigateToReactivation(recoveryEmail);
      } else {
        toast.error(result.message || "Failed to send reactivation email");
      }
    } catch (error) {
      console.error('Reactivation request error:', error);
      setAuthError(error.message || 'Failed to request reactivation');
      toast.error(error.message || 'Failed to request reactivation');
    } finally {
      stopLoading();
    }
  };

  // Authentication handlers
  const handleVerificationRequired = (result) => {
    navigate('/verify-email', {
      state: {
        userId: result.userId,
        email: result.email || ''
      }
    });
    toast.info(result.message || "Please verify your email");
  };

  const handleSuccessfulSignIn = async (result) => {
    if (!result.user) {
      toast.error('Invalid user data received');
      return;
    }

    const userData = storeUserData(result.user);
    toast.success(`Welcome, ${userData.firstName || 'User'}!`);
    navigateAfterAuth(userData);
  };

  const handleGoogleSignInError = (error) => {
    console.error('Google sign-in error handler:', error);
    
    let errorMessage = error.message || 'Google sign-in failed';
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in process was cancelled';
      toast.info('Sign-in cancelled');
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup blocked - try direct redirect';
      toast.error('Enable popups or use email sign-in');
      setShowRedirectOption(true);
    }
  
    setAuthError(errorMessage);
    
    if (!['auth/popup-closed-by-user', 'auth/popup-blocked'].includes(error.code)) {
      toast.error(errorMessage);
    }
  };

  // Main authentication flows
  const handleSubmit = async (values, { setSubmitting }) => {
    console.log('Login attempt:', { email: values.email });
    setSubmitting(true);
    setAuthError(null);
    startLoading();
    
    try {
      // Check if account is auto-deactivated
      const statusCheck = await authService.checkAccountStatus(values.email);
      console.log('Account status check result:', statusCheck);
      
      if (statusCheck.exists && statusCheck.isAutoDeactivated) {
        console.log('Account is auto-deactivated:', statusCheck);
        
        // Store deactivation info
        setDeactivationInfo({
          email: values.email,
          deactivatedAt: statusCheck.deactivatedAt,
          tokenExpired: statusCheck.tokenExpired
        });
        
        // Try login to trigger notification (expect error)
        try {
          await authService.login(values.email, values.password);
        } catch (loginError) {
          console.log('Login attempt on deactivated account (for notification):', loginError.message);
        }
        
        // Handle deactivated account flow
        await handleAutoDeactivatedAccount(values.email);
        return;
      }
      
      // Normal login flow
      const result = await contextLogin(values.email, values.password);
      console.log('Login result:', result);
      
      // Check if the login automatically reactivated an account
      if (result && result.wasReactivated) {
        await handleReactivatedAccount(result);
        return;
      }
      
      // Handle login failures
      if (!result || !result.success) {
        const errorMessage = result?.message || 'Login failed. Please try again.';
        toast.error(errorMessage);
        return;
      }
      
      if (!result.user) {
        toast.error('Invalid response from server');
        return;
      }
      
      // Check verification status
      console.log('Checking verification status:', {
        userEmail: result.user.email,
        explicitVerification: !!result.isVerified,
        userVerification: !!result.user.isVerified,
        requireVerification: !!result.requireVerification
      });
      
      // Redirect to verification if required
      if (result.requireVerification === true) {
        console.log('Server explicitly requires verification');
        handleVerificationRequired({
          userId: result.user.id || result.userId,
          email: values.email,
          message: result.message
        });
        return;
      }
      
      // Normal successful login flow
      console.log('User considered verified, proceeding with login');
      const userData = storeUserData(result.user);
      showSuccessToast(userData);
      navigateAfterAuth(userData);
      
    } catch (error) {
      console.error('Login submission error:', error);
      setAuthError(error.message || 'Authentication failed');
      toast.error(error.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
      stopLoading();
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      setShowRedirectOption(false);
      startLoading();

      console.log('Starting Google sign-in attempt');
      const result = await contextGoogleSignIn();
      console.log('Google sign-in result received:', result);

      if (result && result.email) {
        // Check account status first
        const statusCheck = await authService.checkAccountStatus(result.email);
        console.log('Account status check result:', statusCheck);

        if (statusCheck.exists && statusCheck.isAutoDeactivated) {
          await handleDeactivatedAccount(result.email, statusCheck);
          return;
        }

        if (result.wasReactivated) {
          await handleReactivatedAccount(result);
          return;
        }
      }

      if (result?.requireVerification) {
        handleVerificationRequired(result);
        return;
      }

      if (result?.success) {
        await handleSuccessfulSignIn(result);
        return;
      }

      throw new Error(result?.message || 'Google authentication failed');

    } catch (error) {
      console.error('Google sign-in error:', error);
      handleGoogleSignInError(error);
    } finally {
      stopLoading();
    }
  };

  const handleGoogleRedirectSignIn = async () => {
    try {
      setAuthError(null);
      startLoading();
      
      toast.info("Redirecting to Google sign-in...");
      
      // Use the redirect method instead of popup
      await authService.googleSignInWithRedirect();
      
      // This function will redirect the browser, so we won't reach the code below
      // The result will be handled when the user returns to the app
      
    } catch (error) {
      console.error('Google redirect sign-in error:', error);
      setAuthError(error.message || 'Google sign-in redirect failed');
      toast.error(error.message || 'Google sign-in redirect failed');
      stopLoading();
    }
  };

  return {
    isLoading,
    authError,
    handleSubmit,
    handleGoogleSignIn,
    handleGoogleRedirectSignIn,
    showRedirectOption,
    initialValues,
    validationSchema,
    // Account reactivation props
    isAutoDeactivated,
    recoveryEmail,
    setRecoveryEmail,
    handleRequestReactivation,
    deactivationInfo
  };
};