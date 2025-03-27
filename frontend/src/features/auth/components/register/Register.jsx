import React, { useState, useEffect } from 'react';
import { User, Lock, Phone, Mail, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Button, Loader, useSnackbar, useLoader } from '@shared/index';
import { useRegister } from './registerHook';
import { RegisterSchema, initialValues } from './validation';
import { p, t } from '@shared/index';
import crosswalk from '../../../../assets/images/vectors/crosswalk.jpg';
import VerifyEmail from '@features/auth/verification/VerifiEmail';

const Register = () => {
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
  } = useRegister();
  
  const { isLoading } = useLoader();

  return (
    <>
      <Loader />
      
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

        {/* Right Side - Form with Background Image */}
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
              <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full flex items-center justify-center`}
                style={{ border: `2px solid ${t.main}` }}>
                <User className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} style={{ color: p.main }} />
              </div>
            </div>

            <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-center mb-4 md:mb-6`}
              style={{ color: t.main }}>
              Create Account
            </h2>

            <Formik
              initialValues={initialValues}
              validationSchema={RegisterSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, touched, errors, values, handleChange }) => (
                <Form className="space-y-3 md:space-y-4">
                  {/* Name fields - responsive layout */}
                  <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex gap-2'}`}>
                    {/* First Name Input */}
                    <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                      <div className="relative flex items-center">
                        <User className="absolute left-3 w-4 h-4 text-gray-400" />
                        <Field
                          type="text"
                          name="firstName"
                          placeholder="First Name *"
                          className={`w-full h-10 pl-9 pr-3 border rounded-lg text-sm ${
                            touched.firstName && errors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={isLoading}
                        />
                      </div>
                      <ErrorMessage
                        name="firstName"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>

                    {/* Last Name Input */}
                    <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                      <div className="relative flex items-center">
                        <User className="absolute left-3 w-4 h-4 text-gray-400" />
                        <Field
                          type="text"
                          name="lastName"
                          placeholder="Last Name *"
                          className={`w-full h-10 pl-9 pr-3 border rounded-lg text-sm ${
                            touched.lastName && errors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={isLoading}
                        />
                      </div>
                      <ErrorMessage
                        name="lastName"
                        component="div"
                        className="text-xs text-red-500 mt-1"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                      <Field
                        type="email"
                        name="email"
                        placeholder="Email *"
                        className={`w-full h-10 pl-9 pr-3 border rounded-lg text-sm ${
                          touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    <ErrorMessage 
                      name="email"
                      component="div"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>

                  {/* Password Input with strength meter and visibility toggle */}
                  <div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                      <Field
                        type={passwordVisible ? "text" : "password"}
                        name="password"
                        placeholder="Password *"
                        className={`w-full h-10 pl-9 pr-10 border rounded-lg text-sm ${
                          touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                        onChange={(e) => handlePasswordChange(e, handleChange)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 text-gray-400 hover:text-gray-600"
                        onClick={togglePasswordVisibility}
                        tabIndex="-1"
                      >
                        {passwordVisible ? 
                          <EyeOff className="w-4 h-4" /> : 
                          <Eye className="w-4 h-4" />
                        }
                      </button>
                    </div>
                    
                    {/* Password strength meter */}
                    {values.password && (
                      <div className="mt-2">
                        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full`} 
                            style={{ 
                              width: `${(passwordStrength.score / 6) * 100}%`,
                              backgroundColor: 
                                passwordStrength.color === 'red-500' ? '#ef4444' : 
                                passwordStrength.color === 'yellow-500' ? '#eab308' : 
                                passwordStrength.color === 'green-500' ? '#22c55e' : '#d1d5db'
                            }}
                          />
                        </div>
                        <p className={`text-xs mt-1`} 
                           style={{ 
                             color: 
                               passwordStrength.color === 'red-500' ? '#ef4444' : 
                               passwordStrength.color === 'yellow-500' ? '#eab308' : 
                               passwordStrength.color === 'green-500' ? '#22c55e' : '#6b7280'
                           }}>
                          {isMobile ? 
                            `${passwordStrength.label}: ${passwordStrength.feedback}` :
                            `Password strength: ${passwordStrength.label} - ${passwordStrength.feedback}`
                          }
                        </p>
                      </div>
                    )}
                    
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>

                  {/* Confirm Password Input with visibility toggle */}
                  <div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                      <Field
                        type={confirmPasswordVisible ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm Password *"
                        className={`w-full h-10 pl-9 pr-10 border rounded-lg text-sm ${
                          touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 text-gray-400 hover:text-gray-600"
                        onClick={toggleConfirmPasswordVisibility}
                        tabIndex="-1"
                      >
                        {confirmPasswordVisible ? 
                          <EyeOff className="w-4 h-4" /> : 
                          <Eye className="w-4 h-4" />
                        }
                      </button>
                    </div>
                    <ErrorMessage
                      name="confirmPassword"
                      component="div"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full h-10 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isSubmitting || isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 text-xs text-gray-500 bg-white">Or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={isLoading}
                    className="w-full h-10 flex items-center justify-center gap-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <img src="/google.svg" alt="Google" className="w-4 h-4" />
                    <span>Sign up with Google</span>
                  </button>

                  <div className="text-center text-xs text-gray-600">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-medium text-green-700 hover:underline"
                    >
                      Login now
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;