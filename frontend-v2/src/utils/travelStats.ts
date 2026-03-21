import type { StatByMode } from "@/types/stats";
import type { Travel } from "@/types/travel";;

/**
 * Calculate statistics grouped by mode of transport from an array of travels
 * @param travels - Array of travel objects
 * @returns Array of statistics per mode of transport
 */
export const calculateStatsByMode = (travels: Travel[]): StatByMode[] => {
  if (!travels || travels.length === 0) {
    return [];
  }

  // Group travels by mode of transport
  const groupedByMode = travels.reduce((acc, travel) => {
    const mode = travel.modeOfTransport || 'other';

    if (!acc[mode]) {
      acc[mode] = {
        modeOfTransport: mode,
        totalMinutes: 0,
        totalKm: 0,
        count: 0
      };
    }

    acc[mode].totalMinutes += travel.duration || 0;
    acc[mode].totalKm += travel.distance || 0;
    acc[mode].count += 1;

    return acc;
  }, {} as Record<string, StatByMode>);

  // Convert to array and sort by totalMinutes descending (most used modes first)
  return Object.values(groupedByMode).sort((a, b) => b.totalMinutes - a.totalMinutes);
};
