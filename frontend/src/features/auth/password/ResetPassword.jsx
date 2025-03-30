import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import authService from '../../../services/authService';

// Green theme constants
const theme = {
  primary: '#2e7d32', // Dark green
  primaryLight: '#4caf50', // Medium green
  primaryDark: '#1b5e20', // Deeper green
  success: '#81c784', // Light green
  error: '#e57373', // Light red
  white: '#ffffff',
  gray: '#f5f5f5',
  darkGray: '#757575',
  textPrimary: '#212121',
  textSecondary: '#757575',
};

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract token from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');
    
    if (!tokenFromUrl) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    } else {
      setToken(tokenFromUrl);
    }
  }, [location]);

  // Password validation schema
  const validationSchema = Yup.object({
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
      .required('Required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Required'),
  });

  // Function to check password criteria
  const checkPasswordCriteria = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Calculate password strength percentage
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    
    const criteria = checkPasswordCriteria(password);
    const metCriteria = Object.values(criteria).filter(Boolean).length;
    return (metCriteria / 5) * 100;
  };

  // Handle form submission
  const handleFormSubmit = async (values, { setSubmitting }) => {
    // Reset message/error states
    setError('');
    setMessage('');
    
    // Validate token exists
    if (!token) {
      setError('Missing reset token. Please request a new password reset link.');
      setSubmitting(false);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await authService.resetPassword(token, values.newPassword);
      
      setMessage(response.message || 'Password reset successful!');
      
      // If the backend provides a token for immediate login
      if (response.accessToken) {
        localStorage.setItem('authToken', response.accessToken);
        // Redirect to dashboard after a brief delay
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        // Otherwise redirect to login after a brief delay
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: '16px'
      }}
    >
      <div 
        style={{
          maxWidth: '420px',
          width: '100%',
          backgroundColor: theme.white,
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Green accent top bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            backgroundColor: theme.primary,
          }}
        />
        
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: theme.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: theme.textPrimary 
            }}>EcoPulse</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ 
            fontSize: '22px', 
            fontWeight: 'bold', 
            color: theme.textPrimary,
            margin: 0,
            marginBottom: '6px'
          }}>
            Reset Your Password
          </h2>
          <p style={{ 
            fontSize: '14px', 
            color: theme.textSecondary,
            margin: 0 
          }}>
            Please create a strong password for your account
          </p>
        </div>

        {message && (
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(129, 199, 132, 0.2)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            <div style={{ 
              minWidth: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              backgroundColor: theme.success,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              fontWeight: '500', 
              color: theme.primary 
            }}>{message}</p>
          </div>
        )}

        {error && (
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(229, 115, 115, 0.2)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            <div style={{ 
              minWidth: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              backgroundColor: theme.error,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#d32f2f' 
            }}>{error}</p>
          </div>
        )}

        <Formik
          initialValues={{ newPassword: '', confirmPassword: '' }}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
        >
          {({ values, errors, touched, isSubmitting }) => {
            const passwordCriteria = checkPasswordCriteria(values.newPassword);
            return (
              <Form>
                {/* Password Strength Progress Bar */}
                {values.newPassword && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: theme.textSecondary }}>Password Strength</span>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '500',
                        color: getStrengthColor(calculatePasswordStrength(values.newPassword), theme)
                      }}>
                        {getStrengthLabel(calculatePasswordStrength(values.newPassword))}
                      </span>
                    </div>
                    <div style={{ 
                      height: '6px', 
                      width: '100%', 
                      backgroundColor: '#e0e0e0', 
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${calculatePasswordStrength(values.newPassword)}%`, 
                        backgroundColor: getStrengthColor(calculatePasswordStrength(values.newPassword), theme),
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '16px' }}>
                  <label 
                    htmlFor="newPassword" 
                    style={{ 
                      display: 'block', 
                      marginBottom: '6px', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: theme.textPrimary 
                    }}
                  >
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Field
                      id="newPassword"
                      name="newPassword"
                      type={showPassword.newPassword ? "text" : "password"}
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 14px',
                        fontSize: '14px',
                        borderRadius: '8px',
                        border: `1px solid ${errors.newPassword && touched.newPassword ? theme.error : '#e0e0e0'}`,
                        backgroundColor: theme.white,
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                        outline: 'none',
                      }}
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('newPassword')}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: theme.textSecondary
                      }}
                    >
                      {showPassword.newPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  <ErrorMessage 
                    name="newPassword" 
                    component="div" 
                    style={{ 
                      color: theme.error, 
                      fontSize: '12px', 
                      marginTop: '4px' 
                    }} 
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label 
                    htmlFor="confirmPassword" 
                    style={{ 
                      display: 'block', 
                      marginBottom: '6px', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: theme.textPrimary 
                    }}
                  >
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword.confirmPassword ? "text" : "password"}
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 14px',
                        fontSize: '14px',
                        borderRadius: '8px',
                        border: `1px solid ${errors.confirmPassword && touched.confirmPassword ? theme.error : '#e0e0e0'}`,
                        backgroundColor: theme.white,
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                        outline: 'none',
                      }}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: theme.textSecondary
                      }}
                    >
                      {showPassword.confirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  <ErrorMessage 
                    name="confirmPassword" 
                    component="div" 
                    style={{ 
                      color: theme.error, 
                      fontSize: '12px', 
                      marginTop: '4px' 
                    }} 
                  />
                </div>

                {/* Password criteria checklist */}
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: theme.gray, 
                  borderRadius: '8px', 
                  marginBottom: '24px' 
                }}>
                  <h4 style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: theme.textPrimary, 
                    margin: 0, 
                    marginBottom: '8px' 
                  }}>
                    Password requirements:
                  </h4>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '8px'
                  }}>
                    <PasswordRequirement 
                      met={passwordCriteria.length} 
                      text="At least 8 characters"
                      theme={theme}
                    />
                    <PasswordRequirement 
                      met={passwordCriteria.uppercase} 
                      text="One uppercase letter"
                      theme={theme}
                    />
                    <PasswordRequirement 
                      met={passwordCriteria.lowercase} 
                      text="One lowercase letter"
                      theme={theme}
                    />
                    <PasswordRequirement 
                      met={passwordCriteria.number} 
                      text="One number"
                      theme={theme}
                    />
                    <PasswordRequirement 
                      met={passwordCriteria.special} 
                      text="One special character"
                      theme={theme}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !token}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: !isSubmitting && token ? theme.primary : '#9e9e9e',
                    color: theme.white,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: !isSubmitting && token ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'background-color 0.2s',
                    outline: 'none',
                    marginBottom: '16px',
                    boxShadow: !isSubmitting && token ? '0 2px 8px rgba(46, 125, 50, 0.3)' : 'none',
                  }}
                  onMouseOver={(e) => {
                    if (!isSubmitting && token) {
                      e.currentTarget.style.backgroundColor = theme.primaryDark;
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSubmitting && token) {
                      e.currentTarget.style.backgroundColor = theme.primary;
                    }
                  }}
                >
                  {isSubmitting ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ 
                          animation: 'spin 1s linear infinite',
                          marginRight: '8px'
                        }}
                      >
                        <style>{`
                          @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                          }
                        `}</style>
                        <circle 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                          fill="none" 
                          strokeDasharray="28" 
                          strokeDashoffset="28" 
                        />
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <a 
                    href="/login" 
                    style={{ 
                      color: theme.primary, 
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseOut={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                  >
                    Back to Login
                  </a>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

// Helper functions for password strength
const getStrengthColor = (percentage, theme) => {
  if (percentage <= 20) return '#e57373'; // weak - red
  if (percentage <= 40) return '#ffb74d'; // fair - orange
  if (percentage <= 60) return '#ffd54f'; // moderate - yellow
  if (percentage <= 80) return '#aed581'; // good - light green
  return theme.primary; // strong - primary green
};

const getStrengthLabel = (percentage) => {
  if (percentage <= 20) return 'Weak';
  if (percentage <= 40) return 'Fair';
  if (percentage <= 60) return 'Moderate';
  if (percentage <= 80) return 'Good';
  return 'Strong';
};

// Password requirement component
const PasswordRequirement = ({ met, text, theme }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center',
    fontSize: '12px',
    color: met ? theme.primary : theme.textSecondary,
    fontWeight: met ? '500' : '400',
  }}>
    <div style={{ 
      width: '14px', 
      height: '14px', 
      borderRadius: '50%', 
      backgroundColor: met ? theme.primary : 'transparent',
      border: met ? 'none' : `1px solid ${theme.textSecondary}`,
      marginRight: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      {met && (
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
    </div>
    {text}
  </div>
);

export default ResetPassword;