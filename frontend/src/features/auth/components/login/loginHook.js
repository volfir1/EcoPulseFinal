// Refactored loginHook.js with improved modularity and organization

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext'; // Assuming path is correct
import * as Yup from 'yup';
import { useSnackbar } from '@shared/index'; // Assuming path is correct
import authService from '@services/authService'; // Assuming path is correct

/**
 * Custom hook for handling login logic, including email/password,
 * Google Sign-In, and account deactivation/reactivation flows.
 */
export const useLogin = () => {
  // --- Hooks ---
  const { login: contextLogin, googleSignIn: contextGoogleSignIn, setUser, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useSnackbar();

  // --- State Management ---
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null); // Stores error messages for display
  const [recoveryEmail, setRecoveryEmail] = useState(''); // For the reactivation email input
  const [showRedirectOption, setShowRedirectOption] = useState(false); // For Google redirect fallback
  const [deactivationInfo, setDeactivationInfo] = useState(null); // Detailed info for deactivated accounts
  const [isDeactivated, setIsDeactivated] = useState(false); // Flag if current focus is a deactivated account

  // --- Validation Schema (Formik) ---
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
  });

  // --- Formik Initial Values ---
  // Updated via useEffect based on navigation state
  const [initialFormValues, setInitialFormValues] = useState({
    email: '',
    password: ''
  });


  // --- Effect to Sync with Location State ---
  // Handles pre-filling form or setting deactivated state if navigated from other flows
  useEffect(() => {
    let emailFromState = '';
    let shouldSetDeactivated = false;
    let newDeactivationInfo = null;

    if (location.state) {
      const { email, isDeactivated: locIsDeactivated, isAutoDeactivated, message, emailSent, hasError, lockoutRemaining } = location.state;

      if (email) {
        emailFromState = email;
        setRecoveryEmail(email); // Keep recovery separate in case form email is cleared
      }

      if (locIsDeactivated) {
        shouldSetDeactivated = true;
        newDeactivationInfo = {
          email: email || '',
          isAuto: isAutoDeactivated ?? false,
          message: message || "Your account is deactivated.",
          emailSent: emailSent ?? false,
          hasError: hasError ?? false,
          lockoutRemaining: lockoutRemaining || 0
        };
      }
    }
    // Update Formik initial values state *once*
    setInitialFormValues(prev => ({ ...prev, email: emailFromState }));
    // Update deactivation state
    setIsDeactivated(shouldSetDeactivated);
    setDeactivationInfo(newDeactivationInfo);

  }, [location.state, navigate]); // Depend on location.state


  // --- Helper Functions ---
  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  const showSuccessToast = (userData) => {
    toast.success(`Welcome back, ${userData?.firstName || 'User'}!`);
  };

  // --- Store User Data (Core Auth Logic) ---
  const storeUserData = (user, accessToken) => {
    if (!user || !user.email) {
      console.error("storeUserData called with invalid user object:", user);
      return null; // Return null or handle appropriately
    }
    const verifiedUser = {
      id: user.id || '', // Ensure ID exists
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email, // Already checked
      role: user.role || 'user',
      ...user, // Spread other user properties
      isVerified: true, // Assume verified at this stage
      // Ensure token is stored, prioritizing function arg, then user obj, then localStorage (fallback)
      accessToken: accessToken || user.accessToken || localStorage.getItem('authToken') || ''
    };
    localStorage.setItem('user', JSON.stringify(verifiedUser));
    if (verifiedUser.accessToken) {
      localStorage.setItem('authToken', verifiedUser.accessToken);
    } else {
      localStorage.removeItem('authToken'); // Clear if no token provided
    }
    setUser(verifiedUser); // Update auth context state
    setIsAuthenticated(true); // Update auth context state
    return verifiedUser;
  };

  // --- Navigate After Auth (Core Navigation Logic) ---
  const navigateAfterAuth = (user) => {
    const role = user?.role || 'user'; // Default to 'user' role
    const targetPath = role === 'admin' ? '/admin/dashboard' : '/dashboard';
    console.log(`Navigating ${role} to ${targetPath}`);
    navigate(targetPath, { replace: true, state: {} }); // Navigate and clear location state
  };


  // --- Reactivation Flow Handlers ---

  /**
   * Handles the process of requesting a reactivation email for a deactivated account.
   * Manages loading state, displays toasts, updates deactivationInfo state, and navigates.
   * @param {string} email - The email of the account to reactivate.
   * @param {boolean} isAuto - Whether the deactivation was automatic (due to inactivity).
   * @param {object|null} initialStatusCheck - Optional result from a prior checkAccountStatus call.
   */
  const handleDeactivatedAccountFlow = async (email, isAuto, initialStatusCheck = null) => {
    console.log(`Handling deactivated account flow (Auto: ${isAuto}) for:`, email);
    startLoading();

    setIsDeactivated(true); // Ensure UI reflects deactivation mode
    setRecoveryEmail(email);

    // Consolidate info, prioritize fresh check results for lockout
    const lockoutRem = initialStatusCheck?.lockoutRemaining || 0;
    const currentInfo = {
      email, isAuto,
      deactivatedAt: initialStatusCheck?.deactivatedAt,
      tokenExpired: initialStatusCheck?.tokenExpired,
      lockoutRemaining: lockoutRem,
      message: `Account deactivated. ${lockoutRem > 0 ? 'Reactivation locked.' : 'Sending reactivation email...'}`,
      emailSent: false, hasError: false
    };
    setDeactivationInfo(currentInfo);

    // --- Lockout Check ---
    if (lockoutRem > 0) {
      const waitMinutes = Math.ceil(lockoutRem / 60);
      toast.warn(`Too many reactivation attempts. Please wait ${waitMinutes} minutes.`);
      // Optionally navigate back to login immediately, passing state
      // navigate('/login', { state: { ...currentInfo, isDeactivated: true }, replace: true });
      stopLoading();
      return; // Stop if locked out
    }

    // --- Request Reactivation Email ---
    const reason = isAuto ? "inactivity" : "manual action";
    toast.info(`Account deactivated due to ${reason}. Sending reactivation email...`);

    try {
      const reactivationResult = await authService.requestReactivation(email);
      console.log('Reactivation request response:', reactivationResult);

      if (reactivationResult.success) {
        toast.success("Reactivation email sent. Please check your inbox (and spam folder).");
        currentInfo.emailSent = true;
        currentInfo.message = `Reactivation link sent to ${email}. Check your inbox.`;
        setDeactivationInfo({ ...currentInfo });
        // Stay on login page or navigate, passing updated state
        // navigate('/login', { state: { ...currentInfo, isDeactivated: true }, replace: true }); // Example nav
      } else {
        toast.error(reactivationResult.message || "Problem sending reactivation email.");
        currentInfo.hasError = true;
        currentInfo.message = reactivationResult.message || "Failed to send email. Try again?";
        setDeactivationInfo({ ...currentInfo });
        // Optionally navigate to specific reactivation page on error
        // navigate('/reactivate-account', { state: { ...currentInfo, isDeactivated: true }, replace: true });
      }
    } catch (error) {
      console.error('Critical error during reactivation request:', error);
      toast.error("An unexpected server error occurred. Please try again later.");
      currentInfo.hasError = true;
      currentInfo.message = "Technical issue sending email. Please try again later.";
      setDeactivationInfo({ ...currentInfo });
      // Optionally navigate
      // navigate('/reactivate-account', { state: { ...currentInfo, isDeactivated: true }, replace: true });
    } finally {
      stopLoading();
    }
  };

  /**
   * Handles the outcome after a user clicks a reactivation link.
   * Assumes this is called from a component handling the reactivation token.
   * @param {object} result - The result object from authService.recoverAccount.
   */
  const handleReactivatedAccount = async (result) => {
    stopLoading();
    if (!result?.success || !result?.user || !result?.user.email) {
      toast.error(result?.message || 'Reactivation failed or user data missing. Please try logging in.');
      navigate('/login', { replace: true, state: { email: result?.user?.email || recoveryEmail } });
      return;
    }
    const userData = storeUserData(result.user, result.token || result.user.accessToken);
    if (userData) {
      toast.success(result.message || "Account reactivated successfully!");
      navigateAfterAuth(userData);
    } else {
      // Handle case where storeUserData failed
      toast.error('Reactivation succeeded but failed to log in. Please try logging in manually.');
      navigate('/login', { replace: true, state: { email: result.user.email } });
    }
  };

  /**
   * Triggered by a manual user action (e.g., clicking "Resend Link").
   * @param {string} emailToRequest - The email to request reactivation for.
   */
  const handleRequestReactivation = async (emailToRequest) => {
    const targetEmail = emailToRequest || recoveryEmail;
    if (!targetEmail) {
      toast.error("Email address is required to request reactivation.");
      return;
    }
    console.log("Manual request reactivation triggered for:", targetEmail);
    // Check status again before sending to get latest lockout info
    startLoading();
    let statusCheck = null;
    try {
      statusCheck = await authService.checkAccountStatus(targetEmail);
    } catch (error) {
      console.error("Failed to check status before manual reactivation request:", error);
      toast.error("Failed to check account status. Please try again.");
      stopLoading();
      return;
    } finally {
      // Don't stopLoading here if status check succeeded, handleDeactivatedAccountFlow will do it
      if (!statusCheck) stopLoading();
    }

    // Proceed with the flow, using the latest status check result
    const isCurrentlyAuto = statusCheck?.isAutoDeactivated ?? deactivationInfo?.isAuto ?? false;
    await handleDeactivatedAccountFlow(targetEmail, isCurrentlyAuto, statusCheck);
  };


  // --- Authentication Handlers ---

  /** Handles navigation to the email verification page */
  const handleVerificationRequired = (result) => {
    stopLoading();
    const userId = result?.userId || result?.user?.id;
    const userEmail = result?.email || result?.user?.email;
    if (!userId || !userEmail) {
      console.error("Missing userId or email for verification redirection", result);
      toast.error("Verification error. Please try logging in again.");
      setAuthError("Missing user details for verification.");
      return;
    }
    navigate('/verify-email', { state: { userId, email: userEmail }, replace: true });
    toast.info(result?.message || "Please check your email to verify your account.");
  };

  /** Handles successful sign-in/reactivation final steps */
  const handleSuccessfulSignIn = async (result) => {
    stopLoading();
    if (!result?.user || !result?.user?.email) {
      console.error('Invalid user data on successful sign-in:', result);
      toast.error('Authentication error: Failed to load user details.');
      setAuthError('Incomplete user data received.');
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
      return;
    }
    const userData = storeUserData(result.user, result.token || result.user.accessToken);
    if (userData) {
      showSuccessToast(userData);
      navigateAfterAuth(userData);
    } else {
      toast.error('Login succeeded but failed to store session. Please try again.');
      setAuthError('Failed to store user session.');
    }
  };

  /** Handles errors specifically from Google Sign-In attempts */
  const handleGoogleSignInError = (error) => {
    stopLoading();
    console.error('Google sign-in error handler:', error);
    let errorMessage = error?.message || 'Google sign-in failed';

    if (error?.code === 'auth/popup-closed-by-user' || error?.message?.includes('cancelled')) {
      errorMessage = 'Sign-in process was cancelled.';
      // Don't show error toast for cancellation
    } else if (error?.code === 'auth/popup-blocked' || error?.message?.includes('popup was blocked')) {
      errorMessage = 'Sign-in popup blocked. Please enable popups or try the redirect option.';
      toast.error(errorMessage);
      setShowRedirectOption(true);
    } else if (error?.message?.includes('Network Error') || error?.code === 'auth/network-request-failed') {
      errorMessage = 'Network error during sign-in. Please check your connection.';
      toast.error(errorMessage);
    } else if (error?.message?.includes('ACCOUNT_DEACTIVATED')) {
      // This should be handled *before* full sign-in, but acts as fallback
      const emailOnError = error?.email || recoveryEmail;
      errorMessage = error.message;
      if (emailOnError && !isDeactivated) { // Avoid duplicate flows
        handleDeactivatedAccountFlow(emailOnError, error?.isAutoDeactivated ?? false);
        return; // Stop processing here, flow handles UI
      } else if (!emailOnError) {
        toast.error("Account deactivated, but email is unknown.");
      }
      // If already deactivated, flow is likely running, so do nothing more
    } else {
      // Generic error for other cases
      toast.error(errorMessage);
    }
    setAuthError(errorMessage); // Set error state for display
  };


  // --- Main Authentication Flows ---

  /** Handles Email/Password form submission */
  const handleSubmit = async (values, { setSubmitting }) => {
    console.log('Manual Login attempt:', { email: values.email });
    setSubmitting(true);
    setAuthError(null);
    setIsDeactivated(false);
    setDeactivationInfo(null);
    startLoading();

    let statusCheck = null;
    try {
      // Step 1: Check account status
      statusCheck = await authService.checkAccountStatus(values.email);
      console.log('Account status check result:', statusCheck);

      // Destructure flags for checks
      const {
        exists = false, isActive = false, isAutoDeactivated = false,
        isGoogleLinked = false, hasPasswordSet = false // <-- These are crucial
      } = statusCheck;

      // Step 2: Handle Deactivation
      if (exists && !isActive) {
        console.log(`Account is deactivated (Auto: ${isAutoDeactivated}). Triggering reactivation flow.`);
        await handleDeactivatedAccountFlow(values.email, isAutoDeactivated, statusCheck);
        setSubmitting(false);
        return; // Stop flow
      }

      // *** Step 3: Handle Google-Only Account Attempting Password Login ***
      if (exists && isActive && isGoogleLinked && !hasPasswordSet) {
        console.log('Password login attempt for Google-only account rejected.');
        const errMsg = "This account uses Google Sign-In. Please use the 'Sign in with Google' button.";
        setAuthError(errMsg);
        toast.error(errMsg);
        stopLoading();
        setSubmitting(false);
        return; // Stop flow
      }

      // Step 4: Proceed with Password Login via Context
      console.log('Account status OK for password login, calling contextLogin.');
      const result = await contextLogin(values.email, values.password);
      console.log('Login result from context:', result);

      // Step 5: Handle Implicit Reactivation during login
      if (result?.wasReactivated) {
        console.log('Account implicitly reactivated during login.');
        await handleReactivatedAccount(result);
        setSubmitting(false);
        return;
      }

      // Step 6: Handle Login Failure (e.g., wrong password)
      if (!result?.success) {
        const errorMessage = result?.message || 'Login failed. Check email/password.';
        console.error("Login failed:", errorMessage, result);
        setAuthError(errorMessage);
        toast.error(errorMessage);
        stopLoading();
        setSubmitting(false);
        return;
      }

      // Step 7: Handle Missing User Data after successful call
      if (!result.user || !result.user.email) {
        console.error('Login succeeded but user data missing:', result);
        toast.error('Login error: Failed to load user details.');
        setAuthError('Invalid user data from server.');
        stopLoading();
        setSubmitting(false);
        return;
      }

      // Step 8: Handle Email Verification Requirement
      const needsVerification = result.requireVerification === true || (result.user?.isVerified === false);
      if (needsVerification) {
        console.log('Email verification required.');
        handleVerificationRequired({ userId: result.user.id, email: result.user.email, message: result.message });
        setSubmitting(false);
        return;
      }

      // Step 9: Successful Login
      console.log('Manual login successful and verified.');
      await handleSuccessfulSignIn(result);
      setSubmitting(false);

    } catch (error) {
      console.error('Error during manual login submission:', error);
      stopLoading();
      setSubmitting(false);

      // Fallback Deactivation Check (if API call failed earlier)
      const isDeactivationError = error?.response?.data?.error === 'ACCOUNT_DEACTIVATED' || error?.message?.toLowerCase().includes('deactivated');
      if (isDeactivationError && !isDeactivated) {
        console.warn('Manual login failed due to deactivation (caught in error handler).');
        const emailOnError = error?.response?.data?.email || values.email;
        const isAutoOnError = error?.response?.data?.isAutoDeactivated ?? statusCheck?.isAutoDeactivated ?? false;
        await handleDeactivatedAccountFlow(emailOnError, isAutoOnError, statusCheck);
      } else if (!isDeactivationError) { // Avoid duplicate errors
        const generalErrorMessage = error?.response?.data?.message || error?.message || 'Authentication failed.';
        setAuthError(generalErrorMessage);
        toast.error(generalErrorMessage);
      }
    }
  };


  // Modify handleGoogleSignIn function in loginHook.js
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setShowRedirectOption(false);
    setIsDeactivated(false);
    setDeactivationInfo(null);
    startLoading();
  
    try {
      // Direct single-step Google sign-in
      console.log('Starting Google sign-in process');
      const result = await contextGoogleSignIn();
      console.log('Google sign-in result:', result);
      
      // Process the result based on status
      if (result?.isDeactivated || result?.isAutoDeactivated) {
        const email = result.email || '';
        const isAuto = result.isAutoDeactivated || false;
        await handleDeactivatedAccountFlow(email, isAuto);
        return;
      }
      
      if (result?.requireVerification) {
        handleVerificationRequired(result);
        return;
      }
      
      if (result?.success && result?.user) {
        await handleSuccessfulSignIn(result);
        return;
      }
      
      // Unexpected result
      console.warn("Unexpected Google Sign-In outcome:", result);
      throw new Error(result?.message || 'Google authentication failed.');
    } catch (error) {
      console.error('Error during Google Sign-In:', error);
      
      // Check error response for deactivation information
      if (error.response?.data?.isDeactivated || 
          (error.response?.data?.message && error.response?.data?.message.includes('deactivated'))) {
        console.log('Deactivation info found in error response:', error.response.data);
        const email = error.response.data.email || '';
        const isAuto = error.response.data.isAutoDeactivated || false;
        await handleDeactivatedAccountFlow(email, isAuto);
        return;
      }
      
      // Special handling for popup blocking to make it clear to users
      if (error.code === 'auth/popup-blocked' || 
          (error.message && error.message.includes('popup was blocked'))) {
        setShowRedirectOption(true);
        toast.error("Sign-in popup was blocked. Please enable popups or use the redirect option below.");
        setAuthError("Your browser blocked the sign-in popup. Please enable popups for this site or use the redirect method below.");
      } else {
        // Use general error handler for other errors
        handleGoogleSignInError(error);
      }
    } finally {
      stopLoading();
    }
  };


  /** Handles Google Sign-In via Redirect button click */
  const handleGoogleRedirectSignIn = async () => {
    try {
      setAuthError(null); startLoading();
      toast.info("Redirecting to Google...");
      await authService.googleSignInWithRedirect(); // Navigates away
    } catch (error) {
      console.error('Google redirect init error:', error);
      setAuthError(error?.message || 'Google redirect failed.');
      toast.error(error?.message || 'Google redirect failed.');
      stopLoading(); // Only stop if init fails
    }
  };


  // --- Returned Values from Hook ---
  return {
    isLoading,
    authError,
    handleSubmit,
    handleGoogleSignIn,
    handleGoogleRedirectSignIn,
    showRedirectOption,
    initialValues: initialFormValues, // Use the state variable for initial values
    validationSchema,
    // Deactivation props
    isDeactivated,
    recoveryEmail,
    setRecoveryEmail,
    handleRequestReactivation,
    deactivationInfo
  };
};