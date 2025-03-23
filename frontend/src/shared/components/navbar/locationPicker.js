import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';

const LocationPicker = ({ open, onClose, onLocationSelect }) => {
  const theme = useTheme();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [cityName, setCityName] = useState('');

  // Default center (you can set this to your default location)
  const center = {
    lat: 14.5547,  // Manila coordinates
    lng: 121.0244
  };

  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    setSelectedLocation({ lat, lng });

    // Reverse geocoding to get city name
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      
      if (response.results[0]) {
        // Find city from address components
        const addressComponents = response.results[0].address_components;
        const cityComponent = addressComponents.find(
          component => component.types.includes('locality')
        );
        
        if (cityComponent) {
          setCityName(cityComponent.long_name);
        }
      }
    } catch (error) {
      console.error('Error getting city name:', error);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation && cityName) {
      onLocationSelect({
        coordinates: selectedLocation,
        city: cityName
      });
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Select Location
      </DialogTitle>
      <DialogContent>
        <Box sx={{ height: 400, width: '100%' }}>
          <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
            <GoogleMap
              mapContainerStyle={{ height: '100%', width: '100%' }}
              center={center}
              zoom={12}
              onClick={handleMapClick}
            >
              {selectedLocation && (
                <Marker
                  position={selectedLocation}
                />
              )}
            </GoogleMap>
          </LoadScript>
        </Box>
        {selectedLocation && cityName && (
          <Typography sx={{ mt: 2 }}>
            Selected city: {cityName}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleConfirm}
          disabled={!selectedLocation || !cityName}
          variant="contained"
        >
          Confirm Location
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationPicker;