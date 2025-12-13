import { HourPart } from "@/types/chart"
import type { Travel } from "@/types/travel"
import { extractHourAndMinutes, normalizeHour } from "@/utils/chart"

export const calculateBestModes = (travels: Travel[], quantity: number) => {
  const topModes = travels.reduce((acc, t) => {
    const key = t.modeOfTransport
    if (!acc[key]) {
      acc[key] = 0
    }
    acc[key] += t.duration
    return acc
  }, {} as Record<string, number>)

  const sortedModes = Object.entries(topModes).sort((a, b) => a[1] - b[1]).reverse()
  const result = sortedModes.map(loc => loc[0]).slice(0, quantity)

  for (let i = 0; i < quantity; i++) {
    if (!result[i]) result[i] = '';
  }

  return result;
}

export const getEachHourOfTravel = ({ startTime: start, endTime: end }: Travel): HourPart[] => {
  const startTime = extractHourAndMinutes(start);
  const endTime = extractHourAndMinutes(end);

  const hours: HourPart[] = [];

  // Same day - short travel in same hour (< 60 min)
  if (endTime.hour === startTime.hour) {
    return [{ hour: normalizeHour(endTime.hour), totalMinutes: (endTime.minutes - startTime.minutes) }]
  }

  // Partial hours (start and end)
  hours.push({ hour: normalizeHour(startTime.hour), totalMinutes: (60 - startTime.minutes) });
  hours.push({ hour: normalizeHour(endTime.hour), totalMinutes: endTime.minutes });

  // Full hours for travels in same day
  if (endTime.hour > startTime.hour) {
    for (let i = startTime.hour + 1; i < endTime.hour; i++) {
      hours.push({ hour: normalizeHour(i), totalMinutes: 60 });
    }

    return hours
  }

  // Full hours for travels between 2 days
  for (let i = startTime.hour + 1; i < 24; i++) {
    hours.push({ hour: normalizeHour(i), totalMinutes: 60 });
  }

  for (let i = 0; i < endTime.hour; i++) {
    hours.push({ hour: normalizeHour(i), totalMinutes: 60 });
  }

  return hours
}
