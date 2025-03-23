import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import SolarPanelModel from './SolarPanel';
import * as THREE from 'three';
// Simple loading indicator that's clearly visible
const LoadingBox = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#32a832" wireframe />
  </mesh>
);

// Fallback component in case the model fails to load
const FallbackSolarPanel = () => {
  return (
    <group>
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[2, 0.1, 1.5]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 6, 0, 0]}>
        <boxGeometry args={[1.8, 0.05, 1.2]} />
        <meshStandardMaterial color="#2244dd" metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
};

const SolarPanel3DScene = () => {
  return (
    <div style={{ width: '200%', height: 450, background: '#f0f0f0' }}>
      <Canvas 
        shadows 
        camera={{ position: [3, 3, 3], fov: 50 }}
        onCreated={state => {
          // Set clear color to match your page background
          state.gl.setClearColor(new THREE.Color('#a9bba9'));
        }}
      >
        {/* Simple lighting setup that won't cause issues */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          intensity={0.8} 
          position={[5, 5, 5]} 
          castShadow 
        />
        
        {/* Scene components with error boundary */}
        <Suspense fallback={<LoadingBox />}>
          <ErrorBoundary fallback={<FallbackSolarPanel />}>
            <SolarPanelModel />
          </ErrorBoundary>
        </Suspense>
        
        {/* Simple controls */}
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={2}
          maxDistance={10}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
};

// Simple error boundary component
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

export default SolarPanel3DScene;