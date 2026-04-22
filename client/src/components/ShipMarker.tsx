import { useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Ship } from '../types';

interface ShipMarkerProps {
  ship: Ship;
}

function createShipIcon(cog?: number) {
  const rotation = cog || 0;
  
  return L.divIcon({
    className: 'ship-marker',
    html: `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
           style="transform: rotate(${rotation}deg); transform-origin: center;">
        <path d="M10 2L16 16L10 14L4 16L10 2Z" fill="#3b82f6" stroke="#1e40af" stroke-width="1.5"/>
      </svg>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

export function ShipMarker({ ship }: ShipMarkerProps) {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([ship.latitude, ship.longitude]);
    }
  }, [ship.latitude, ship.longitude]);

  return (
    <Marker
      ref={markerRef}
      position={[ship.latitude, ship.longitude]}
      icon={createShipIcon(ship.cog)}
    >
      <Popup>
        <div className="p-2">
          <h4 className="font-semibold text-gray-900">{ship.name || 'Unknown Vessel'}</h4>
          <p className="text-sm text-gray-600 mt-1">MMSI: {ship.mmsi}</p>
          {ship.shipType && (
            <p className="text-sm text-gray-600">Type: {ship.shipType}</p>
          )}
          {ship.sog !== undefined && (
            <p className="text-sm text-gray-600">Speed: {ship.sog.toFixed(1)} knots</p>
          )}
          {ship.cog !== undefined && (
            <p className="text-sm text-gray-600">Course: {ship.cog.toFixed(1)}°</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Updated: {new Date(ship.lastUpdate).toLocaleString('en-US')}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}
