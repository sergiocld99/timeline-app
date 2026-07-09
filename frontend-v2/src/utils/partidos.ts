import type { Location } from "@/types/location";

import { BUENOS_AIRES_PARTIDOS } from "@/constants/partidos";

export const getSortedPartidos = (locations: Location[]) => {
  const counts: Record<string, number> = {};

  locations.forEach(loc => {
    if (loc.zipcode?.toUpperCase().startsWith('B') && loc.partido) {
      counts[loc.partido] = (counts[loc.partido] || 0) + 1;
    }
  });

  const sortedByCount = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name]) => name);

  const rest = BUENOS_AIRES_PARTIDOS
    .filter(p => !sortedByCount.includes(p))
    .sort();

  return {
    top: sortedByCount,
    all: [...sortedByCount, ...rest]
  };
};
