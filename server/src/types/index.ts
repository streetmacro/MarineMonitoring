export type BerthStatus = 'FREE' | 'REPAIR' | 'AWAITING';

export interface IBerth {
  id: number;
  coords: [number, number];
  status: BerthStatus;
  lastUpdated: Date;
  name?: string;
}

export interface AISMessage {
  MessageType: string;
  MetaData: {
    MMSI: string;
    ShipName?: string;
    latitude: number;
    longitude: number;
    time_utc: string;
  };
  Message?: {
    PositionReport?: {
      Latitude: number;
      Longitude: number;
      Cog?: number;
      Sog?: number;
    };
    ShipStaticData?: {
      Name?: string;
      ShipType?: string;
    };
  };
}

export interface ShipData {
  mmsi: string;
  name: string;
  latitude: number;
  longitude: number;
  cog?: number;
  sog?: number;
  shipType?: string;
  lastUpdate: Date;
}
