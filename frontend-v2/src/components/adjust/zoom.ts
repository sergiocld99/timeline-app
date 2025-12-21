export const getZoomByDistance = (km: number) => {
  if (km > 140) return 7
  if (km > 100) return 8
  if (km > 50) return 9
  if (km > 15) return 10
  if (km > 7.5) return 11
  if (km > 3.25) return 12
  return 13
}