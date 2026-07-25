import { calculateHome, ROUTE_SEPARATOR } from "./routeService.js";
import { getHourParts } from "./timeService.js";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const extractDate = (date) => {
  const dayOfWeek = daysOfWeek[date.getDay()];
  const dateParts = date.toISOString().split('T')[0].split('-');
  const shortYear = dateParts[0].substring(2);
  return `${dayOfWeek} ${dateParts[2]}/${dateParts[1]}/${shortYear}`;
};

const buildShortDate = (date) => {
  const dateParts = date.toISOString().split('T')[0].split('-');
  const timeParts = date.toISOString().split('T')[1].split(':');
  const shortYear = dateParts[0].substring(2);
  return `${dateParts[2]}/${dateParts[1]}/${shortYear} ${timeParts[0]}:${timeParts[1]}`; // DD/MM/YY HH:mm format
};

const calculateDuration = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return (end - start) / (1000 * 60); // duration in minutes
};

export const enrichDuration = (travel) => {
  const duration = calculateDuration(travel.startTime, travel.endTime);

  travel.set('duration', duration, { strict: false });

  return travel
}

// Median (not average) so a single unusually long trip doesn't skew the estimate
const getMedianDuration = (durations) => {
  if (durations.length === 0) return null

  const sorted = [...durations].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]

  return Math.round(median)
}

/**
 * Picks the destination that most often follows travels from the same origin
 * around a given hour:minute (in minutes since midnight, UTC digits), together
 * with the typical duration of those travels so the caller can estimate an endTime.
 * @param {Array} travels - Travel documents/objects with startTime (Date), endTime (Date) and destination
 * @param {number} targetMinutes - target time of day, in minutes since midnight
 * @param {{ toleranceMinutes?: number, minOccurrences?: number }} [options]
 * @returns {{ destination: string, count: number, durationMinutes: number | null } | null}
 */
export const computeDestinationSuggestion = (travels, targetMinutes, { toleranceMinutes = 15, minOccurrences = 2 } = {}) => {
  const counts = new Map()

  for (const travel of travels) {
    // startTime holds Argentina wall-clock digits written as UTC (see CLAUDE.md), so
    // reading UTC hour/minute here gives the real time-of-day the user picked
    const travelMinutes = travel.startTime.getUTCHours() * 60 + travel.startTime.getUTCMinutes()
    const diff = Math.min(
      Math.abs(travelMinutes - targetMinutes),
      1440 - Math.abs(travelMinutes - targetMinutes)
    )

    if (diff > toleranceMinutes) continue

    const destId = travel.destination.toString()
    const entry = counts.get(destId) ?? { count: 0, mostRecent: travel.startTime, durations: [] }

    entry.count++
    if (travel.startTime > entry.mostRecent) entry.mostRecent = travel.startTime

    if (travel.endTime) {
      const duration = calculateDuration(travel.startTime, travel.endTime)

      if (duration > 0) entry.durations.push(duration)
    }

    counts.set(destId, entry)
  }

  // Requires at least 2 past matches so a single one-off trip doesn't dictate the suggestion
  const [bestDestination] = [...counts.entries()]
    .filter(([, entry]) => entry.count >= minOccurrences)
    .sort((a, b) => b[1].count - a[1].count || b[1].mostRecent - a[1].mostRecent)

  if (!bestDestination) return null

  const [destination, entry] = bestDestination

  return { destination, count: entry.count, durationMinutes: getMedianDuration(entry.durations) }
}

export const getOverallSpeed = (travels) => {
  let sumOfDurationMin = 0
  let sumOfDistanceKm = 0

  travels.forEach(t => {
    const duration = calculateDuration(t.startTime, t.endTime);

    sumOfDurationMin += duration
    sumOfDistanceKm += t.distance
  })

  const speedKmh = (sumOfDistanceKm / sumOfDurationMin) * 60

  return [sumOfDistanceKm, sumOfDurationMin, travels.length === 0 ? 0 : speedKmh]
}

/**
 * Enriches travel documents with calculated fields
 * @param {Array} travels - Array of travel documents
 * @returns {Array} - Array of enriched travel documents
 */
export const enrichTravels = (travels) => {
  return travels.map(t => {
    const duration = calculateDuration(t.startTime, t.endTime);

    t.set('shortDate', buildShortDate(t.startTime), { strict: false });
    t.set('extractedDate', extractDate(t.startTime), { strict: false });
    t.set('duration', duration, { strict: false });
    t.set('speed', (t.distance / duration) * 60, { strict: false });

    // From FE: analize/travel.ts
    t.set('hourParts', getHourParts(t.startTime, t.endTime, duration), { strict: false });

    return t;
  });
};

/**
 * Enriches a single travel document with calculated fields
 * @param {Object} travel - Travel document
 * @returns {Object} - Enriched travel document
 */
export const enrichTravel = (travel) => {
  const duration = calculateDuration(travel.startTime, travel.endTime);

  travel.shortDate = buildShortDate(travel.startTime);
  travel.extractedDate = extractDate(travel.startTime);
  travel.duration = duration;
  travel.speed = (travel.distance / duration) * 60;

  return travel;
};

/**
 * Calculates aggregated statistics from an array of enriched travels
 * @param {Array} travels - Array of enriched travel documents
 * @returns {Object} - Object containing aggregated statistics
 */
export const calculateTravelStats = (travels) => {
  if (!travels || travels.length === 0) {
    return {};
  }

  const placesVisited = new Set()
  const uniqueDaysSet = new Set()
  const uniqueRoutesSet = new Set()
  const monthlyStats = {};
  const routeStats = {};
  const placeDataMap = new Map();

  let totalKm = 0;
  let totalMinutes = 0;
  let sumLatitude = 0;
  let sumLongitude = 0;
  let validWeight = 0;

  let maxDistanceTravel = null;
  let maxDurationTravel = null;
  let maxSpeedTravel = null;

  travels.forEach(t => {
    const distance = t.distance || 0;
    const duration = t.get ? t.get('duration') : t.duration || 0;
    const weight = t.get ? t.get('weight').percentage : t.weight?.percentage || 0
    const speed = t.get ? t.get('speed') : t.speed || 0

    totalKm += distance;
    totalMinutes += duration;

    // Unique Days
    const date = new Date(t.startTime);
    uniqueDaysSet.add(date.toISOString().split('T')[0]);

    // Monthly Stats
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyStats[monthKey]) {
      monthlyStats[monthKey] = { km: 0, minutes: 0, count: 0, zipcodes: [] };
    }
    monthlyStats[monthKey].km += distance;
    monthlyStats[monthKey].minutes += duration;
    monthlyStats[monthKey].count += 1;

    // Route Stats
    if (t.origin && t.destination) {
      const sortedLocations = [t.origin.name, t.destination.name].sort()
      const routeKey = `${sortedLocations[0]}${ROUTE_SEPARATOR}${sortedLocations[1]}`;
      routeStats[routeKey] = (routeStats[routeKey] || 0) + 1;

      // extra monthly stats
      if (!monthlyStats[monthKey].zipcodes.find(cp => cp === t.origin.zipcode)) {
        monthlyStats[monthKey].zipcodes.push(t.origin.zipcode)
      }

      if (!monthlyStats[monthKey].zipcodes.find(cp => cp === t.destination.zipcode)) {
        monthlyStats[monthKey].zipcodes.push(t.destination.zipcode)
      }

      // Unique Routes Set (using zipcodes consistent with statistics-service)
      if (t.origin.zipcode && t.destination.zipcode) {
        const routeZipcodes = [t.origin.zipcode, t.destination.zipcode].sort();
        uniqueRoutesSet.add(routeZipcodes.join('-'));
      }
    }

    // Records / Outliers
    if (!maxDistanceTravel || distance > maxDistanceTravel.distance) {
      maxDistanceTravel = t;
    }
    if (!maxDurationTravel || duration > (maxDurationTravel.get ? maxDurationTravel.get('duration') : maxDurationTravel.duration)) {
      maxDurationTravel = t;
    }
    if (!maxSpeedTravel || speed > (maxSpeedTravel.get ? maxSpeedTravel.get('speed') : maxSpeedTravel.speed)) {
      maxSpeedTravel = t;
    }

    // Calculate average coordinates from all origins and destinations
    if (t.origin && t.origin.latitude != null && t.origin.longitude != null) {
      placesVisited.add(t.origin.zipcode)
      placeDataMap.set(t.origin.zipcode, { name: t.origin.name, id: t.origin.id });
      sumLatitude += t.origin.latitude * weight;
      sumLongitude += t.origin.longitude * weight;
      validWeight += weight
    }
    if (t.destination && t.destination.latitude != null && t.destination.longitude != null) {
      placesVisited.add(t.destination.zipcode)
      placeDataMap.set(t.destination.zipcode, { name: t.destination.name, id: t.destination.id });
      sumLatitude += t.destination.latitude * weight;
      sumLongitude += t.destination.longitude * weight;
      validWeight += weight
    }
  });

  const count = travels.length;
  const averageLatitude = validWeight > 0 ? sumLatitude / validWeight : 0;
  const averageLongitude = validWeight > 0 ? sumLongitude / validWeight : 0;
  const averageDistance = count > 0 ? totalKm / count : 0;
  const averageDuration = count > 0 ? totalMinutes / count : 0;

  const totalHours = totalMinutes / 60
  const averageSpeed = totalHours > 0 ? totalKm / totalHours : 0;

  // Format Top Routes
  let topRoutes = Object.entries(routeStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([route, count]) => ({ route, count }));

  const home = calculateHome(topRoutes)

  // Rearrange route order
  if (home) {
    topRoutes = topRoutes.map(r => {
      if (!r.route.includes(home)) {
        return r;
      }

      const [loc1, loc2] = r.route.split(ROUTE_SEPARATOR)
      const otherLocation = loc1 === home ? loc2 : loc1

      r.route = `${home}${ROUTE_SEPARATOR}${otherLocation}`
      return r
    })
  }

  return {
    count,
    totalDistance: Math.round(totalKm * 100) / 100, // Round to 2 decimals
    totalHours: Math.round(totalHours * 100) / 100,
    totalMinutes,
    averageLatitude: Math.round(averageLatitude * 10000) / 10000, // Round to 4 decimals
    averageLongitude: Math.round(averageLongitude * 10000) / 10000,
    averageSpeed: Math.round(averageSpeed * 100) / 100,
    averageDistance: Math.round(averageDistance * 100) / 100,
    averageDuration: Math.round(averageDuration * 100) / 100,
    uniqueDays: uniqueDaysSet.size,
    uniqueRoutes: uniqueRoutesSet.size,
    placesVisited: {
      count: placesVisited.size,
      zipcodes: Array.from(placesVisited.values()),
      data: Object.fromEntries(placeDataMap)
    },
    monthlyStats,
    topRoutes,
    home,
    records: {
      maxDistance: maxDistanceTravel ? {
        value: maxDistanceTravel.distance,
        date: maxDistanceTravel.startTime,
        origin: maxDistanceTravel.origin,
        destination: maxDistanceTravel.destination
      } : null,
      maxDuration: maxDurationTravel ? {
        value: maxDurationTravel.get ? maxDurationTravel.get('duration') : maxDurationTravel.duration,
        date: maxDurationTravel.startTime,
        origin: maxDurationTravel.origin,
        destination: maxDurationTravel.destination
      } : null,
      maxSpeed: maxSpeedTravel ? {
        value: Math.round(maxSpeedTravel.get ? maxSpeedTravel.get('speed') : maxSpeedTravel.speed),
        date: maxSpeedTravel.startTime,
        origin: maxSpeedTravel.origin,
        destination: maxSpeedTravel.destination
      } : null,
    }
  };
};

