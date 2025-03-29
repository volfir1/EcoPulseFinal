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
  const [recoveryEmail, setRecoveryEmail] = useState(location.state?.email || ''); // Pre-fill if coming from reactivation attempt
  const [showRedirectOption, setShowRedirectOption] = useState(false);
  // Store more detailed deactivation info
  const [deactivationInfo, setDeactivationInfo] = useState(location.state?.isDeactivated ? {
      email: location.state?.email,
      isAuto: location.state?.isAutoDeactivated,
      message: location.state?.message, // Carry over messages from navigation state
      emailSent: location.state?.emailSent,
      hasError: location.state?.hasError
  } : null);
  // Use deactivationInfo to determine if the account is generally deactivated
  const [isDeactivated, setIsDeactivated] = useState(!!location.state?.isDeactivated);

  // Validation configuration
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
  });

  const initialValues = {
    email: location.state?.email || '', // Pre-fill email from state if available
    password: ''
  };

  // --- Helper functions ---
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
    // Ensure user data has essential fields, default if necessary
    const verifiedUser = {
        id: user?.id || '', // Ensure id is present
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '', // Ensure email is present
        role: user?.role || 'user', // Default role
        ...user, // Spread the rest of the user data
        isVerified: true, // Explicitly set as verified upon successful storage
        // Keep accessToken if provided separately or within user object
        accessToken: accessToken || user?.accessToken || localStorage.getItem('authToken') || ''
    };


    localStorage.setItem('user', JSON.stringify(verifiedUser));

    // Store token separately as well if available
    const tokenToStore = accessToken || user?.accessToken;
    if (tokenToStore) {
        localStorage.setItem('authToken', tokenToStore);
    }

    setUser(verifiedUser);
    setIsAuthenticated(true);

    return verifiedUser;
  };


  // Handle navigation based on user role
  const navigateAfterAuth = (user) => {
    const targetPath = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    console.log(`Navigating ${user.role} to ${targetPath}`);
    // Clear any auth-related state from location before navigating away
    navigate(targetPath, { replace: true, state: {} });
  };

  // --- Reactivation Handlers ---

  // NEW: Generic handler for deactivated accounts
  const handleDeactivatedAccountFlow = async (email, isAuto, initialStatusCheck = null) => {
      console.log(`Handling deactivated account flow (Auto: ${isAuto}) for:`, email);
      startLoading(); // Ensure loading indicator

      // Update state
      setIsDeactivated(true); // General flag
      setRecoveryEmail(email);
      const currentDeactivationInfo = { // Build info object
          email,
          isAuto,
          deactivatedAt: initialStatusCheck?.deactivatedAt,
          tokenExpired: initialStatusCheck?.tokenExpired,
          message: isAuto
              ? "Your account was deactivated due to inactivity. Sending reactivation email..."
              : "Your account has been deactivated. Sending reactivation email...",
          emailSent: false, // Assume not sent yet
          hasError: false
      };
      setDeactivationInfo(currentDeactivationInfo);


      const reason = isAuto ? "inactivity" : "administrator action";
      toast.info(`Account deactivated due to ${reason}. Sending reactivation email...`);

      try {
          console.log('Sending reactivation request to server...');
          const reactivationResult = await authService.requestReactivation(email);
          console.log('Reactivation request response:', reactivationResult);

          if (reactivationResult.success) {
              toast.success("Reactivation email sent successfully. Please check your inbox.");
              // Navigate back to login or a dedicated page, clearly indicating success
              currentDeactivationInfo.emailSent = true;
              currentDeactivationInfo.message = `Your account is deactivated. A reactivation link has been sent to ${email}. Check your inbox.`;
              navigate('/login', { // Or maybe '/reactivation-sent'
                  state: { ...currentDeactivationInfo }, // Pass updated info
                  replace: true
              });
          } else {
              // Handle failure to send email
              toast.error(reactivationResult.message || "Problem sending reactivation email. Please try again.");
              currentDeactivationInfo.hasError = true;
              currentDeactivationInfo.message = reactivationResult.message || "We encountered an issue sending the reactivation email. You can request a new one below.";
              // Navigate to a page where they can manually request again
              navigate('/reactivate-account', {
                  state: { ...currentDeactivationInfo }, // Pass updated info with error
                  replace: true
              });
          }
      } catch (error) {
          console.error('Critical error during reactivation request:', error);
          toast.error("An unexpected error occurred while requesting reactivation. Please try again.");
          currentDeactivationInfo.hasError = true;
          currentDeactivationInfo.message = "We encountered a technical issue. Please try requesting a new reactivation email.";
           navigate('/reactivate-account', {
              state: { ...currentDeactivationInfo }, // Pass updated info with error
              replace: true
           });
      } finally {
          stopLoading(); // Ensure loading stops
      }
  };


  // Handles the result *after* clicking a reactivation link
  const handleReactivatedAccount = async (result) => {
      stopLoading(); // Make sure loading stops if it was initiated by reactivation process
      if (!result.user || !result.user.email) { // Ensure we have user data
          toast.error(result.message || 'Reactivation successful, but failed to load user data. Please log in.');
          navigate('/login', { replace: true, state: { email: result.user?.email || recoveryEmail } });
          return;
      }

      const userData = storeUserData(result.user, result.token || result.user.accessToken); // Use token if provided separately
      toast.success(result.message || "Account reactivated. Welcome back!");
      navigateAfterAuth(userData);
  };


  // Triggered by a button press, e.g., on the /reactivate-account page
  const handleRequestReactivation = async (emailToRequest) => {
      const targetEmail = emailToRequest || recoveryEmail; // Use passed email or state
      if (!targetEmail) {
          toast.error("Email is required to request reactivation.");
          return;
      }
      console.log("Manual request reactivation triggered for:", targetEmail);
      // Call the main flow handler, passing the email and assuming 'isAuto' doesn't matter here
      // or determine 'isAuto' based on stored deactivationInfo if available
      const isCurrentlyAuto = deactivationInfo?.email === targetEmail ? deactivationInfo.isAuto : false;
      await handleDeactivatedAccountFlow(targetEmail, isCurrentlyAuto);
  };


  // --- Authentication Handlers ---
  const handleVerificationRequired = (result) => {
    stopLoading();
    const userId = result.userId || result.user?.id; // Get userId reliably
    const userEmail = result.email || result.user?.email; // Get email reliably

    if (!userId || !userEmail) {
      console.error("Missing userId or email for verification redirection", result);
      toast.error("An error occurred. Cannot proceed with email verification.");
      setAuthError("Missing user details for verification.");
      return;
    }

    navigate('/verify-email', {
      state: {
        userId: userId,
        email: userEmail
      },
      replace: true // Replace login history entry
    });
    toast.info(result.message || "Please check your email to verify your account.");
  };

  const handleSuccessfulSignIn = async (result) => {
    stopLoading();
    if (!result.user || !result.user.email) { // Validate essential user data
      console.error('Invalid user data received on successful sign-in:', result);
      toast.error('Authentication successful, but user data is incomplete. Please try again.');
      setAuthError('Incomplete user data received from server.');
      // Clear potentially bad state
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    const userData = storeUserData(result.user, result.token || result.user.accessToken);
    showSuccessToast(userData); // Use the specific success toast
    navigateAfterAuth(userData);
  };


  const handleGoogleSignInError = (error) => {
    stopLoading();
    console.error('Google sign-in error handler:', error);

    let errorMessage = error.message || 'Google sign-in failed';

    if (error.code === 'auth/popup-closed-by-user' || error.message?.includes('cancelled')) {
      errorMessage = 'Sign-in process was cancelled';
      // Don't show an error toast, maybe an info toast or nothing
      // toast.info('Sign-in cancelled');
    } else if (error.code === 'auth/popup-blocked' || error.message?.includes('popup was blocked')) {
      errorMessage = 'Sign-in popup was blocked. Please enable popups in your browser settings.';
      toast.error(errorMessage); // Show error as it requires user action
      setShowRedirectOption(true); // Offer redirect as an alternative
    } else if (error.message?.includes('Network Error') || error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error during sign-in. Please check your connection.';
        toast.error(errorMessage);
    } else if (error.message?.includes('ACCOUNT_DEACTIVATED')) { // Handle specific backend error if passed through
        const emailOnError = error.email || recoveryEmail; // Try to get email from error or state
        errorMessage = error.message; // Use the specific message
        if (emailOnError) {
            handleDeactivatedAccountFlow(emailOnError, error.isAutoDeactivated ?? false); // Trigger reactivation flow
            // Don't show a generic error toast here as the flow handles notifications
            return; // Stop further error handling for this case
        } else {
            toast.error("Your account is deactivated, but we couldn't identify your email to help reactivate.");
        }
    }
    else {
      // For other errors, show a generic error toast
      toast.error(errorMessage);
    }

    setAuthError(errorMessage); // Set the error state regardless
  };


  // --- Main Authentication Flows ---

  // Email/Password Login
  const handleSubmit = async (values, { setSubmitting }) => {
    console.log('Login attempt:', { email: values.email });
    setSubmitting(true);
    setAuthError(null);
    setIsDeactivated(false); // Reset deactivation state on new attempt
    setDeactivationInfo(null);
    startLoading();

    let statusCheck = null;
    try {
      // 1. Check account status first
      statusCheck = await authService.checkAccountStatus(values.email);
      console.log('Account status check result:', statusCheck);

      // *** MODIFIED CHECK ***
      // 2. If account exists but is NOT active (covers manual and auto deactivation)
      if (statusCheck.exists && !statusCheck.isActive) {
        console.log(`Account is deactivated (Auto: ${statusCheck.isAutoDeactivated}). Triggering reactivation flow.`);
        // Trigger the reactivation flow AND STOP further execution
        await handleDeactivatedAccountFlow(values.email, statusCheck.isAutoDeactivated, statusCheck);
        setSubmitting(false); // Ensure form is not submitting anymore
        // stopLoading(); // handleDeactivatedAccountFlow handles its own loading state
        return; // IMPORTANT: Stop handleSubmit here
      }

      // 3. If account is active or doesn't exist yet (let backend handle non-existent), proceed to login attempt
      console.log('Account is active or does not exist, proceeding with login attempt.');
      const result = await contextLogin(values.email, values.password);
      console.log('Login result:', result);

      // 4. Handle potential reactivation during login (backend might reactivate implicitly)
      if (result?.wasReactivated) {
          console.log('Account was reactivated during login process.');
          await handleReactivatedAccount(result);
          setSubmitting(false);
          return; // Stop processing
      }

      // 5. Handle general login failures returned by contextLogin/authService.login
      // Note: This assumes contextLogin forwards success/failure status correctly
      if (!result || !result.success) {
          // We might get here if the password is wrong for an *active* account
          const errorMessage = result?.message || 'Login failed. Please check your credentials.';
          console.error("Login failed:", errorMessage, result);
          setAuthError(errorMessage);
          toast.error(errorMessage);
          stopLoading();
          setSubmitting(false);
          return;
      }

      // 6. Handle missing user data after a supposed success
      if (!result.user || !result.user.email) {
          console.error('Login successful but user data is missing/invalid:', result);
          toast.error('Login succeeded but failed to retrieve user details. Please try again.');
          setAuthError('Invalid user data received from server.');
          stopLoading();
          setSubmitting(false);
          return;
      }

      // 7. Handle verification requirement
      // Check both explicit flag and user object property for robustness
      const needsVerification = result.requireVerification === true || (result.user && result.user.isVerified === false);
      console.log('Checking verification status:', {
          needsVerification,
          requireVerificationFlag: result.requireVerification,
          userIsVerified: result.user?.isVerified
      });

      if (needsVerification) {
          console.log('Server requires email verification.');
          handleVerificationRequired({
              userId: result.user.id, // Ensure ID is passed
              email: result.user.email, // Ensure email is passed
              message: result.message || 'Please verify your email.'
          });
          // stopLoading(); // handleVerificationRequired stops loading
          setSubmitting(false);
          return; // Stop processing
      }

      // 8. Normal successful login for verified user
      console.log('User considered verified, proceeding with successful sign-in handler.');
      await handleSuccessfulSignIn(result);
      // stopLoading(); // handleSuccessfulSignIn stops loading
      setSubmitting(false); // Already handled? Ensure it is.

    } catch (error) {
        console.error('Error during login submission process:', error);
        stopLoading(); // Ensure loading stops on any error
        setSubmitting(false); // Ensure form is not submitting

        // *** FALLBACK CHECK for Deactivation ***
        // Check if the error specifically indicates a deactivated account
        // This is crucial if the backend is fixed to return 403/401 instead of 500
        const isDeactivationError = error.response?.data?.error === 'ACCOUNT_DEACTIVATED' ||
                                   error.message?.toLowerCase().includes('deactivated');

        if (isDeactivationError) {
             console.warn('Login attempt failed specifically due to deactivation (caught in error handler) - triggering reactivation flow as fallback.');
             // Try to get details from error or fallback to form values/initial status check
             const emailOnError = error.response?.data?.email || values.email;
             const isAutoOnError = error.response?.data?.isAutoDeactivated ?? statusCheck?.isAutoDeactivated ?? false;
             await handleDeactivatedAccountFlow(emailOnError, isAutoOnError, statusCheck);
        } else {
             // Handle other errors (wrong password, network, 500 errors *not* related to deactivation)
             const generalErrorMessage = error.response?.data?.message || error.message || 'Authentication failed. Please try again.';
             setAuthError(generalErrorMessage);
             toast.error(generalErrorMessage);
        }
    }
    // No finally block needed for setSubmitting/stopLoading as it's handled in all paths
  };


  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setShowRedirectOption(false);
    setIsDeactivated(false); // Reset deactivation state
    setDeactivationInfo(null);
    startLoading();

    let googleAuthResult = null;
    let statusCheck = null;
    try {
      // 1. Initiate Google Sign-In with Firebase/Backend
      console.log('Starting Google sign-in attempt via context');
      googleAuthResult = await contextGoogleSignIn(); // This calls authService.googleSignIn
      console.log('Google sign-in result received from context:', googleAuthResult);

      // If Google sign-in itself failed at the authService level (e.g., popup closed, network error before backend call)
      if (!googleAuthResult || (!googleAuthResult.success && !googleAuthResult.email && !googleAuthResult.requireVerification && !googleAuthResult.isDeactivated)) {
         // Errors like popup closed are often handled internally or don't need a generic error message.
         // Relying on handleGoogleSignInError for specific cases.
         // If googleAuthResult exists but isn't success and doesn't fit other categories, throw its message.
         if (googleAuthResult && googleAuthResult.message) {
            throw new Error(googleAuthResult.message);
         } else if (!googleAuthResult) {
            // This case might occur if contextGoogleSignIn returns null/undefined on failure
            throw new Error('Google sign-in failed or was cancelled.');
         }
         // Otherwise, the error might have been handled (like popup closed), so just stop loading.
         stopLoading();
         return;
      }


      // --- We have some result from Google/Backend ---

      // 2. Check for explicit deactivation response from backend during Google Sign-in
      // (authService.googleSignIn might already check this via its backend call)
      if (googleAuthResult.isDeactivated) {
          console.log('Google sign-in response indicates account is deactivated.');
          // Need the email to proceed
          const emailForReactivation = googleAuthResult.email;
          if (emailForReactivation) {
              await handleDeactivatedAccountFlow(emailForReactivation, googleAuthResult.isAutoDeactivated ?? false);
          } else {
              toast.error("Account is deactivated, but email is missing. Cannot start reactivation.");
              setAuthError("Account deactivated - email unknown.");
          }
          stopLoading();
          return; // Stop processing
      }


      // 3. If not explicitly deactivated by backend, but we have an email, check status manually
      // This is a belt-and-suspenders approach in case the google-signin endpoint doesn't return deactivation status reliably.
      const emailFromGoogle = googleAuthResult.email || googleAuthResult.user?.email;
      if (emailFromGoogle) {
          console.log("Checking account status independently after Google Sign-in for:", emailFromGoogle);
          statusCheck = await authService.checkAccountStatus(emailFromGoogle);
          console.log('Independent status check result:', statusCheck);

          if (statusCheck.exists && !statusCheck.isActive) {
              console.log(`Account status check shows deactivated (Auto: ${statusCheck.isAutoDeactivated}). Triggering flow.`);
              await handleDeactivatedAccountFlow(emailFromGoogle, statusCheck.isAutoDeactivated, statusCheck);
              stopLoading();
              return; // Stop processing
          }
      }


      // 4. Handle potential reactivation during Google sign-in
      if (googleAuthResult.wasReactivated) {
          console.log('Account was reactivated during Google sign-in process.');
          await handleReactivatedAccount(googleAuthResult);
          return; // Stop processing
      }

      // 5. Handle verification requirement returned by Google sign-in process
      if (googleAuthResult.requireVerification === true) {
          console.log('Google sign-in process requires email verification.');
          handleVerificationRequired(googleAuthResult);
          return; // Stop processing
      }


      // 6. Handle successful Google sign-in
      if (googleAuthResult.success && googleAuthResult.user) {
          console.log('Google sign-in successful, proceeding.');
          await handleSuccessfulSignIn(googleAuthResult);
          return; // Stop processing
      }

      // 7. If we reach here, something went wrong, but wasn't caught by specific cases
      console.warn("Google Sign-In flow reached unexpected state:", googleAuthResult);
      throw new Error(googleAuthResult?.message || 'Google authentication failed after backend interaction.');


    } catch (error) {
        console.error('Error during Google Sign-In process:', error);
        // Pass the error AND the partial result (if any) to the handler
        handleGoogleSignInError(error); // This function will stop loading and show appropriate messages
    }
    // No finally block needed, handled within try/catch paths and error handler
  };


  // Google Redirect Sign-In (Initiation)
  const handleGoogleRedirectSignIn = async () => {
    try {
      setAuthError(null);
      startLoading();
      toast.info("Redirecting to Google for sign-in...");
      await authService.googleSignInWithRedirect();
      // Browser redirects away, stopLoading() might not execute if redirect is instant.
      // No explicit stopLoading() needed here as the page context is lost.
    } catch (error) {
      console.error('Google redirect sign-in initiation error:', error);
      setAuthError(error.message || 'Google sign-in redirect failed');
      toast.error(error.message || 'Google sign-in redirect failed');
      stopLoading(); // Stop loading only if the redirect initiation fails
    }
  };


  // --- Return Values ---
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
    isDeactivated, // Use this general flag in the UI
    recoveryEmail,
    setRecoveryEmail, // Allow setting email perhaps from URL params
    handleRequestReactivation, // Expose the manual request handler
    deactivationInfo // Expose detailed info for potential UI display
  };
};