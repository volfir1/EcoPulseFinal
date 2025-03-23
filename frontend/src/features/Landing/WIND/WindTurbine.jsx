import React, { useRef, useEffect, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const WindTurbineModel = () => {
  const modelRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Create refs for the turbine blades group
  const bladesRef = useRef([]);
  const rotorRef = useRef(null);
  
  // Try to load the model with better error handling
  let gltf;
  try {
    gltf = useLoader(
      GLTFLoader, 
      '/3D/wind_turbine.glb',
      (loader) => {
        loader.crossOrigin = 'anonymous';
        console.log('Wind turbine loader set up successfully');
      }
    );
  } catch (error) {
    console.error('Error loading wind turbine model:', error);
    // We'll handle the fallback through the modelLoaded state
  }
  
  // Setup model once loaded
  useEffect(() => {
    if (gltf && gltf.scene) {
      console.log('Wind turbine model loaded successfully');
      setModelLoaded(true);
      
      // Reset position and apply appropriate scale
      gltf.scene.position.set(0, -10, 0);
      gltf.scene.rotation.set(0, 0, 0);
      gltf.scene.scale.set(0.005, 0.005, 0.005);
      
      // Center the model based on its bounding box
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.x -= center.x;
      gltf.scene.position.y -= center.y;
      gltf.scene.position.z -= center.z;
      
      // Apply materials and identify blade components
      const blades = [];
      let hub = null;
      
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Apply appropriate colors based on part name
          let material;
          
          if (child.name.includes('blade') || child.name.includes('rotor')) {
            // Warmer white blades with orange-red reflections for sunset feel
            material = new THREE.MeshStandardMaterial({
              color: '#fcfcfc',
              metalness: 0.3,
              roughness: 0.2,
              emissive: '#ff8642',
              emissiveIntensity: 0.05
            });
            
            // Store blade reference for animation
            child.userData.isBlade = true;
            blades.push(child);
            
            // Handle red tip coloring separately if needed
            if (child.name.includes('tip')) {
              material.color = new THREE.Color('#e74c3c');
              material.emissiveIntensity = 0.1;
            }
            
          } else if (child.name.includes('tower') || child.name.includes('pole')) {
            // Light gray tower with sunset reflection
            material = new THREE.MeshStandardMaterial({
              color: '#f5f5f5',
              metalness: 0.3,
              roughness: 0.2,
              emissive: '#ff9e66',
              emissiveIntensity: 0.03
            });
            
          } else if (child.name.includes('nacelle') || child.name.includes('hub')) {
            // Light gray nacelle/hub
            material = new THREE.MeshStandardMaterial({
              color: '#e0e0e0',
              metalness: 0.3,
              roughness: 0.2,
              emissive: '#ff9e66',
              emissiveIntensity: 0.03
            });
            
            // Store hub reference for animation
            if (child.name.includes('hub')) {
              hub = child;
            }
            
          } else if (child.name.includes('base')) {
            // Warm-toned base to match sunset
            material = new THREE.MeshStandardMaterial({
              color: '#e9967a', // Darker sunset orange
              metalness: 0.1,
              roughness: 0.8,
              emissive: '#b06350',
              emissiveIntensity: 0.1
            });
            
          } else {
            // Default material - sunset toned
            material = new THREE.MeshStandardMaterial({
              color: '#e0e0e0',
              metalness: 0.2,
              roughness: 0.3,
              emissive: '#ff9e66',
              emissiveIntensity: 0.05
            });
          }
          
          // Apply material
          child.material = material;
        }
      });
      
      // Store references for animation
      bladesRef.current = blades;
      rotorRef.current = hub;
    }
  }, [gltf]);
  
  // Enhanced blade animation with much faster rotation
  useFrame(({ clock }) => {
    if (modelLoaded && modelRef.current) {
      // Natural wind simulation effect with faster speed
      const windSpeed = 3.0 + (Math.sin(clock.getElapsedTime() * 0.1) * 0.5);
      
      // Very subtle oscillation of the entire turbine
      const oscillation = Math.sin(clock.getElapsedTime() * 0.2) * 0.01;
      modelRef.current.rotation.y = oscillation;
      
      // Animate each blade with faster rotation
      if (bladesRef.current.length > 0) {
        bladesRef.current.forEach(blade => {
          if (blade && blade.rotation) {
            blade.rotation.z += 0.08 * windSpeed;
          }
        });
      }
      
      // Rotate the hub with the blades if available
      if (rotorRef.current) {
        rotorRef.current.rotation.z += 0.08 * windSpeed;
      }
    }
  });

  // If model failed to load, just return an empty group so the fallback will be shown
  if (!modelLoaded || !gltf) {
    return null;
  }

  // Return the model
  return <primitive ref={modelRef} object={gltf.scene} />;
};

export default WindTurbineModel;