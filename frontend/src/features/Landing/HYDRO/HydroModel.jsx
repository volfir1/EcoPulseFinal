import React, { useRef, useEffect } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const HydroPowerModel = () => {
  const modelRef = useRef();
  
  // Load the GLB model
  const gltf = useLoader(
    GLTFLoader, 
    '/3D/gravity_dam.glb',
    (loader) => {
      loader.crossOrigin = 'anonymous';
      console.log('Hydro power loader set up successfully');
    }
  );
  
  // Setup model once loaded
  useEffect(() => {
    if (gltf && gltf.scene) {
      console.log('Hydro power model loaded successfully');
      
      // Improved positioning and scaling for better visibility
      gltf.scene.position.set(0, -3, 0);  // Moved up from -5 to -3
      gltf.scene.rotation.set(0, Math.PI * 0.15, 0);  // Slight rotation for better angle
      gltf.scene.scale.set(0.7, 0.7, 0.7);  // Increased from 0.5 to 0.7
      
      // Apply materials and shadows to all meshes in the model
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Enhance materials for better visibility
          if (child.material) {
            // Increase metalness and reduce roughness for better reflections
            child.material.metalness = Math.min(child.material.metalness + 0.1, 1);
            child.material.roughness = Math.max(child.material.roughness - 0.1, 0);
          }
          
          // Enhanced water materials
          if (child.name.toLowerCase().includes('water')) {
            child.material = new THREE.MeshStandardMaterial({
              color: '#3498db',
              metalness: 0.2,
              roughness: 0.1,
              transparent: true,
              opacity: 0.85,
              emissive: '#2980b9',
              emissiveIntensity: 0.3
            });
          }
          
          // Enhance dam structure materials if present
          if (child.name.toLowerCase().includes('dam') || child.name.toLowerCase().includes('structure')) {
            // Keep original material but enhance it
            const originalMaterial = child.material;
            child.material = new THREE.MeshStandardMaterial({
              color: originalMaterial.color || new THREE.Color('#aaaaaa'),
              metalness: 0.15,
              roughness: 0.8,
              emissive: new THREE.Color('#111111'),
              emissiveIntensity: 0.05
            });
          }
        }
      });
    }
  }, [gltf]);
  
  // Animation for water elements
  const isCanvasAvailable = typeof useFrame === 'function';
  
  if (isCanvasAvailable) {
    useFrame(({ clock }) => {
      if (gltf && gltf.scene) {
        // Find water parts and animate them
        gltf.scene.traverse((child) => {
          if (child.isMesh && child.name.toLowerCase().includes('water')) {
            // More dynamic wave motion
            const time = clock.getElapsedTime();
            const height = Math.sin(time * 0.8) * 0.08;
            
            // Store original Y position if not already stored
            if (child.userData.originalY === undefined) {
              child.userData.originalY = child.position.y;
            }
            
            child.position.y = child.userData.originalY + height;
            
            // Also add slight rotation for more natural movement
            child.rotation.z = Math.sin(time * 0.4) * 0.02;
          }
        });
        
        // Slight overall model "breathing" for more visual interest
        if (modelRef.current) {
          const time = clock.getElapsedTime();
          modelRef.current.rotation.y = Math.sin(time * 0.1) * 0.03 + Math.PI * 0.15;
        }
      }
    });
  }

  // Return the model with ref
  return <primitive ref={modelRef} object={gltf.scene} />;
};

export default HydroPowerModel;