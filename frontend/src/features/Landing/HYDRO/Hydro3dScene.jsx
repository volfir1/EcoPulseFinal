import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import HydroPowerModel from './HydroModel';
import HydroPowerFallback from './HydroFallback';
import * as THREE from 'three';

// Simple loading indicator
const LoadingBox = () => (
  <mesh>
    <boxGeometry args={[1.5, 1.5, 1.5]} />
    <meshStandardMaterial color="#3498db" wireframe />
  </mesh>
);

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in 3D component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Wrapper to scale up the model
const EnlargedHydroPowerModel = () => {
  return (
    <group scale={[1.8, 1.8, 1.8]} position={[0, -2, 0]}>
      <HydroPowerModel />
    </group>
  );
};

// Wrapper to scale up the fallback
const EnlargedHydroPowerFallback = () => {
  return (
    <group scale={[1.8, 1.8, 1.8]} position={[0, -2, 0]}>
      <HydroPowerFallback />
    </group>
  );
};

const HydroPower3DScene = () => {
  // Track loading state for a better user experience
  const [isLoading, setIsLoading] = useState(true);
  
  // Handle loading completion
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div style={{ 
      width: 600,  // Expanded from 110% to 120%
      height: 500,    // Expanded from 550 to 600
      background: 'transparent',
      position: 'relative',
      borderRadius: '12px',
      overflow: 'hidden',
      margin: '-20px'  // Negative margin to offset increased size
    }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#3498db',
          fontSize: '1.2rem',
          zIndex: 10
        }}>
          Loading hydro power model...
        </div>
      )}
      
      <Canvas 
        shadows 
        camera={{ 
          position: [20, 6, 20],  // Adjusted camera position for better view
          fov: 75                 // Wider field of view to see more of the model
        }}
        gl={{ alpha: true, antialias: true }}
        onCreated={state => {
          // Set clear color to transparent to blend with background
          state.gl.setClearColor(new THREE.Color(0xffffff), 0);
        }}
      >
        {/* Scene lighting */}
        <ambientLight intensity={0.5} /> {/* Increased ambient light */}
        <directionalLight 
          intensity={1.2}        // Increased light intensity
          position={[5, 10, 5]} 
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight 
          intensity={0.7}        // Increased fill light
          position={[-5, 5, -5]} 
        />
        
        {/* Try to load the GLB model, with fallback */}
        <Suspense fallback={<LoadingBox />}>
          <ErrorBoundary fallback={<EnlargedHydroPowerFallback />}>
            <EnlargedHydroPowerModel />
          </ErrorBoundary>
        </Suspense>
        
        {/* Camera controls */}
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          minDistance={6}        // Reduced to allow closer zoom
          maxDistance={50}       // Increased max distance
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          enableDamping={true}
          dampingFactor={0.05}
          target={[0, 0, 0]}     // Set target to center of model
        />
      </Canvas>
    </div>
  );
};

export default HydroPower3DScene;