import Location from "../models/Location.js";
import Travel from "../models/Travel.js";

const UNITS_PER_KM = 0.0344 / 4.8;

const enrichLocations = (locations, targetLatitude, targetLongitude) => {
  return locations.map(t => {
    const distanceUnits = Math.sqrt(Math.pow(t.latitude - targetLatitude, 2) + Math.pow(t.longitude - targetLongitude, 2));
    t.set('distance', distanceUnits, { strict: false });
    t.set('distanceKm', distanceUnits / UNITS_PER_KM, { strict: false });
    return t;
  });
};

const findNearLocations = async (locationFilter, { latitude, longitude, radiusKm, limit }) => {
  const radius = radiusKm * UNITS_PER_KM;

  const locations = await Location.find({
    ...locationFilter,
    latitude: { $gte: latitude - radius, $lte: latitude + radius },
    longitude: { $gte: longitude - radius, $lte: longitude + radius },
  });

  const enrichedLocations = enrichLocations(locations, latitude, longitude);
  const sortedLocations = enrichedLocations.sort((a, b) => a.get('distanceKm') - b.get('distanceKm'));

  return sortedLocations.slice(0, limit);
};

export const getNearLocations = async ({ latitude, longitude, radiusKm, limit }) => {
  return findNearLocations({}, { latitude, longitude, radiusKm, limit });
};

export const getNearLocationsWithRecentTravels = async ({ latitude, longitude, radiusKm, limit }, userId) => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const recentTravels = await Travel.find(
    { startTime: { $gte: oneYearAgo }, ...(userId != null && { userId }) },
    { destination: 1 }
  ).lean();

  const recentDestinationIds = [...new Set(recentTravels.map(t => t.destination.toString()))];

  if (recentDestinationIds.length === 0) {
    return [];
  }

  return findNearLocations({ _id: { $in: recentDestinationIds } }, { latitude, longitude, radiusKm, limit });
};