import type { AxiosErrorResponse } from '@/types/commons';
import type { Travel, TravelStats } from '@/types/travel';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import TravelService from '@/services/TravelService';

export const useTravelStats = (travels: Travel[], initialStats?: TravelStats) => {
  const [stats, setStats] = useState<TravelStats | undefined>(initialStats);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      // If no travels, empty stats (or server handles it)
      if (travels.length === 0) {
        setStats({
          count: 0,
          totalDistance: 0,
          averageSpeed: 0,
          totalMinutes: 0,
          totalHours: 0,
          totalPrice: 0,
          averageLatitude: 0,
          averageLongitude: 0,
          averageDistance: 0,
          averageDuration: 0,
          averagePrice: 0,
          placesVisited: { count: 0, zipcodes: [] }
        } as TravelStats);
        return;
      }

      // If length matches initial stats count, assume initial stats are valid (optimization)
      // Limitation: If we filter but length stays same (unlikely but possible), this might be wrong.
      // Better: Compare IDs or assume if initialStats exists and length matches, we use it initially.
      // BUT, if the component re-renders with new `travels` prop, we want to respect that.

      const isInitialStatsValid = initialStats && travels.length === initialStats.count;

      if (isInitialStatsValid) {
        setStats(initialStats);
        return;
      }

      setIsLoading(true);
      try {
        const travelsPayload = travels.map(t => ({ id: t._id, weight: t.weight }));
        const newStats = await TravelService.getStats(travelsPayload);
        setStats(newStats);
      } catch (error) {
        const err = error as AxiosErrorResponse;

        toast.error(`Error fetching stats: ${err.response?.data?.message}`)
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [travels, initialStats]);

  return { stats, isLoading };
};
