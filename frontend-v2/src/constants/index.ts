import type { TravelStats } from "@/types/travel";

const getBaseHost = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  return 'localhost';
};

const host = getBaseHost();

export const backendBaseUrl = `http://${host}:3000/api`;
export const v2BaseUrl = `http://${host}:8081/api/v2`;

export const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// The backend answers `{}` (not a zeroed object) when a range has no travels,
// so consumers must merge over this to avoid reading fields off undefined.
export const EMPTY_TRAVEL_STATS: TravelStats = {
  count: 0,
  totalDistance: 0,
  averageSpeed: 0,
  totalMinutes: 0,
  totalHours: 0,
  averageLatitude: 0,
  averageLongitude: 0,
  averageDistance: 0,
  averageDuration: 0,
  placesVisited: { count: 0, zipcodes: [] }
};
