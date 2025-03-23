import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import WindTurbineModel from './WindTurbine';
import * as THREE from 'three';

// Sunset-colored cloud component
const SunsetCloud = ({ position, color = '#ffcdb8', highColor = '#ff8642', scale = 10 }) => {
  return (
    <group position={position} scale={[scale, scale * 0.6, scale]}>
      {/* Main cloud parts with sunset gradient effects */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 7, 7]} />
        <meshStandardMaterial 
          color={color} 
          roughness={1} 
          emissive={highColor}
          emissiveIntensity={0.1}
        />
      </mesh>
      <mesh position={[1.2, 0.3, 0]}>
        <sphereGeometry args={[0.9, 7, 7]} />
        <meshStandardMaterial 
          color={color} 
          roughness={1}
          emissive={highColor}
          emissiveIntensity={0.15} 
        />
      </mesh>
      <mesh position={[-1.2, 0.2, 0]}>
        <sphereGeometry args={[0.8, 7, 7]} />
        <meshStandardMaterial 
          color={color} 
          roughness={1}
          emissive={highColor}
          emissiveIntensity={0.1} 
        />
      </mesh>
      <mesh position={[0.5, 0.5, 0.5]}>
        <sphereGeometry args={[0.7, 7, 7]} />
        <meshStandardMaterial 
          color={color} 
          roughness={1}
          emissive={highColor}
          emissiveIntensity={0.2} 
        />
      </mesh>
      <mesh position={[-0.5, 0.4, -0.5]}>
        <sphereGeometry args={[0.6, 7, 7]} />
        <meshStandardMaterial 
          color={color} 
          roughness={1}
          emissive={highColor}
          emissiveIntensity={0.15} 
        />
      </mesh>
    </group>
  );
};

// Simple loading indicator
const LoadingBox = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#32a832" wireframe />
  </mesh>
);

// Fallback component in case the model fails to load
// Enhanced fallback component with sunset colors
const FallbackWindTurbine = () => {
  const [rotation, setRotation] = useState(0);
  
  // Rotate the blades with faster speed
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.03);
    }, 16);
    
    return () => clearInterval(interval);
  }, []);
  
  // Colors matching the sunset theme
  const baseColor = "#e9967a"; // Sunset orange base
  const towerColor = "#f5f5f5"; // White tower with slight orange tint
  const nacelleColor = "#e0e0e0"; // Light gray nacelle
  const bladeColor = "#fcfcfc"; // Slightly warm white blades
  const tipColor = "#e74c3c"; // Red tips
  
  return (
    <group>
      {/* Base - using octahedron for geometric look with sunset colors */}
      <mesh position={[0, -8, 0]} scale={[4, 2, 4]} rotation={[0, Math.PI/4, 0]}>
        <octahedronGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color={baseColor} 
          flatShading={true} 
          emissive="#b06350"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Tower */}
      <mesh position={[0, 3, 0]} scale={[0.4, 8, 0.4]}>
        <cylinderGeometry />
        <meshStandardMaterial 
          color={towerColor} 
          metalness={0.2} 
          roughness={0.1}
          emissive="#ff9e66"
          emissiveIntensity={0.03}
        />
      </mesh>
      
      {/* Nacelle */}
      <mesh position={[0, 11, 0.5]} scale={[0.7, 0.7, 1.5]}>
        <boxGeometry />
        <meshStandardMaterial 
          color={nacelleColor} 
          metalness={0.3} 
          roughness={0.2}
          emissive="#ff9e66"
          emissiveIntensity={0.05}
        />
      </mesh>
      
      {/* Hub with faster rotating blades */}
      <mesh position={[0, 11, 2]} rotation={[0, 0, rotation]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color={nacelleColor} 
          metalness={0.3} 
          roughness={0.3}
          emissive="#ff9e66"
          emissiveIntensity={0.05}
        />
      
        {/* Blades with red tips - rotating together */}
        {[0, 120, 240].map((rotationAngle, index) => (
          <group 
            key={index}
            rotation={[0, 0, rotationAngle * (Math.PI / 180)]}
          >
            {/* Main blade - white with sunset reflections */}
            <mesh position={[0, 3, 0]}>
              <boxGeometry args={[0.3, 6, 0.1]} />
              <meshStandardMaterial 
                color={bladeColor} 
                metalness={0.1} 
                roughness={0.2}
                emissive="#ff8642"
                emissiveIntensity={0.05}
              />
            </mesh>
            
            {/* Red tip */}
            <mesh position={[0, 6.5, 0]}>
              <boxGeometry args={[0.3, 1, 0.1]} />
              <meshStandardMaterial 
                color={tipColor} 
                metalness={0.1} 
                roughness={0.3}
                emissive="#ff8642"
                emissiveIntensity={0.1}
              />
            </mesh>
          </group>
        ))}
      </mesh>
    </group>
  );
};

const WindTurbine3DScene = () => {
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
      height: 500, 
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
          color: '#f8d8c0',
          fontSize: '1.2rem',
          zIndex: 10
        }}>
          Loading turbine model...
        </div>
      )}
      
      <Canvas 
        shadows 
        camera={{ position: [30, 20, 30], fov: 25 }}
        onCreated={state => {
          // Set clear color to transparent to blend with background
          state.gl.setClearColor(new THREE.Color('transparent'));
        }}
      >
        {/* Simple lighting setup */}
        {/* Scene lighting to match sunset in background image */}
        <ambientLight intensity={0.5} color="#ffd4a3" />
        <directionalLight 
          intensity={1.2} 
          position={[-10, 10, 10]} 
          color="#ff7e40"
          castShadow
        />
        <directionalLight 
          intensity={0.8} 
          position={[10, 5, -10]} 
          color="#ffb973"
        />
        
        {/* Subtle fog to blend with background */}
        <fog attach="fog" args={['#ff9e66', 30, 100]} />
        
        {/* Scene components with error boundary */}
        <Suspense fallback={<LoadingBox />}>
          <ErrorBoundary fallback={<FallbackWindTurbine />}>
            <WindTurbineModel />
          </ErrorBoundary>
        </Suspense>
        
        {/* Add a stylized base with sunset colors */}
        <mesh 
          position={[0, -15, 0]}
          receiveShadow
          castShadow
        >
          <octahedronGeometry args={[20, 1]} />
          <meshStandardMaterial 
            color="#e9967a"
            emissive="#b06350"
            emissiveIntensity={0.2}
            roughness={0.8}
            metalness={0.1}
            flatShading={true}
          />
        </mesh>
        
        {/* Add clouds with sunset colors */}
        <group position={[0, 20, 0]}>
          <SunsetCloud position={[-40, 30, -30]} color="#ffcdb8" highColor="#ff8642" scale={10} />
          <SunsetCloud position={[50, 20, -40]} color="#ffd4a3" highColor="#ff9e66" scale={15} />
          <SunsetCloud position={[25, 40, 30]} color="#ffcdb8" highColor="#ff8642" scale={12} />
        </group>
        
        {/* Modified controls to better view the entire turbine */}
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          target={[0, 5, 0]} // Target higher up on the turbine
          maxPolarAngle={Math.PI * 0.45}
          minPolarAngle={Math.PI * 0.25}
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

export default WindTurbine3DScene;