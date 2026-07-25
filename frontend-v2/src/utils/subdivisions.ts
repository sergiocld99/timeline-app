import type { Location } from "@/types/location";

import { SUBDIVISIONS } from "@/constants/subdivisions";

// Top 3 most-used subdivisions for a zipcode prefix (by location count), then
// the remaining configured options alphabetically. Generalizes the former
// getSortedPartidos to any jurisdiction in the subdivision registry.
export const getSortedSubdivisions = (locations: Location[], prefix: string) => {
  const options = SUBDIVISIONS.find((s) => s.prefix === prefix)?.options ?? [];
  const counts: Record<string, number> = {};

  locations.forEach((loc) => {
    if (loc.zipcode?.toUpperCase().startsWith(prefix) && loc.partido) {
      counts[loc.partido] = (counts[loc.partido] || 0) + 1;
    }
  });

  const top = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name]) => name);

  const rest = options.filter((o) => !top.includes(o)).sort();

  return {
    top,
    all: [...top, ...rest],
  };
};
