import { useEffect, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const defaultCenter = {
  lat: -1.2921, // Nairobi coordinates
  lng: 36.8219
};

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
};

const MapComponent = ({
  markerPosition,
  onMarkerPositionChange,
  readOnly = false,
  zoom = 12
}) => {
  const [_, setMap] = useState(null);
  const [center, setCenter] = useState(markerPosition || defaultCenter);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    // If marker position is provided, update center
    if (markerPosition) {
      setCenter(markerPosition);
    }
  }, [markerPosition]);

  const handleMapClick = (event) => {
    if (readOnly) return;

    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    onMarkerPositionChange?.(newPosition);
  };

  const handleMarkerDrag = (event) => {
    if (readOnly) return;

    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    onMarkerPositionChange?.(newPosition);
  };

  // If there's no API key or map fails to load, show a simple location display
  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY || loadError) {
    return (
      <div className="flex flex-col h-[400px] bg-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Location Information</h3>
        {markerPosition ? (
          <div className="space-y-4">
            <div>
              <p className="font-medium">Coordinates:</p>
              <p className="text-gray-600">Latitude: {markerPosition.lat.toFixed(6)}</p>
              <p className="text-gray-600">Longitude: {markerPosition.lng.toFixed(6)}</p>
            </div>
            <div>
              <p className="font-medium">Approximate Location:</p>
              <p className="text-gray-600">Nairobi, Kenya</p>
            </div>
            <a 
              href={`https://www.openstreetmap.org/?mlat=${markerPosition.lat}&mlon=${markerPosition.lng}#map=15/${markerPosition.lat}/${markerPosition.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline mt-4 inline-block"
            >
              View on OpenStreetMap
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No location data available</p>
          </div>
        )}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onClick={handleMapClick}
        onLoad={setMap}
        options={options}
      >
        {markerPosition && (
          <Marker
            position={markerPosition}
            draggable={!readOnly}
            onDragEnd={handleMarkerDrag}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default MapComponent;
