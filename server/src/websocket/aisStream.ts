/**
 * AISStream WebSocket Client
 * 
 * This module handles real-time ship tracking by connecting to the AISStream.io API.
 * AIS (Automatic Identification System) provides vessel position reports broadcast by ships.
 * 
 * Flow:
 * 1. Connects to wss://stream.aisstream.io/v0/stream
 * 2. Subscribes to PositionReport messages within geographic bounding boxes
 * 3. Parses incoming vessel data (MMSI, name, position, course, speed)
 * 4. Persists ship data to MongoDB via Ship model
 * 5. Emits updates to connected WebSocket clients for real-time UI updates
 * 6. Auto-reconnects on disconnections with exponential backoff
 */

import WebSocket from 'ws';
import { AISMessage, ShipData } from '../types';
import { Ship } from '../models/Ship';

interface AISStreamConfig {
  apiKey: string;
  boundingBoxes: number[][][];
  filterMessageTypes?: string[];
}

export class AISStreamClient {
  private ws: WebSocket | null = null;
  private config: AISStreamConfig;
  private reconnectInterval: number = 5000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private onShipUpdate: ((ship: ShipData) => void) | null = null;
  private isConnected: boolean = false;

  constructor(config: AISStreamConfig) {
    this.config = config;
  }

  public setOnShipUpdate(callback: (ship: ShipData) => void): void {
    this.onShipUpdate = callback;
  }

  /**
   * Establishes WebSocket connection to AISStream API
   * Sets up event handlers for open, message, error, and close events
   */
  public connect(): void {
    if (this.isConnected) {
      console.log('AIS Stream already connected');
      return;
    }

    try {
      console.log('Connecting to AIS Stream...');
      this.ws = new WebSocket('wss://stream.aisstream.io/v0/stream');

      this.ws.on('open', () => {
        console.log('AIS Stream connected');
        this.isConnected = true;
        this.subscribe();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message: AISMessage = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing AIS message:', error);
        }
      });

      this.ws.on('error', (error) => {
        console.error('AIS Stream error:', error);
      });

      this.ws.on('close', () => {
        console.log('AIS Stream disconnected');
        this.isConnected = false;
        this.scheduleReconnect();
      });
    } catch (error) {
      console.error('Error connecting to AIS Stream:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Sends subscription request to AISStream API
   * Filters for PositionReport messages within specified geographic boundaries
   * Bounding boxes define the area around Tallinn port for monitoring
   */
  private subscribe(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not open, cannot subscribe');
      return;
    }

    const subscriptionMessage = {
      APIKey: this.config.apiKey,
      BoundingBoxes: this.config.boundingBoxes,
      FilterMessageTypes: this.config.filterMessageTypes || ["PositionReport"]
    };

    this.ws.send(JSON.stringify(subscriptionMessage));
    console.log('Subscribed to AIS Stream with bounding boxes:', this.config.boundingBoxes);
  }

  /**
   * Processes incoming AIS PositionReport messages
   * Extracts: MMSI (unique vessel ID), name, GPS coordinates
   * Optionally extracts: COG (course over ground), SOG (speed over ground)
   * Saves to database and broadcasts to frontend clients
   */
  private handleMessage(message: AISMessage): void {
    if (!message.MetaData) return;

    const { MMSI, ShipName, latitude, longitude } = message.MetaData;
    
    if (!MMSI || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return;
    }

    const shipData: ShipData = {
      mmsi: MMSI.toString(),
      name: ShipName?.trim() || 'Unknown',
      latitude,
      longitude,
      lastUpdate: new Date()
    };

    if (message.Message?.PositionReport) {
      const { Cog, Sog } = message.Message.PositionReport;
      shipData.cog = typeof Cog === 'number' ? Cog : undefined;
      shipData.sog = typeof Sog === 'number' ? Sog : undefined;
    }

    if (message.Message?.ShipStaticData?.Name) {
      shipData.name = message.Message.ShipStaticData.Name.trim();
    }

    if (message.Message?.ShipStaticData?.ShipType) {
      shipData.shipType = message.Message.ShipStaticData.ShipType.toString();
    }

    this.saveShip(shipData);

    if (this.onShipUpdate) {
      this.onShipUpdate(shipData);
    }
  }

  /**
   * Persists ship data to MongoDB using upsert (insert or update)
   * MMSI is used as unique identifier - ships are updated if they exist
   * Data expires after 1 hour via TTL index in Ship schema
   */
  private async saveShip(shipData: ShipData): Promise<void> {
    try {
      await Ship.findOneAndUpdate(
        { mmsi: shipData.mmsi },
        shipData,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Error saving ship data:', error);
    }
  }

  /**
   * Implements auto-reconnect with 5 second delay
   * Prevents multiple concurrent reconnection attempts
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    console.log(`Reconnecting in ${this.reconnectInterval}ms...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectInterval);
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    console.log('AIS Stream client disconnected');
  }

  public getStatus(): { isConnected: boolean } {
    return { isConnected: this.isConnected };
  }
}

export default AISStreamClient;
