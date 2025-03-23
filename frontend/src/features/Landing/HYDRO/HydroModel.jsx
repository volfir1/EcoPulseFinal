import React, { useRef, useEffect } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';

const HydroPowerModel = () => {
  const modelRef = useRef();
  
  // Load the FBX model with proper error handling
  let fbx;
  try {
    fbx = useLoader(
      FBXLoader, 
      '/3D/hydro.fbx', // Ensure your FBX file is in this location
      (loader) => {
        loader.crossOrigin = 'anonymous';
        console.log('Hydro power loader set up successfully');
      }
    );
  } catch (error) {
    console.error('Error loading hydro power model:', error);
    // We'll handle the fallback through a return null
    return null;
  }
  
  // Setup model once loaded
  useEffect(() => {
    if (fbx) {
      console.log('Hydro power model loaded successfully');
      
      // Reset position and apply appropriate scale
      fbx.position.set(0, -10, 0);
      fbx.rotation.set(0, 0, 0);
      fbx.scale.set(0.03, 0.03, 0.03); // FBX models often need different scaling than GLB
      
      // Center the model based on its bounding box
      const box = new THREE.Box3().setFromObject(fbx);
      const center = box.getCenter(new THREE.Vector3());
      fbx.position.x -= center.x;
      fbx.position.y -= center.y;
      fbx.position.z -= center.z;
      
      // Apply materials to all meshes
      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Apply appropriate colors based on part type
          let material;
          
          if (child.name.includes('water') || child.name.includes('river')) {
            // Blue water
            material = new THREE.MeshStandardMaterial({
              color: '#3498db',
              metalness: 0.1,
              roughness: 0.2,
              transparent: true,
              opacity: 0.8,
              emissive: '#2980b9',
              emissiveIntensity: 0.2
            });
          } else if (child.name.includes('dam') || child.name.includes('structure')) {
            // Gray concrete dam
            material = new THREE.MeshStandardMaterial({
              color: '#7f8c8d',
              metalness: 0.1,
              roughness: 0.8,
            });
          } else if (child.name.includes('turbine') || child.name.includes('generator')) {
            // Metal parts
            material = new THREE.MeshStandardMaterial({
              color: '#95a5a6',
              metalness: 0.6,
              roughness: 0.2,
            });
          } else {
            // Default material - concrete-like
            material = new THREE.MeshStandardMaterial({
              color: '#bdc3c7',
              metalness: 0.1,
              roughness: 0.5,
            });
          }
          
          // Apply material
          child.material = material;
        }
      });
    }
  }, [fbx]);
  
  // Subtle water animation if applicable
  useFrame(({ clock }) => {
    if (fbx) {
      // Find water parts and animate them
      fbx.traverse((child) => {
        if (child.isMesh && (child.name.includes('water') || child.name.includes('river'))) {
          // Gentle wave motion based on time
          const time = clock.getElapsedTime();
          const height = Math.sin(time * 0.5) * 0.05;
          child.position.y = child.userData.originalY || 0 + height;
          
          // Store original Y position if not already stored
          if (child.userData.originalY === undefined) {
            child.userData.originalY = child.position.y;
          }
        }
      });
    }
  });

  // Return the model
  return fbx ? <primitive ref={modelRef} object={fbx} /> : null;
};

export default HydroPowerModel;