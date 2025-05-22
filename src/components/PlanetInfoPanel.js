import React, { useState } from 'react';
import '../styles/PlanetInfoPanel.css';

const formatNumber = (num) => {
  if (num === undefined || num === null) return 'N/A';
  
  // For large numbers, use scientific notation
  if (num >= 1e9 || num <= -1e9 || (num !== 0 && Math.abs(num) < 0.001)) {
    return num.toExponential(2);
  }
  
  // For smaller numbers, use commas for thousands separators
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const PlanetInfoPanel = ({ selectedBody, onClose, onStartLanding }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!selectedBody) return null;
  
  // For reference, convert time units
  const rotationInEarthDays = selectedBody.rotationPeriod 
    ? (selectedBody.rotationPeriod / 24).toFixed(2) 
    : null;
    
  // Format orbital period for better readability
  const formatOrbitalPeriod = (days) => {
    if (!days) return 'N/A';
    
    if (days >= 365) {
      return `${(days / 365).toFixed(2)} years`;
    }
    
    return `${days} days`;
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const formatLargeNumber = (num) => {
    if (num >= 1e24) {
      return `${(num / 1e24).toFixed(2)} YKg`;
    } else if (num >= 1e21) {
      return `${(num / 1e21).toFixed(2)} ZKg`;
    } else if (num >= 1e18) {
      return `${(num / 1e18).toFixed(2)} EKg`;
    } else if (num >= 1e15) {
      return `${(num / 1e15).toFixed(2)} PKg`;
    } else if (num >= 1e12) {
      return `${(num / 1e12).toFixed(2)} TKg`;
    } else if (num >= 1e9) {
      return `${(num / 1e9).toFixed(2)} GKg`;
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(2)} MKg`;
    } else if (num >= 1e3) {
      return `${(num / 1e3).toFixed(2)} KKg`;
    }
    return `${num.toFixed(2)} Kg`;
  };
  
  const renderOverviewTab = () => {
    return (
      <div className="info-tab-content">
        <div className="info-row">
          <span className="info-label">Type:</span>
          <span className="info-value">{selectedBody.type || 'Unknown'}</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Mass:</span>
          <span className="info-value">{formatLargeNumber(selectedBody.mass)}</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Radius:</span>
          <span className="info-value">{selectedBody.physicalRadius?.toLocaleString() || '?'} km</span>
        </div>
        
        {selectedBody.orbitalPeriod && (
          <div className="info-row">
            <span className="info-label">Orbital Period:</span>
            <span className="info-value">{selectedBody.orbitalPeriod} days</span>
          </div>
        )}
        
        {selectedBody.surfaceGravity && (
          <div className="info-row">
            <span className="info-label">Surface Gravity:</span>
            <span className="info-value">{selectedBody.surfaceGravity} m/s²</span>
          </div>
        )}
        
        {selectedBody.surfaceTemp && (
          <div className="info-row">
            <span className="info-label">Surface Temperature:</span>
            <span className="info-value">{selectedBody.surfaceTemp} K</span>
          </div>
        )}

        {/* Add landing button for non-star bodies */}
        {selectedBody.type !== 'star' && onStartLanding && (
          <div className="landing-button-container">
            <button 
              className="landing-button"
              onClick={() => onStartLanding(selectedBody.id)}
            >
              <span role="img" aria-label="Rocket">🚀</span> Land on {selectedBody.name}
            </button>
          </div>
        )}
      </div>
    );
  };
  
  const renderDetailsTab = () => {
    return (
      <div className="info-tab-content">
        {selectedBody.atmosphere && (
          <div className="info-row">
            <span className="info-label">Atmosphere:</span>
            <span className="info-value">{selectedBody.atmosphere}</span>
          </div>
        )}
        
        {selectedBody.rotationPeriod && (
          <div className="info-row">
            <span className="info-label">Rotation Period:</span>
            <span className="info-value">
              {selectedBody.rotationPeriod} {selectedBody.rotationPeriod < 24 ? 'hours' : 'days'}
            </span>
          </div>
        )}
        
        {selectedBody.orbitalEccentricity && (
          <div className="info-row">
            <span className="info-label">Orbital Eccentricity:</span>
            <span className="info-value">{selectedBody.orbitalEccentricity.toFixed(3)}</span>
          </div>
        )}
        
        {selectedBody.moons && selectedBody.moons.length > 0 && (
          <div className="info-row moons-row">
            <span className="info-label">Moons:</span>
            <div className="moons-list">
              {selectedBody.moons.map(moon => (
                <div key={moon.id} className="moon-item">
                  {moon.name} ({moon.physicalRadius} km)
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Add 3D exploration button */}
        {selectedBody.type !== 'star' && onStartLanding && (
          <div className="landing-button-container">
            <button 
              className="explore-button"
              onClick={() => onStartLanding(selectedBody.id)}
            >
              <span role="img" aria-label="Globe">🌐</span> Explore {selectedBody.name}
            </button>
          </div>
        )}
      </div>
    );
  };
  
  const renderFactsTab = () => {
    return (
      <div className="info-tab-content">
        {selectedBody.facts && selectedBody.facts.length > 0 ? (
          <ul className="facts-list">
            {selectedBody.facts.map((fact, index) => (
              <li key={index} className="fact-item">{fact}</li>
            ))}
          </ul>
        ) : (
          <p className="no-facts">No facts available for {selectedBody.name}.</p>
        )}
      </div>
    );
  };
  
  return (
    <div className="planet-info-panel">
      <div className="info-header">
        <h2>{selectedBody.name}</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="info-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => handleTabChange('details')}
        >
          Details
        </button>
        <button 
          className={`tab-button ${activeTab === 'facts' ? 'active' : ''}`}
          onClick={() => handleTabChange('facts')}
        >
          Facts
        </button>
      </div>
      
      <div className="info-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'details' && renderDetailsTab()}
        {activeTab === 'facts' && renderFactsTab()}
      </div>
    </div>
  );
};

export default PlanetInfoPanel; 