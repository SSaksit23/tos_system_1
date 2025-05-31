import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';

const MapComponent = ({ originCoords, destinationCoords, originName, destinationName }) => {
  // Ensure coordinates are valid numbers
  const isValidCoords = (coords) => 
    coords && 
    typeof coords.latitude === 'number' && 
    typeof coords.longitude === 'number' &&
    !isNaN(coords.latitude) && 
    !isNaN(coords.longitude);

  if (!isValidCoords(originCoords) || !isValidCoords(destinationCoords)) {
    console.warn("Map data not available or invalid for:", originName, destinationName, originCoords, destinationCoords);
    return <p style={{textAlign: 'center', color: '#777', margin: '10px 0'}}>Map data not available for this route.</p>;
  }

  const positionOrigin = [originCoords.latitude, originCoords.longitude];
  const positionDestination = [destinationCoords.latitude, destinationCoords.longitude];
  const polylinePositions = [positionOrigin, positionDestination];

  // Calculate bounds to fit both markers
  const bounds = [positionOrigin, positionDestination];

  return (
    <MapContainer 
        bounds={bounds} 
        scrollWheelZoom={false} 
        style={{ height: '250px', width: '100%', marginTop: '15px', borderRadius: '8px', border: '1px solid #ddd' }}
        key={`${originCoords.latitude}-${destinationCoords.longitude}`} // Add key to force re-render if coords change significantly
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={positionOrigin}>
        <Popup>{originName || 'Origin'}</Popup>
      </Marker>
      <Marker position={positionDestination}>
        <Popup>{destinationName || 'Destination'}</Popup>
      </Marker>
      <Polyline positions={polylinePositions} color="rgb(0, 123, 255)" weight={3} />
    </MapContainer>
  );
};

export default MapComponent;