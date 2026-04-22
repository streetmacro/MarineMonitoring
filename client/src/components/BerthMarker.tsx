import { useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Berth, BerthStatus } from '../types';

interface BerthMarkerProps {
  berth: Berth;
  onStatusChange: (id: number, status: BerthStatus) => Promise<void>;
}

const statusColors: Record<BerthStatus, string> = {
  FREE: '#22c55e',
  REPAIR: '#eab308',
  AWAITING: '#ef4444'
};

const statusLabels: Record<BerthStatus, string> = {
  FREE: 'Free',
  REPAIR: 'Repair',
  AWAITING: 'Awaiting'
};

function createBerthIcon(status: BerthStatus) {
  const color = statusColors[status];

  return L.divIcon({
    className: 'berth-marker',
    html: `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="4" r="3" fill="${color}" stroke="white" stroke-width="1.5"/>
        <line x1="12" y1="7" x2="12" y2="18" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
        <path d="M5 11 Q5 20 12 22 Q19 20 19 11" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}

export function BerthMarker({ berth, onStatusChange }: BerthMarkerProps) {
  const [selectedStatus, setSelectedStatus] = useState<BerthStatus>(berth.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (status: BerthStatus) => {
    if (status === berth.status) return;
    
    setIsUpdating(true);
    try {
      await onStatusChange(berth.id, status);
      setSelectedStatus(status);
    } catch (error) {
      console.error('Failed to update status:', error);
      setSelectedStatus(berth.status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Marker
      position={berth.coords}
      icon={createBerthIcon(berth.status)}
    >
      <Popup className="berth-popup min-w-[200px]">
        <div className="bg-white">
          <div className="border-b border-gray-100 pb-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{berth.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              ID: {berth.id} • Updated: {new Date(berth.lastUpdated).toLocaleString('en-US')}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Berth Status:</p>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleStatusChange('FREE')}
                disabled={isUpdating}
                className={`status-btn flex items-center gap-2 justify-center ${
                  selectedStatus === 'FREE'
                    ? 'bg-green-50 border-green-500 text-green-700 active ring-green-500'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-300'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                {statusLabels.FREE}
              </button>
              
              <button
                onClick={() => handleStatusChange('REPAIR')}
                disabled={isUpdating}
                className={`status-btn flex items-center gap-2 justify-center ${
                  selectedStatus === 'REPAIR'
                    ? 'bg-yellow-50 border-yellow-500 text-yellow-700 active ring-yellow-500'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-yellow-50 hover:border-yellow-300'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                {statusLabels.REPAIR}
              </button>
              
              <button
                onClick={() => handleStatusChange('AWAITING')}
                disabled={isUpdating}
                className={`status-btn flex items-center gap-2 justify-center ${
                  selectedStatus === 'AWAITING'
                    ? 'bg-red-50 border-red-500 text-red-700 active ring-red-500'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-300'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                {statusLabels.AWAITING}
              </button>
            </div>
          </div>
          
          {isUpdating && (
            <div className="mt-3 text-center">
              <span className="text-sm text-gray-500">Updating...</span>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
