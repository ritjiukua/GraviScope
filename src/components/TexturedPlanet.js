import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Generate procedural planet textures
const generatePlanetTexture = (id) => {
  // Create a canvas to generate the texture
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Base colors for different planet types
  const colors = {
    sun: { primary: '#ffff00', secondary: '#ff8800', detail: '#ff4400' },
    mercury: { primary: '#aaa9ad', secondary: '#8c7853', detail: '#6e6e6e' },
    venus: { primary: '#e6e6b8', secondary: '#d6b56b', detail: '#b89d6b' },
    earth: { primary: '#0077ff', secondary: '#00aa44', detail: '#bb7744' },
    mars: { primary: '#ff5500', secondary: '#aa3300', detail: '#772200' },
    jupiter: { primary: '#ffaa66', secondary: '#cc9944', detail: '#774411' },
    saturn: { primary: '#eedc82', secondary: '#d4ca9a', detail: '#aa9955' },
    uranus: { primary: '#b0e0e6', secondary: '#86bad3', detail: '#6a92d4' },
    neptune: { primary: '#5b9bd5', secondary: '#4682b4', detail: '#104e8b' },
    moon: { primary: '#bbbbbb', secondary: '#888888', detail: '#555555' },
    phobos: { primary: '#8b4513', secondary: '#a0522d', detail: '#6b4226' },
    deimos: { primary: '#8b4513', secondary: '#cd853f', detail: '#6b4226' },
    io: { primary: '#ffff00', secondary: '#ff8800', detail: '#ff0000' },
    europa: { primary: '#f0f8ff', secondary: '#b0c4de', detail: '#4682b4' },
    ganymede: { primary: '#a9a9a9', secondary: '#778899', detail: '#696969' },
    callisto: { primary: '#696969', secondary: '#808080', detail: '#a9a9a9' },
    titan: { primary: '#ffd700', secondary: '#daa520', detail: '#b8860b' },
    default: { primary: '#ffffff', secondary: '#cccccc', detail: '#888888' }
  };
  
  // Get colors or use default if not found
  const colorSet = colors[id] || colors.default;
  
  // Sun special case
  if (id === 'sun') {
    // Create a radial gradient for the sun
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, '#ffffa0');
    gradient.addColorStop(0.5, '#ffff00');
    gradient.addColorStop(0.8, '#ff8800');
    gradient.addColorStop(1, '#ff4400');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some solar flares
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = 5 + Math.random() * 15;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
    }
  } 
  // Gas giants (Jupiter, Saturn, Uranus, Neptune)
  else if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(id)) {
    // Fill background
    ctx.fillStyle = colorSet.primary;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add bands
    const bandCount = id === 'jupiter' ? 12 : id === 'saturn' ? 8 : 6;
    const bandHeight = canvas.height / bandCount;
    
    for (let i = 0; i < bandCount; i++) {
      const y = i * bandHeight;
      const isAlternateBand = i % 2 === 0;
      
      ctx.fillStyle = isAlternateBand ? colorSet.secondary : colorSet.primary;
      ctx.fillRect(0, y, canvas.width, bandHeight);
      
      // Add some swirls and details
      const detailsCount = Math.floor(4 + Math.random() * 8);
      for (let j = 0; j < detailsCount; j++) {
        const x = Math.random() * canvas.width;
        const detailY = y + Math.random() * bandHeight;
        const width = 20 + Math.random() * 80;
        const height = bandHeight * 0.3 + Math.random() * (bandHeight * 0.5);
        
        ctx.beginPath();
        ctx.ellipse(x, detailY, width, height, 0, 0, Math.PI * 2);
        ctx.fillStyle = isAlternateBand ? 
          `rgba(${parseInt(colorSet.detail.slice(1, 3), 16)}, ${parseInt(colorSet.detail.slice(3, 5), 16)}, ${parseInt(colorSet.detail.slice(5, 7), 16)}, 0.4)` :
          `rgba(${parseInt(colorSet.secondary.slice(1, 3), 16)}, ${parseInt(colorSet.secondary.slice(3, 5), 16)}, ${parseInt(colorSet.secondary.slice(5, 7), 16)}, 0.4)`;
        ctx.fill();
      }
    }
    
    // For Jupiter, add the Great Red Spot
    if (id === 'jupiter') {
      const spotX = canvas.width * 0.7;
      const spotY = canvas.height * 0.3;
      const spotWidth = canvas.width * 0.15;
      const spotHeight = canvas.height * 0.08;
      
      ctx.beginPath();
      ctx.ellipse(spotX, spotY, spotWidth, spotHeight, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ff4500';
      ctx.fill();
    }
  }
  // Rocky planets (Mercury, Venus, Earth, Mars) and moons
  else {
    // Fill background
    ctx.fillStyle = colorSet.primary;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add surface details (craters, terrain)
    const detailsCount = id === 'earth' ? 50 : 100;
    for (let i = 0; i < detailsCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = 2 + Math.random() * (id === 'moon' || id === 'mercury' ? 10 : 5);
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${parseInt(colorSet.detail.slice(1, 3), 16)}, ${parseInt(colorSet.detail.slice(3, 5), 16)}, ${parseInt(colorSet.detail.slice(5, 7), 16)}, ${Math.random() * 0.5 + 0.2})`;
      ctx.fill();
    }
    
    // Add continents for Earth
    if (id === 'earth') {
      // Generate some continent-like shapes
      for (let i = 0; i < 7; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 30 + Math.random() * 70;
        
        ctx.beginPath();
        
        // Create irregular polygon for continent
        const points = 8 + Math.floor(Math.random() * 7);
        for (let j = 0; j < points; j++) {
          const angle = (j / points) * Math.PI * 2;
          const radius = size * (0.5 + Math.random() * 0.5);
          const px = x + Math.cos(angle) * radius;
          const py = y + Math.sin(angle) * radius;
          
          if (j === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        
        ctx.closePath();
        ctx.fillStyle = colorSet.secondary;
        ctx.fill();
      }
      
      // Add polar ice caps
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.15);
      ctx.fillRect(0, canvas.height * 0.85, canvas.width, canvas.height * 0.15);
    }
    
    // Add polar caps for Mars
    if (id === 'mars') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.1);
      ctx.fillRect(0, canvas.height * 0.9, canvas.width, canvas.height * 0.1);
    }
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
};

// Rotation speeds (radians/second)
const rotationSpeeds = {
  sun: 0.001,
  mercury: 0.0001,
  venus: -0.00005, // Venus rotates backwards
  earth: 0.001,
  mars: 0.0009,
  jupiter: 0.003,
  saturn: 0.0025,
  uranus: 0.0015,
  neptune: 0.0017,
  moon: 0.0001,
  default: 0.001
};

// Planet ring component
const PlanetRings = ({ innerRadius, outerRadius, rotation, color }) => {
  const ringGeometryRef = useRef();
  
  // Generate ring texture
  const ringTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Draw ring segments
    for (let i = 0; i < canvas.width; i++) {
      const shade = Math.random() * 0.3 + 0.7;
      ctx.fillStyle = `rgba(${parseInt(color.slice(1, 3), 16) * shade}, ${parseInt(color.slice(3, 5), 16) * shade}, ${parseInt(color.slice(5, 7), 16) * shade}, ${Math.random() * 0.5 + 0.5})`;
      ctx.fillRect(i, 0, 1, canvas.height);
    }
    
    // Add some gaps and variations
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * canvas.width;
      const width = 5 + Math.random() * 20;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x, 0, width, canvas.height);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  }, [color]);
  
  return (
    <mesh rotation={rotation || [Math.PI / 2, 0, 0]}>
      <ringGeometry args={[innerRadius, outerRadius, 64]} ref={ringGeometryRef} />
      <meshBasicMaterial 
        side={THREE.DoubleSide} 
        color={color} 
        transparent
        opacity={0.7}
        map={ringTexture}
      />
    </mesh>
  );
};

// Moon component
const Moon = ({ position, rotation, size, parentId, moonId, orbitSpeed = 0.001 }) => {
  const moonRef = useRef();
  const orbitRef = useRef(0);
  
  // Generate texture based on moon ID
  const texture = useMemo(() => generatePlanetTexture(moonId), [moonId]);
  
  // Calculate initial orbit angle
  useEffect(() => {
    orbitRef.current = Math.random() * Math.PI * 2;
  }, []);
  
  // Update moon position in orbit around parent
  useFrame((state, delta) => {
    if (moonRef.current) {
      // Update orbit angle
      orbitRef.current += orbitSpeed;
      
      // Calculate new position based on orbit
      const orbitRadius = position[0]; // Use x as orbit radius
      moonRef.current.position.x = Math.cos(orbitRef.current) * orbitRadius;
      moonRef.current.position.z = Math.sin(orbitRef.current) * orbitRadius;
      
      // Rotate the moon
      moonRef.current.rotation.y += rotationSpeeds[moonId] || rotationSpeeds.default;
    }
  });
  
  return (
    <mesh ref={moonRef} position={[position[0], position[1], position[2]]}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

// Main TexturedPlanet component
const TexturedPlanet = ({ 
  id,
  position, 
  size, 
  selected, 
  hasRings,
  ringParams,
  moons = []
}) => {
  const planetRef = useRef();
  
  // Generate texture based on planet ID
  const texture = useMemo(() => generatePlanetTexture(id), [id]);
  
  // Rotate planet on its axis
  useFrame((state, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += rotationSpeeds[id] || rotationSpeeds.default;
    }
  });
  
  return (
    <group position={position}>
      {/* Planet/star sphere */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial 
          map={texture}
          emissive={id === 'sun' ? 0xffff00 : undefined} 
          emissiveIntensity={id === 'sun' ? 0.5 : 0}
        />
        
        {/* Selection indicator */}
        {selected && (
          <mesh>
            <ringGeometry args={[size * 1.3, size * 1.4, 64]} />
            <meshBasicMaterial color={'#ffffff'} transparent opacity={0.6} />
          </mesh>
        )}
      </mesh>
      
      {/* Rings for planets like Saturn */}
      {hasRings && (
        <PlanetRings 
          innerRadius={ringParams?.innerRadius || size * 1.5} 
          outerRadius={ringParams?.outerRadius || size * 2.5}
          rotation={ringParams?.rotation}
          color={ringParams?.color || "#F0E6D0"}
        />
      )}
      
      {/* Moons orbiting the planet */}
      {moons.map((moon, index) => (
        <Moon 
          key={`${id}-moon-${index}`}
          position={[moon.distance, 0, 0]} // Initial position in orbit
          rotation={[0, 0, 0]}
          size={moon.size}
          parentId={id}
          moonId={moon.id}
          orbitSpeed={moon.orbitSpeed}
        />
      ))}
    </group>
  );
};

export default TexturedPlanet; 