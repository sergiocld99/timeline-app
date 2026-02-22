import type { Travel, TravelStats } from '@/types/travel';

import { useQuery } from '@tanstack/react-query';

import TravelService from '@/services/TravelService';

const EMPTY_STATS: TravelStats = {
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
};

export const useTravelStats = (travels: Travel[], initialStats?: TravelStats) => {
  // Generar una llave única basada en los IDs de los viajes para deduplicación
  const travelIds = travels.map(t => t._id).sort();

  const { data, isLoading } = useQuery({
    queryKey: ['travel_stats', travelIds],
    queryFn: async () => {
      if (travels.length === 0) {
        return EMPTY_STATS;
      }

      const payload = travels.map(t => ({
        id: t._id,
        origin: t.origin._id,
        destination: t.destination._id
      }));

      return await TravelService.getStats(payload);
    },
    // Si tenemos stats iniciales que coinciden con la cantidad de viajes, los usamos como data inicial
    initialData: (initialStats && travels.length === initialStats.count) ? initialStats : undefined,
  });

  // Si travels está vacío, devolvemos EMPTY_STATS inmediatamente
  const stats = travels.length === 0 ? EMPTY_STATS : data;

  return { stats, isLoading };
};
