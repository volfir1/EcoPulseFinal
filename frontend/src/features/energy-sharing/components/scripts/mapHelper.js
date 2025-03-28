import L from 'leaflet';

// Initialize Leaflet icons to fix the missing marker issue
export const initializeLeafletIcons = () => {
  // Fix the default icon paths in Leaflet
  delete L.Icon.Default.prototype._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};

// Create custom energy marker icons
export const createCustomIcon = (type, size = 35, value = 0) => {
  // Define colors based on energy type
  const getIconColor = () => {
    switch (type) {
      case 'surplus':
        return '#4caf50'; // Green
      case 'deficit':
        return '#f44336'; // Red
      case 'balanced':
        return '#2196f3'; // Blue
      default:
        return '#9e9e9e'; // Grey
    }
  };

  // Create custom HTML for the icon
  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${getIconColor()};
      border: 2px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: ${Math.max(10, size / 2.5)}px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
      text-align: center;
    ">
      ${Math.round(value)}
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-energy-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

// Helper function to get energy type based on data
export const determineEnergyType = (location) => {
  if (!location.totalPredictedGeneration || !location.totalConsumption) {
    return 'unknown';
  }
  
  const surplus = location.totalPredictedGeneration - location.totalConsumption;
  
  if (surplus > 10) return 'surplus';
  if (surplus < -10) return 'deficit';
  return 'balanced';
};

// Calculate center point of multiple locations
export const calculateCenter = (locations) => {
  if (!locations || locations.length === 0) {
    return [10.3157, 123.8854]; // Default to Cebu
  }
  
  const validLocations = locations.filter(loc => 
    loc.coordinates && 
    loc.coordinates.lat && 
    loc.coordinates.lng
  );
  
  if (validLocations.length === 0) {
    return [10.3157, 123.8854]; // Default to Cebu
  }
  
  const totalLat = validLocations.reduce((sum, loc) => sum + loc.coordinates.lat, 0);
  const totalLng = validLocations.reduce((sum, loc) => sum + loc.coordinates.lng, 0);
  
  return [
    totalLat / validLocations.length,
    totalLng / validLocations.length
  ];
};

// Add energy flow lines between surplus and deficit regions
export const createEnergyFlowLine = (from, to, map) => {
  const fromLatLng = L.latLng(from.coordinates.lat, from.coordinates.lng);
  const toLatLng = L.latLng(to.coordinates.lat, to.coordinates.lng);
  
  // Create curved line
  const latlngs = [
    fromLatLng,
    L.latLng(
      (fromLatLng.lat + toLatLng.lat) / 2 + 0.2,
      (fromLatLng.lng + toLatLng.lng) / 2
    ),
    toLatLng
  ];
  
  // Add animated flow line
  const polyline = L.polyline(latlngs, {
    color: '#4caf50',
    weight: 2,
    opacity: 0.7,
    dashArray: '5, 10',
    className: 'energy-flow-line'
  }).addTo(map);
  
  return polyline;
};