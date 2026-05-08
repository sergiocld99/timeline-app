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
  const placeNames = {};

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
      placeNames[t.origin.zipcode] = t.origin.name
      sumLatitude += t.origin.latitude * weight;
      sumLongitude += t.origin.longitude * weight;
      validWeight += weight
    }
    if (t.destination && t.destination.latitude != null && t.destination.longitude != null) {
      placesVisited.add(t.destination.zipcode)
      placeNames[t.destination.zipcode] = t.destination.name
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
      names: placeNames
    },
    monthlyStats,
    topRoutes,
    home,
    records: {
      maxDistance: maxDistanceTravel ? {
        value: maxDistanceTravel.distance,
        date: maxDistanceTravel.startTime,
        origin: maxDistanceTravel.origin?.name,
        destination: maxDistanceTravel.destination?.name
      } : null,
      maxDuration: maxDurationTravel ? {
        value: maxDurationTravel.get ? maxDurationTravel.get('duration') : maxDurationTravel.duration,
        date: maxDurationTravel.startTime,
        origin: maxDurationTravel.origin?.name,
        destination: maxDurationTravel.destination?.name
      } : null,
      maxSpeed: maxSpeedTravel ? {
        value: Math.round(maxSpeedTravel.get ? maxSpeedTravel.get('speed') : maxSpeedTravel.speed),
        date: maxSpeedTravel.startTime,
        origin: maxSpeedTravel.origin?.name,
        destination: maxSpeedTravel.destination?.name
      } : null,
    }
  };
};

