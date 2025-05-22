import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Generate a random asteroid shape
const generateAsteroidGeometry = (size, complexity) => {
  const geometry = new THREE.IcosahedronGeometry(size, complexity);
  
  // Deform vertices to make it more asteroid-like
  const positions = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  
  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);
    
    // Apply random displacement
    const distortion = 0.3 + Math.random() * 0.3;
    vertex.multiplyScalar(distortion);
    
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  
  geometry.computeVertexNormals();
  return geometry;
};

// Generate a texture for the asteroid
const generateAsteroidTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  // Fill with base color
  ctx.fillStyle = '#5a5a5a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add some craters
  const craterCount = 10 + Math.floor(Math.random() * 20);
  for (let i = 0; i < craterCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 2 + Math.random() * 10;
    
    // Crater rim (lighter)
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(120, 120, 120, ${0.2 + Math.random() * 0.3})`;
    ctx.fill();
    
    // Crater center (darker)
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(40, 40, 40, ${0.3 + Math.random() * 0.4})`;
    ctx.fill();
  }
  
  // Add some variation in color
  ctx.globalCompositeOperation = 'overlay';
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 5 + Math.random() * 15;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    const shade = Math.random() > 0.5 ? 
      `rgba(150, 150, 150, ${0.1 + Math.random() * 0.2})` : 
      `rgba(50, 50, 50, ${0.1 + Math.random() * 0.2})`;
    ctx.fillStyle = shade;
    ctx.fill();
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
};

// Individual asteroid instance
const Asteroid = ({ initialPosition, size, complexity, rotationSpeed, orbitSpeed, orbitRadius, orbitCenterOffset = [0, 0] }) => {
  const asteroidRef = useRef();
  const orbitAngleRef = useRef(Math.random() * Math.PI * 2);
  const rotationAxisRef = useRef(new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5
  ).normalize());
  
  // Generate unique geometry and texture
  const geometry = useMemo(() => generateAsteroidGeometry(size, complexity), [size, complexity]);
  const texture = useMemo(() => generateAsteroidTexture(), []);
  
  // Update position and rotation on each frame
  useFrame((state, delta) => {
    if (asteroidRef.current) {
      // Update orbit angle
      orbitAngleRef.current += orbitSpeed * delta;
      
      // Calculate new position based on orbit
      const x = Math.cos(orbitAngleRef.current) * orbitRadius + orbitCenterOffset[0];
      const z = Math.sin(orbitAngleRef.current) * orbitRadius + orbitCenterOffset[1];
      
      // Apply position
      asteroidRef.current.position.x = x;
      asteroidRef.current.position.z = z;
      
      // Rotate asteroid
      asteroidRef.current.rotateOnAxis(rotationAxisRef.current, rotationSpeed * delta);
    }
  });
  
  return (
    <mesh ref={asteroidRef} position={initialPosition}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial 
        map={texture} 
        metalness={0.4}
        roughness={0.7}
      />
    </mesh>
  );
};

// Main asteroid belt component
const AsteroidBelt = ({ 
  visible = true,
  count = 200, 
  innerRadius = 20, 
  outerRadius = 30,
  centerPosition = [0, 0, 0],
  beltThickness = 2,
  minSize = 0.05,
  maxSize = 0.3
}) => {
  // Generate asteroid data with Gaussian distribution
  const asteroidData = useMemo(() => {
    // Return empty array if not visible to avoid unnecessary calculations
    if (!visible) return [];
    
    const data = [];
    
    for (let i = 0; i < count; i++) {
      // Use Box-Muller transform for Gaussian distribution
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      
      const gaussian = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      
      // Map gaussian to radius
      const radius = (innerRadius + outerRadius) / 2 + 
                     (gaussian * (outerRadius - innerRadius) / 6);
      
      // Ensure radius stays within bounds
      const clampedRadius = Math.max(innerRadius, Math.min(outerRadius, radius));
      
      // Random angle for initial position
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * clampedRadius;
      const z = Math.sin(angle) * clampedRadius;
      
      // Random y position within belt thickness
      const y = (Math.random() - 0.5) * beltThickness;
      
      // Random size with smaller asteroids being more common
      const sizeRandom = Math.random();
      const size = minSize + (sizeRandom * sizeRandom) * (maxSize - minSize);
      
      // Orbital and rotation speeds - smaller asteroids move faster
      const orbitSpeedFactor = 0.5 + (1 - (size - minSize) / (maxSize - minSize)) * 0.5;
      const baseOrbitSpeed = 0.05 + Math.random() * 0.05;
      const orbitSpeed = baseOrbitSpeed * orbitSpeedFactor;
      
      const rotationSpeed = 0.2 + Math.random() * 0.8;
      
      // Geometry complexity (detail level) - smaller for smaller asteroids
      const complexity = size > (minSize + maxSize) / 2 ? 1 : 0;
      
      data.push({
        position: [centerPosition[0] + x, centerPosition[1] + y, centerPosition[2] + z],
        size,
        complexity,
        rotationSpeed,
        orbitSpeed,
        orbitRadius: clampedRadius,
        orbitCenterOffset: [centerPosition[0], centerPosition[2]]
      });
    }
    
    return data;
  }, [visible, count, innerRadius, outerRadius, centerPosition, beltThickness, minSize, maxSize]);
  
  if (!visible) return null;
  
  return (
    <group>
      {asteroidData.map((data, index) => (
        <Asteroid 
          key={`asteroid-${index}`} 
          initialPosition={data.position}
          size={data.size}
          complexity={data.complexity}
          rotationSpeed={data.rotationSpeed}
          orbitSpeed={data.orbitSpeed}
          orbitRadius={data.orbitRadius}
          orbitCenterOffset={data.orbitCenterOffset}
        />
      ))}
    </group>
  );
};

export default AsteroidBelt; 