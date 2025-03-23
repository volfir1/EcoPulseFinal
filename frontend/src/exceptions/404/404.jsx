import React from 'react';
import { useNavigate } from 'react-router-dom';
import { buttonActions } from './function';
import NotFoundSVG from '../../assets/images/exceptions/404.svg';

const ErrorPage404 = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Full-screen SVG container */}
      <div className="absolute inset-0">
        <img 
          src={NotFoundSVG}
          alt="404 Not Found"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Buttons container - absolute positioned on top */}
      <div className="absolute bottom-10 left-60 mb-56 -translate-x-1/2 flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300 w-36 h-12"
        >
          Go Back
        </button>
        <button
          onClick={() => buttonActions.handleGoHome(navigate)}
           className="px-6 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors duration-300 w-36 h-12"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default ErrorPage404;