import React, { useRef, useEffect } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const SolarPanelModel = () => {
  const modelRef = useRef();
  
  // Load the model with proper error handling
  const gltf = useLoader(
    GLTFLoader, 
    '/3D/solar_panel.glb', 
    (loader) => {
      console.log('Loader set up successfully');
    },
    (error) => {
      console.error('Error loading model:', error);
    }
  );
  
  useEffect(() => {
    if (gltf) {
      console.log('Model loaded successfully');
      
      // Reset position and apply appropriate scale
      gltf.scene.position.set(0, 0, 0);
      gltf.scene.rotation.set(0, 0, 0);
      gltf.scene.scale.set(0.01, 0.01, 0.01);
      
      // Center the model based on its bounding box
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.x -= center.x;
      gltf.scene.position.y -= center.y;
      gltf.scene.position.z -= center.z;
      
      // Apply materials to all meshes
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Create simple but visually appealing materials
          child.material = new THREE.MeshStandardMaterial({
            color: child.name.includes('panel') ? '#2244dd' : '#dddddd',
            metalness: 0.7,
            roughness: 0.3,
          });
        }
      });
    }
  }, [gltf]);
  
  // Gentle rotation that won't cause issues
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.002;
    }
  });

  // Return the model
  return <primitive ref={modelRef} object={gltf.scene} />;
};

export default SolarPanelModel;