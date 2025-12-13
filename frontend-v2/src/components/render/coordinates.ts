export const renderPoint = (latitude?: number, longitude?: number) => {
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) return ""

  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
}