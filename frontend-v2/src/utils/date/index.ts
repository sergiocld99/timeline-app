import type { TranslationFn } from "@/types/i18n";

import { convertToArgentineTime } from "@/utils";
import { daysOfWeek } from "@/constants";

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

export const extractDate = (dateTime: string | Date, t?: TranslationFn) => {
  const date = new Date(dateTime);
  const dayOfWeekEn = daysOfWeek[convertToArgentineTime(date).getDay()];
  const dayOfWeek = t ? t(`DaysShort.${dayOfWeekEn}`) : dayOfWeekEn;

  const dateStr = typeof dateTime === 'string' ? dateTime : dateTime.toISOString();
  const parts = dateStr.split('T')[0].split('-');
  const shortYear = parts[0].substring(2);

  return `${dayOfWeek} ${parts[2]}/${parts[1]}/${shortYear}`;
};

export const renderNiceDate = (dateTime: string | Date, t: TranslationFn) => {
  return extractDate(dateTime, t);
};

export const translateDay = (day: string, t: TranslationFn) => {
  if (daysOfWeek.includes(day)) {
    return t(`DaysShort.${day}`);
  }
  return day;
};

// "2026-03" -> "3", the key `MonthsShort` translations are indexed by.
export const toShortMonthKey = (monthKey: string) => String(parseInt(monthKey.split("-")[1], 10));

// dd/mm/yyyy for date-range boundaries. Two flavours reach this function:
// - Boundaries built from the date-only picker carry Argentina wall-clock digits
//   baked into the ISO string (midnight start / 23:59:59.999 end, see CLAUDE.md);
//   reading them with local getters in UTC-3 would render April 1 00:00Z as
//   March 31 21:00, so those are read literally (offset 0).
// - Default rolling window values are real instants and round-trip via local getters.
const isBakedBoundary = (isoString: string) =>
  isoString.endsWith("T00:00:00.000Z") || isoString.endsWith("T23:59:59.999Z");

export const formatDayMonthYear = (isoString?: string) => {
  if (!isoString) return "";

  const date = new Date(isoString);
  const day = String(isBakedBoundary(isoString) ? date.getUTCDate() : date.getDate()).padStart(2, "0");
  const month = String(
    isBakedBoundary(isoString) ? date.getUTCMonth() + 1 : date.getMonth() + 1
  ).padStart(2, "0");

  return `${day}/${month}/${isBakedBoundary(isoString) ? date.getUTCFullYear() : date.getFullYear()}`;
};

export const getDaysRange = (dateFrom: string, dateTo: string) => {
  if (!dateFrom || !dateTo) return 0;
  const from = new Date(dateFrom.split('T')[0]);
  const to = new Date(dateTo.split('T')[0]);
  const diffTime = to.getTime() - from.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
};