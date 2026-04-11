import type { Travel } from '@/types/travel';

import { useQuery } from '@tanstack/react-query';

import TravelService from '@/services/TravelService';

export const useMapConfig = (travels: Travel[]) => {
  // Generar una llave única basada en los IDs de los viajes para deduplicación
  const travelIds = travels.map(t => t._id).sort();

  const { data, isLoading } = useQuery({
    queryKey: ['map_config', travelIds],
    queryFn: async () => {
      if (travels.length === 0) {
        return null;
      }

      const payload = travels.map(t => ({
        id: t._id,
        origin: t.origin._id,
        destination: t.destination._id
      }));

      return await TravelService.getMapConfig(payload);
    },
    staleTime: Infinity,
  });

  return { mapConfig: data, isLoading };
};
