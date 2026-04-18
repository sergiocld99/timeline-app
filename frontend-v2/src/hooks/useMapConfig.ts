import type { MapConfig } from '@/types/map';
import type { Travel } from '@/types/travel';

import { useQuery } from '@tanstack/react-query';

import MapService from '@/services/MapService';

export const useMapConfig = (travels: Travel[]) => {
  // Generar una llave única basada en los IDs de los viajes para deduplicación
  const travelIds = travels.map(t => t._id).sort();

  const { data, isLoading } = useQuery<MapConfig | null>({
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

      return await MapService.getMapConfig(payload);
    },
    staleTime: Infinity,
  });

  return { mapConfig: data, isLoading };
};
