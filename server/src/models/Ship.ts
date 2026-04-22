/**
 * Ship Model - MongoDB Schema for Vessel Tracking
 * 
 * Stores real-time ship position data received from AISStream API.
 * Key features:
 * - MMSI as unique identifier (Maritime Mobile Service Identity)
 * - Geospatial indexing for location-based queries
 * - TTL (Time To Live) index: data expires after 1 hour
 * - Auto-timestamping for createdAt/updatedAt
 * 
 * Ships without updates for 1 hour are automatically deleted,
 * ensuring database only contains active vessels.
 */

import mongoose, { Schema, Document } from 'mongoose';
import { ShipData } from '../types';

export interface IShipDocument extends ShipData, Document {}

const shipSchema = new Schema<IShipDocument>({
  // MMSI: Unique 9-digit vessel identifier assigned by maritime authorities
  mmsi: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Vessel name (can be empty if not broadcast by ship)
  name: {
    type: String,
    default: 'Unknown'
  },
  // GPS coordinates from AIS transponder
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  // COG: Course Over Ground (direction vessel is moving, 0-360 degrees)
  cog: {
    type: Number,
    default: null
  },
  // SOG: Speed Over Ground (knots)
  sog: {
    type: Number,
    default: null
  },
  // Vessel type code (cargo, tanker, passenger, etc.)
  shipType: {
    type: String,
    default: 'Unknown'
  },
  // TTL index: documents expire 1 hour after lastUpdate
  // Ensures old ship data is cleaned up automatically
  lastUpdate: {
    type: Date,
    default: Date.now,
    expires: 3600
  }
}, {
  timestamps: true
});

// Geospatial index for efficient location-based queries
// Enables fast lookups of ships within geographic boundaries
shipSchema.index({ latitude: 1, longitude: 1 });

export const Ship = mongoose.model<IShipDocument>('Ship', shipSchema);

export default Ship;
