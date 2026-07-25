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

// `extractedDate` arrives from the backend as "Tue 04/07/26": the first 4 chars
// are the weekday prefix, the rest is the date the chronological axis keys on.
const WEEKDAY_PREFIX_LENGTH = 4

export const getDatePart = (extractedDate: string) => {
  return extractedDate.slice(WEEKDAY_PREFIX_LENGTH)
}

// "04/07/26" -> "04". The monthly axis is cyclical, so however long the selected
// range is it always folds onto the same day-of-month, never onto 365 columns.
export const getDayOfMonth = (extractedDate: string) => {
  return getDatePart(extractedDate).slice(0, 2)
}

const padDay = (day: number) => day.toString().padStart(2, '0')

// Days are grouped so the monthly axis fits on the card's rows and each band
// aggregates several dates of a 30-day range instead of a single one.
//
// The bands are a fixed, hand-picked partition of the month covering 01-31 with
// no gaps or overlaps, so they are declared explicitly rather than derived from
// a band size. They are deliberately uneven (3 to 5 days), which means a band's
// cell intensity is not directly comparable to another band's: a 5-day band has
// more dates to accumulate minutes from than a 3-day one.
const DAY_OF_MONTH_BANDS = [
  { start: '01', end: '04' },
  { start: '05', end: '07' },
  { start: '08', end: '11' },
  { start: '12', end: '14' },
  { start: '15', end: '18' },
  { start: '19', end: '21' },
  { start: '22', end: '26' },
  { start: '27', end: '31' },
] as const

export const DAY_OF_MONTH_RANGES = DAY_OF_MONTH_BANDS.map(band => band.start)

const findBandByDay = (dayOfMonth: string) => {
  const day = Number(dayOfMonth)

  return DAY_OF_MONTH_BANDS.find(band => day >= Number(band.start) && day <= Number(band.end))
}

const findBandByStart = (rangeStart: string) => DAY_OF_MONTH_BANDS.find(band => band.start === rangeStart)

export const getDayRangeStart = (dayOfMonth: string) => {
  return findBandByDay(dayOfMonth)?.start ?? DAY_OF_MONTH_BANDS[0].start
}

export const getDayRangeDays = (rangeStart: string) => {
  const band = findBandByStart(rangeStart)

  if (!band) return []

  const start = Number(band.start)
  const end = Number(band.end)

  return Array.from({ length: end - start + 1 }, (_, i) => padDay(start + i))
}

export const getDayRangeLabel = (rangeStart: string) => {
  const band = findBandByStart(rangeStart)

  return band ? `${band.start}-${band.end}` : rangeStart
}

export const getDaysRange = (dateFrom: string, dateTo: string) => {
  if (!dateFrom || !dateTo) return 0;
  const from = new Date(dateFrom.split('T')[0]);
  const to = new Date(dateTo.split('T')[0]);
  const diffTime = to.getTime() - from.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
};