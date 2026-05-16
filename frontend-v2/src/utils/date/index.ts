import type { DateFormatter } from "@/types/i18n";

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

export const renderNiceDate = (date: string | Date, format: DateFormatter) => {
  return format.dateTime(new Date(date), {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
};