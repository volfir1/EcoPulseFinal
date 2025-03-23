import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';
import { p, t } from '@shared/index'; // Assumes these exports contain your color values
import crosswalk from '@assets/images/vectors/crosswalk.jpg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

   const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError('');
      setMessage('');
    
      try {
        const trimmedEmail = email.trim();
        
        if (!trimmedEmail) {
          setError('Email is required');
          setIsSubmitting(false);
          return;
        }
    
        if (!validateEmail(trimmedEmail)) {
          setError('Please enter a valid email address');
          setIsSubmitting(false);
          return;
        }
    
        const response = await authService.forgotPassword(trimmedEmail);
        
        if (response.success) {
          setMessage(response.message);
          setEmail(''); // Clear the email field on success
    
          // Add a delay before allowing another submission
          setTimeout(() => {
            setIsSubmitting(false);
          }, 30000); // 30 second cooldown
        } else {
          setError(response.message || 'An error occurred. Please try again later.');
          setIsSubmitting(false);
        }
      } catch (err) {
        console.error('Forgot password error:', err);
        setError('Unable to process your request. Please try again later.');
        setIsSubmitting(false);
      }
    };
    setError('');
    setMessage('');

    try {
      const trimmedEmail = email.trim();
      
      if (!trimmedEmail) {
        setError('Email is required');
        return;
      }

      if (!validateEmail(trimmedEmail)) {
        setError('Please enter a valid email address');
        return;
      }

      const response = await authService.forgotPassword(trimmedEmail);
      
      if (response.success) {
        setMessage(response.message);
        setEmail(''); // Clear the email field on success

        // Add a delay before allowing another submission
        setTimeout(() => {
          setIsSubmitting(false);
        }, 30000); // 30 second cooldown
      } else {
        setError(response.message);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Unable to process your request. Please try again later.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Gradient Background */}
      <div 
        className="flex flex-col items-center justify-center flex-1 p-12 text-center"
        style={{ background: `linear-gradient(135deg, ${p.main}, ${p.dark})` }}
      >
        <img src="/logo.png" alt="EcoPulse Logo" className="w-32 h-32 mb-6" />
        <h1 className="mb-6 text-5xl font-bold text-white">EcoPulse</h1>
        <p className="text-lg leading-relaxed text-white/80 max-w-md">
          Forgot your password? No worries, we'll help you reset it.
        </p>
      </div>

      {/* Right Side - Background Image with Form Card */}
      <div 
        className="relative flex items-center justify-center w-1/2 bg-center bg-cover"
        style={{
          backgroundImage: `url(${crosswalk})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }} />
        <div className="relative z-10 w-full max-w-md p-8 mx-12 bg-white shadow-xl rounded-3xl">
          <h2 className="mb-6 text-2xl font-bold text-center" style={{ color: t.main }}>
            Reset Your Password
          </h2>
          <p className="mb-4 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {message && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{message}</div>}
          {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            className={`w-full h-10 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700 
              ${error ? 'border-red-500' : 'border-gray-300'}
              ${isSubmitting ? 'bg-gray-100' : 'bg-white'}
            `}
            placeholder="Enter your email"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className="w-full h-10 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>

        {message && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}
      </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            <a href="/login" className="text-green-700 hover:underline">
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
