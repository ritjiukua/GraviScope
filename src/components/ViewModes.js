import React from 'react';
import '../styles/ViewModes.css';

const ViewModes = ({ 
  viewMode, 
  setViewMode,
  showOrbits,
  setShowOrbits,
  showLabels,
  setShowLabels,
  showAsteroids,
  setShowAsteroids,
  cameraRef,
  resetCamera,
  selectedBody,
  setFollowingBody,
  isFollowingBody
}) => {
  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  // Handle toggle options
  const handleToggleOrbits = () => {
    setShowOrbits(!showOrbits);
  };
  
  const handleToggleLabels = () => {
    setShowLabels(!showLabels);
  };
  
  const handleToggleAsteroids = () => {
    setShowAsteroids(!showAsteroids);
  };
  
  // Handle camera position changes
  const handleCameraReset = () => {
    resetCamera();
  };
  
  const handleFollowPlanet = () => {
    // Toggle following the selected body
    setFollowingBody(!isFollowingBody);
  };
  
  // Different camera presets
  const setCameraPosition = (position) => {
    if (!cameraRef.current) return;
    
    switch(position) {
      case 'top':
        cameraRef.current.object.position.set(0, 30, 0);
        cameraRef.current.target.set(0, 0, 0);
        break;
      case 'side':
        cameraRef.current.object.position.set(30, 0, 0);
        cameraRef.current.target.set(0, 0, 0);
        break;
      case 'angle':
        cameraRef.current.object.position.set(20, 15, 20);
        cameraRef.current.target.set(0, 0, 0);
        break;
      case 'distant':
        cameraRef.current.object.position.set(40, 10, 40);
        cameraRef.current.target.set(0, 0, 0);
        break;
      default:
        break;
    }
    
    // Update orbit controls
    cameraRef.current.update();
  };
  
  return (
    <div className="view-modes-panel">
      <h3>View Modes</h3>
      
      {/* View mode selector */}
      <div className="view-modes-section">
        <h4>Visualization Mode</h4>
        <div className="view-mode-buttons">
          <button 
            className={`view-mode-btn ${viewMode === 'realistic' ? 'active' : ''}`} 
            onClick={() => handleViewModeChange('realistic')}
          >
            Realistic
          </button>
          <button 
            className={`view-mode-btn ${viewMode === 'schematic' ? 'active' : ''}`} 
            onClick={() => handleViewModeChange('schematic')}
          >
            Schematic
          </button>
          <button 
            className={`view-mode-btn ${viewMode === 'gravity' ? 'active' : ''}`} 
            onClick={() => handleViewModeChange('gravity')}
          >
            Gravity Field
          </button>
        </div>
      </div>
      
      {/* Toggle options */}
      <div className="toggle-options-section">
        <h4>Display Options</h4>
        <div className="toggle-option">
          <input 
            type="checkbox" 
            id="show-orbits" 
            checked={showOrbits} 
            onChange={handleToggleOrbits}
          />
          <label htmlFor="show-orbits">Orbit Paths</label>
        </div>
        
        <div className="toggle-option">
          <input 
            type="checkbox" 
            id="show-labels" 
            checked={showLabels} 
            onChange={handleToggleLabels}
          />
          <label htmlFor="show-labels">Planet Labels</label>
        </div>
        
        <div className="toggle-option">
          <input 
            type="checkbox" 
            id="show-asteroids" 
            checked={showAsteroids} 
            onChange={handleToggleAsteroids}
          />
          <label htmlFor="show-asteroids">Asteroid Belt</label>
        </div>
      </div>
      
      {/* Camera controls */}
      <div className="camera-controls-section">
        <h4>Camera Controls</h4>
        
        <div className="camera-position-controls">
          <label htmlFor="camera-preset">Preset Positions:</label>
          <select 
            id="camera-preset" 
            onChange={(e) => setCameraPosition(e.target.value)}
            disabled={isFollowingBody}
          >
            <option value="">Select position</option>
            <option value="top">Top View</option>
            <option value="side">Side View</option>
            <option value="angle">Angled View</option>
            <option value="distant">Distant View</option>
          </select>
        </div>
        
        <div className="follow-planet-control">
          <button 
            className={`follow-btn ${isFollowingBody ? 'active' : ''}`}
            onClick={handleFollowPlanet}
            disabled={!selectedBody}
          >
            {isFollowingBody ? 'Stop Following' : 'Follow Selected Planet'}
          </button>
        </div>
        
        <div className="reset-camera-control">
          <button 
            className="reset-btn"
            onClick={handleCameraReset}
          >
            Reset Camera
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewModes; 