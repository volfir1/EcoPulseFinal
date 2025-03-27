// components/Login.jsx
import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, AlertTriangle, Clock, RefreshCw, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, p, t } from '@shared/index';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Loader from '@shared/components/loaders/Loader';
import { useLogin } from './loginHook';
import crosswalk from '../../../../assets/images/vectors/crosswalk.jpg';

const Login = () => {
  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Update responsive states based on screen width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    handleGoogleSignIn,
    handleGoogleRedirectSignIn,
    showRedirectOption,
    handleSubmit,
    initialValues,
    validationSchema,
    isLoading: hookLoading,
    authError,
    // Account reactivation props
    isDeactivated,
    showReactivationOption,
    lockoutInfo,
    recoveryEmail,
    setRecoveryEmail,
    handleRequestReactivation
  } = useLogin();

  return (
    <>
      {hookLoading && <Loader />}
      
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left Side - Primary Color Background */}
        <div 
          className={`flex flex-col items-center justify-center p-6 md:p-12 text-center ${isMobile ? 'py-8' : ''} ${isMobile || isTablet ? 'w-full' : 'flex-1'}`}
          style={{ 
            background: `linear-gradient(135deg, ${p.main}, ${p.dark})` 
          }}
        >
          <img src="/logo.png" alt="EcoPulse Logo" className={`${isMobile ? 'w-20 h-20' : 'w-32 h-32'} mb-4 md:mb-6`} />
          <h1 className={`mb-3 md:mb-6 ${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-white`}>EcoPulse</h1>
          <p className={`text-sm md:text-lg leading-relaxed text-white/80 max-w-md ${isMobile ? 'hidden' : ''}`}>
            Join our community of eco-conscious individuals and businesses.
            Together, we can make a difference for a sustainable future.
          </p>
        </div>

        {/* Right Side - Background Image */}
        <div 
          className={`relative flex items-center justify-center ${isMobile || isTablet ? 'w-full py-8 px-4' : 'w-1/2'} bg-center bg-cover`}
          style={{
            backgroundImage: isMobile ? 'none' : `url(${crosswalk})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: isMobile ? '#f9f9f9' : 'transparent'
          }}
        >
          {!isMobile && (
            <div 
              className="absolute inset-0" 
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
            />
          )}
          
          <div className={`relative z-10 w-full max-w-md ${isMobile ? 'p-4 mx-0' : isTablet ? 'p-6 mx-4' : 'p-8 mx-12'} bg-white shadow-xl rounded-3xl`}>
            <div className="flex justify-center mb-4">
              <div 
                className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full flex items-center justify-center`}
                style={{ border: `2px solid ${p.main}` }}
              >
                <User 
                  className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}
                  style={{ color: p.main }} 
                />
              </div>
            </div>

            <h2 
              className={`mb-4 md:mb-6 ${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-center`}
              style={{ color: t.main }}
            >
              {isDeactivated ? 'Account Deactivated' : 'Login'}
            </h2>

            {/* Deactivated Account UI */}
            {isDeactivated && (
              <div className="space-y-4 md:space-y-6">
                {/* Lockout Notice */}
                {lockoutInfo && (
                  <div className="p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2 md:space-y-3">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <Clock className="w-4 h-4 md:w-5 md:h-5" />
                      <h3 className="font-medium text-sm md:text-base">Reactivation Locked</h3>
                    </div>
                    <p className="text-xs md:text-sm text-yellow-700">
                      Your account reactivation is currently locked. Please try again in {lockoutInfo.hours} hours.
                    </p>
                  </div>
                )}

                {/* Reactivation Options */}
                {showReactivationOption && (
                  <div className="p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg space-y-2 md:space-y-3">
                    <div className="flex items-center space-x-2 text-green-800">
                      <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
                      <h3 className="font-medium text-sm md:text-base">Account Deactivated</h3>
                    </div>
                    <p className="text-xs md:text-sm text-green-700">
                      Your account has been deactivated. A reactivation link has been sent to your email.
                    </p>
                    
                    <div className="space-y-2 pt-2">
                      <p className="text-xs md:text-sm font-medium text-gray-700">
                        Didn't receive the email? Request a new reactivation link:
                      </p>
                      
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <input
                          type="email"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          placeholder="Your email"
                          className="flex-1 h-10 px-3 border rounded-lg text-sm"
                        />
                        
                        <button
                          onClick={handleRequestReactivation}
                          disabled={hookLoading}
                          className="h-10 px-4 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Back to Login Button */}
                <div className="pt-4">
                  <Link
                    to="/login"
                    className="w-full h-10 flex items-center justify-center bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}

            {/* Normal Login Form */}
            {!isDeactivated && (
              <>
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting, touched, errors }) => (
                    <Form className="space-y-3 md:space-y-4">
                      <div className="space-y-1">
                        <div className="relative flex items-center">
                          <Mail 
                            className="absolute left-3 w-4 h-4 text-gray-400" 
                          />
                          <Field
                            type="email"
                            name="email"
                            className={`w-full h-10 pl-9 pr-3 border rounded-lg text-sm ${
                              touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Email"
                          />
                        </div>
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="text-xs text-red-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="relative flex items-center">
                          <Lock 
                            className="absolute left-3 w-4 h-4 text-gray-400" 
                          />
                          <Field
                            type="password"
                            name="password"
                            className={`w-full h-10 pl-9 pr-3 border rounded-lg text-sm ${
                              touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Password"
                          />
                        </div>
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="text-xs text-red-500"
                        />
                      </div>

                      {/* Forgot Password Link */}
                      <div className="text-right">
                        <Link 
                          to="/forgot-password" 
                          className="text-xs text-green-700 hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || hookLoading}
                        className="w-full h-10 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {isSubmitting || hookLoading ? 'Logging in...' : 'Login'}
                      </button>

                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="px-4 text-xs text-gray-500 bg-white">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      {/* Google Sign-in Button */}
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={hookLoading}
                        className="w-full h-10 flex items-center justify-center gap-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <img src="/google.svg" alt="Google" className="w-4 h-4" />
                        <span>Sign in with Google</span>
                      </button>
                      
                      {/* Redirect Option - only shows after popup is blocked */}
                      {showRedirectOption && (
                        <div className="mt-3 md:mt-4 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2 md:space-y-3">
                          <div className="flex items-center space-x-2 text-blue-800">
                            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
                            <h3 className="font-medium text-sm">Popup Blocked</h3>
                          </div>
                          <p className="text-xs md:text-sm text-blue-700">
                            Your browser blocked the sign-in popup. You can enable popups in your browser settings or use the redirect method instead.
                          </p>
                          <button
                            type="button"
                            onClick={handleGoogleRedirectSignIn}
                            disabled={hookLoading}
                            className="w-full h-10 flex items-center justify-center gap-2 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            <img src="/google.svg" alt="Google" className="w-4 h-4 invert" />
                            <span>{isMobile ? 'Google (Redirect)' : 'Sign in with Google (Redirect)'}</span>
                          </button>
                        </div>
                      )}

                      {/* Display auth-specific errors */}
                      {authError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs md:text-sm text-red-700">
                          {authError}
                        </div>
                      )}

                      <div className="text-center text-xs text-gray-600">
                        Not a member?{' '}
                        <Link 
                          to="/register" 
                          className="font-medium text-green-700 hover:underline"
                        >
                          Sign up now
                        </Link>
                      </div>
                    </Form>
                  )}
                </Formik>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;