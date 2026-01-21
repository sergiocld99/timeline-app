import type { AxiosErrorResponse } from '@/types/commons';
import type { Travel, TravelStats } from '@/types/travel';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import TravelService from '@/services/TravelService';

export const useTravelStats = (travels: Travel[], initialStats?: TravelStats) => {
  const [stats, setStats] = useState<TravelStats | undefined>(initialStats);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    const fetchStats = async () => {
      // If no travels, empty stats (or server handles it)
      if (travels.length === 0) {
        if (!ignore) {
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
          setIsLoading(false);
        }
        return;
      }

      // If length matches initial stats count, assume initial stats are valid (optimization)
      const isInitialStatsValid = initialStats && travels.length === initialStats.count;

      if (isInitialStatsValid) {
        if (!ignore) {
          setStats(initialStats);
          setIsLoading(false);
        }
        return;
      }

      if (!ignore) setIsLoading(true);
      try {
        const travelsPayload = travels.map(t => ({ id: t._id, weight: t.weight }));
        const newStats = await TravelService.getStats(travelsPayload);
        if (!ignore) setStats(newStats);
      } catch (error) {
        if (!ignore) {
          const err = error as AxiosErrorResponse;

          if (err.message?.includes('Network Error')) {
            toast.error('Network Error: Stats could not be updated');
          } else {
            toast.error(`Error fetching stats: ${err.response?.data?.message}`);
          }
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchStats();

    return () => {
      ignore = true;
    };
  }, [travels, initialStats]);

  return { stats, isLoading };
};
