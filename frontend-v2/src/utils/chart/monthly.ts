import type { MonthlyStats, PlaceMonthRanking, PlacesVisited } from "@/types/travel";

import { ACCENT1, MUTED, WARNING } from "@/constants/colors";

type MonthlyBarEntry = {
  zipcodes: string[];
  prevZipcodes: string[];
  places: number;
}

/**
 * Calculates the fill color and opacity for a bar in the monthly places chart.
 * 
 * @param entry The data entry for the current bar
 * @param activeZipcode The zipcode currently being hovered/selected
 * @param maxPlaces The maximum number of places in the dataset (for normalization)
 * @returns An object with fill and opacity
 */
export const getMonthlyBarStyling = (
  entry: MonthlyBarEntry,
  activeZipcode: string | null,
  maxPlaces: number
) => {
  const isHighlighted = activeZipcode ? entry.zipcodes.includes(activeZipcode) : true;
  const isPrevHighlighted = !isHighlighted && activeZipcode ? entry.prevZipcodes.includes(activeZipcode) : false;

  let fill = MUTED;
  let opacity = 0.15;

  if (isHighlighted) {
    fill = ACCENT1;
    // Normalize opacity based on the number of places, between 0.3 and 1.0
    opacity = 0.3 + (entry.places / Math.max(maxPlaces, 1)) * 0.7;
  } else if (isPrevHighlighted) {
    fill = WARNING; // Reddish color for previous year visits
    opacity = 0.4;
  }

  return { fill, opacity };
};

// Ranks places by how many distinct months they appear in across monthlyStats,
// excluding the backend-calculated home (it dominates every ranking otherwise).
export const calculateTopPlacesByMonths = (
  monthlyStats: MonthlyStats,
  placesData: PlacesVisited["data"],
  home: string | undefined,
  limit = 5
): PlaceMonthRanking[] => {
  const monthKeysByPlace: Record<string, string[]> = {};

  Object.entries(monthlyStats).forEach(([monthKey, { zipcodes }]) => {
    zipcodes.forEach(zipcode => {
      if (!monthKeysByPlace[zipcode]) { monthKeysByPlace[zipcode] = []; }
      monthKeysByPlace[zipcode].push(monthKey);
    });
  });

  return Object.entries(monthKeysByPlace)
    .filter(([zipcode]) => placesData?.[zipcode]?.name !== home)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, limit)
    .map(([zipcode, monthKeys]) => ({
      zipcode,
      monthKeys,
      name: placesData?.[zipcode]?.name || zipcode,
      id: placesData?.[zipcode]?.id
    }));
};
