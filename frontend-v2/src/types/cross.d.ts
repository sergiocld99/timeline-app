export type Cross = {
  _id: string
  name: string
  latitude: number
  longitude: number
}

export type EnrichedCross = Cross & {
  adjustedDistance: number
  adjustedTimestamp: Date
}