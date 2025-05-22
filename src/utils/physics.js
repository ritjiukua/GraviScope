// Physics constants for gravity calculations
export const G = 6.67430e-11; // Gravitational constant (m³/(kg·s²))
export const SCALE_FACTOR = 1e9; // Scale factor for visualization

/**
 * Calculate the gravitational force between two bodies
 */
export const calculateGravitationalForce = (body1, body2) => {
  const dx = (body2.position[0] - body1.position[0]) * SCALE_FACTOR;
  const dy = (body2.position[1] - body1.position[1]) * SCALE_FACTOR;
  const dz = (body2.position[2] - body1.position[2]) * SCALE_FACTOR;
  const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
  const forceMagnitude = G * body1.mass * body2.mass / (distance * distance);
  return [
    forceMagnitude * dx / distance,
    forceMagnitude * dy / distance,
    forceMagnitude * dz / distance
  ];
};

/**
 * Calculate acceleration from force
 */
export const calculateAcceleration = (force, mass) => [
  force[0] / mass,
  force[1] / mass,
  force[2] / mass
];

/**
 * Orbital velocity for a circular orbit
 */
export const calculateOrbitalVelocity = (centralMass, distance) => {
  return Math.sqrt((G * centralMass) / distance);
};

/**
 * Update position based on velocity and time step
 */
export const updatePosition = (position, velocity, timeStep) => [
  position[0] + velocity[0] * timeStep / SCALE_FACTOR,
  position[1] + velocity[1] * timeStep / SCALE_FACTOR,
  position[2] + velocity[2] * timeStep / SCALE_FACTOR
];

/**
 * Update velocity based on acceleration and time step
 */
export const updateVelocity = (velocity, acceleration, timeStep) => [
  velocity[0] + acceleration[0] * timeStep,
  velocity[1] + acceleration[1] * timeStep,
  velocity[2] + acceleration[2] * timeStep
]; 