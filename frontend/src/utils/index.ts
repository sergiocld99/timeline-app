export const getHoursAndMinutes = (totalMinutes: number) => {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export const extractDate = (dateTime: string) => {
  return dateTime.split('T')[0].substring(5);
}

export const extractTime = (dateTime: string) => {
  return dateTime.split('T')[1].substring(0, 5);
}

/**
 * @param hoursBefore hours to substract from current time
 * @returns resulting time in format YYYY-MM-DDTHH:mm
 */
export const getTimeFromCurrent = (hoursBefore: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hoursBefore);
  return date.toISOString().slice(0, 16);
}

export const getFixedPercentage = (percentage: number) => {
  return `${percentage.toFixed(percentage < 10 ? 1 : 0)}%`
}

export const getEmojiForMode = (mode: string) => {
  switch (mode) {
    case 'car':
      return '🚗';
    case 'bus':
      return '🚌';
    case 'train':
      return '🚆';
    case 'subway':
      return '🚇';
    case 'walking':
      return '🚶';
    default:
      return '🤔'
  }
}