import React, { useState, useEffect } from 'react';
import * as THREE from 'three';

// Enhanced fallback component that will be shown if the GLTF model fails to load
const FallbackWindTurbine = () => {
  const [rotation, setRotation] = useState(0);
  
  // Rotate the blades with faster speed
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.08);
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
      <group position={[0, 11, 2]} rotation={[0, 0, rotation]}>
        <mesh>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial 
            color={nacelleColor} 
            metalness={0.3} 
            roughness={0.3}
            emissive="#ff9e66"
            emissiveIntensity={0.05}
          />
        </mesh>
      
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
      </group>
    </group>
  );
};

export default FallbackWindTurbine;