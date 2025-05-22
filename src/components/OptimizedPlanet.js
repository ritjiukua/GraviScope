import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three/src/loaders/TextureLoader';

// Optimized planet component that supports both textured and wireframe visualization modes
const OptimizedPlanet = ({ 
  body, 
  position, 
  selected = false, 
  onClick = () => {}, 
  performanceSettings = { qualityLevel: 'medium' },
  hasRings = false,
  ringParams = null,
  moons = []
}) => {
  // Reference to the mesh
  const meshRef = useRef();
  const ringsRef = useRef();
  
  // State for hover and distance to camera
  const [hovered, setHovered] = useState(false);
  const [distanceToCamera, setDistanceToCamera] = useState(0);
  
  // Update distance to camera each frame for LOD
  useFrame(({ camera }) => {
    if (meshRef.current) {
      const dist = camera.position.distanceTo(meshRef.current.position);
      setDistanceToCamera(dist);
    }
  });
  
  // Determine detail level based on distance and performance settings
  const getDetailLevel = () => {
    const baseLevel = performanceSettings?.qualityLevel || 'medium';
    
    // Apply distance-based LOD with more conservative segment counts
    if (distanceToCamera > 40) {
      return 'low'; // Far objects always low detail
    } else if (distanceToCamera > 20) {
      // Medium distance objects get lower quality on low-end devices
      return baseLevel === 'low' ? 'low' : 'medium';
    } else {
      // Close objects get medium quality on low-end devices, high on others
      return baseLevel === 'low' ? 'medium' : 'high';
    }
  };
  
  // Get geometry segments based on detail level and object size
  const segments = useMemo(() => {
    const detailLevel = getDetailLevel();
    const baseSizeMultiplier = body.radius * 10;
    
    if (detailLevel === 'low') {
      return Math.max(8, Math.min(16, baseSizeMultiplier));
    } else if (detailLevel === 'medium') {
      return Math.max(16, Math.min(24, baseSizeMultiplier));
    } else {
      return Math.max(24, Math.min(32, baseSizeMultiplier));
    }
  }, [getDetailLevel(), body.radius]);
  
  // Load texture based on body type
  const texture = useMemo(() => {
    try {
      // Default textures for different body types
      let texturePath;
      
      if (body.id === 'sun') {
        texturePath = '/textures/sun.jpg';
      } else if (body.type === 'rocky') {
        switch (body.id) {
          case 'mercury': texturePath = '/textures/mercury.jpg'; break;
          case 'venus': texturePath = '/textures/venus.jpg'; break;
          case 'earth': texturePath = '/textures/earth.jpg'; break;
          case 'mars': texturePath = '/textures/mars.jpg'; break;
          default: texturePath = '/textures/rocky.jpg';
        }
      } else if (body.type === 'gas giant') {
        switch (body.id) {
          case 'jupiter': texturePath = '/textures/jupiter.jpg'; break;
          case 'saturn': texturePath = '/textures/saturn.jpg'; break;
          case 'uranus': texturePath = '/textures/uranus.jpg'; break;
          case 'neptune': texturePath = '/textures/neptune.jpg'; break;
          default: texturePath = '/textures/gas_giant.jpg';
        }
      } else {
        // Fallback texture
        texturePath = '/textures/default.jpg';
      }
      
      return new THREE.TextureLoader().load(texturePath);
    } catch (error) {
      console.error('Failed to load texture:', error);
      return null;
    }
  }, [body.id, body.type]);
  
  // Set up material based on body type
  const material = useMemo(() => {
    if (body.id === 'sun') {
      // Emissive material for the sun
      return new THREE.MeshBasicMaterial({
        color: body.color || '#ffff00',
        emissive: body.color || '#ffff00',
        emissiveIntensity: 0.8
      });
    } else if (texture) {
      // Textured material for planets
      return new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.2,
        roughness: 0.8
      });
    } else {
      // Fallback colored material
      return new THREE.MeshStandardMaterial({
        color: body.color || '#aaaaaa',
        metalness: 0.2,
        roughness: 0.7
      });
    }
  }, [body.id, body.color, texture]);
  
  // Scale up slightly when selected
  useEffect(() => {
    if (meshRef.current) {
      const scale = selected ? 1.05 : 1.0;
      meshRef.current.scale.set(scale, scale, scale);
    }
  }, [selected]);
  
  // Rotate the planet slowly
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.x = 0.5; // Tilt the rings
    }
  });

  // Handle click event more responsively
  const handleClick = (e) => {
    e.stopPropagation();
    onClick();
  };
  
  return (
    <group position={position}>
      {/* Main planet sphere */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
      >
        <sphereGeometry args={[body.radius, segments, segments]} />
        <primitive object={material} />
        
        {/* Selection indicator */}
        {selected && (
          <mesh>
            <sphereGeometry args={[body.radius * 1.15, 16, 16]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.2} 
              wireframe={true} 
            />
          </mesh>
        )}
      </mesh>
      
      {/* Rings for planets that have them (like Saturn) */}
      {hasRings && (
        <mesh ref={ringsRef} onClick={handleClick}>
          <ringGeometry 
            args={[
              body.radius * 1.5, 
              body.radius * 2.2, 
              32
            ]} 
          />
          <meshBasicMaterial 
            color="#ffebcd" 
            transparent 
            opacity={0.7} 
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Planet moons */}
      {moons && moons.map((moon, index) => {
        // Skip rendering small moons at large distances for performance
        if (distanceToCamera > 50 && moon.size < 0.05) return null;
        
        // Calculate orbital position
        const angle = (Date.now() * moon.orbitSpeed * 0.0001) % (Math.PI * 2);
        const x = moon.distance * Math.cos(angle);
        const z = moon.distance * Math.sin(angle);
        
        return (
          <mesh 
            key={`moon-${moon.id || index}`}
            position={[x, 0, z]}
            onClick={handleClick}
          >
            <sphereGeometry args={[moon.size, 8, 8]} />
            <meshStandardMaterial color="#aaaaaa" />
          </mesh>
        );
      })}
    </group>
  );
};

export default OptimizedPlanet; 