import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import HydroPowerModel from './HydroModel';
import HydroPowerFallback from './HydroFallback';
import * as THREE from 'three';

// Simple loading indicator
const LoadingBox = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
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
      width: '100%', 
      height: 350,  // Match original height from hero section
      background: 'transparent',
      position: 'relative',
      borderRadius: '12px',
      overflow: 'hidden'
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
        camera={{ position: [15, 8, 15], fov: 40 }}
        onCreated={state => {
          // Set clear color to transparent to blend with background
          state.gl.setClearColor(new THREE.Color('transparent'));
        }}
      >
        {/* Scene lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          intensity={1} 
          position={[5, 10, 5]} 
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight 
          intensity={0.5} 
          position={[-5, 5, -5]} 
        />
        
        {/* Try to load the FBX model, with fallback */}
        <Suspense fallback={<LoadingBox />}>
          <ErrorBoundary fallback={<HydroPowerFallback />}>
            <HydroPowerModel />
          </ErrorBoundary>
        </Suspense>
        
        {/* Static camera controls */}
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          minDistance={10}
          maxDistance={50}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
};

export default HydroPower3DScene;