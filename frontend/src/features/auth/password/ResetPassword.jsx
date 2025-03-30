import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
// Removed unused 'resetPassword' import, keeping 'authService'
import authService from '../../../services/authService'; 

// --- Theme constants remain the same ---
const theme = {
  primary: '#2e7d32', // Dark green
  primaryLight: '#4caf50', // Medium green
  primaryDark: '#1b5e20', // Deeper green
  success: '#81c784', // Light green // Adjusted for better contrast with white text
  error: '#e57373', // Light red
  white: '#ffffff',
  gray: '#f5f5f5',
  darkGray: '#757575',
  textPrimary: '#212121',
  textSecondary: '#757575',
};

// --- Helper functions for password strength remain the same ---
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

// --- Password requirement component remains the same ---
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


// --- Main ResetPassword Component ---
const ResetPassword = () => {
  // --- State hooks remain the same ---
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmittingState, setIsSubmittingState] = useState(false); // Renamed to avoid conflict with Formik's isSubmitting
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480); // Use a slightly larger breakpoint maybe? e.g., 640

  const navigate = useNavigate();
  const location = useLocation();

  // --- useEffect hooks for resize, meta tag, and token extraction remain the same ---
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640); // Example using 640px breakpoint
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => { // Viewport Meta Tag - consider if truly needed here vs index.html
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        let originalContent = viewportMeta ? viewportMeta.content : null;
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.getElementsByTagName('head')[0].appendChild(viewportMeta);
        }
        // Apply stricter viewport settings
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';

        return () => { // Cleanup function
            const currentMeta = document.querySelector('meta[name="viewport"]');
            if (currentMeta) {
                if (originalContent) {
                    currentMeta.content = originalContent; // Restore original if it existed
                } else if (!originalContent && currentMeta === viewportMeta) {
                    // Only remove if *this* instance created it and it wasn't there before
                    currentMeta.remove();
                } else {
                    // Fallback to default if original wasn't tracked properly or tag changed
                     currentMeta.content = 'width=device-width, initial-scale=1.0';
                }
            }
        };
    }, []);


  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');
    if (!tokenFromUrl) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    } else {
      setToken(tokenFromUrl);
    }
  }, [location]);


  // --- Validation schema remains the same ---
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

  // --- Helper functions (checkPasswordCriteria, togglePasswordVisibility, calculatePasswordStrength) remain the same ---
    const checkPasswordCriteria = (password) => {
      return {
          length: password.length >= 8,
          uppercase: /[A-Z]/.test(password),
          lowercase: /[a-z]/.test(password),
          number: /[0-9]/.test(password),
          special: /[^A-Za-z0-9]/.test(password),
      };
    };

    const togglePasswordVisibility = (field) => {
      setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const calculatePasswordStrength = (password) => {
        if (!password) return 0;
        const criteria = checkPasswordCriteria(password);
        const metCriteria = Object.values(criteria).filter(Boolean).length;
        // Assign weight? e.g., length counts more? For now, simple count.
        return Math.min((metCriteria / 5) * 100, 100); // Cap at 100%
    };


  // --- Handle form submission remains largely the same ---
  const handleFormSubmit = async (values, { setSubmitting }) => {
    setError('');
    setMessage('');
    if (!token) {
      setError('Missing reset token. Please use the link provided in your email.');
      setSubmitting(false);
      return;
    }

    setIsSubmittingState(true); // Use component's submitting state for UI disabling

    try {
      const response = await authService.resetPassword(token, values.newPassword);
      setMessage(response.message || 'Password reset successful!');
      if (response.accessToken) {
        localStorage.setItem('authToken', response.accessToken);
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setIsSubmittingState(false); // Use component's submitting state
      setSubmitting(false); // Signal Formik submission end
    }
  };

  // --- JSX Rendering ---
  return (
    // Outer container styling remains the same
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: isMobile ? '12px' : '16px',
        boxSizing: 'border-box'
      }}
    >
      {/* Card container styling remains the same */}
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
          backgroundColor: theme.white,
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          padding: isMobile ? '20px' : '24px', // Slightly more padding
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Top accent bar remains the same */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', backgroundColor: theme.primary }} />
        
        {/* Logo remains the same */}
         <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          {/* ... logo svg and span ... */}
           <div style={{ display: 'flex', alignItems: 'center' }}>
               <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px' }}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                 </svg>
               </div>
               <span style={{ fontSize: '20px', fontWeight: 'bold', color: theme.textPrimary }}>EcoPulse</span>
             </div>
         </div>

        {/* Header text remains the same */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: theme.textPrimary, margin: 0, marginBottom: '6px' }}>Reset Your Password</h2>
            <p style={{ fontSize: '14px', color: theme.textSecondary, margin: 0 }}>Please create a strong password for your account</p>
        </div>

        {/* Message and Error display remain the same */}
        {message && ( /* ... success message div ... */
           <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(129, 199, 132, 0.2)', marginBottom: '16px', display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '20px', height: '20px', borderRadius: '50%', backgroundColor: theme.success, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px', flexShrink: 0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: theme.primary }}>{message}</p>
            </div>
        )}
        {error && ( /* ... error message div ... */
             <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(229, 115, 115, 0.2)', marginBottom: '16px', display: 'flex', alignItems: 'flex-start' }}>
                 <div style={{ minWidth: '20px', height: '20px', borderRadius: '50%', backgroundColor: theme.error, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px', flexShrink: 0 }}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </div>
                 <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#d32f2f', wordBreak: 'break-word' }}>{error}</p>
               </div>
        )}

        {/* --- Formik Form --- */}
        <Formik
          initialValues={{ newPassword: '', confirmPassword: '' }}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
          validateOnChange // Provide real-time feedback
          validateOnBlur
        >
          {/* Use Formik's 'isSubmitting' for button state, not local state */}
          {({ values, errors, touched, isSubmitting }) => {
            const passwordCriteria = checkPasswordCriteria(values.newPassword);
            const strengthPercent = calculatePasswordStrength(values.newPassword);

            return (
              <Form>
                 {/*FIX: Removed the stray closing braces here */}

                 {/* Password Strength Progress Bar - Only show when typing starts */}
                 {values.newPassword.length > 0 && (
                   <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                       <span style={{ fontSize: '12px', color: theme.textSecondary }}>Password Strength</span>
                       <span style={{ fontSize: '12px', fontWeight: '500', color: getStrengthColor(strengthPercent, theme) }}>
                         {getStrengthLabel(strengthPercent)}
                       </span>
                     </div>
                     <div style={{ height: '6px', width: '100%', backgroundColor: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' }}>
                       <div style={{ height: '100%', width: `${strengthPercent}%`, backgroundColor: getStrengthColor(strengthPercent, theme), borderRadius: '3px', transition: 'width 0.3s ease' }} />
                     </div>
                   </div>
                 )}


                {/* New Password Field */}
                <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
                  <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: theme.textPrimary }}>
                    New Password
                  </label>
                  {/* FIX: Added position: 'relative' here */}
                  <div style={{ position: 'relative' }}>
                    <Field
                      id="newPassword"
                      name="newPassword"
                      type={showPassword.newPassword ? "text" : "password"}
                      style={{
                        width: '100%', padding: '10px 40px 10px 14px', fontSize: isMobile ? '16px' : '14px',
                        borderRadius: '8px', border: `1px solid ${errors.newPassword && touched.newPassword ? theme.error : '#e0e0e0'}`,
                        backgroundColor: theme.white, boxSizing: 'border-box', transition: 'border-color 0.2s', outline: 'none',
                      }}
                      placeholder="Enter your new password"
                    />
                    {/* Show/Hide Button - styling remains the same */}
                    <button type="button" onClick={() => togglePasswordVisibility('newPassword')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: isMobile ? '8px' : '4px', color: theme.textSecondary, WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
                      {showPassword.newPassword ? ( /* eye-off svg */ <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : ( /* eye svg */ <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                  <ErrorMessage name="newPassword" component="div" style={{ color: theme.error, fontSize: '12px', marginTop: '4px' }} />
                </div>

                {/* Confirm Password Field */}
                <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
                  <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: theme.textPrimary }}>
                    Confirm Password
                  </label>
                   {/* FIX: Added position: 'relative' here */}
                  <div style={{ position: 'relative' }}>
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword.confirmPassword ? "text" : "password"}
                      style={{
                         width: '100%', padding: '10px 40px 10px 14px', fontSize: isMobile ? '16px' : '14px',
                         borderRadius: '8px', border: `1px solid ${errors.confirmPassword && touched.confirmPassword ? theme.error : '#e0e0e0'}`,
                         backgroundColor: theme.white, boxSizing: 'border-box', transition: 'border-color 0.2s', outline: 'none',
                      }}
                      placeholder="Confirm your new password"
                    />
                    {/* Show/Hide Button - styling remains the same */}
                    <button type="button" onClick={() => togglePasswordVisibility('confirmPassword')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: isMobile ? '8px' : '4px', color: theme.textSecondary, WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
                     {showPassword.confirmPassword ? ( /* eye-off svg */ <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                     ) : ( /* eye svg */ <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                     )}
                    </button>
                  </div>
                  <ErrorMessage name="confirmPassword" component="div" style={{ color: theme.error, fontSize: '12px', marginTop: '4px' }} />
                </div>

                {/* Password criteria checklist - layout remains the same */}
                 <div style={{ padding: '12px', backgroundColor: theme.gray, borderRadius: '8px', marginBottom: '24px' }}>
                   <h4 style={{ fontSize: '13px', fontWeight: '600', color: theme.textPrimary, margin: 0, marginBottom: '8px' }}>Password requirements:</h4>
                   <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}> {/* Slightly wider minmax */}
                     <PasswordRequirement met={passwordCriteria.length} text="At least 8 characters" theme={theme} />
                     <PasswordRequirement met={passwordCriteria.uppercase} text="One uppercase letter" theme={theme} />
                     <PasswordRequirement met={passwordCriteria.lowercase} text="One lowercase letter" theme={theme} />
                     <PasswordRequirement met={passwordCriteria.number} text="One number" theme={theme} />
                     <PasswordRequirement met={passwordCriteria.special} text="One special character" theme={theme} />
                   </div>
                 </div>


                {/* Submit Button - Use Formik's 'isSubmitting' */}
                <button
                  type="submit"
                  // Use Formik's isSubmitting and component's token state
                  disabled={isSubmitting || !token || isSubmittingState} 
                  style={{
                     width: '100%', padding: isMobile ? '14px' : '12px',
                     backgroundColor: !(isSubmitting || !token || isSubmittingState) ? theme.primary : '#9e9e9e', // Grey when disabled
                     color: theme.white, border: 'none', borderRadius: '8px',
                     fontSize: isMobile ? '16px' : '15px', fontWeight: '500',
                     cursor: !(isSubmitting || !token || isSubmittingState) ? 'pointer' : 'not-allowed', // Adjust cursor
                     display: 'flex', justifyContent: 'center', alignItems: 'center',
                     transition: 'background-color 0.2s, box-shadow 0.2s',
                     outline: 'none', marginBottom: '12px',
                     boxShadow: !(isSubmitting || !token || isSubmittingState) ? '0 2px 8px rgba(46, 125, 50, 0.3)' : 'none',
                     WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation'
                  }}
                  // Use CSS :hover/:active if possible, fallback to JS if needed with inline styles
                  onMouseOver={(e) => { if (!(isSubmitting || !token || isSubmittingState)) { e.currentTarget.style.backgroundColor = theme.primaryDark; }}}
                  onMouseOut={(e) => { if (!(isSubmitting || !token || isSubmittingState)) { e.currentTarget.style.backgroundColor = theme.primary; }}}
                  onTouchStart={(e) => { if (!(isSubmitting || !token || isSubmittingState)) { e.currentTarget.style.backgroundColor = theme.primaryDark; }}}
                  onTouchEnd={(e) => { if (!(isSubmitting || !token || isSubmittingState)) { e.currentTarget.style.backgroundColor = theme.primary; }}}
                >
                  {/* Show loading state based on component state OR formik state */}
                  {isSubmitting || isSubmittingState ? ( 
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                         {/* Simple spinner SVG */}
                         <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} fill={theme.white}>
                           <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
                           <path d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z"/>
                           <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                         </svg>
                         Processing...
                       </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>

                {/* Back to Login Link remains the same */}
                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <a href="/login" style={{ color: theme.primary, textDecoration: 'none', fontSize: '13px', fontWeight: '500', padding: '8px', display: 'inline-block', WebkitTapHighlightColor: 'transparent' }} onMouseOver={(e) => { e.currentTarget.style.textDecoration = 'underline'; }} onMouseOut={(e) => { e.currentTarget.style.textDecoration = 'none'; }}>
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

export default ResetPassword;