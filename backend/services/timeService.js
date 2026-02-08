const normalizeHour = (hour) => {
  return hour.toString().padStart(2, '0');
}

const calculateHalfTime = (startTime, duration) => {
  const halfTimestamp = startTime.hour * 60 + startTime.minutes + duration / 2

  return {
    hour: Math.floor(halfTimestamp / 60) % 24,
    minutes: Math.floor(halfTimestamp % 60)
  }
}

const extractHourAndMinutes = (time) => {
  const [hour, minutes] = time.toISOString().split('T')[1].split(':');
  return { hour: parseInt(hour), minutes: parseInt(minutes) };
}

const calculateHourParts = (normalizedStart, normalizedEnd) => {
  const hours = [];

  // Same day - short travel in same hour (< 60 min)
  if (normalizedEnd.hour === normalizedStart.hour) {
    return [{ hour: normalizeHour(normalizedEnd.hour), totalMinutes: (normalizedEnd.minutes - normalizedStart.minutes) }]
  }

  // Partial hours (start and end)
  hours.push({ hour: normalizeHour(normalizedStart.hour), totalMinutes: (60 - normalizedStart.minutes) });
  hours.push({ hour: normalizeHour(normalizedEnd.hour), totalMinutes: normalizedEnd.minutes });

  // Full hours for travels in same day
  if (normalizedEnd.hour > normalizedStart.hour) {
    for (let i = normalizedStart.hour + 1; i < normalizedEnd.hour; i++) {
      hours.push({ hour: normalizeHour(i), totalMinutes: 60 });
    }

    return hours
  }

  // Full hours for travels between 2 days
  for (let i = normalizedStart.hour + 1; i < 24; i++) {
    hours.push({ hour: normalizeHour(i), totalMinutes: 60 });
  }

  for (let i = 0; i < normalizedEnd.hour; i++) {
    hours.push({ hour: normalizeHour(i), totalMinutes: 60 });
  }

  return hours
}

export const getHourParts = (startTime, endTime, duration) => {
  const normalizedStart = extractHourAndMinutes(startTime);
  const normalizedEnd = extractHourAndMinutes(endTime);
  const normalizedHalfTime = calculateHalfTime(normalizedStart, duration);

  return {
    completeParts: calculateHourParts(normalizedStart, normalizedEnd),
    firstHalf: calculateHourParts(normalizedStart, normalizedHalfTime),
    secondHalf: calculateHourParts(normalizedHalfTime, normalizedEnd),
  }
}