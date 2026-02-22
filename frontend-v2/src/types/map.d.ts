export type MapLocationType = 'travel' | 'nearby' | 'visited-nearby'

export type MapLocation = {
  name: string,
  lat: number,
  lng: number,
  frecuency: number,
  lastDate?: string,
  isFrequent?: boolean,
  distanceAwayFromAvg?: number,
  type: MapLocationType
}

export type Center = [number, number]

export type GravityCenter = {
  lat?: number;
  lng?: number;
}
