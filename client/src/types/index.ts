export type BerthStatus = 'FREE' | 'REPAIR' | 'AWAITING';

export interface Berth {
  _id: string;
  id: number;
  coords: [number, number];
  status: BerthStatus;
  lastUpdated: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ship {
  _id: string;
  mmsi: string;
  name: string;
  latitude: number;
  longitude: number;
  cog?: number;
  sog?: number;
  shipType?: string;
  lastUpdate: string;
}

export interface BerthStats {
  total: number;
  free: number;
  repair: number;
  awaiting: number;
}

export interface ShipStats {
  totalActive: number;
  shipTypes: { _id: string; count: number }[];
}

export interface WebSocketMessage {
  type: 'ship_update';
  data: Ship;
}
