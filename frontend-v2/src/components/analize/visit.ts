import type { HourPart } from "@/types/chart";
import type { Visit } from "@/types/travel";

import { extractHourAndMinutes, normalizeHour } from "@/utils/chart";
import { extractKeys, sortByDescendingValue } from "@/utils/kv";

export const calculateBestLocations = (visits: Visit[], quantity: number) => {
  const topLocations = visits.reduce((acc, v) => {
    const key = v.location.name
    if (!acc[key]) {
      acc[key] = 0
    }
    acc[key] += v.durationMinutes
    return acc
  }, {} as Record<string, number>)

  const sortedLocations = sortByDescendingValue(topLocations)
  return extractKeys(sortedLocations, quantity, true)
}

export const getEachHourOfVisit = ({ arrivalTime, departureTime }: Visit): HourPart[] => {
  const startTime = extractHourAndMinutes(arrivalTime);
  const endTime = extractHourAndMinutes(departureTime);

  const hours: HourPart[] = [];

  if (endTime.hour === startTime.hour) {
    return [{ hour: normalizeHour(endTime.hour), totalMinutes: (endTime.minutes - startTime.minutes) }]
  }

  hours.push({ hour: normalizeHour(startTime.hour), totalMinutes: (60 - startTime.minutes) });
  hours.push({ hour: normalizeHour(endTime.hour), totalMinutes: endTime.minutes });

  for (let i = startTime.hour + 1; i < endTime.hour; i++) {
    hours.push({ hour: normalizeHour(i), totalMinutes: 60 });
  }

  return hours;
}