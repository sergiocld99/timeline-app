import type { HourPart } from "./chart"
import type { Weighted } from "./commons"
import type { Location } from "./location"

export type Visit = Weighted & {
  _id: string
  date: string
  location: Location
  arrivalTime: string
  departureTime: string
  durationMinutes: number
  hourParts: HourPart[]
}

export type VisitsStats = {
  averageLatitude: number
  averageLongitude: number
}

export type VisitsData = {
  visits: Visit[]
  stats?: VisitsStats
  dateFrom?: string
  dateTo?: string
}
