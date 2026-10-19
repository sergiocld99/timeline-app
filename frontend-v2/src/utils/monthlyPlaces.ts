import type { PlacesVisited } from "@/types/travel";

export type PlaceData = NonNullable<PlacesVisited["data"]>;

export const MONTHS_PER_YEAR = 12;

export type PlaceGroup = "notVisited" | "decreasing" | "frequent" | "new";
export type Centroid = {
  group: PlaceGroup;
  count: number;
  latitude: number | null;
  longitude: number | null;
};

type Bucket = {
  sumLat: number;
  sumLng: number;
  weight: number;
  count: number;
};

// Display order of the centroid summary.
export const PLACE_GROUPS: PlaceGroup[] = ["notVisited", "decreasing", "frequent", "new"];

// Same colours the table rows use for each group.
export const PLACE_GROUP_COLORS: Record<PlaceGroup, string> = {
  notVisited: "#ff6b6b",
  decreasing: "#e8ff47",
  frequent: "#f0f0f8",
  new: "#47ff88",
};

export const getVisitedMonthsSet = (placeData?: PlaceData, zipcode?: string): Set<number> => {
  const set = new Set<number>();
  if (!placeData || !zipcode) return set;
  const months = placeData[zipcode]?.months || [];
  for (const m of months) {
    const mm = Number(m.slice(5, 7));
    if (!isNaN(mm) && mm >= 1 && mm <= MONTHS_PER_YEAR) {
      set.add(mm);
    }
  }
  return set;
};

export const getPlaceName = (zipcode: string, data?: PlaceData, prevData?: PlaceData): string =>
  data?.[zipcode]?.name || prevData?.[zipcode]?.name || "";

export const getPlaceCoordinates = (
  zipcode: string,
  data?: PlaceData,
  prevData?: PlaceData
): { latitude: number; longitude: number } | null => {
  const place = data?.[zipcode] || prevData?.[zipcode];
  return place ? { latitude: place.latitude, longitude: place.longitude } : null;
};

export const getPlaceBalance = (visitedCurrent: Set<number>, visitedPrev: Set<number>): number =>
  visitedCurrent.size - visitedPrev.size;

// Mirrors the row colouring so the summary groups always match the table.
export const getPlaceGroup = (visitedCurrent: Set<number>, visitedPrev: Set<number>): PlaceGroup => {
  const balance = getPlaceBalance(visitedCurrent, visitedPrev);
  if (balance > 0 && visitedPrev.size === 0) return "new";
  if (balance < 0 && visitedCurrent.size > 0) return "decreasing";
  if (balance < 0) return "notVisited";
  return "frequent";
};

/**
 * Weighted centroid per group: Σ(coord × |balance|) / Σ|balance|.
 * Places with balance 0 carry no weight, so they don't move the coordinate;
 * `count` still includes them so the group size matches the table rows. A
 * group with no weighted place returns no centroid ("-").
 */
export const calculateCentroids = (
  zipcodes: string[],
  data?: PlaceData,
  prevData?: PlaceData
): Centroid[] => {
  const buckets: Record<PlaceGroup, Bucket> = {
    notVisited: { sumLat: 0, sumLng: 0, weight: 0, count: 0 },
    decreasing: { sumLat: 0, sumLng: 0, weight: 0, count: 0 },
    frequent: { sumLat: 0, sumLng: 0, weight: 0, count: 0 },
    new: { sumLat: 0, sumLng: 0, weight: 0, count: 0 },
  };

  for (const zipcode of zipcodes) {
    const visitedCurrent = getVisitedMonthsSet(data, zipcode);
    const visitedPrev = getVisitedMonthsSet(prevData, zipcode);
    const group = getPlaceGroup(visitedCurrent, visitedPrev);
    const bucket = buckets[group];
    // Count every row of the group so the amount matches the table, but only
    // places with a non-zero balance contribute to the weighted coordinate.
    bucket.count += 1;

    const weight = Math.abs(getPlaceBalance(visitedCurrent, visitedPrev));
    if (weight === 0) continue;

    const coordinates = getPlaceCoordinates(zipcode, data, prevData);
    if (!coordinates) continue;

    bucket.sumLat += coordinates.latitude * weight;
    bucket.sumLng += coordinates.longitude * weight;
    bucket.weight += weight;
  }

  return PLACE_GROUPS.map((group) => {
    const bucket = buckets[group];
    if (bucket.weight === 0) {
      return { group, count: bucket.count, latitude: null, longitude: null };
    }
    return {
      group,
      count: bucket.count,
      latitude: bucket.sumLat / bucket.weight,
      longitude: bucket.sumLng / bucket.weight,
    };
  });
};
