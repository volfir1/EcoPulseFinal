// register/registerHook.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar, useLoader } from '@shared/index';
import authService from '../../../../services/authService';
import { calculatePasswordStrength } from './passwordUtils';
import verificationStore from '../../utils/verificationStore';

export const useRegister = () => {
  const navigate = useNavigate();
  const toast = useSnackbar();
  const { startLoading, stopLoading } = useLoader();
  
  // Password visibility states
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: 'empty',
    color: 'gray-300',
    feedback: 'Enter a password'
  });

  // Common verification navigation function for new registrations
  const navigateToVerification = (userId, email, provider) => {
    // Save verification data to store for persistence
    verificationStore.saveVerificationData({
      userId,
      email,
      isNewRegistration: true,
      provider,
      returnTo: '/dashboard'
    });
    
    // Navigate to verification page
    navigate('/verify-email', {
      state: {
        userId,
        email,
        isNewRegistration: true,
        provider,
        returnTo: '/dashboard'
      }
    });
  };

  // Handle normal form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    startLoading();
    setSubmitting(true);
    
    try {
      // Use the authService.register method
      const result = await authService.register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.phone || ''
      });

      if (result.success) {
        const userId = result.userId || result.user?.id;
        if (!userId) {
          throw new Error("Registration successful but user ID is missing");
        }
        
        // For new registrations, always navigate to verification
        toast.success('Registration successful! Please verify your email.');
        navigateToVerification(userId, values.email, 'email');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      stopLoading();
      setSubmitting(false);
    }
  };

  // Google Sign Up function
  const handleGoogleSignUp = async () => {
    startLoading();
    
    try {
      // Use the authService method
      const result = await authService.googleSignIn();
      
      // Check if verification is required (for new accounts only)
      if (result.requireVerification) {
        const userId = result.userId || result.user?.id;
        const email = result.email || result.user?.email;
        
        if (!userId || !email) {
          throw new Error("Google sign-up successful but required user data is missing");
        }
        
        // Show success message for new accounts
        toast.success('Google sign-up successful! Please verify your email.');
        
        // Navigate to verification for new accounts
        navigateToVerification(userId, email, 'google');
      } else {
        // For returning users with verified accounts, go straight to dashboard
        toast.success('Google sign-in successful!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      }
    } catch (error) {
      console.error('Google sign-up error:', error);
      
      // Handle different Firebase Auth errors
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            toast.error('Sign-up canceled. You closed the popup.');
            break;
          case 'auth/popup-blocked':
            toast.error('Sign-up popup was blocked by your browser. Please enable popups.');
            break;
          case 'auth/account-exists-with-different-credential':
            toast.error('An account already exists with the same email address but different sign-in credentials.');
            break;
          default:
            toast.error(`Google sign-up failed: ${error.message}`);
        }
      } else {
        toast.error(error.message || 'Google sign-up failed. Please try again.');
      }
    } finally {
      stopLoading();
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(prev => !prev);
  };

  // Password strength handler
  const handlePasswordChange = (e, handleChange) => {
    const password = e.target.value;
    setPasswordStrength(calculatePasswordStrength(password));
    
    // Make sure Formik also updates the field
    if (handleChange) {
      handleChange(e);
    }
  };

  return {
    formValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    },
    passwordVisibility: {
      passwordVisible,
      confirmPasswordVisible
    },
    passwordStrength,
    formHandlers: {
      handleSubmit,
      handleGoogleSignUp,
      togglePasswordVisibility,
      toggleConfirmPasswordVisibility,
      handlePasswordChange
    }
  };
};