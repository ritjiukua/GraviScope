import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// PlanetLabel component that displays a label in 3D space
const PlanetLabel = ({ 
  position, 
  planetName, 
  planetId, 
  selected,
  cameraRef
}) => {
  const labelRef = useRef();
  
  // Calculate appropriate styles based on planet type
  const getLabelStyles = () => {
    const baseStyles = {
      padding: '3px 8px',
      borderRadius: '4px',
      fontSize: '0.85rem',
      fontWeight: '500',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      opacity: '0.9',
      transition: 'all 0.2s',
      backdropFilter: 'blur(4px)',
      pointerEvents: 'none',
    };
    
    // For the sun
    if (planetId === 'sun') {
      return {
        ...baseStyles,
        color: '#fff',
        textShadow: '0 0 5px rgba(255, 255, 200, 0.8)',
        background: 'rgba(255, 200, 0, 0.3)',
        border: '1px solid rgba(255, 200, 0, 0.6)',
        boxShadow: '0 0 8px rgba(255, 200, 0, 0.4)',
      };
    }
    
    // For selected planets
    if (selected) {
      return {
        ...baseStyles,
        color: '#fff',
        background: 'rgba(100, 150, 255, 0.4)',
        border: '1px solid rgba(100, 150, 255, 0.7)',
        boxShadow: '0 0 10px rgba(100, 150, 255, 0.5)',
        fontWeight: '600',
        opacity: '1',
      };
    }
    
    // Based on planet types
    switch (planetId) {
      case 'mercury':
      case 'venus':
      case 'earth':
      case 'mars':
        return {
          ...baseStyles,
          color: '#fff',
          background: 'rgba(50, 100, 150, 0.3)',
          border: '1px solid rgba(50, 100, 150, 0.5)',
        };
      case 'jupiter':
      case 'saturn':
        return {
          ...baseStyles,
          color: '#fff',
          background: 'rgba(180, 120, 70, 0.3)',
          border: '1px solid rgba(180, 120, 70, 0.5)',
        };
      case 'uranus':
      case 'neptune':
        return {
          ...baseStyles,
          color: '#fff',
          background: 'rgba(70, 130, 180, 0.3)',
          border: '1px solid rgba(70, 130, 180, 0.5)',
        };
      default:
        // Moons or other bodies
        return {
          ...baseStyles,
          color: '#eee',
          background: 'rgba(80, 80, 100, 0.3)',
          border: '1px solid rgba(80, 80, 100, 0.5)',
        };
    }
  };
  
  // Update label position and visibility on each frame
  useFrame((state) => {
    if (!labelRef.current) return;
    
    // Get camera position and calculate distance to planet
    // Use state.camera if orbitControlsRef is not available
    const cameraPosition = cameraRef?.current?.position || state.camera.position;
    const distance = new THREE.Vector3(...position).distanceTo(cameraPosition);
    
    // Calculate an offset from the planet based on its position relative to camera
    const planetPos = new THREE.Vector3(...position);
    const cameraToObject = new THREE.Vector3().subVectors(planetPos, cameraPosition).normalize();
    
    // Adjust opacity based on distance (fade out when too far)
    const maxDistance = 50;
    const minOpacity = 0.2;
    const maxOpacity = planetId === 'sun' || selected ? 1 : 0.9;
    
    let computedOpacity = maxOpacity;
    if (distance > maxDistance) {
      computedOpacity = Math.max(minOpacity, maxOpacity * (1 - (distance - maxDistance) / maxDistance));
    }
    
    // Apply opacity
    if (labelRef.current.firstChild) {
      labelRef.current.firstChild.style.opacity = computedOpacity;
      
      // For the sun and selected planets, always keep the label visible
      if (planetId === 'sun' || selected) {
        labelRef.current.firstChild.style.opacity = maxOpacity;
      }
      
      // Make selected planet's label bigger
      if (selected) {
        labelRef.current.firstChild.style.fontSize = '1rem';
        labelRef.current.firstChild.style.fontWeight = 'bold';
      } else {
        labelRef.current.firstChild.style.fontSize = '0.85rem';
        labelRef.current.firstChild.style.fontWeight = '500';
      }
    }
  });
  
  return (
    <Html
      ref={labelRef}
      position={position}
      distanceFactor={15}
      style={{
        transform: 'translate3d(-50%, -100%, 0)',
        marginTop: '-0.5em',
      }}
    >
      <div style={getLabelStyles()}>
        {planetName}
      </div>
    </Html>
  );
};

export default PlanetLabel; 