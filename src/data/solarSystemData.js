import { G, SCALE_FACTOR } from '../utils/physics';

// Some handy constants for space distances and sizes
const AU = 1.496e11; // 1 AU in meters
const EARTH_RADIUS = 6371; // Earth's radius in km
const SUN_RADIUS = 695700; // Sun's radius in km

// Need to know how fast something should go to stay in orbit? This does the trick
const calculateOrbitalVelocity = (centralMass, distanceMeters) => {
  return Math.sqrt((G * centralMass) / distanceMeters);
};

// Main solar system data
const solarSystemData = {
  // We'll start with the big stuff: the main planets and the sun
  bodies: [
    {
      id: 'sun',
      name: 'Sun',
      type: 'star',
      position: [0, 0, 0],
      velocity: [0, 0, 0],
      mass: 1.989e30, // Mass in kg
      radius: 0.12, // Scaled for visualization
      realRadius: SUN_RADIUS, // Actual radius in km
      color: '#ffff00',
      temperature: 5778, // Kelvin
      rotationPeriod: 609.12, // Hours
      fixed: true,
      description: 'The Sun is the star at the center of the Solar System. It is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core.'
    },
    {
      id: 'mercury',
      name: 'Mercury',
      type: 'planet',
      position: [0.39 * AU / SCALE_FACTOR, 0, 0],
      distanceFromSun: 0.39 * AU, // Mercury is basically hugging the sun (in meters)
      velocity: [0, calculateOrbitalVelocity(1.989e30, 0.39 * AU), 0],
      mass: 3.3011e23, // Tiny compared to the big guys (kg)
      radius: 0.03, // Scaled for the sim so you can actually see it
      realRadius: 2439.7, // Real radius in km
      color: '#bbb', 
      temperature: 440, // Toasty! (Kelvin)
      rotationPeriod: 1407.6, // Hours (almost 59 days, yikes)
      orbitalPeriod: 88, // Days to go around the sun
      axialTilt: 0.034, // Basically no tilt, just spinning straight
      fixed: false,
      path: [],
      moons: [], // Mercury has no moons. It's just out there alone
      description: 'Mercury is the smallest and innermost planet in the Solar System. Its orbit around the Sun takes 87.97 Earth days, the shortest of all the planets in the Solar System.'
    },
    {
      id: 'venus',
      name: 'Venus',
      type: 'planet',
      position: [0.72 * AU / SCALE_FACTOR, 0, 0],
      distanceFromSun: 0.72 * AU, // Venus is next in line (meters)
      velocity: [0, calculateOrbitalVelocity(1.989e30, 0.72 * AU), 0],
      mass: 4.8675e24, // Heavier than Mercury, but still not a gas giant (kg)
      radius: 0.04, // Scaled for the sim
      realRadius: 6051.8, // Real radius in km
      color: '#e6e6b8', 
      temperature: 737, // Venus is HOT (Kelvin)
      rotationPeriod: -5832.5, // Hours (retrograde, so it's negative, spinning backwards!)
      orbitalPeriod: 225, // Days to orbit the sun
      axialTilt: 177.36, // Venus is basically upside down
      fixed: false,
      path: [],
      moons: [], // Venus has no moons either. What gives?
      atmosphere: 'Carbon dioxide (96%), Nitrogen (3%)',
      description: 'Venus is the second planet from the Sun. It is named after the Roman goddess of love and beauty. Venus is the second-brightest natural object in the night sky after the Moon.'
    },
    {
      id: 'earth',
      name: 'Earth',
      type: 'planet',
      position: [AU / SCALE_FACTOR, 0, 0],
      distanceFromSun: AU, // Earth is 1 AU from the sun (by definition, go Earth!)
      velocity: [0, calculateOrbitalVelocity(1.989e30, AU), 0],
      mass: 5.972e24, // Our home, not too big, not too small (kg)
      radius: 0.05, // Scaled for the sim
      realRadius: EARTH_RADIUS, // Real radius in km
      color: '#0077ff',
      temperature: 288, // Average temp in Kelvin (pretty comfy)
      rotationPeriod: 23.93, // Hours in a day
      orbitalPeriod: 365.26, // Days in a year
      axialTilt: 23.44, // That's why we get seasons
      fixed: false,
      path: [],
      moons: [
        {
          id: 'moon',
          name: 'Moon',
          distance: 0.1, // Scaled distance for the sim
          realDistance: 384400, // Real distance in km
          size: 0.015, // Scaled size
          realRadius: 1737.4, // Real radius in km
          mass: 7.342e22, // Not super massive, but still tugs on us (kg)
          orbitSpeed: 0.005, // For animation
          orbitPeriod: 27.32, // Days to go around Earth
          description: 'The Moon is Earth\'s only natural satellite. It is the fifth-largest satellite in the Solar System.'
        }
      ],
      atmosphere: 'Nitrogen (78%), Oxygen (21%)',
      description: 'Earth is the third planet from the Sun and the only astronomical object known to harbor life. Earth is the densest planet in the Solar System.'
    },
    {
      id: 'mars',
      name: 'Mars',
      type: 'planet',
      position: [1.52 * AU / SCALE_FACTOR, 0, 0],
      distanceFromSun: 1.52 * AU, // meters
      velocity: [0, calculateOrbitalVelocity(1.989e30, 1.52 * AU), 0],
      mass: 6.39e23, // kg
      radius: 0.04, // Scaled size for visualization
      realRadius: 3389.5, // km
      color: '#ff5500',
      temperature: 210, // Kelvin (average)
      rotationPeriod: 24.62, // Hours
      orbitalPeriod: 687, // days
      axialTilt: 25.19, // degrees
      fixed: false,
      path: [],
      moons: [
        {
          id: 'phobos',
          name: 'Phobos',
          distance: 0.06, // Scaled distance for visualization
          realDistance: 9376, // km from Mars
          size: 0.008, // Scaled size for visualization
          realRadius: 11.267, // km
          mass: 1.0659e16, // kg
          orbitSpeed: 0.01, // Scaled orbital speed for animation
          orbitPeriod: 0.32, // days
          description: 'Phobos is the innermost and larger of the two natural satellites of Mars.'
        },
        {
          id: 'deimos',
          name: 'Deimos',
          distance: 0.08, // Scaled distance for visualization
          realDistance: 23463.2, // km from Mars
          size: 0.006, // Scaled size for visualization
          realRadius: 6.2, // km
          mass: 1.4762e15, // kg
          orbitSpeed: 0.007, // Scaled orbital speed for animation
          orbitPeriod: 1.26, // days
          description: 'Deimos is the smaller and outer of the two natural satellites of Mars.'
        }
      ],
      atmosphere: 'Carbon dioxide (95%), Nitrogen (3%)',
      description: 'Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System. Mars is a terrestrial planet with a thin atmosphere.'
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      type: 'planet',
      position: [5.2 * AU / SCALE_FACTOR, 0, 0],
      distanceFromSun: 5.2 * AU, // meters
      velocity: [0, calculateOrbitalVelocity(1.989e30, 5.2 * AU), 0],
      mass: 1.898e27, // kg
      radius: 0.075, // Scaled size for visualization
      realRadius: 69911, // km
      color: '#ffaa66',
      temperature: 165, // Kelvin (average)
      rotationPeriod: 9.93, // Hours
      orbitalPeriod: 4333, // days (11.86 years)
      axialTilt: 3.13, // degrees
      fixed: false,
      path: [],
      moons: [
        {
          id: 'io',
          name: 'Io',
          distance: 0.12, // Scaled distance for visualization
          realDistance: 421700, // km from Jupiter
          size: 0.01, // Scaled size for visualization
          realRadius: 1821.6, // km
          mass: 8.932e22, // kg
          orbitSpeed: 0.008, // Scaled orbital speed for animation
          orbitPeriod: 1.77, // days
          description: 'Io is the innermost of the four Galilean moons of Jupiter. It is the most volcanically active body in the Solar System.'
        },
        {
          id: 'europa',
          name: 'Europa',
          distance: 0.14, // Scaled distance for visualization
          realDistance: 670900, // km from Jupiter
          size: 0.01, // Scaled size for visualization
          realRadius: 1560.8, // km
          mass: 4.8e22, // kg
          orbitSpeed: 0.006, // Scaled orbital speed for animation
          orbitPeriod: 3.55, // days
          description: 'Europa is the smallest of the four Galilean moons orbiting Jupiter. Europa has a thin oxygen atmosphere and a subsurface ocean of liquid water.'
        },
        {
          id: 'ganymede',
          name: 'Ganymede',
          distance: 0.16, // Scaled distance for visualization
          realDistance: 1070400, // km from Jupiter
          size: 0.012, // Scaled size for visualization
          realRadius: 2634.1, // km
          mass: 1.48e23, // kg
          orbitSpeed: 0.004, // Scaled orbital speed for animation
          orbitPeriod: 7.15, // days
          description: 'Ganymede is the largest moon of Jupiter and in the Solar System. It is the ninth-largest object in the Solar System, and is even larger than the planet Mercury.'
        },
        {
          id: 'callisto',
          name: 'Callisto',
          distance: 0.18, // Scaled distance for visualization
          realDistance: 1882700, // km from Jupiter
          size: 0.011, // Scaled size for visualization
          realRadius: 2410.3, // km
          mass: 1.08e23, // kg
          orbitSpeed: 0.003, // Scaled orbital speed for animation
          orbitPeriod: 16.69, // days
          description: 'Callisto is the second-largest moon of Jupiter and the third-largest moon in the Solar System. It is one of the most heavily cratered satellites in the Solar System.'
        }
      ],
      atmosphere: 'Hydrogen (90%), Helium (10%)',
      description: 'Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets combined.'
    },
    {
      id: 'saturn',
      name: 'Saturn',
      type: 'planet',
      position: [9.58 * AU / SCALE_FACTOR, 0, 0],
      distanceFromSun: 9.58 * AU, // meters
      velocity: [0, calculateOrbitalVelocity(1.989e30, 9.58 * AU), 0],
      mass: 5.683e26, // kg
      radius: 0.06, // Scaled size for visualization
      realRadius: 58232, // km
      color: '#eedc82',
      temperature: 134, // Kelvin (average)
      rotationPeriod: 10.7, // Hours
      orbitalPeriod: 10759, // days (29.46 years)
      axialTilt: 26.73, // degrees
      fixed: false,
      path: [],
      hasRings: true,
      ringParams: {
        innerRadius: 0.1, // Scaled inner radius for visualization
        outerRadius: 0.17, // Scaled outer radius for visualization
        realInnerRadius: 74500, // km
        realOuterRadius: 136200, // km
      },
      moons: [
        {
          id: 'titan',
          name: 'Titan',
          distance: 0.15, // Scaled distance for visualization
          realDistance: 1221870, // km from Saturn
          size: 0.011, // Scaled size for visualization
          realRadius: 2574.73, // km
          mass: 1.3455e23, // kg
          orbitSpeed: 0.004, // Scaled orbital speed for animation
          orbitPeriod: 15.95, // days
          description: 'Titan is the largest moon of Saturn. It is the only moon known to have a dense atmosphere, and the only known body in space, other than Earth, where clear evidence of stable bodies of surface liquid has been found.'
        }
      ],
      atmosphere: 'Hydrogen (96%), Helium (3%)',
      description: 'Saturn is the sixth planet from the Sun and the second-largest in the Solar System, after Jupiter. It is a gas giant with an average radius about nine times that of Earth. Saturn is known for its prominent ring system.'
    },
    {
      id: 'uranus',
      name: 'Uranus',
      type: 'planet',
      position: [19.22 * AU / SCALE_FACTOR, 0, 0],
      distanceFromSun: 19.22 * AU, // meters
      velocity: [0, calculateOrbitalVelocity(1.989e30, 19.22 * AU), 0],
      mass: 8.681e25, // kg
      radius: 0.05, // Scaled size for visualization
      realRadius: 25362, // km
      color: '#b0e0e6',
      temperature: 76, // Kelvin (average)
      rotationPeriod: -17.24, // Hours (negative because it rotates in retrograde)
      orbitalPeriod: 30687, // days (84.01 years)
      axialTilt: 97.77, // degrees (unique sideways rotation)
      fixed: false,
      path: [],
      hasRings: true,
      ringParams: {
        innerRadius: 0.07, // Scaled inner radius for visualization
        outerRadius: 0.09, // Scaled outer radius for visualization
        realInnerRadius: 26840, // km
        realOuterRadius: 97700, // km
      },
      moons: [], // Simplified for now
      atmosphere: 'Hydrogen (83%), Helium (15%), Methane (2%)',
      description: 'Uranus is the seventh planet from the Sun. Its unique sideways rotation makes it different from all other planets in the solar system. Like Jupiter and Saturn, Uranus is an ice giant.'
    },
    {
      id: 'neptune',
      name: 'Neptune',
      type: 'planet',
      position: [30.05 * AU / SCALE_FACTOR, 0, 0],
      distanceFromSun: 30.05 * AU, // meters
      velocity: [0, calculateOrbitalVelocity(1.989e30, 30.05 * AU), 0],
      mass: 1.024e26, // kg
      radius: 0.05, // Scaled size for visualization
      realRadius: 24622, // km
      color: '#5b9bd5',
      temperature: 72, // Kelvin (average)
      rotationPeriod: 16.11, // Hours
      orbitalPeriod: 60190, // days (164.8 years)
      axialTilt: 28.32, // degrees
      fixed: false,
      path: [],
      moons: [], // Simplified for now
      atmosphere: 'Hydrogen (80%), Helium (19%), Methane (1%)',
      description: 'Neptune is the eighth and farthest-known Solar planet from the Sun. In the Solar System, it is the fourth-largest planet by diameter, the third-most-massive planet, and the densest giant planet.'
    }
  ],
  
  // Additional solar system objects
  additionalObjects: {
    // Asteroid belt data
    asteroidBelt: {
      innerRadius: 2.2 * AU / SCALE_FACTOR, // Scaled inner radius
      outerRadius: 3.2 * AU / SCALE_FACTOR, // Scaled outer radius
      realInnerRadius: 2.2 * AU, // meters
      realOuterRadius: 3.2 * AU, // meters
      particleCount: 3000, // Number of asteroids to render
      height: 0.4 * AU / SCALE_FACTOR, // Scaled height of the belt
      mass: 3.0e21, // Total mass of the asteroid belt in kg (about 4% of Moon's mass)
      description: 'The asteroid belt is a torus-shaped region in the Solar System, located roughly between the orbits of the planets Mars and Jupiter. It contains many solid, irregularly shaped bodies, of many sizes but much smaller than planets, called asteroids or minor planets.'
    },
    
    // Kuiper belt could be added here
    // Oort cloud could be added here
  }
};

export default solarSystemData; 