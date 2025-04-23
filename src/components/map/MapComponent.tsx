
import React, { useEffect, useRef } from 'react';
import { Incident } from '@/models/Incident';
import { MapPin } from 'lucide-react';

// Mock implementation of a map component
// In a real application, this would use a library like Leaflet or Google Maps API
const MapComponent: React.FC<{
  incidents?: Incident[];
  currentLocation?: { latitude: number; longitude: number };
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: string;
  interactive?: boolean;
}> = ({ incidents, currentLocation, onLocationSelect, height = '400px', interactive = true }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // This is a placeholder for a real map implementation
  // In a real app, you'd initialize the map library here
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Mock map initialization
    console.log("Map would initialize here with:", { incidents, currentLocation });

    // Mock click handler for location selection
    if (interactive && onLocationSelect) {
      const handleMapClick = (e: MouseEvent) => {
        if (!mapContainerRef.current) return;
        
        // Get click coordinates relative to map container
        const rect = mapContainerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convert to "fake" lat/lng (this is just for demonstration)
        // In a real map, you'd get actual geographic coordinates
        const lat = -1.2921 + (y / rect.height - 0.5) * 0.1;
        const lng = 36.8219 + (x / rect.width - 0.5) * 0.1;
        
        onLocationSelect(lat, lng);
      };
      
      mapContainerRef.current.addEventListener('click', handleMapClick);
      
      return () => {
        mapContainerRef.current?.removeEventListener('click', handleMapClick);
      };
    }
  }, [incidents, currentLocation, onLocationSelect, interactive]);

  // Create "pins" for each incident and current location
  const renderPins = () => {
    const pins = [];
    
    // Add pins for incidents
    if (incidents) {
      pins.push(
        ...incidents.map((incident) => {
          // Calculate pin position as percentage of container
          // In a real map implementation, you'd use proper geo projection
          const left = ((incident.location.longitude - 36.7719) / 0.1) * 50 + 50;
          const top = ((incident.location.latitude - -1.3421) / 0.1) * 50 + 50;
          
          let pinColor;
          switch (incident.status) {
            case 'reported':
              pinColor = 'text-ajali-red';
              break;
            case 'investigating':
              pinColor = 'text-ajali-orange';
              break;
            case 'resolved':
              pinColor = 'text-green-500';
              break;
            case 'rejected':
              pinColor = 'text-gray-500';
              break;
            default:
              pinColor = 'text-ajali-red';
          }
          
          return (
            <div 
              key={incident.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${Math.max(0, Math.min(100, left))}%`, top: `${Math.max(0, Math.min(100, top))}%` }}
              title={incident.title}
            >
              <MapPin className={`h-8 w-8 ${pinColor}`} />
            </div>
          );
        })
      );
    }
    
    // Add pin for current location if provided
    if (currentLocation) {
      const left = ((currentLocation.longitude - 36.7719) / 0.1) * 50 + 50;
      const top = ((currentLocation.latitude - -1.3421) / 0.1) * 50 + 50;
      
      pins.push(
        <div 
          key="current-location"
          className="absolute transform -translate-x-1/2 -translate-y-1/2" 
          style={{ left: `${Math.max(0, Math.min(100, left))}%`, top: `${Math.max(0, Math.min(100, top))}%` }}
        >
          <div className="h-4 w-4 bg-blue-500 rounded-full border-2 border-white shadow-md pulse-animation"></div>
        </div>
      );
    }
    
    return pins;
  };

  return (
    <div 
      ref={mapContainerRef} 
      className="relative rounded-lg overflow-hidden border border-gray-300 bg-gray-100"
      style={{ height }}
    >
      {/* Placeholder Map Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url("https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/36.8219,-1.2921,12/600x400?access_token=pk.eyJ1IjoicGxhY2Vob2xkZXIiLCJhIjoiY2xhY2Vob2xkZXIifQ.cGxhY2Vob2xkZXI")`,
          opacity: 0.7
        }}
      ></div>
      
      {/* Pins layer */}
      <div className="absolute inset-0">
        {renderPins()}
      </div>
      
      {/* Interactive message if map is clickable */}
      {interactive && onLocationSelect && (
        <div className="absolute bottom-2 left-2 right-2 text-center bg-black bg-opacity-50 text-white text-sm p-1 rounded">
          Click on the map to select a location
        </div>
      )}
    </div>
  );
};

export default MapComponent;
