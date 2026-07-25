import type { Location } from "@/types/location";

import { SUBDIVISIONS } from "@/constants/subdivisions";

// One drill-down quick filter is surfaced per every 12 locations in the
// category (floor), picking the most-used subdivisions first.
const FILTERS_PER_LOCATIONS = 12;

// Most-used subdivisions for a zipcode prefix (as `top`, capped by the rule
// above), plus the full configured option list ordered most-used-first (`all`).
// Generalizes the former getSortedPartidos to any jurisdiction in the registry.
export const getSortedSubdivisions = (locations: Location[], prefix: string) => {
  const options = SUBDIVISIONS.find((s) => s.prefix === prefix)?.options ?? [];
  const counts: Record<string, number> = {};
  let total = 0;

  locations.forEach((loc) => {
    if (loc.zipcode?.toUpperCase().startsWith(prefix)) {
      total += 1;
      if (loc.partido) counts[loc.partido] = (counts[loc.partido] || 0) + 1;
    }
  });

  const limit = Math.floor(total / FILTERS_PER_LOCATIONS);

  const ranked = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([name]) => name);

  const top = ranked.slice(0, limit);
  const rest = options.filter((o) => !ranked.includes(o)).sort();

  return {
    top,
    all: [...ranked, ...rest],
  };
};
