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