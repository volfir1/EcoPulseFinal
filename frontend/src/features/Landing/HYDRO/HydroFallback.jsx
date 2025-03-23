import React, { useState, useEffect } from 'react';
import * as THREE from 'three';

// Fallback component in case the FBX model fails to load
const HydroPowerFallback = () => {
  // Water animation state
  const [waterLevel, setWaterLevel] = useState(0);
  
  // Water animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setWaterLevel(prev => (Math.sin(Date.now() * 0.001) * 0.1));
    }, 16);
    
    return () => clearInterval(interval);
  }, []);
  
  // Dam colors
  const waterColor = "#3498db"; // Bright blue
  const damColor = "#7f8c8d";   // Gray concrete
  const topColor = "#95a5a6";   // Lighter gray for dam top
  
  return (
    <group>
      {/* Water reservoir */}
      <mesh position={[0, -1 + waterLevel, -5]} receiveShadow>
        <boxGeometry args={[20, 2, 10]} />
        <meshStandardMaterial 
          color={waterColor} 
          transparent={true}
          opacity={0.8}
          metalness={0.1}
          roughness={0.1}
          emissive={waterColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Dam body - curved shape */}
      <mesh position={[0, -3, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[10, 10, 8, 32, 1, false, Math.PI, Math.PI]} />
        <meshStandardMaterial 
          color={damColor} 
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      
      {/* Dam top */}
      <mesh position={[0, 1, 0]} receiveShadow castShadow>
        <boxGeometry args={[20, 0.5, 1]} />
        <meshStandardMaterial 
          color={topColor} 
          metalness={0.2}
          roughness={0.5}
        />
      </mesh>
      
      {/* Downstream river */}
      <mesh position={[0, -7, 10]} receiveShadow>
        <boxGeometry args={[6, 0.5, 20]} />
        <meshStandardMaterial 
          color={waterColor} 
          transparent={true}
          opacity={0.8}
          metalness={0.1}
          roughness={0.1}
          emissive={waterColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Powerhouse */}
      <mesh position={[0, -5, 5]} castShadow>
        <boxGeometry args={[5, 4, 3]} />
        <meshStandardMaterial 
          color="#bdc3c7" 
          metalness={0.1}
          roughness={0.5}
        />
      </mesh>
      
      {/* Water outlets */}
      {[-1.5, 0, 1.5].map((x, i) => (
        <mesh key={i} position={[x, -6, 3]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 2, 16]} rotation={[Math.PI/2, 0, 0]} />
          <meshStandardMaterial 
            color="#95a5a6" 
            metalness={0.6}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};

export default HydroPowerFallback;