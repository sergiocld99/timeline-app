import type { DateFormatter } from "@/types/i18n";

import { convertToArgentineTime } from "@/utils";

export const isAfter = (date: Date, threshold: Date) => {
  return date.getTime() > threshold.getTime()
}

export const isBefore = (date: Date, threshold: Date) => {
  return date.getTime() < threshold.getTime()
}

export const getDaysSince = (date: Date, base: Date) => {
  const msDiff = date.getTime() - base.getTime()
  const msPerDay = 1000 * 60 * 60 * 24;

  return msDiff / msPerDay
}

export const renderNiceDate = (dateTime: string | Date, format: DateFormatter) => {
  const date = new Date(dateTime);
  const dayOfWeek = format.dateTime(convertToArgentineTime(date), { weekday: 'short' });

  const dateStr = typeof dateTime === 'string' ? dateTime : dateTime.toISOString();
  const parts = dateStr.split('T')[0].split('-');
  const shortYear = parts[0].substring(2);

  return `${dayOfWeek} ${parts[2]}/${parts[1]}/${shortYear}`;
};

export const translateDay = (day: string, format: DateFormatter) => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayIndex = daysOfWeek.indexOf(day);
  if (dayIndex !== -1) {
    const date = new Date(2024, 0, 7 + dayIndex); // 2024-01-07 is Sunday
    return format.dateTime(date, { weekday: 'short' });
  }
  return day;
};