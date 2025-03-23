import React, { useRef, useEffect, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const GeothermalPowerModel = () => {
  const modelRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Create refs for animated elements
  const steamVentsRef = useRef([]);
  const pipesRef = useRef([]);
  
  // Try to load the model with error handling
  let gltf;
  try {
    gltf = useLoader(
      GLTFLoader, 
      '/3D/geothermal_plant.glb',
      (loader) => {
        loader.crossOrigin = 'anonymous';
        console.log('Geothermal power loader set up successfully');
      }
    );
  } catch (error) {
    console.error('Error loading geothermal power model:', error);
    return null;
  }
  
  // Setup model once loaded
  useEffect(() => {
    if (gltf && gltf.scene) {
      console.log('Geothermal power model loaded successfully');
      setModelLoaded(true);
      
      // Reset position and apply appropriate scale
      gltf.scene.position.set(0, -10, 0);
      gltf.scene.rotation.set(0, 0, 0);
      gltf.scene.scale.set(0.01, 0.01, 0.01);
      
      // Center the model based on its bounding box
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.x -= center.x;
      gltf.scene.position.y -= center.y;
      gltf.scene.position.z -= center.z;
      
      // Apply materials and identify animated parts
      const steamVents = [];
      const pipes = [];
      
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Apply appropriate colors based on part type
          let material;
          
          if (child.name.includes('steam') || child.name.includes('vent')) {
            // Steam vents
            material = new THREE.MeshStandardMaterial({
              color: '#ffffff',
              metalness: 0.1,
              roughness: 0.1,
              transparent: true,
              opacity: 0.6,
              emissive: '#ffffff',
              emissiveIntensity: 0.2
            });
            steamVents.push(child);
          } else if (child.name.includes('pipe') || child.name.includes('tube')) {
            // Pipes and tubes
            material = new THREE.MeshStandardMaterial({
              color: '#b87333', // Copper color
              metalness: 0.8,
              roughness: 0.2,
            });
            pipes.push(child);
          } else if (child.name.includes('building') || child.name.includes('structure')) {
            // Buildings
            material = new THREE.MeshStandardMaterial({
              color: '#95a5a6',
              metalness: 0.2,
              roughness: 0.8,
            });
          } else if (child.name.includes('ground') || child.name.includes('terrain')) {
            // Ground/terrain
            material = new THREE.MeshStandardMaterial({
              color: '#7e5109', // Brown volcanic soil
              metalness: 0.1,
              roughness: 0.9,
            });
          } else {
            // Default material
            material = new THREE.MeshStandardMaterial({
              color: '#bdc3c7',
              metalness: 0.3,
              roughness: 0.7,
            });
          }
          
          // Apply material
          child.material = material;
        }
      });
      
      // Store references for animation
      steamVentsRef.current = steamVents;
      pipesRef.current = pipes;
    }
  }, [gltf]);
  
  // Steam and heat animations
  useFrame(({ clock }) => {
    if (modelLoaded && modelRef.current) {
      const time = clock.getElapsedTime();
      
      // Animate steam vents with pulsing opacity
      if (steamVentsRef.current.length > 0) {
        steamVentsRef.current.forEach((vent, index) => {
          // Varied pulsing for each vent
          const pulseFreq = 0.5 + (index * 0.2);
          const opacity = 0.4 + (Math.sin(time * pulseFreq) * 0.3);
          vent.material.opacity = opacity;
          
          // Also vary emissive intensity
          vent.material.emissiveIntensity = 0.1 + (Math.sin(time * pulseFreq) * 0.1);
        });
      }
      
      // Subtle color shifting for hot pipes
      if (pipesRef.current.length > 0) {
        pipesRef.current.forEach((pipe, index) => {
          // Varied heat pulsing for pipes
          const heatFreq = 0.3 + (index * 0.1);
          const heatIntensity = 0.1 + (Math.sin(time * heatFreq) * 0.05);
          
          // Update emissive for heat glow
          pipe.material.emissive = new THREE.Color('#ff4000');
          pipe.material.emissiveIntensity = heatIntensity;
        });
      }
    }
  });

  // Return the model
  return gltf ? <primitive ref={modelRef} object={gltf.scene} /> : null;
};

export default GeothermalPowerModel;