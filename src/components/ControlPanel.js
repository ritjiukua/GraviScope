import React from 'react';
import '../styles/ControlPanel.css';

const ControlPanel = ({ 
  timeStep, 
  setTimeStep, 
  isPaused, 
  setIsPaused,
  performanceSettings,
  setPerformanceSettings
}) => {
  // Handle time step change
  const handleTimeStepChange = (e) => {
    setTimeStep(parseFloat(e.target.value));
  };
  
  // Handle pause/play toggle
  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };
  
  // Handle performance mode change
  const handlePerformanceModeChange = (e) => {
    const newQualityLevel = e.target.value;
    
    // Update performance settings based on quality level
    setPerformanceSettings({
      ...performanceSettings,
      qualityLevel: newQualityLevel,
      maxAsteroids: newQualityLevel === 'low' ? 300 : newQualityLevel === 'medium' ? 1000 : 3000,
      starCount: newQualityLevel === 'low' ? 1000 : newQualityLevel === 'medium' ? 3000 : 5000,
      useShadows: newQualityLevel !== 'low',
      useHighResPlanets: newQualityLevel === 'high',
      maxOrbitPoints: newQualityLevel === 'low' ? 100 : newQualityLevel === 'medium' ? 300 : 500,
    });
  };
  
  return (
    <div className="control-panel">
      <h3>Simulation Controls</h3>
      
      <div className="control-group">
        <label>Time Speed</label>
        <div className="slider-container">
          <input 
            type="range" 
            min="0.0001" 
            max="0.01" 
            step="0.0001" 
            value={timeStep} 
            onChange={handleTimeStepChange}
          />
          <span>{(timeStep * 1000).toFixed(1)}x</span>
        </div>
      </div>
      
      <div className="control-group">
        <button 
          className={`control-button ${isPaused ? 'play' : 'pause'}`}
          onClick={handlePauseToggle}
        >
          {isPaused ? 'Play' : 'Pause'}
        </button>
      </div>
      
      {/* Performance mode selector */}
      <div className="control-group performance-control">
        <label>Performance Mode</label>
        <select 
          value={performanceSettings.qualityLevel} 
          onChange={handlePerformanceModeChange}
          className="performance-select"
        >
          <option value="low">Low (Better Performance)</option>
          <option value="medium">Medium (Balanced)</option>
          <option value="high">High (Better Graphics)</option>
        </select>
      </div>
      
      <div className="instructions">
        <h4>Navigation</h4>
        <ul>
          <li>Rotate: Left mouse drag</li>
          <li>Pan: Right mouse drag</li>
          <li>Zoom: Scroll wheel</li>
        </ul>
      </div>
    </div>
  );
};

export default ControlPanel; 