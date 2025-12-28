import type { Weighted } from "./commons"
import { Cross } from "./cross"

export type Location = {
  _id: string
  name: string
  latitude: number
  longitude: number
  zipcode: string
  notes: string
}

export type LocationEditValues = {
  name: string,
  latitude: number,
  longitude: number,
  notes: string,
}

export type Travel = Weighted & {
  _id: string
  startTime: string
  endTime: string
  origin: Location
  destination: Location
  modeOfTransport: string
  distance: number
  shortDate: string
  duration: number
  speed: number
  crosses: Cross[]
}

export type TravelWithFarthestPoint = Travel & {
  farthestPoint?: Location
}

export type TravelStats = {
  count: number
  totalDistance: number
  totalHours: number
  totalMinutes: number
  totalPrice: number
  averageLatitude: number
  averageLongitude: number
  averageSpeed: number
  averageDistance: number
  averageDuration: number
  averagePrice: number
  placesVisited: {
    count: number,
    zipcodes: string[]
  }
}

export type TravelsData = {
  travels: Travel[]
  stats?: TravelStats
  dateFrom?: string
  dateTo?: string
}

export type TravelEditValues = {
  distance: string;
  duration: string;
  modeOfTransport: string;
  origin: string;
  destination: string;
}

export type Visit = Weighted & {
  _id: string
  date: string
  location: Location
  arrivalTime: string
  departureTime: string
  durationMinutes: number
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