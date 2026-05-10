import { ACCENT1, MUTED, WARNING } from "@/constants/colors";

interface MonthlyBarEntry {
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
