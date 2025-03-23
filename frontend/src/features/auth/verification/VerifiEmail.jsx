import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { useSnackbar } from '@shared/index';
import { useAuth } from '@context/AuthContext';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useSnackbar();
  const { verifyEmail, resendVerificationCode, isLoading } = useAuth();
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [attempts, setAttempts] = useState(0);

  // Data extraction with fallback
  const stateData = location.state || {};
  const urlUserId = searchParams.get('userId');
  const urlEmail = searchParams.get('email');
  
  const userId = stateData.userId || urlUserId || '';
  const email = stateData.email || urlEmail || '';
  const provider = stateData.provider || 'email';

  // Countdown effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Verification handler with improved auth storage
  const handleVerification = async (e) => {
    if (e) e.preventDefault();
    
    // Basic validation
    if (!verificationCode) {
      toast.error('Please enter a verification code');
      return;
    }
    
    setIsSubmitting(true);
  
    try {
      console.log('Verification attempt:', {
        userId,
        email,
        verificationCode,
        attempts: attempts + 1
      });
      
      setAttempts(prev => prev + 1);
      
      const response = await verifyEmail(userId, verificationCode);
      
      if (response?.success) {
        // Double-check localStorage has token before navigation
        const hasToken = localStorage.getItem('authToken');
        const hasUser = localStorage.getItem('user');
        
        console.log('Pre-navigation check:', { hasToken, hasUser });
        
        // If we still don't have a token, try to save it again as a fallback
        // Your backend includes accessToken in the user object
        if (!hasToken && response.user?.accessToken) {
          localStorage.setItem('authToken', response.user.accessToken);
          console.log('Saved token in component as fallback');
        }
        
        // If we don't have user data, save it as fallback
        if (!hasUser && response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          console.log('Saved user in component as fallback');
        }
        
        toast.success('Email verified successfully!');
        
        // Increased delay to ensure localStorage is updated
        setTimeout(() => {
          // Final check before navigation
          if (!localStorage.getItem('authToken') || !localStorage.getItem('user')) {
            console.warn('Still missing auth data before navigation!');
          }
          
          // IMPORTANT: Redirect to onboarding page with state
          console.log('Redirecting to onboarding page...');
          navigate('/onboarding', { 
            replace: true,
            state: { 
              verified: true,
              email: email,
              userId: userId,
              message: 'Email verified successfully! Complete your profile to get started.'
            }
          });
        }, 2000);
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      
      const errorMessage = error.message || 'Verification failed';
      
      if (errorMessage.includes('Invalid verification code')) {
        toast.error('Invalid verification code. Please check and try again.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend code handler
  const handleResendCode = async () => {
    try {
      await resendVerificationCode(userId);
      setCountdown(60);
      setAttempts(0);
      toast.success('New verification code sent!');
    } catch (error) {
      toast.error(error.message || 'Failed to resend code');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Verify Your Email
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        {provider === 'google' 
          ? 'Please enter the verification code sent to your Google email'
          : 'Please enter the verification code sent to your email'}
      </Typography>

      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Email: {email || 'your email'}
      </Typography>

      {/* Development mode debug info */}
      {process.env.NODE_ENV === 'development' && (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ display: 'block', mb: 2 }}
        >
          Debug - User ID: {userId || 'none'}
        </Typography>
      )}

      <form onSubmit={handleVerification} noValidate>
        <TextField
          fullWidth
          label="Verification Code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          margin="normal"
          required
          error={attempts > 1}
          helperText={attempts > 1 ? "Multiple incorrect attempts" : ""}
        />

        <Button
          fullWidth
          variant="contained"
          type="submit"
          sx={{ mt: 3 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
              Verifying...
            </>
          ) : 'Verify Email'}
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={handleResendCode}
          disabled={countdown > 0 || isSubmitting}
          sx={{ mt: 2 }}
        >
          {countdown > 0 
            ? `Resend code in ${countdown}s` 
            : 'Resend verification code'}
        </Button>
        
        <Button
          fullWidth
          variant="text"
          onClick={() => navigate('/login')}
          sx={{ mt: 1 }}
          disabled={isSubmitting}
        >
          Return to Login
        </Button>
      </form>
    </Box>
  );
};

export default VerifyEmail;