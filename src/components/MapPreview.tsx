import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Loader2, Crosshair, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapPreviewProps {
  radius: number;
  onLocationChange?: (lat: number, lng: number) => void;
}

const MapPreview: React.FC<MapPreviewProps> = ({ radius, onLocationChange }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get user's GPS location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        onLocationChange?.(latitude, longitude);
        setIsLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError('Unable to get location');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [onLocationChange]);

  // Initialize map when location is available
  useEffect(() => {
    if (!mapContainer.current || !location || mapRef.current) return;

    mapRef.current = L.map(mapContainer.current, {
      center: [location.lat, location.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    });

    // Stealth Mode dark map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      opacity: 0.4,
    }).addTo(mapRef.current);

    circleRef.current = L.circle([location.lat, location.lng], {
      radius: radius,
      color: 'hsl(280, 70%, 60%)',
      fillColor: 'hsl(280, 70%, 60%)',
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(mapRef.current);

    // Remove the default Leaflet marker, we'll use a custom HTML overlay instead
    // The marker is positioned via CSS absolute positioning in the center

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [location, radius]);

  // Update circle radius when it changes
  useEffect(() => {
    if (circleRef.current && mapRef.current && location) {
      circleRef.current.setRadius(radius);
      const zoom = radius <= 100 ? 17 : radius <= 200 ? 16 : radius <= 300 ? 15.5 : radius <= 400 ? 15 : 14.5;
      mapRef.current.setView([location.lat, location.lng], zoom);
    }
  }, [radius, location]);

  // Loading state - "Scanning" aesthetic
  if (isLoading) {
    return (
      <div 
        className="relative h-40 rounded-2xl overflow-hidden flex items-center justify-center"
        style={{
          backgroundColor: '#09090B',
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 8px,
            #101012 8px,
            #101012 16px
          )`,
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <Crosshair 
            className="w-10 h-10 text-primary animate-pulse" 
            style={{
              filter: 'drop-shadow(0 0 8px hsl(280 70% 60% / 0.6))',
            }}
          />
          <span 
            className="text-xs font-mono text-[#71717A] tracking-wider"
          >
            Acquiring Satellite Fix...
          </span>
        </div>
      </div>
    );
  }

  // Error state - same "Scanning" aesthetic
  if (locationError) {
    return (
      <div 
        className="relative h-40 rounded-2xl overflow-hidden flex items-center justify-center"
        style={{
          backgroundColor: '#09090B',
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 8px,
            #101012 8px,
            #101012 16px
          )`,
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <Crosshair 
            className="w-10 h-10 text-primary/50 animate-pulse" 
            style={{
              filter: 'drop-shadow(0 0 8px hsl(280 70% 60% / 0.3))',
            }}
          />
          <span 
            className="text-xs font-mono text-[#71717A] tracking-wider"
          >
            Signal Lost — Retry Location
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative h-40 rounded-2xl overflow-hidden"
      style={{
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
      }}
    >
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Custom Neon Beacon Pin */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
        <div 
          className="animate-float"
          style={{
            filter: 'drop-shadow(0px 0px 15px rgba(213, 0, 249, 0.7))',
          }}
        >
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="neonPinGradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#D500F9" />
                <stop offset="100%" stopColor="#651FFF" />
              </linearGradient>
            </defs>
            {/* Pin body */}
            <path 
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
              fill="url(#neonPinGradient)"
            />
            {/* Inner white dot - the "eye" */}
            <circle 
              cx="12" 
              cy="9" 
              r="2.5" 
              fill="white" 
              fillOpacity="0.9"
            />
          </svg>
        </div>
      </div>

      <div 
        className="absolute bottom-2 left-2 rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 z-[1000]"
        style={{
          backgroundColor: 'rgba(24, 24, 27, 0.9)',
          border: '1px solid #3F3F46',
        }}
      >
        <Navigation className="w-3 h-3 text-primary" />
        <span className="text-white">Your location</span>
      </div>
    </div>
  );
};

export default MapPreview;
