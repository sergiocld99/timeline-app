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

/**
 * Enriches travel documents with calculated fields
 * @param {Array} travels - Array of travel documents
 * @returns {Array} - Array of enriched travel documents
 */
export const enrichTravels = (travels) => {
  return travels.map(t => {
    const duration = calculateDuration(t.startTime, t.endTime);

    t.set('shortDate', buildShortDate(t.startTime), { strict: false });
    t.set('duration', duration, { strict: false });
    t.set('speed', (t.distance / duration) * 60, { strict: false });

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

  let totalKm = 0;
  let totalMinutes = 0;
  let totalPrice = 0;
  let sumLatitude = 0;
  let sumLongitude = 0;
  let validWeight = 0;

  travels.forEach(t => {
    const distance = t.distance || 0;
    const duration = t.get ? t.get('duration') : t.duration || 0;
    const price = t.price || 0;
    const weight = t.get ? t.get('weight').percentage : t.weight?.percentage || 0

    totalKm += distance;
    totalMinutes += duration;
    totalPrice += price;

    // Calculate average coordinates from all origins and destinations
    if (t.origin && t.origin.latitude != null && t.origin.longitude != null) {
      placesVisited.add(t.origin.zipcode)
      sumLatitude += t.origin.latitude * weight;
      sumLongitude += t.origin.longitude * weight;
      validWeight += weight
    }
    if (t.destination && t.destination.latitude != null && t.destination.longitude != null) {
      placesVisited.add(t.destination.zipcode)
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
  const averagePrice = count > 0 ? totalPrice / count : 0;
  
  const totalHours = totalMinutes / 60
  const averageSpeed = totalHours > 0 ? totalKm / totalHours : 0;

  return {
    count,
    totalDistance: Math.round(totalKm * 100) / 100, // Round to 2 decimals
    totalHours: Math.round(totalHours * 100) / 100,
    totalMinutes,
    totalPrice,
    averageLatitude: Math.round(averageLatitude * 10000) / 10000, // Round to 4 decimals
    averageLongitude: Math.round(averageLongitude * 10000) / 10000,
    averageSpeed: Math.round(averageSpeed * 100) / 100,
    averageDistance: Math.round(averageDistance * 100) / 100,
    averageDuration: Math.round(averageDuration * 100) / 100,
    averagePrice: Math.round(averagePrice * 100) / 100,
    placesVisited: {
      count: placesVisited.size,
      zipcodes: Array.from(placesVisited.values())
    }
  };
};

