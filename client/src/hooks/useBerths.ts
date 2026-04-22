import { useState, useEffect, useCallback } from 'react';
import { Berth, BerthStats, BerthStatus } from '../types';
import { berthsApi } from '../utils/api';

export function useBerths() {
  const [berths, setBerths] = useState<Berth[]>([]);
  const [stats, setStats] = useState<BerthStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBerths = useCallback(async () => {
    try {
      setIsLoading(true);
      const [berthsData, statsData] = await Promise.all([
        berthsApi.getAll(),
        berthsApi.getStats()
      ]);
      setBerths(berthsData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch berths');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBerthStatus = useCallback(async (id: number, status: BerthStatus) => {
    try {
      const updated = await berthsApi.updateStatus(id, status);
      setBerths((prev) =>
        prev.map((berth) => (berth.id === id ? updated : berth))
      );
      
      const newStats = await berthsApi.getStats();
      setStats(newStats);
      
      return updated;
    } catch (err) {
      console.error('Error updating berth status:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchBerths();
  }, [fetchBerths]);

  return {
    berths,
    stats,
    isLoading,
    error,
    updateBerthStatus,
    refetch: fetchBerths
  };
}
