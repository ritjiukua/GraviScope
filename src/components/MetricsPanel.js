import React from 'react';
import '../styles/MetricsPanel.css';

// Metrics and equations panel component
const MetricsPanel = ({ selectedBody, bodies }) => {
  // Find the selected body from the bodies array
  const body = bodies.find(b => b.id === selectedBody) || bodies[0];
  
  // Calculate distance to sun (if not the sun)
  const sunBody = bodies.find(b => b.id === 'sun');
  let distanceToSun = null;
  let orbitalVelocity = null;
  
  if (body.id !== 'sun' && sunBody) {
    const dx = (body.position[0] - sunBody.position[0]);
    const dy = (body.position[1] - sunBody.position[1]);
    const dz = (body.position[2] - sunBody.position[2]);
    distanceToSun = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    // Calculate orbital velocity magnitude
    const vx = body.velocity[0];
    const vy = body.velocity[1];
    const vz = body.velocity[2];
    orbitalVelocity = Math.sqrt(vx*vx + vy*vy + vz*vz);
  }

  return (
    <div className="metrics-panel">
      <h2>Celestial Metrics</h2>
      
      <div className="body-info">
        <h3>{body.id.charAt(0).toUpperCase() + body.id.slice(1)}</h3>
        <div className="body-details">
          <div className="body-icon" style={{ backgroundColor: body.color }}></div>
          <div className="body-stats">
            <p><strong>Mass:</strong> {body.mass.toExponential(3)} kg</p>
            <p><strong>Radius:</strong> {body.id === 'sun' ? '696,340 km' : body.id === 'earth' ? '6,371 km' : '3,389 km'}</p>
            {body.id !== 'sun' && (
              <>
                <p><strong>Distance to Sun:</strong> {(distanceToSun * 1e9 / 1e9).toFixed(2)} million km</p>
                <p><strong>Orbital Velocity:</strong> {orbitalVelocity?.toFixed(2)} km/s</p>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="equations-section">
        <h3>Gravitational Equations</h3>
        
        <div className="equation-card">
          <div className="equation-title">Newton's Law of Universal Gravitation</div>
          <div className="equation-formula">F = G × (m₁m₂) / r²</div>
          <div className="equation-description">
            The gravitational force between two bodies is directly proportional to the product 
            of their masses and inversely proportional to the square of the distance between them.
          </div>
        </div>
        
        <div className="equation-card">
          <div className="equation-title">Acceleration Due to Gravity</div>
          <div className="equation-formula">a = G × M / r²</div>
          <div className="equation-description">
            The acceleration experienced by a body in a gravitational field is proportional 
            to the mass of the attracting body and inversely proportional to the square of the distance.
          </div>
        </div>
        
        <div className="equation-card">
          <div className="equation-title">Orbital Velocity</div>
          <div className="equation-formula">v = √(G × M / r)</div>
          <div className="equation-description">
            For a circular orbit, the velocity needed is the square root of the product of the 
            gravitational constant, the mass of the central body, divided by the orbital radius.
          </div>
        </div>
        
        <div className="equation-card">
          <div className="equation-title">Kepler's Third Law</div>
          <div className="equation-formula">T² ∝ r³</div>
          <div className="equation-description">
            The square of the orbital period of a planet is directly proportional to 
            the cube of the semi-major axis of its orbit.
          </div>
        </div>
      </div>
      
      <div className="simulation-controls">
        <h3>Simulation Details</h3>
        <p><strong>Time step:</strong> 1 hour per frame</p>
        <p><strong>Gravitational constant (G):</strong> 6.67430 × 10⁻¹¹ m³/kg·s²</p>
        <p><strong>Scale:</strong> 1 unit = 1,000,000 km</p>
      </div>
    </div>
  );
};

export default MetricsPanel; 