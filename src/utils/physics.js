// Physics constants
export const G = 6.67430e-11; // Gravitational constant in m³/(kg·s²)
export const SCALE_FACTOR = 1e9; // Scale factor to make visualization visible

/**
 * Calculate the gravitational force between two celestial bodies
 * @param {Object} body1 - First celestial body
 * @param {Object} body2 - Second celestial body
 * @returns {Array} - Force vector [x, y, z]
 */
export const calculateGravitationalForce = (body1, body2) => {
  // Calculate distance vector components
  const dx = (body2.position[0] - body1.position[0]) * SCALE_FACTOR;
  const dy = (body2.position[1] - body1.position[1]) * SCALE_FACTOR;
  const dz = (body2.position[2] - body1.position[2]) * SCALE_FACTOR;
  
  // Calculate distance magnitude
  const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
  
  // Calculate force magnitude (F = G * m₁ * m₂ / r²)
  const forceMagnitude = G * body1.mass * body2.mass / (distance * distance);
  
  // Calculate force components (F = F_magnitude * unit_vector)
  return [
    forceMagnitude * dx / distance,
    forceMagnitude * dy / distance,
    forceMagnitude * dz / distance
  ];
};

/**
 * Calculate acceleration from force
 * @param {Array} force - Force vector [x, y, z]
 * @param {Number} mass - Mass of the body
 * @returns {Array} - Acceleration vector [x, y, z]
 */
export const calculateAcceleration = (force, mass) => {
  return [
    force[0] / mass,
    force[1] / mass, 
    force[2] / mass
  ];
};

/**
 * Calculate orbital velocity for circular orbit
 * @param {Number} centralMass - Mass of the central body
 * @param {Number} distance - Distance from central body
 * @returns {Number} - Orbital velocity
 */
export const calculateOrbitalVelocity = (centralMass, distance) => {
  return Math.sqrt((G * centralMass) / distance);
};

/**
 * Update position based on velocity and time step
 * @param {Array} position - Current position [x, y, z]
 * @param {Array} velocity - Current velocity [x, y, z]
 * @param {Number} timeStep - Time step in seconds
 * @returns {Array} - New position [x, y, z]
 */
export const updatePosition = (position, velocity, timeStep) => {
  return [
    position[0] + velocity[0] * timeStep / SCALE_FACTOR,
    position[1] + velocity[1] * timeStep / SCALE_FACTOR,
    position[2] + velocity[2] * timeStep / SCALE_FACTOR
  ];
};

/**
 * Update velocity based on acceleration and time step
 * @param {Array} velocity - Current velocity [x, y, z]
 * @param {Array} acceleration - Current acceleration [x, y, z]
 * @param {Number} timeStep - Time step in seconds
 * @returns {Array} - New velocity [x, y, z]
 */
export const updateVelocity = (velocity, acceleration, timeStep) => {
  return [
    velocity[0] + acceleration[0] * timeStep,
    velocity[1] + acceleration[1] * timeStep,
    velocity[2] + acceleration[2] * timeStep
  ];
}; 