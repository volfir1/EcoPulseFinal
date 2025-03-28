import L from 'leaflet';

// Fix Leaflet default icon issues
export const initializeLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

// Create a simple location marker icon
export const createLocationIcon = (location, isSelected = false) => {
  // Determine if location has energy surplus or deficit
  const hasSurplus = location.totalPredictedGeneration > location.totalConsumption;
  
  // Determine color based on energy status
  const color = hasSurplus ? '#4caf50' : '#f44336'; // Green for surplus, Red for deficit
  
  // Create SVG for the location pin
  const html = `
    <div style="width: 30px; height: 40px; position: relative;">
      <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.72 0 0 6.72 0 15C0 26.25 15 40 15 40C15 40 30 26.25 30 15C30 6.72 23.28 0 15 0ZM15 20C12.24 20 10 17.76 10 15C10 12.24 12.24 10 15 10C17.76 10 20 12.24 20 15C20 17.76 17.76 20 15 20Z" 
          fill="${color}" ${isSelected ? 'stroke="white" stroke-width="1.5"' : ''}/>
      </svg>
      ${isSelected ? `
        <div style="
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          border-radius: 50%;
          border: 2px solid ${color};
          opacity: 0.4;
        "></div>
      ` : ''}
    </div>
  `;
  
  return L.divIcon({
    html: html,
    className: '',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40]
  });
};

// Create a more prominent pulsing location marker for hovering
export const createPulsingLocationIcon = (location) => {
  const hasSurplus = location.totalPredictedGeneration > location.totalConsumption;
  const color = hasSurplus ? '#4caf50' : '#f44336';
  
  // Create SVG with enhanced pulsing effect
  const html = `
    <div style="width: 30px; height: 40px; position: relative;">
      <div class="outer-pulse-ring" style="
        position: absolute;
        top: 0px;
        left: 0px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: transparent;
        border: 3px solid ${color};
        opacity: 0.7;
        animation: outer-pulse 1.5s infinite;
        z-index: -1;
      "></div>
      <div class="inner-pulse-ring" style="
        position: absolute;
        top: 5px;
        left: 5px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: ${color};
        opacity: 0.5;
        animation: inner-pulse 1.5s infinite;
        z-index: -1;
      "></div>
      <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="
        filter: drop-shadow(0 0 6px ${color}) drop-shadow(0 0 10px white);
        transform: scale(1.15);
        transform-origin: center;
        animation: glow 1.5s infinite alternate;
      ">
        <path d="M15 0C6.72 0 0 6.72 0 15C0 26.25 15 40 15 40C15 40 30 26.25 30 15C30 6.72 23.28 0 15 0ZM15 20C12.24 20 10 17.76 10 15C10 12.24 12.24 10 15 10C17.76 10 20 12.24 20 15C20 17.76 17.76 20 15 20Z" 
          fill="${color}" stroke="white" stroke-width="1.5"/>
      </svg>
    </div>
    <style>
      @keyframes outer-pulse {
        0% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(2.5); opacity: 0; }
        100% { transform: scale(1); opacity: 0.7; }
      }
      @keyframes inner-pulse {
        0% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.8); opacity: 0.2; }
        100% { transform: scale(1); opacity: 0.5; }
      }
      @keyframes glow {
        0% { filter: drop-shadow(0 0 6px ${color}) drop-shadow(0 0 10px white); }
        100% { filter: drop-shadow(0 0 10px ${color}) drop-shadow(0 0 16px white); }
      }
    </style>
  `;
  
  return L.divIcon({
    html: html,
    className: '',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40]
  });
};