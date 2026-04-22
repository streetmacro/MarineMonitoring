/**
 * Berth Model - MongoDB Schema for Port Berth Management
 * 
 * Manages physical mooring locations at the port with status tracking.
 * Statuses:
 * - FREE: Berth available for incoming vessels
 * - REPAIR: Berth under maintenance/construction
 * - AWAITING: Berth occupied by vessel waiting to dock
 * 
 * Pre-save/update hooks automatically track lastUpdated timestamp.
 * Default names auto-generate as "Berth {id}".
 */

import mongoose, { Schema, Document } from 'mongoose';
import { IBerth, BerthStatus } from '../types';

export interface IBerthDocument extends IBerth, Document {}

const berthSchema = new Schema<IBerthDocument>({
  // Sequential berth identifier (1, 2, 3...) - used as primary key
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  // [latitude, longitude] - GPS coordinates for map display
  coords: {
    type: [Number],
    required: true,
    validate: {
      validator: (v: number[]) => v.length === 2,
      message: 'Coords must be an array of two numbers [lat, lng]'
    }
  },
  // Current occupancy status with enum validation
  status: {
    type: String,
    enum: ['FREE', 'REPAIR', 'AWAITING'],
    default: 'FREE',
    required: true
  },
  // Timestamp of last status change (updated by pre-hooks)
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  // Display name - auto-generates as "Berth {id}" if not specified
  name: {
    type: String,
    default: function() {
      return `Berth ${this.id}`;
    }
  }
}, {
  timestamps: true
});

// Pre-save hook: updates lastUpdated timestamp on document creation/update
berthSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Pre-update hook: updates lastUpdated timestamp on findOneAndUpdate operations
berthSchema.pre('findOneAndUpdate', function(next) {
  this.set({ lastUpdated: new Date() });
  next();
});

export const Berth = mongoose.model<IBerthDocument>('Berth', berthSchema);

export default Berth;
