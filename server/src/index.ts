/**
 * Marine Monitoring Server
 * 
 * Architecture:
 * - HTTP Server (Express): REST API for berths and ships
 * - WebSocket Server (/ws): Real-time ship position updates to frontend
 * - AISStream Client: External WebSocket connection to AISStream.io for vessel data
 * - MongoDB: Persistent storage for berths and transient ship positions
 * 
 * Data Flow:
 * 1. AISStream.io -> AISStreamClient (real-time vessel positions)
 * 2. AISStreamClient -> MongoDB (persist ship data)
 * 3. AISStreamClient -> broadcastShipUpdate() -> WebSocket clients
 * 4. Frontend receives updates and moves ship markers on map
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import berthRoutes, { initializeBerths } from './routes/berths';
import shipRoutes from './routes/ships';
import AISStreamClient from './websocket/aisStream';
import { ShipData } from './types';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marine_monitoring';
const AIS_API_KEY = process.env.AIS_STREAM_API_KEY || '';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

app.use(express.json());

app.use('/api/berths', berthRoutes);
app.use('/api/ships', shipRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aisConnected: aisClient?.getStatus().isConnected || false
  });
});

// Active WebSocket client connections from frontend browser
const clients = new Set<WebSocket>();

/**
 * WebSocket connection handler for frontend clients
 * Each browser tab opening the app connects here
 * Clients receive real-time ship position updates
 */
wss.on('connection', (ws: WebSocket) => {
  console.log('WebSocket client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

/**
 * Broadcasts ship position updates to all connected frontend clients
 * Called by AISStreamClient when new vessel data arrives
 * readyState === 1 means the WebSocket connection is OPEN
 */
const broadcastShipUpdate = (ship: ShipData): void => {
  const message = JSON.stringify({
    type: 'ship_update',
    data: ship
  });

  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
};

// External AISStream.io connection client
let aisClient: AISStreamClient | null = null;

/**
 * Initializes connection to AISStream.io API
 * Requires API key from environment variables
 * Defines geographic bounding box around Tallinn port for vessel monitoring
 */
const initAISClient = (): void => {
  if (!AIS_API_KEY) {
    console.warn('AIS_STREAM_API_KEY not set, skipping AIS connection');
    return;
  }

  const boundingBoxes = [
    [[57.0, 20.0], [60.0, 28.0]]
  ];

  aisClient = new AISStreamClient({
    apiKey: AIS_API_KEY,
    boundingBoxes,
    filterMessageTypes: ['PositionReport', 'ShipStaticData']
  });

  aisClient.setOnShipUpdate(broadcastShipUpdate);
  aisClient.connect();
};

const startServer = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await initializeBerths();

    initAISClient();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

const gracefulShutdown = (): void => {
  console.log('Shutting down gracefully...');

  if (aisClient) {
    aisClient.disconnect();
  }

  wss.close(() => {
    console.log('WebSocket server closed');
  });

  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();
