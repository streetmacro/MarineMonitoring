import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BerthMarker } from './BerthMarker';
import { ShipMarker } from './ShipMarker';
import { Berth, Ship, BerthStatus } from '../types';

interface MapViewProps {
  berths: Berth[];
  ships: Ship[];
  onBerthStatusChange: (id: number, status: BerthStatus) => Promise<void>;
}

const PORT_CENTER: [number, number] = [59.462, 24.650];
const DEFAULT_ZOOM = 14;

function MapController({ berths }: { berths: Berth[] }) {
  const map = useMap();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && berths.length > 0) {
      const group = new L.FeatureGroup();
      
      berths.forEach(berth => {
        const marker = L.marker(berth.coords);
        group.addLayer(marker);
      });

      const bounds = group.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
      
      initialized.current = true;
    }
  }, [map, berths]);

  return null;
}

function ZoomControlFix() {
  const map = useMap();

  useEffect(() => {
    const zoomControl = document.querySelector('.leaflet-control-zoom') as HTMLElement;
    if (zoomControl) {
      zoomControl.style.cssText = 'position: absolute !important; right: 20px !important; left: auto !important; top: 80px !important; margin: 0 !important;';
    }
  }, [map]);

  return null;
}

export function MapView({ berths, ships, onBerthStatusChange }: MapViewProps) {
  return (
    <MapContainer
      center={PORT_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom={true}
      className="w-full h-full"
    >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController berths={berths} />
        <ZoomControlFix />
        
        {berths.map((berth) => (
          <BerthMarker
            key={berth._id}
            berth={berth}
            onStatusChange={onBerthStatusChange}
          />
        ))}
        
        {ships.map((ship) => (
          <ShipMarker key={ship.mmsi} ship={ship} />
        ))}
    </MapContainer>
  );
}
