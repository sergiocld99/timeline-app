
export const getHoursAndMinutes = (totalMinutes: number) => {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 10) {
    if (minutes >= 50) return `${hours+1}h`
    return `${hours}h`
  }

  return `${hours}h ${minutes}m`;
}

export const extractTime = (dateTime: string) => {
  return dateTime.split('T')[1].substring(0, 5);
}

export const getArgentineCurrentTime = () => {
  const date = new Date();
  date.setHours(date.getHours() - 3)
  return date;
}

export const convertToArgentineTime = (date: Date) => {
  date.setHours(date.getHours() + 3)
  return date;
}

export const convertToFormDate = (date: Date) => {
  return date.toISOString().slice(0, 16);
}

/**
 * @param formDate date in format YYYY-MM-DDTHH:mm
 * @param minutes minutes to add
 * @returns resulting time in format YYYY-MM-DDTHH:mm
 */
export const addMinutesToFormDate = (formDate: string, minutes: number) => {
  // Form digits are Argentina wall-clock (see CLAUDE.md), so we read/write them as UTC
  const date = new Date(`${formDate.slice(0, 16)}:00.000Z`);
  date.setUTCMinutes(date.getUTCMinutes() + minutes);
  return convertToFormDate(date);
}

/**
 * @param hoursBefore hours to substract from current time
 * @returns resulting time in format YYYY-MM-DDTHH:mm
 */
export const getTimeFromCurrent = (hoursBefore: number) => {
  const date = getArgentineCurrentTime();
  date.setHours(date.getHours() - hoursBefore);
  return convertToFormDate(date);
}

export const getStartDateFromCurrent = (daysBefore: number) => {
  const date = getArgentineCurrentTime();
  date.setDate(date.getDate() - daysBefore - 1)
  date.setHours(21,0,0,0)
  return convertToFormDate(date);
} 

export const getTodayEndTime = () => {
  const date = getArgentineCurrentTime();
  date.setHours(20,59,59,0)
  return convertToFormDate(date);
}

export const getFixedPercentage = (percentage: number) => {
  return `${percentage.toFixed(percentage < 9.95 ? 1 : 0)}%`
}

export const getEmojiForMode = (mode: string) => {
  switch (mode) {
    case 'car':
      return '🚗';
    case 'taxi':
      return '🚕'
    case 'bus':
      return '🚌';
    case 'train':
      return '🚆';
    case 'subway':
      return '🚇';
    case 'ferry':
      return '⛴️';
    case 'walking':
      return '🚶';
    case 'mixed':
      return '🛸';
    default:
      return '🤔'
  }
}