import React, { useRef, useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stats, Stars, useDetectGPU, Text } from '@react-three/drei';
import * as THREE from 'three';
import solarSystemData from '../data/solarSystem';
import ControlPanel from './ControlPanel';
import PlanetInfoPanel from './PlanetInfoPanel';
import ViewModes from './ViewModes';
import OptimizedPlanet from './OptimizedPlanet';
import AsteroidBelt from './AsteroidBelt';
import PlanetLabel from './PlanetLabel';
import '../styles/GravitySimulator.css';

// Environment with stars and lighting
const SpaceEnvironment = ({ viewMode }) => {
  // Adjust star density based on view mode
  const getStarProps = () => {
    switch (viewMode) {
      case 'realistic':
        return { radius: 100, depth: 50, count: 5000, factor: 4, saturation: 0.5 };
      case 'schematic':
        return { radius: 100, depth: 50, count: 2000, factor: 4, saturation: 0.2 };
      case 'gravity':
        return { radius: 100, depth: 50, count: 1000, factor: 4, saturation: 0.1 };
      default:
        return { radius: 100, depth: 50, count: 5000, factor: 4, saturation: 0.5 };
    }
  };
  
  return (
    <>
      <Stars {...getStarProps()} />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#ffffaa" />
      {/* Add additional lights to ensure scene is visible from all angles */}
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <directionalLight position={[-10, -10, -5]} intensity={0.2} />
    </>
  );
};

// Component to render orbit paths - memoized to prevent unnecessary rerenders
const OrbitPath = memo(({ positions, color = '#ffffff', opacity = 0.2 }) => {
  const ref = useRef();
  
  useEffect(() => {
    if (ref.current && positions.length > 1) {
      const curve = new THREE.CatmullRomCurve3(
        positions.map(pos => new THREE.Vector3(pos[0], pos[1], pos[2]))
      );
      curve.closed = true;
      
      const points = curve.getPoints(positions.length * 2);
      ref.current.geometry.setFromPoints(points);
    }
  }, [positions]);
  
  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
});

OrbitPath.displayName = 'OrbitPath';

// Performance detection component
const PerformanceOptimizer = ({ children }) => {
  const gpu = useDetectGPU();
  const [qualityLevel, setQualityLevel] = useState('medium');
  
  useEffect(() => {
    // Determine quality level based on GPU tier
    if (gpu.tier === 0) {
      setQualityLevel('low');
    } else if (gpu.tier >= 2) {
      setQualityLevel('high');
    } else {
      setQualityLevel('medium');
    }
  }, [gpu.tier]);
  
  // Create context with performance settings
  const performanceContext = {
    qualityLevel,
    maxAsteroids: qualityLevel === 'low' ? 300 : qualityLevel === 'medium' ? 1000 : 3000,
    starCount: qualityLevel === 'low' ? 1000 : qualityLevel === 'medium' ? 3000 : 5000,
    useShadows: qualityLevel !== 'low',
    useHighResPlanets: qualityLevel === 'high',
    usePostProcessing: qualityLevel === 'high',
    maxOrbitPoints: qualityLevel === 'low' ? 100 : qualityLevel === 'medium' ? 300 : 500,
  };
  
  return (
    <div className={`quality-${qualityLevel}`}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { performanceSettings: performanceContext })
      )}
    </div>
  );
};

// Memoized TexturedPlanet component with LOD support
const OptimizedPlanetWrapper = memo(({ body, position, selected, onClick, performanceSettings }) => {
  // Calculate distance to camera for LOD
  const ref = useRef();
  const [distanceToCamera, setDistanceToCamera] = useState(0);
  
  useFrame(({ camera }) => {
    if (ref.current) {
      const dist = camera.position.distanceTo(ref.current.position);
      setDistanceToCamera(dist);
    }
  });
  
  // Skip rendering very distant and small planets for performance
  if (distanceToCamera > 80 && body.radius < 0.3 && !selected) {
    return null;
  }
  
  return (
    <group 
      ref={ref} 
      position={position}
    >
      <OptimizedPlanet 
        body={body}
        position={[0, 0, 0]} // Position is relative to the group
        selected={selected}
        onClick={onClick}
        performanceSettings={performanceSettings}
        hasRings={body.hasRings}
        ringParams={body.rings}
        moons={body.moons}
      />
    </group>
  );
});

OptimizedPlanetWrapper.displayName = 'OptimizedPlanetWrapper';

// Main simulation scene content - with performance optimizations
const SimulationContent = ({ 
  timeStep, 
  isPaused, 
  selectedBodyId, 
  setSelectedBody, 
  setShowInfoPanel, 
  viewMode, 
  showOrbits, 
  showLabels, 
  showAsteroids, 
  isFollowingBody, 
  setFollowingBody,
  orbitControlsRef,
  performanceSettings
}) => {
  // Refs
  const bodiesRef = useRef({});
  
  // State management
  const [bodies, setBodies] = useState(Object.values(solarSystemData));
  
  // Use memoized planets for stable rendering
  const planetsToRender = useMemo(() => 
    bodies.filter(body => !body.isMoon), 
    [bodies]
  );
  
  // Track positions for orbit paths - limit based on performance settings
  const [bodyPaths, setBodyPaths] = useState({});
  
  // Create cached force calculation function
  const calculateGravitationalForce = useCallback((body1, body2) => {
    const G = 6.67430e-11; // Gravitational constant
    
    // Calculate distance between bodies
    const dx = body2.position[0] - body1.position[0];
    const dy = body2.position[1] - body1.position[1];
    const dz = body2.position[2] - body1.position[2];
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    const distance = Math.sqrt(distanceSquared);
    
    // Skip if bodies are too close to avoid extreme forces
    if (distance < (body1.radius + body2.radius) * 0.8) {
      return [0, 0, 0];
    }
    
    // Calculate force magnitude: F = G * (m1 * m2) / r^2
    const forceMagnitude = G * body1.mass * body2.mass / distanceSquared;
    
    // Calculate force components
    const forceX = forceMagnitude * dx / distance;
    const forceY = forceMagnitude * dy / distance;
    const forceZ = forceMagnitude * dz / distance;
    
    return [forceX, forceY, forceZ];
  }, []);
  
  // Initialize body paths
  useEffect(() => {
    const initialPaths = {};
    bodies.forEach(body => {
      if (!body.fixed) {
        initialPaths[body.id] = [body.position];
      }
    });
    setBodyPaths(initialPaths);
  }, []);
  
  // Use Web Workers for physics calculations if available
  const [physicsWorker, setPhysicsWorker] = useState(null);
  
  useEffect(() => {
    // Only create worker if Web Workers are supported by the browser
    if (window.Worker) {
      try {
        // Worker implementation for physics calculations
        const workerCode = `
          self.onmessage = function(e) {
            const { bodies, timeStep, G } = e.data;
            const updatedBodies = calculatePhysics(bodies, timeStep, G);
            self.postMessage({ updatedBodies });
          };
          
          function calculatePhysics(bodies, timeStep, G) {
            const updatedBodies = JSON.parse(JSON.stringify(bodies));
            
            // Calculate forces on each body
            updatedBodies.forEach((body, index) => {
              if (body.fixed) return;
              
              let totalForceX = 0;
              let totalForceY = 0;
              let totalForceZ = 0;
              
              // Sum forces from all other bodies
              updatedBodies.forEach((otherBody, otherIndex) => {
                if (index !== otherIndex) {
                  const [forceX, forceY, forceZ] = calculateGravitationalForce(body, otherBody, G);
                  totalForceX += forceX;
                  totalForceY += forceY;
                  totalForceZ += forceZ;
                }
              });
              
              // Calculate acceleration: a = F / m
              const accelerationX = totalForceX / body.mass;
              const accelerationY = totalForceY / body.mass;
              const accelerationZ = totalForceZ / body.mass;
              
              // Update velocity: v = v + a * dt
              body.velocity[0] += accelerationX * timeStep * 1e11;
              body.velocity[1] += accelerationY * timeStep * 1e11;
              body.velocity[2] += accelerationZ * timeStep * 1e11;
              
              // Update position: p = p + v * dt
              body.position[0] += body.velocity[0] * timeStep;
              body.position[1] += body.velocity[1] * timeStep;
              body.position[2] += body.velocity[2] * timeStep;
            });
            
            return updatedBodies;
          }
          
          function calculateGravitationalForce(body1, body2, G) {
            // Calculate distance between bodies
            const dx = body2.position[0] - body1.position[0];
            const dy = body2.position[1] - body1.position[1];
            const dz = body2.position[2] - body1.position[2];
            const distanceSquared = dx * dx + dy * dy + dz * dz;
            const distance = Math.sqrt(distanceSquared);
            
            // Skip if bodies are too close to avoid extreme forces
            if (distance < (body1.radius + body2.radius) * 0.8) {
              return [0, 0, 0];
            }
            
            // Calculate force magnitude: F = G * (m1 * m2) / r^2
            const forceMagnitude = G * body1.mass * body2.mass / distanceSquared;
            
            // Calculate force components
            const forceX = forceMagnitude * dx / distance;
            const forceY = forceMagnitude * dy / distance;
            const forceZ = forceMagnitude * dz / distance;
            
            return [forceX, forceY, forceZ];
          }
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);
        
        setPhysicsWorker(worker);
        
        // Clean up
        return () => {
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
        };
      } catch (error) {
        console.error('Failed to create Web Worker:', error);
      }
    }
  }, []);
  
  // Update physics with optimized approach
  useFrame(() => {
    if (isPaused) return;
    
    // Skip physics updates when tab is not visible
    if (document.hidden) return;
    
    // Skip frames for better performance on low-end devices
    if (performanceSettings?.qualityLevel === 'low') {
      if (Math.random() > 0.5) return; // 50% chance to skip frame
    }
    
    // Use web worker if available, otherwise do calculation on main thread
    if (physicsWorker) {
      // Prepare data for worker - only send what's needed
      const bodiesData = bodies.map(body => ({
        id: body.id,
        mass: body.mass,
        radius: body.radius,
        position: [...body.position],
        velocity: [...body.velocity],
        fixed: body.fixed
      }));
      
      // Send data to worker
      physicsWorker.postMessage({
        bodies: bodiesData,
        timeStep,
        G: 6.67430e-11 // Gravitational constant
      });
      
      // Handle worker response
      physicsWorker.onmessage = (e) => {
        const { updatedBodies } = e.data;
        
        // Update body positions and velocities from worker results
        const newBodies = bodies.map(body => {
          const updatedBody = updatedBodies.find(b => b.id === body.id);
          if (updatedBody) {
            body.position = updatedBody.position;
            body.velocity = updatedBody.velocity;
          }
          return body;
        });
        
        setBodies(newBodies);
        
        // Update orbit paths with reduced frequency for better performance
        updateOrbitPaths(newBodies);
        
        // Follow selected body with camera if enabled
        if (isFollowingBody) {
          followSelectedBody(newBodies);
        }
      };
    } else {
      // Fallback to main thread calculations
      mainThreadPhysicsUpdate();
    }
  });
  
  // Function to update orbit paths with optimized approach
  const updateOrbitPaths = useCallback((updatedBodies) => {
    // For performance, only update every few frames
    if (Math.random() > 0.3) return; // 70% chance to skip orbit update
    
    const maxOrbitPoints = performanceSettings?.maxOrbitPoints || 500;
    
    updatedBodies.forEach(body => {
      if (!body.fixed) {
        setBodyPaths(prevPaths => {
          const newPaths = { ...prevPaths };
          if (!newPaths[body.id]) {
            newPaths[body.id] = [];
          }
          
          // Add current position and limit history length
          newPaths[body.id] = [
            ...newPaths[body.id], 
            [...body.position]
          ].slice(-maxOrbitPoints);
          
          return newPaths;
        });
      }
    });
  }, [performanceSettings?.maxOrbitPoints]);

  // Follow selected body with camera
  const followSelectedBody = useCallback((updatedBodies) => {
    if (isFollowingBody && selectedBodyId) {
      const body = updatedBodies.find(b => b.id === selectedBodyId);
      if (body && orbitControlsRef.current) {
        const target = new THREE.Vector3(...body.position);
        orbitControlsRef.current.target.lerp(target, 0.1); // Smooth transition
        orbitControlsRef.current.update();
      }
    }
  }, [isFollowingBody, selectedBodyId, orbitControlsRef]);

  // Main thread physics calculation as fallback
  const mainThreadPhysicsUpdate = useCallback(() => {
    // Make a copy of current bodies
    const updatedBodies = [...bodies];
    
    // Calculate forces on each body
    updatedBodies.forEach((body, index) => {
      if (body.fixed) return;
      
      let totalForceX = 0;
      let totalForceY = 0;
      let totalForceZ = 0;
      
      // Sum forces from all other bodies
      updatedBodies.forEach((otherBody, otherIndex) => {
        if (index !== otherIndex) {
          const [forceX, forceY, forceZ] = calculateGravitationalForce(body, otherBody);
          totalForceX += forceX;
          totalForceY += forceY;
          totalForceZ += forceZ;
        }
      });
      
      // Calculate acceleration: a = F / m
      const accelerationX = totalForceX / body.mass;
      const accelerationY = totalForceY / body.mass;
      const accelerationZ = totalForceZ / body.mass;
      
      // Update velocity: v = v + a * dt
      body.velocity[0] += accelerationX * timeStep * 1e11; // Scale factor for visualization
      body.velocity[1] += accelerationY * timeStep * 1e11;
      body.velocity[2] += accelerationZ * timeStep * 1e11;
      
      // Update position: p = p + v * dt
      body.position[0] += body.velocity[0] * timeStep;
      body.position[1] += body.velocity[1] * timeStep;
      body.position[2] += body.velocity[2] * timeStep;
    });
    
    setBodies(updatedBodies);
    
    // Update orbit paths and follow selected body
    updateOrbitPaths(updatedBodies);
    followSelectedBody(updatedBodies);
  }, [bodies, timeStep, calculateGravitationalForce, updateOrbitPaths, followSelectedBody]);
  
  // Handle selecting a celestial body
  const handleSelectBody = useCallback((id) => {
    const body = bodies.find(b => b.id === id);
    if (body) {
      // Set selected body
      setSelectedBody(body);
      setShowInfoPanel(true);
      
      // If in following mode, reset it when selecting a new body
      if (isFollowingBody) {
        setFollowingBody(false);
      }
      
      // Position camera to view the selected body properly
      if (orbitControlsRef.current) {
        const bodyPosition = new THREE.Vector3(...body.position);
        
        // Calculate appropriate distance based on body size and type
        let distance = body.radius * 10;
        if (body.id === 'sun') {
          distance = body.radius * 20; // Keep further away from the sun
        } else if (body.type === 'gas giant') {
          distance = body.radius * 8; // Gas giants are large
        } else {
          distance = Math.max(4, body.radius * 12); // For smaller planets
        }
        
        // Set target to the body's position
        orbitControlsRef.current.target.copy(bodyPosition);
        
        // Calculate a good viewing angle
        const offset = new THREE.Vector3(1, 0.5, 1).normalize().multiplyScalar(distance);
        const newCameraPosition = bodyPosition.clone().add(offset);
        
        // Animate the camera movement for smoother transition
        const startPosition = orbitControlsRef.current.object.position.clone();
        const startTarget = orbitControlsRef.current.target.clone();
        const targetPosition = newCameraPosition;
        const duration = 1000; // 1 second duration
        const startTime = Date.now();
        
        const animateCamera = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Use easeInOutCubic easing function
          const eased = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
          // Interpolate position
          orbitControlsRef.current.object.position.lerpVectors(
            startPosition, 
            targetPosition, 
            eased
          );
          
          // Update controls
          orbitControlsRef.current.update();
          
          // Continue animation if not complete
          if (progress < 1) {
            requestAnimationFrame(animateCamera);
          }
        };
        
        // Start the animation
        animateCamera();
      }
    }
  }, [bodies, isFollowingBody, setFollowingBody, setSelectedBody, setShowInfoPanel, orbitControlsRef]);
  
  // Render functions
  const renderPlanet = useCallback((body, isSelected) => {
    const onClick = () => handleSelectBody(body.id);
    
    return (
      <OptimizedPlanetWrapper
        key={`planet-${body.id}`}
        body={body}
        position={body.position}
        selected={isSelected}
        onClick={onClick}
        performanceSettings={performanceSettings}
      />
    );
  }, [handleSelectBody, performanceSettings]);
  
  const renderPlanetLabel = useCallback((body, isSelected) => {
    if (!showLabels) return null;
    
    return (
      <PlanetLabel
        key={`label-${body.id}`}
        position={body.position}
        planetName={body.name}
        planetId={body.id}
        selected={isSelected}
        cameraRef={orbitControlsRef}
      />
    );
  }, [showLabels, orbitControlsRef]);
  
  const renderOrbitPath = useCallback((id, path) => {
    if (!showOrbits) return null;
    
    const body = bodies.find(b => b.id === id);
    if (!body || !path || path.length <= 1) return null;
    
    return (
      <OrbitPath 
        key={`orbit-${id}`} 
        positions={path} 
        color={body?.color || '#ffffff'} 
        opacity={selectedBodyId && selectedBodyId === id ? 0.5 : 0.2}
      />
    );
  }, [bodies, selectedBodyId, showOrbits]);
  
  return (
    <>
      <SpaceEnvironment viewMode={viewMode} />
      
      {/* Axes helper for debugging */}
      <primitive object={new THREE.AxesHelper(5)} />
      
      {/* Grid helper for orientation */}
      <primitive object={new THREE.GridHelper(50, 50, 0x888888, 0x444444)} />
      
      {/* Orbit controls for camera */}
      <OrbitControls 
        ref={orbitControlsRef} 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={3}
        maxDistance={150}
        dampingFactor={0.1}
        enableDamping={true}
      />
      
      {/* Asteroid belt */}
      {showAsteroids && (
        <AsteroidBelt 
          visible={true}
          count={performanceSettings?.maxAsteroids || 1000}
          innerRadius={10.5} 
          outerRadius={12}
          beltThickness={0.5}
          centerPosition={[0, 0, 0]}
          minSize={0.02}
          maxSize={0.1}
        />
      )}
      
      {/* Render orbit paths */}
      {Object.entries(bodyPaths).map(([id, path]) => renderOrbitPath(id, path))}
      
      {/* Render all celestial bodies */}
      {planetsToRender.map(body => {
        const isSelected = selectedBodyId === body.id;
        
        return (
          <group key={body.id}>
            {renderPlanet(body, isSelected)}
            {renderPlanetLabel(body, isSelected)}
            
            {/* Add glow effect for sun */}
            {body.id === 'sun' && (
              <pointLight 
                position={body.position} 
                intensity={1.0} 
                distance={50} 
                decay={2} 
                color="#ffdd88" 
              />
            )}
          </group>
        );
      })}
      
      {/* Performance stats (if needed) */}
      <Stats />
    </>
  );
};

// Add new NavigationGuide component
const NavigationGuide = ({ isVisible, onClose, currentStep, setCurrentStep }) => {
  const guideSteps = [
    {
      title: "Welcome to the Gravity Simulator",
      content: "This tutorial will help you navigate the solar system. Click 'Next' to continue.",
      position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    },
    {
      title: "Select Planets",
      content: "Click on any planet to select it and view its details. Try clicking on Mars or Jupiter!",
      position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    },
    {
      title: "Camera Controls",
      content: "Rotate: Left mouse drag\nPan: Right mouse drag\nZoom: Scroll wheel",
      position: { top: '30%', right: '20%', transform: 'translate(0, 0)' }
    },
    {
      title: "View Modes",
      content: "Change visualization styles in the View Modes panel to see different representations of the solar system.",
      position: { top: '20%', right: '20%', transform: 'translate(0, 0)' }
    },
    {
      title: "Preset Views",
      content: "Use the camera preset dropdown to quickly jump to different viewing angles.",
      position: { top: '60%', right: '20%', transform: 'translate(0, 0)' }
    },
    {
      title: "Follow Planets",
      content: "Select a planet and click 'Follow Selected Planet' to have the camera track it as it moves.",
      position: { top: '70%', right: '20%', transform: 'translate(0, 0)' }
    },
    {
      title: "Planet List",
      content: "Use the Planet Explorer to quickly jump to specific planets without having to find them manually.",
      position: { top: '50%', left: '20%', transform: 'translate(0, 0)' }
    }
  ];

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible) return null;

  const step = guideSteps[currentStep];

  return (
    <div className="navigation-guide" style={step.position}>
      <div className="guide-content">
        <h3>{step.title}</h3>
        <p>{step.content}</p>
        <div className="guide-controls">
          <button onClick={handlePrev} disabled={currentStep === 0}>Previous</button>
          <span>{currentStep + 1} / {guideSteps.length}</span>
          <button onClick={handleNext}>
            {currentStep === guideSteps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
        <button className="guide-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

// Add PlanetExplorer component for quick navigation to planets
const PlanetExplorer = ({ bodies, onSelectPlanet }) => {
  return (
    <div className="planet-explorer">
      <h3>Planet Explorer</h3>
      <p className="explorer-help">Click on a planet to navigate to it</p>
      <div className="planet-list">
        {bodies.map(body => (
          <div 
            key={body.id} 
            className="planet-item"
            onClick={() => onSelectPlanet(body.id)}
          >
            <div className="planet-color" style={{ backgroundColor: body.color }}></div>
            <span>{body.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Add LandingVisualization component
const LandingVisualization = ({ 
  planetId, 
  onClose, 
  performanceSettings 
}) => {
  const planetData = solarSystemData[planetId];
  const [landingPhase, setLandingPhase] = useState('orbit');
  const [altitude, setAltitude] = useState(100); // km
  const [velocity, setVelocity] = useState(7.8); // km/s
  const [completed, setCompleted] = useState(false);
  const [time, setTime] = useState(0);
  
  const atmosphereHeight = useMemo(() => {
    // Very basic atmosphere heights - would use real data in a full implementation
    switch (planetId) {
      case 'earth': return 100; // km
      case 'mars': return 50; // km
      case 'venus': return 250; // km
      case 'jupiter': return 1000; // km
      case 'saturn': return 1000; // km
      case 'uranus': return 600; // km
      case 'neptune': return 600; // km
      default: return 0; // No atmosphere
    }
  }, [planetId]);
  
  const hasAtmosphere = atmosphereHeight > 0;
  
  // Update landing simulation
  useEffect(() => {
    if (completed) return;
    
    const simulationSpeed = 0.5; // Adjust for slower/faster simulation
    const interval = setInterval(() => {
      setTime(prev => prev + 0.1);
      
      switch (landingPhase) {
        case 'orbit':
          // Simulate de-orbit burn
          if (time > 2) {
            setLandingPhase('entry');
            setVelocity(7.5);
          }
          break;
          
        case 'entry':
          // Simulate atmospheric entry
          if (hasAtmosphere && altitude <= atmosphereHeight) {
            // Atmospheric drag slows velocity
            setVelocity(prev => Math.max(prev - 0.1 * simulationSpeed, 0.5));
            
            // Heat increases then decreases
            if (altitude < atmosphereHeight / 2) {
              setLandingPhase('descent');
            }
          } else {
            // Non-atmospheric bodies go straight to powered descent
            setAltitude(prev => Math.max(prev - 0.5 * simulationSpeed, 0));
            if (altitude < 50) {
              setLandingPhase('descent');
            }
          }
          
          setAltitude(prev => Math.max(prev - 0.5 * simulationSpeed, 0));
          break;
          
        case 'descent':
          // Simulate powered descent
          setVelocity(prev => Math.max(prev - 0.05 * simulationSpeed, 0));
          setAltitude(prev => Math.max(prev - velocity * 0.1 * simulationSpeed, 0));
          
          if (altitude <= 0) {
            setLandingPhase('landed');
            setVelocity(0);
            setAltitude(0);
            setCompleted(true);
          }
          break;
          
        default:
          break;
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [landingPhase, time, altitude, velocity, completed, hasAtmosphere, atmosphereHeight]);
  
  // Landing visualization scene
  const LandingScene = () => {
    const planetRef = useRef();
    const lander = useRef();
    
    // Planet rotation
    useFrame(() => {
      if (planetRef.current) {
        planetRef.current.rotation.y += 0.001;
      }
    });
    
    // Planet scale and lander position based on altitude
    const planetScale = 1;
    const landerDistance = 1.5 + (altitude / 20);
    
    return (
      <>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.0} />
        
        {/* Skybox with stars */}
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0.5} fade />
        
        {/* Planet */}
        <group ref={planetRef}>
          <mesh scale={[planetScale, planetScale, planetScale]}>
            <sphereGeometry args={[1, 36, 36]} />
            <meshStandardMaterial 
              color={planetData.color} 
              metalness={0.2}
              roughness={0.8}
            />
          </mesh>
          
          {/* Atmosphere if applicable */}
          {hasAtmosphere && (
            <mesh scale={[1.05, 1.05, 1.05]}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshBasicMaterial 
                color={planetData.atmosphereColor || '#8cb1de'} 
                transparent
                opacity={0.3}
              />
            </mesh>
          )}
        </group>
        
        {/* Lander */}
        {landingPhase !== 'landed' && (
          <group ref={lander} position={[0, 0, landerDistance]}>
            <mesh scale={[0.05, 0.05, 0.05]}>
              <boxGeometry />
              <meshStandardMaterial color="#dddddd" />
            </mesh>
            
            {/* Thruster flame/reentry heat */}
            {(landingPhase === 'entry' || landingPhase === 'descent') && (
              <mesh position={[0, 0, 0.1]} scale={[0.03, 0.03, 0.1]}>
                <coneGeometry args={[1, 1, 8]} />
                <meshBasicMaterial 
                  color={landingPhase === 'entry' ? '#ff4400' : '#33aaff'} 
                  transparent
                  opacity={0.8}
                />
              </mesh>
            )}
          </group>
        )}
        
        {/* Surface marker when landed */}
        {landingPhase === 'landed' && (
          <mesh position={[0, 0, 1.05]} scale={[0.05, 0.05, 0.05]}>
            <boxGeometry />
            <meshStandardMaterial color="#dddddd" />
          </mesh>
        )}
        
        {/* Landing info text */}
        <Text 
          position={[0, 1.5, 0]} 
          fontSize={0.1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {landingPhase === 'landed' 
            ? `Landed on ${planetData.name}!` 
            : `${landingPhase.toUpperCase()} - Alt: ${altitude.toFixed(1)} km - Vel: ${velocity.toFixed(1)} km/s`}
        </Text>
      </>
    );
  };
  
  return (
    <div className="landing-visualization">
      <div className="landing-header">
        <h3>Landing on {planetData.name}</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <Canvas camera={{ position: [0, 1, 3], fov: 45 }}>
        <OrbitControls enablePan={false} />
        <LandingScene />
      </Canvas>
      
      <div className="landing-controls">
        <div className="landing-phase">
          <div className={`phase-indicator ${landingPhase === 'orbit' ? 'active' : completed ? 'completed' : ''}`}>
            <span>Orbit</span>
          </div>
          <div className="phase-line"></div>
          <div className={`phase-indicator ${landingPhase === 'entry' ? 'active' : (landingPhase === 'descent' || landingPhase === 'landed') ? 'completed' : ''}`}>
            <span>Entry</span>
          </div>
          <div className="phase-line"></div>
          <div className={`phase-indicator ${landingPhase === 'descent' ? 'active' : landingPhase === 'landed' ? 'completed' : ''}`}>
            <span>Descent</span>
          </div>
          <div className="phase-line"></div>
          <div className={`phase-indicator ${landingPhase === 'landed' ? 'active completed' : ''}`}>
            <span>Landing</span>
          </div>
        </div>
         
        <div className="landing-stats">
          <div className="stat-item">
            <span className="stat-label">Planet</span>
            <span className="stat-value">{planetData.name}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Gravity</span>
            <span className="stat-value">{planetData.surfaceGravity || 0} m/s²</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Atmosphere</span>
            <span className="stat-value">{hasAtmosphere ? (planetData.atmosphere || 'Yes') : 'None'}</span>
          </div>
        </div>
         
        {landingPhase === 'landed' && (
          <button 
            className="restart-button"
            onClick={() => {
              setLandingPhase('orbit');
              setAltitude(100);
              setVelocity(7.8);
              setCompleted(false);
              setTime(0);
            }}
          >
            Restart Landing
          </button>
        )}
      </div>
    </div>
  );
};

// Main SimulationScene component
const SimulationScene = () => {
  // State management
  const [timeStep, setTimeStep] = useState(0.005);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedBody, setSelectedBody] = useState(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [viewMode, setViewMode] = useState('realistic');
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showAsteroids, setShowAsteroids] = useState(true);
  const [isFollowingBody, setFollowingBody] = useState(false);
  
  // Create a ref to forward to the SimulationContent component
  const cameraRef = useRef(null);
  
  // Add new state for performance settings
  const [performanceSettings, setPerformanceSettings] = useState({
    qualityLevel: 'medium',
    maxAsteroids: 1000,
    starCount: 3000,
    useShadows: true,
    useHighResPlanets: true,
    maxOrbitPoints: 300
  });
  
  // Add new state for tutorial
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [hasSeenGuide, setHasSeenGuide] = useState(false);
  
  // Add new state for landing visualization
  const [showLanding, setShowLanding] = useState(false);
  const [landingPlanetId, setLandingPlanetId] = useState(null);

  // Add new ref for camera target and position
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));

  // Check for first-time users
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedGravitySimulator');
    if (!hasVisitedBefore) {
      // Show guide for first-time users
      setShowGuide(true);
      localStorage.setItem('hasVisitedGravitySimulator', 'true');
    }
    setHasSeenGuide(!!hasVisitedBefore);
  }, []);

  // Close the info panel
  const handleCloseInfoPanel = () => {
    setShowInfoPanel(false);
  };
  
  // Reset camera position
  const resetCamera = () => {
    if (cameraRef.current) {
      // Reset target to origin
      cameraRef.current.target.set(0, 0, 0);
      
      // Reset camera position
      cameraRef.current.object.position.set(0, 10, 30);
      
      // Update OrbitControls
      cameraRef.current.update();
    }
  };
  
  // New function to handle planet selection from the explorer with improved camera positioning
  const handlePlanetSelect = (planetId) => {
    // Find the selected planet
    const planet = solarSystemData[planetId];
    if (!planet) return;
    
    // Update selected body state
    setSelectedBody(planet);
    setShowInfoPanel(true);
    
    // Delay camera update slightly to ensure state has updated
    setTimeout(() => {
      if (cameraRef.current && planet) {
        // Create vector for target position
        const target = new THREE.Vector3(...planet.position);
        
        // Update camera target
        cameraRef.current.target.set(target.x, target.y, target.z);
        
        // Calculate appropriate distance based on planet size
        const distanceFactor = planet.radius * (planet.id === 'sun' ? 30 : 20);
        const distance = Math.max(5, distanceFactor);
        
        // Position camera away from the planet at a reasonable angle
        const cameraPos = new THREE.Vector3(
          target.x + distance,
          target.y + distance * 0.5,
          target.z + distance
        );
        
        // Set camera position
        cameraRef.current.object.position.copy(cameraPos);
        
        // Force camera update
        cameraRef.current.update();
        
        // Force a render
        if (isPaused) {
          const wasPaused = isPaused;
          setIsPaused(false);
          // Set a timeout to pause again if it was paused
          setTimeout(() => {
            if (wasPaused) setIsPaused(true);
          }, 100);
        }
      }
    }, 50);
  };
  
  // Add method to handle landing visualization
  const handleStartLanding = (planetId) => {
    // Only allow landing on planets with defined properties
    if (planetId && planetId !== 'sun') {
      setLandingPlanetId(planetId);
      setShowLanding(true);
    }
  };
  
  return (
    <>
      <Canvas 
        camera={{ position: [-20, 30, 40], fov: 45, near: 0.1, far: 200 }}
        style={{ 
          width: '100%', 
          height: '100vh',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0
        }}
        gl={{ 
          antialias: false, // Disable antialiasing for performance
          alpha: false,
          powerPreference: 'high-performance',
          precision: 'lowp', // Use lower precision for better performance
          depth: true
        }}
        frameloop={isPaused ? 'demand' : 'always'} // Only render when needed if paused
        dpr={window.devicePixelRatio > 1 ? 1.5 : 1} // Reduce resolution on high-DPI screens
      >
        {/* Reduce fog distance for performance */}
        <fog attach="fog" args={['#000', 60, 180]} />
        
        <SimulationContent 
          timeStep={timeStep}
          isPaused={isPaused}
          selectedBodyId={selectedBody?.id}
          setSelectedBody={setSelectedBody}
          setShowInfoPanel={setShowInfoPanel}
          viewMode={viewMode}
          showOrbits={showOrbits}
          showLabels={showLabels}
          showAsteroids={showAsteroids}
          isFollowingBody={isFollowingBody}
          setFollowingBody={setFollowingBody}
          orbitControlsRef={cameraRef}
          performanceSettings={performanceSettings}
        />
      </Canvas>
      
      {/* UI Controls with proper z-index to appear over the canvas */}
      <div className="simulator-ui-container">
        <ControlPanel 
          timeStep={timeStep} 
          setTimeStep={setTimeStep}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          performanceSettings={performanceSettings}
          setPerformanceSettings={setPerformanceSettings}
        />
        
        <ViewModes 
          viewMode={viewMode}
          setViewMode={setViewMode}
          showOrbits={showOrbits}
          setShowOrbits={setShowOrbits}
          showLabels={showLabels}
          setShowLabels={setShowLabels}
          showAsteroids={showAsteroids}
          setShowAsteroids={setShowAsteroids}
          cameraRef={cameraRef}
          resetCamera={resetCamera}
          selectedBody={selectedBody}
          setFollowingBody={setFollowingBody}
          isFollowingBody={isFollowingBody}
        />
        
        {showInfoPanel && selectedBody && (
          <PlanetInfoPanel 
            body={selectedBody} 
            onClose={handleCloseInfoPanel}
            onStartLanding={handleStartLanding}
          />
        )}
        
        <div className="overlay-controls">
          <button 
            className="guide-button"
            onClick={() => { setShowGuide(true); setGuideStep(0); }}
          >
            <span role="img" aria-label="Guide">📚</span> Navigation Guide
          </button>
          
          <PlanetExplorer 
            bodies={Object.values(solarSystemData).filter(body => body.type !== 'star')} 
            onSelectPlanet={handlePlanetSelect} 
          />
        </div>
      </div>
      
      <NavigationGuide 
        isVisible={showGuide}
        onClose={() => setShowGuide(false)}
        currentStep={guideStep}
        setCurrentStep={setGuideStep}
      />
      
      {showLanding && (
        <div className="modal-overlay">
          <LandingVisualization 
            planetId={landingPlanetId}
            onClose={() => setShowLanding(false)}
            performanceSettings={performanceSettings}
          />
        </div>
      )}
    </>
  );
};

// Main component
const GravitySimulator = () => {
  return (
    <div className="gravity-simulator">
      <SimulationScene />
    </div>
  );
};

export default GravitySimulator;