export const getHoursAndMinutes = (totalMinutes: number) => {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export const extractDate = (dateTime: string) => {
  const parts = dateTime.split('T')[0].split('-')
  const shortYear = parts[0].substring(2);

  return `${parts[2]}/${parts[1]}/${shortYear}`
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
    default:
      return '🤔'
  }
}