import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three/src/loaders/TextureLoader';

// Okay, so here's the planet component. I want it to look cool, but also not kill my computer if I'm zoomed out.
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
  // Gotta keep a handle on the mesh so I can mess with it later
  const meshRef = useRef();
  const ringsRef = useRef();
  
  // Just tracking if the mouse is hovering and how far away the camera is
  const [hovered, setHovered] = useState(false);
  const [distanceToCamera, setDistanceToCamera] = useState(0);
  
  // Every frame, let's check how far the camera is. LOD magic!
  useFrame(({ camera }) => {
    if (meshRef.current) {
      const dist = camera.position.distanceTo(meshRef.current.position);
      setDistanceToCamera(dist);
    }
  });
  
  // How much detail do we actually need? Let's not go overboard if we don't have to
  const getDetailLevel = () => {
    const baseLevel = performanceSettings?.qualityLevel || 'medium';
    
    // If you're way out there, let's keep it simple
    if (distanceToCamera > 40) {
      return 'low'; // Far away? Eh, who needs detail
    } else if (distanceToCamera > 20) {
      // Potato mode if needed, otherwise medium
      return baseLevel === 'low' ? 'low' : 'medium';
    } else {
      // Up close and personal? Crank it up (unless your PC says no)
      return baseLevel === 'low' ? 'medium' : 'high';
    }
  };
  
  // Segments = smoothness. More segments = rounder planet, but also more work for the GPU
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
  
  // Time to pick a texture. This is where the planet gets its personality
  const texture = useMemo(() => {
    try {
      // I've got a bunch of textures for different planet types. Let's see what fits
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
        // No idea? Just slap on the default
        texturePath = '/textures/default.jpg';
      }
      
      return new THREE.TextureLoader().load(texturePath);
    } catch (error) {
      console.error('Failed to load texture:', error);
      return null;
    }
  }, [body.id, body.type]);
  
  // Materials! Sun glows, planets get their fancy skins, everything else gets a color
  const material = useMemo(() => {
    if (body.id === 'sun') {
      // Sun = big yellow ball of light
      return new THREE.MeshBasicMaterial({
        color: body.color || '#ffff00',
        emissive: body.color || '#ffff00',
        emissiveIntensity: 0.8
      });
    } else if (texture) {
      // Planets get their cool textures
      return new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.2,
        roughness: 0.8
      });
    } else {
      // If all else fails, just give it a color and call it a day
      return new THREE.MeshStandardMaterial({
        color: body.color || '#aaaaaa',
        metalness: 0.2,
        roughness: 0.7
      });
    }
  }, [body.id, body.color, texture]);
  
  // If you click a planet, let's make it a bit bigger so you know it's special
  useEffect(() => {
    if (meshRef.current) {
      const scale = selected ? 1.05 : 1.0;
      meshRef.current.scale.set(scale, scale, scale);
    }
  }, [selected]);
  
  // Planets spin, rings tilt. Because why not?
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.x = 0.5; // Saturn's rings are just showing off
    }
  });

  // Clicks should feel instant. No lag allowed!
  const handleClick = (e) => {
    e.stopPropagation();
    onClick();
  };
  
  return (
    <group position={position}>
      {/* The main planet sphere. This is the main event! */}
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
        
        {/* If you picked this planet, let's give it a little glow */}
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
      
      {/* Got rings? Show 'em off! */}
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
      
      {/* Moons! But if they're tiny and far away, let's not bother */}
      {moons && moons.map((moon, index) => {
        // If the moon is basically a pixel and super far, skip it
        if (distanceToCamera > 50 && moon.size < 0.05) return null;
        
        // Where's the moon right now? Let's spin it around its planet
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