import Location from "../models/Location.js";

const UNITS_PER_KM = 0.0344 / 4.8;

const enrichLocations = (locations, targetLatitude, targetLongitude) => {
  return locations.map(t => {
    const distanceUnits = Math.sqrt(Math.pow(t.latitude - targetLatitude, 2) + Math.pow(t.longitude - targetLongitude, 2));
    t.set('distance', distanceUnits, { strict: false });
    t.set('distanceKm', distanceUnits / UNITS_PER_KM, { strict: false });
    return t;
  });
};

export const getNearLocations = async ({ latitude, longitude, radiusKm, limit }) => {
  // EXAMPLE:
  // - B1887 is -34.8122, -58.2881
  // - B1888 is -34.7792, -58.2785
  // Difference is: LAT: 0.0330, LONG: 0.0096
  // Linear distance formula: sqrt(0.0330^2 + 0.0096^2) = 0.0344
  // By GMaps, 4.8 km = 0.0344, so 1 km = 0.0344 / 4.8 = KM_PER_UNIT

  const radius = radiusKm * UNITS_PER_KM;

  const locations = await Location.find({
    latitude: { $gte: latitude - radius, $lte: latitude + radius },
    longitude: { $gte: longitude - radius, $lte: longitude + radius },
  });

  const enrichedLocations = enrichLocations(locations, latitude, longitude);
  const sortedLocations = enrichedLocations.sort((a, b) => a.get('distanceKm') - b.get('distanceKm'));

  return sortedLocations.slice(0, limit);
}