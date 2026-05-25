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