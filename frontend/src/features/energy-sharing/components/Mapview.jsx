import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createLocationIcon, createPulsingLocationIcon } from './scripts/mapHelper';

// Component to handle map resizing and selective centering
const MapController = ({ center, hoveredCity, selectedCity }) => {
  const map = useMap();

  // Resize map when it loads or window resizes
  useEffect(() => {
    map.invalidateSize();
    
    const handleResize = () => {
      map.invalidateSize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  // Only fly to the location when it's selected, not when hovered
  useEffect(() => {
    if (selectedCity) {
      // Pan to selected city with animation
      map.flyTo(center, 8, { duration: 0.8 });
    } else if (!map._initialViewSet) {
      // Set initial view only once
      map.setView(center, 7, { animate: false });
      map._initialViewSet = true;
    }
  }, [map, center, selectedCity]);

  return null;
};

const MapView = ({ locationsWithTotals, hoveredCity, onMarkerHover }) => {
  // State to track currently selected city (for persistence)
  const [selectedCity, setSelectedCity] = useState(null);
  // State to track if popup is open (to keep marker highlighted)
  const [popupOpen, setPopupOpen] = useState(null);

  // Calculate map center based primarily on selected city, not hovered
  const center = useMemo(() => {
    // If a city is selected, center on it
    if (selectedCity) {
      const location = locationsWithTotals.find(loc => loc.Place === selectedCity);
      if (location && location.coordinates) {
        return [location.coordinates.lat, location.coordinates.lng];
      }
    }
    
    // Otherwise center based on average of all locations
    if (locationsWithTotals.length === 0) {
      return [10.3157, 123.8854]; // Default to Cebu
    }

    const validLocations = locationsWithTotals.filter(
      loc => loc.coordinates && loc.coordinates.lat && loc.coordinates.lng
    );
    
    if (validLocations.length === 0) {
      return [10.3157, 123.8854]; // Default to Cebu
    }

    const latitudes = validLocations.map(loc => loc.coordinates.lat);
    const longitudes = validLocations.map(loc => loc.coordinates.lng);

    const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
    const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

    return [avgLat, avgLng];
  }, [locationsWithTotals, selectedCity]); // Removed hoveredCity dependency

  // Handle marker click to toggle selection
  const handleMarkerClick = (place) => {
    setSelectedCity(prevSelected => prevSelected === place ? null : place);
  };

  return (
    <MapContainer
      center={center}
      zoom={7}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Controller to handle map animations and resizing */}
      <MapController 
        center={center} 
        hoveredCity={hoveredCity} 
        selectedCity={selectedCity} 
      />
      
      {/* Render markers for each location */}
      {locationsWithTotals.map((location, index) => {
        // Skip if coordinates are invalid
        if (!location.coordinates || !location.coordinates.lat || !location.coordinates.lng) {
          return null;
        }
        
        // Check if this location is currently selected or hovered
        const isSelected = location.Place === selectedCity;
        const isHovered = location.Place === hoveredCity;
        const isActive = isSelected || location.Place === popupOpen;
        
        // Calculate energy values for visualization
        const energySurplus = location.totalPredictedGeneration - location.totalConsumption;
        const hasSurplus = energySurplus > 0;
        
        return (
          <Marker
            key={index}
            position={[location.coordinates.lat, location.coordinates.lng]}
            icon={isHovered 
              ? createPulsingLocationIcon(location) 
              : createLocationIcon(location, isSelected || location.Place === popupOpen)
            }
            eventHandlers={{
              mouseover: () => onMarkerHover(location.Place),
              mouseout: () => onMarkerHover(null),
              click: () => handleMarkerClick(location.Place),
              popupopen: () => setPopupOpen(location.Place),
              popupclose: () => setPopupOpen(null),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{location.Place}</h3>
                <div className="my-2">
                  <div className={`text-sm font-semibold ${hasSurplus ? 'text-green-600' : 'text-red-600'}`}>
                    {hasSurplus 
                      ? `Energy Surplus: +${Math.round(energySurplus)} GWh` 
                      : `Energy Deficit: ${Math.round(energySurplus)} GWh`
                    }
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-2 text-sm mt-3">
                  <div className="text-gray-600">Generation:</div>
                  <div className="font-medium text-right">{Math.round(location.totalPredictedGeneration)} GWh</div>
                  
                  <div className="text-gray-600">Consumption:</div>
                  <div className="font-medium text-right">{Math.round(location.totalConsumption)} GWh</div>
                  
                  {location.totalRenewable !== undefined && (
                    <>
                      <div className="text-gray-600">Renewable:</div>
                      <div className="font-medium text-right">
                        {Math.round(location.totalRenewable)} GWh 
                        <span className="text-green-600 ml-1">
                          ({Math.round(location.totalRenewable / location.totalPredictedGeneration * 100)}%)
                        </span>
                      </div>
                    </>
                  )}
                  
                  {location.totalNonRenewable !== undefined && (
                    <>
                      <div className="text-gray-600">Non-Renewable:</div>
                      <div className="font-medium text-right">{Math.round(location.totalNonRenewable)} GWh</div>
                    </>
                  )}
                </div>
                
                {/* Energy Sources Section */}
                {(location.solar || location.wind || location.hydropower || location.geothermal || location.biomass) && (
                  <>
                    <div className="mt-3 mb-1 font-semibold">Energy Sources</div>
                    <div className="grid grid-cols-2 gap-x-2 text-xs">
                      {location.solar > 0 && (
                        <>
                          <div className="text-gray-600">Solar:</div>
                          <div className="text-right">{Math.round(location.solar)} GWh</div>
                        </>
                      )}
                      {location.wind > 0 && (
                        <>
                          <div className="text-gray-600">Wind:</div>
                          <div className="text-right">{Math.round(location.wind)} GWh</div>
                        </>
                      )}
                      {location.hydropower > 0 && (
                        <>
                          <div className="text-gray-600">Hydropower:</div>
                          <div className="text-right">{Math.round(location.hydropower)} GWh</div>
                        </>
                      )}
                      {location.geothermal > 0 && (
                        <>
                          <div className="text-gray-600">Geothermal:</div>
                          <div className="text-right">{Math.round(location.geothermal)} GWh</div>
                        </>
                      )}
                      {location.biomass > 0 && (
                        <>
                          <div className="text-gray-600">Biomass:</div>
                          <div className="text-right">{Math.round(location.biomass)} GWh</div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;