import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, X, Loader as LoaderIcon } from 'lucide-react';
import { Card, p, t, useSnackbar } from '@shared/index';
import authService from '@services/authService';
import { useAuth } from '@context/AuthContext';

const AccountRecovery = () => {
  const [searchParams] = useSearchParams();
  const { setUser, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useSnackbar();
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  
  const recoveryToken = searchParams.get('token');
  const recoveryAttemptedRef = useRef(false);
  
  useEffect(() => {
    // Prevent multiple recovery attempts
    if (recoveryAttemptedRef.current) {
      return;
    }
    
    const recoverAccount = async () => {
      if (!recoveryToken) {
        setStatus('error');
        setError('Invalid recovery link. No token provided.');
        return;
      }
      
      // Mark that we've attempted recovery to prevent loops
      recoveryAttemptedRef.current = true;
      
      console.log(`Attempting account recovery with token: ${recoveryToken.substring(0, 5)}...`);
      
      try {
        // Process the account recovery
        const result = await authService.recoverAccount(recoveryToken);
        
        console.log('Recovery result:', result);
        
        if (result.success) {
          // Update auth context and localStorage
          if (result.user) {
            console.log('Received user data:', result.user);
            localStorage.setItem('user', JSON.stringify(result.user));
            setUser(result.user);
            setIsAuthenticated(true);
            
            if (result.user.accessToken) {
              localStorage.setItem('authToken', result.user.accessToken);
            }
          }
          
          setStatus('success');
          setMessage(result.message || 'Your account has been successfully recovered!');
          toast.success('Account recovered successfully');
          
          // Auto-redirect after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setError(result.message || 'Failed to recover account.');
          setDebugInfo(result.debug || null);
          toast.error(result.message || 'Failed to recover account');
        }
      } catch (error) {
        console.error('Account recovery error:', error);
        setStatus('error');
        setError(error.message || 'An error occurred during account recovery.');
        toast.error(error.message || 'An error occurred during account recovery');
      }
    };
    
    recoverAccount();
  }, [recoveryToken, navigate, setUser, setIsAuthenticated, toast]);
  
  // Handle manual retry - completely reload the page rather than just re-running the effect
  const handleRetry = () => {
    window.location.reload();
  };
  
  // Handle request new token
  const handleRequestNewToken = async () => {
    // Show prompt to get email
    const email = prompt("Please enter your email address to request a new recovery link:");
    
    if (!email) return;
    
    try {
      setStatus('loading');
      const result = await authService.requestAccountRecovery(email);
      
      if (result.success) {
        toast.success("A new recovery link has been sent to your email.");
        setStatus('error'); // Keep showing error UI but with updated message
        setError("A new recovery link has been sent to your email. Please check your inbox.");
      } else {
        toast.error(result.message || "Failed to send recovery email");
        setStatus('error');
      }
    } catch (error) {
      console.error('Error requesting new token:', error);
      toast.error(error.message || "Failed to send recovery email");
      setStatus('error');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <Card.Base className="max-w-md w-full p-8">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="EcoPulse Logo" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2" style={{ color: t.main }}>Account Recovery</h1>
        </div>
        
        {status === 'loading' && (
          <div className="flex flex-col items-center py-8">
            <div className="mb-4">
              <LoaderIcon className="w-12 h-12 animate-spin text-green-600" />
            </div>
            <p className="text-gray-600 text-center">
              Processing your account recovery request...
            </p>
            {recoveryToken && (
              <p className="text-xs text-gray-400 mt-4">
                Token: {recoveryToken.substring(0, 8)}...{recoveryToken.substring(recoveryToken.length - 8)}
              </p>
            )}
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center py-6">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <Check className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-lg font-medium text-gray-800 mb-2">Recovery Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-4">
              You will be redirected to your dashboard in a few seconds...
            </p>
            <Link 
              to="/dashboard" 
              className="block w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              Go to Dashboard Now
            </Link>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center py-6">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <X className="w-12 h-12 text-red-600" />
              </div>
            </div>
            <h2 className="text-lg font-medium text-gray-800 mb-2">Recovery Failed</h2>
            <p className="text-red-500 mb-6">{error}</p>
            
            {/* Add token info for debugging */}
            {recoveryToken && (
              <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-100 rounded-lg">
                <p>Recovery Token: {recoveryToken.substring(0, 8)}...{recoveryToken.substring(recoveryToken.length - 8)}</p>
              </div>
            )}
            
            {/* Debug information section */}
            {debugInfo && (
              <div className="text-xs text-left mb-4 p-2 bg-gray-100 rounded-lg overflow-auto max-h-32">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="block w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Retry Recovery
              </button>
              <button
                onClick={handleRequestNewToken}
                className="block w-full py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-center"
              >
                Request New Recovery Link
              </button>
              <Link 
                to="/login" 
                className="block w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                Return to Login
              </Link>
              <button 
                onClick={() => {
                  const email = 'support@ecopulse.com'; // Replace with your support email
                  const subject = 'Account Recovery Issue';
                  const body = `I'm having an issue recovering my account.\n\nToken: ${recoveryToken}\nError: ${error}`;
                  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                }}
                className="block w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}
      </Card.Base>
    </div>
  );
};

export default AccountRecovery;