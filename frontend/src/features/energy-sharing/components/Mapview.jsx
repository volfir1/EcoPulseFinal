import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createCustomIcon } from './scripts/mapHelper';
import { Box, Typography, Divider, Chip } from '@mui/material';
import { Zap, ZapOff } from 'lucide-react';

// Animated map component for focusing on a location
const AnimatedPanTo = ({ position, hoveredCity }) => {
  const map = useMap();
  
  useEffect(() => {
    if (hoveredCity) {
      map.flyTo(position, 8, {
        animate: true,
        duration: 0.8
      });
    }
  }, [map, position, hoveredCity]);
  
  return null;
};

// Component to ensure map resizes properly
const MapResizer = () => {
  const map = useMap();
  
  useEffect(() => {
    // Ensure map is properly sized when component mounts
    map.invalidateSize();
    
    // Also resize when window size changes
    const handleResize = () => {
      map.invalidateSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  
  return null;
};

const MapView = ({ locationsWithTotals, hoveredCity, onMarkerHover }) => {
  const [activeLocation, setActiveLocation] = useState(null);
  
  // Set a region center based on average of all locations
  const center = useMemo(() => {
    if (locationsWithTotals.length === 0) return [10.3157, 123.8854]; // Cebu coordinates

    const validLocations = locationsWithTotals.filter(
      loc => loc.coordinates && loc.coordinates.lat && loc.coordinates.lng
    );
    
    if (validLocations.length === 0) return [10.3157, 123.8854];

    const latitudes = validLocations.map(loc => loc.coordinates.lat);
    const longitudes = validLocations.map(loc => loc.coordinates.lng);

    const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
    const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

    return [avgLat, avgLng];
  }, [locationsWithTotals]);
  
  // Find position for hovered city
  const hoveredPosition = useMemo(() => {
    if (!hoveredCity) return null;
    const location = locationsWithTotals.find(loc => loc.Place === hoveredCity);
    if (location && location.coordinates) {
      return [location.coordinates.lat, location.coordinates.lng];
    }
    return null;
  }, [hoveredCity, locationsWithTotals]);

  // Enhanced Markers component
  const EnhancedMarkers = () => {
    return (
      <>
        {locationsWithTotals.map((location, index) => {
          // Skip if coordinates are invalid
          if (!location.coordinates || !location.coordinates.lat || !location.coordinates.lng) {
            return null;
          }
          
          // Calculate energy surplus/deficit
          const energySurplus = location.totalPredictedGeneration - location.totalConsumption;
          const hasSurplus = energySurplus > 0;
          
          // Determine icon and styles based on energy status
          const iconType = hasSurplus ? 'surplus' : 'deficit';
          const iconSize = Math.max(
            30, 
            Math.min(50, 25 + Math.sqrt(Math.abs(energySurplus)) * 0.8)
          );
          
          const customIcon = createCustomIcon(iconType, iconSize, Math.abs(energySurplus));
          
          return (
            <React.Fragment key={index}>
              {/* Energy circle radius visualization */}
              <Circle 
                center={[location.coordinates.lat, location.coordinates.lng]} 
                radius={Math.sqrt(location.totalPredictedGeneration) * 800}
                pathOptions={{
                  fillColor: hasSurplus ? '#4caf50' : '#f44336',
                  fillOpacity: 0.15,
                  color: hasSurplus ? '#4caf50' : '#f44336',
                  weight: 1,
                  opacity: 0.5,
                }}
              />
              
              {/* Location marker */}
              <Marker
                position={[location.coordinates.lat, location.coordinates.lng]}
                icon={customIcon}
                eventHandlers={{
                  mouseover: () => onMarkerHover(location.Place),
                  mouseout: () => onMarkerHover(null),
                  click: () => setActiveLocation(location.Place === activeLocation ? null : location.Place)
                }}
              >
                <Tooltip direction="top" offset={[0, -15]} opacity={0.9}>
                  <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
                    {location.Place}: {hasSurplus ? '+' : ''}{Math.round(energySurplus)} GWh
                  </Typography>
                </Tooltip>
                
                <Popup className="custom-popup" closeButton={false} maxWidth={300} minWidth={250}>
                  <Box sx={{ p: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {location.Place}
                      </Typography>
                      <Chip 
                        size="small" 
                        icon={hasSurplus ? <Zap size={14} /> : <ZapOff size={14} />}
                        label={hasSurplus ? "Surplus" : "Deficit"} 
                        color={hasSurplus ? "success" : "error"}
                        variant="outlined"
                      />
                    </Box>
                    
                    <Divider sx={{ mb: 1.5 }} />
                    
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="body2" fontWeight={600} color={hasSurplus ? "success.main" : "error.main"}>
                        {hasSurplus ? `Energy Surplus: +${Math.round(energySurplus)} GWh` : `Energy Deficit: ${Math.round(energySurplus)} GWh`}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">Generation:</Typography>
                      <Typography variant="body2" fontWeight={500}>{Math.round(location.totalPredictedGeneration)} GWh</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">Consumption:</Typography>
                      <Typography variant="body2" fontWeight={500}>{Math.round(location.totalConsumption)} GWh</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">Renewable:</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {Math.round(location.totalRenewable)} GWh 
                        ({Math.round(location.totalPredictedGeneration > 0 
                          ? (location.totalRenewable / location.totalPredictedGeneration * 100) 
                          : 0)}%)
                      </Typography>
                    </Box>
                    
                    {location.totalNonRenewable > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">Non-Renewable:</Typography>
                        <Typography variant="body2" fontWeight={500}>{Math.round(location.totalNonRenewable)} GWh</Typography>
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>Energy Sources</Typography>
                    
                    {location.solar > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography variant="caption" color="text.secondary">Solar:</Typography>
                        <Typography variant="caption">{Math.round(location.solar)} GWh</Typography>
                      </Box>
                    )}
                    
                    {location.wind > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography variant="caption" color="text.secondary">Wind:</Typography>
                        <Typography variant="caption">{Math.round(location.wind)} GWh</Typography>
                      </Box>
                    )}
                    
                    {location.hydropower > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography variant="caption" color="text.secondary">Hydropower:</Typography>
                        <Typography variant="caption">{Math.round(location.hydropower)} GWh</Typography>
                      </Box>
                    )}
                    
                    {location.geothermal > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography variant="caption" color="text.secondary">Geothermal:</Typography>
                        <Typography variant="caption">{Math.round(location.geothermal)} GWh</Typography>
                      </Box>
                    )}
                    
                    {location.biomass > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography variant="caption" color="text.secondary">Biomass:</Typography>
                        <Typography variant="caption">{Math.round(location.biomass)} GWh</Typography>
                      </Box>
                    )}
                  </Box>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
        
        {/* Map animation when hovering over a region */}
        {hoveredPosition && (
          <AnimatedPanTo position={hoveredPosition} hoveredCity={hoveredCity} />
        )}
        
        {/* Ensure map resize works properly */}
        <MapResizer />
      </>
    );
  };

  return (
    <MapContainer
      center={center}
      zoom={7}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <EnhancedMarkers />
    </MapContainer>
  );
};

export default MapView;