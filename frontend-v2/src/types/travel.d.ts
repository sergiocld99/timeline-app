import type { HourPart } from "./chart"
import type { Weighted } from "./commons"
import type { Cross } from "./cross"

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
  zipcode: string,
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
  extractedDate: string
  duration: number
  speed: number
  crosses: Cross[]
  hourParts: {
    completeParts: HourPart[],
    firstHalf: HourPart[],
    secondHalf: HourPart[],
  }
}

export type TravelWithFarthestPoint = Travel & {
  farthestPoint?: Location
}

export type TravelDTO = {
  id: string
  origin: string
  destination: string
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
  uniqueDays?: number
  placesVisited: Partial<{
    count: number,
    zipcodes: string[]
  }>
}

export type TravelFindResult = {
  count: number,
  travels: Travel[]
}

export type TravelsData = {
  travels: Travel[]
  stats?: TravelStats
  dateFrom?: string
  dateTo?: string
}

export type TravelEditValues = {
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  modeOfTransport: string;
}

export type TravelFormData = {
  origin: string;
  destination: string;
  startTime: string;
  endTime: string;
  modeOfTransport: string;
  distance: string;
  price: string;
}

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