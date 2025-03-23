import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createCustomIcon } from './scripts/mapHelper';

const MapView = ({ locationsWithTotals, hoveredCity, onMarkerHover }) => {
    // Set Cebu as the default center
    const center = useMemo(() => {
        if (locationsWithTotals.length === 0) return [10.3157, 123.8854]; // Cebu coordinates

        const latitudes = locationsWithTotals.map(loc => loc.coordinates.lat);
        const longitudes = locationsWithTotals.map(loc => loc.coordinates.lng);

        const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
        const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

        return [avgLat, avgLng];
    }, [locationsWithTotals]);

    const Markers = () => {
        const map = useMap();

        useEffect(() => {
            map.invalidateSize();
        }, [map]);

        return (
            <>
                {locationsWithTotals.map((location, index) => (
                    location.coordinates && (
                        <Marker
                            key={index}
                            position={[location.coordinates.lat, location.coordinates.lng]}
                            icon={createCustomIcon(location.energyType)}
                            eventHandlers={{
                                mouseover: () => onMarkerHover(location.Place),
                                mouseout: () => onMarkerHover(null),
                            }}
                        >
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-bold">{location.Place}</h3>
                                    <p>Total Predicted Generation: {location.totalPredictedGeneration}</p>
                                    <p>Total Predicted Consumption: {location.totalConsumption}</p>
                                    {location.totalRenewable !== undefined && <p>Total Renewable: {location.totalRenewable}</p>}
                                    {location.totalNonRenewable !== undefined && <p>Total Non-Renewable: {location.totalNonRenewable}</p>}
                                    {location.solar !== undefined && <p>Solar: {location.solar}</p>}
                                    {location.wind !== undefined && <p>Wind: {location.wind}</p>}
                                    {location.hydropower !== undefined && <p>Hydropower: {location.hydropower}</p>}
                                    {location.geothermal !== undefined && <p>Geothermal: {location.geothermal}</p>}
                                    {location.biomass !== undefined && <p>Biomass: {location.biomass}</p>}
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </>
        );
    };

    return (
        <MapContainer
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            className="rounded-lg"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Markers />
        </MapContainer>
    );
};

export default MapView;