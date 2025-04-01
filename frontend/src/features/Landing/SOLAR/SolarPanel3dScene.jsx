import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import SolarPanelModel from './SolarPanel';
import * as THREE from 'three';

// Simple loading indicator that's clearly visible
const LoadingBox = () => (
  <mesh>
    <boxGeometry args={[0.5, 0.5, 0.5]} />
    <meshStandardMaterial color="#32a832" wireframe />
  </mesh>
);

// Fallback component in case the model fails to load - scaled down
const FallbackSolarPanel = () => {
  return (
    <group scale={[0.5, 0.5, 0.5]}>
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

// Wrapper component to scale down the original model
const ScaledSolarPanelModel = () => {
  return (
    <group scale={[0.5, 0.5, 0.5]}>
      <SolarPanelModel />
    </group>
  );
};

const SolarPanel3DScene = () => {
  return (
    <div style={{ width: '200%', height: 450 }}>
      <Canvas
        shadows
        camera={{ 
          position: [4, 4, 4], // Move camera further out
          fov: 40, // Narrower field of view makes the model appear smaller
          near: 0.1,
          far: 1000
        }}
        gl={{ alpha: true, antialias: true }}
        onCreated={state => {
          state.gl.setClearColor(new THREE.Color('#ffffff'), 0);
        }}
      >
        {/* Simple lighting setup that won't cause issues */}
        <ambientLight intensity={0.6} />
        <directionalLight
          intensity={0.8}
          position={[5, 5, 5]}
          castShadow
        />
        
        {/* Centered scene with error boundary */}
        <Suspense fallback={<LoadingBox />}>
          <ErrorBoundary fallback={<FallbackSolarPanel />}>
            <ScaledSolarPanelModel />
          </ErrorBoundary>
        </Suspense>
        
        {/* Controls with adjusted distances */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3.5}
          maxDistance={15}
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