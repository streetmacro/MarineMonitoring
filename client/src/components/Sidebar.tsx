import { useState } from 'react';
import { 
  Anchor, 
  Ship, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Menu,
  X
} from 'lucide-react';
import { Berth, Ship as ShipType, BerthStats } from '../types';

interface SidebarProps {
  berths: Berth[];
  ships: ShipType[];
  stats: BerthStats | null;
  isConnected: boolean;
}

const statusConfig = {
  FREE: { color: 'bg-green-500', label: 'FREE', icon: CheckCircle2 },
  REPAIR: { color: 'bg-yellow-500', label: 'REPAIR', icon: AlertCircle },
  AWAITING: { color: 'bg-red-500', label: 'AWAITING', icon: Clock }
};

export function Sidebar({ berths, ships, stats, isConnected }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'berths' | 'ships'>('berths');

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 left-4 z-[1000] p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors lg:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={`
        fixed left-0 top-0 h-full bg-white shadow-xl z-[999] transition-transform duration-300 ease-in-out
        w-80 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:static'}
      `}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Anchor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Kopli 103, Tallinn</h1>
              <p className="text-xs text-gray-500">Port Monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-500">
              {isConnected ? 'Connection Active' : 'No Connection'}
            </span>
          </div>
        </div>

        {stats && (
          <div className="p-4 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Activity size={16} />
              Berth Status
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                <div className="text-xl font-bold text-green-600">{stats.free}</div>
                <div className="text-xs text-gray-500">FREE</div>
              </div>
              <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                <div className="text-xl font-bold text-yellow-600">{stats.repair}</div>
                <div className="text-xs text-gray-500">REPAIR</div>
              </div>
              <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                <div className="text-xl font-bold text-red-600">{stats.awaiting}</div>
                <div className="text-xs text-gray-500">AWAITING</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('berths')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'berths'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Anchor size={16} />
              Berths ({berths.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('ships')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'ships'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Ship size={16} />
              Ships ({ships.length})
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {activeTab === 'berths' ? (
            <div className="p-2 space-y-1">
              {berths.map((berth) => {
                const config = statusConfig[berth.status];
                const Icon = config.icon;
                
                return (
                  <div
                    key={berth._id}
                    className="p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full ${config.color} mt-1.5 flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{berth.name}</h3>
                          <Icon size={14} className="text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {config.label} • {new Date(berth.lastUpdated).toLocaleDateString('en-US')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {ships.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Ship size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No Active Ships</p>
                </div>
              ) : (
                ships.slice(0, 50).map((ship) => (
                  <div
                    key={ship.mmsi}
                    className="p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
                        <Ship size={14} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {ship.name || 'Unknown Vessel'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          MMSI: {ship.mmsi}
                        </p>
                        {ship.sog !== undefined && (
                          <p className="text-xs text-gray-400 mt-1">
                            {ship.sog.toFixed(1)} knots • {new Date(ship.lastUpdate).toLocaleTimeString('en-US')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Port Monitoring System • v1.0
          </p>
        </div>
      </div>
    </>
  );
}
