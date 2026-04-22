import axios from 'axios';
import { Berth, BerthStats, Ship, ShipStats, BerthStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const berthsApi = {
  getAll: async (): Promise<Berth[]> => {
    const response = await api.get('/berths');
    return response.data;
  },

  getById: async (id: number): Promise<Berth> => {
    const response = await api.get(`/berths/${id}`);
    return response.data;
  },

  updateStatus: async (id: number, status: BerthStatus): Promise<Berth> => {
    const response = await api.patch(`/berths/${id}`, { status });
    return response.data;
  },

  getStats: async (): Promise<BerthStats> => {
    const response = await api.get('/berths/stats/overview');
    return response.data;
  }
};

export const shipsApi = {
  getAll: async (limit?: number): Promise<Ship[]> => {
    const response = await api.get('/ships', {
      params: { limit }
    });
    return response.data;
  },

  getStats: async (): Promise<ShipStats> => {
    const response = await api.get('/ships/stats');
    return response.data;
  }
};

export default api;
