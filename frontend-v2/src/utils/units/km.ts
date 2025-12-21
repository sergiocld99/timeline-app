const UNITS_PER_KM = 0.0344 / 4.8;

export const calculateDistanceKm = (lat1: number, lat2: number, lng1: number, lng2: number) => {
  const distanceUnits = Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));

  return distanceUnits / UNITS_PER_KM
}