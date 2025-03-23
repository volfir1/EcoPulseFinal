import React from 'react';
import Lottie from 'lottie-react';
import animationData from '@assets/json/loader.json';
import { useLoader } from './useLoader';

const Loader = () => {
  const { isLoading } = useLoader();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
      <div className="w-32 h-32">
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
        />
      </div>
    </div>
  );
};

export default Loader;