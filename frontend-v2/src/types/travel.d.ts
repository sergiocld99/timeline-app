import type { Weighted } from "./commons"

export type Location = {
  _id: string
  name: string
  latitude: number
  longitude: number
  zipcode: string
  notes: string
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
}

export type TravelsData = {
  travels: Travel[]
  dateFrom?: string
  dateTo?: string
}

export type TravelEditValues = {
  distance: string;
  duration: string;
  modeOfTransport: string;
}

export type Visit = Weighted & {
  _id: string
  date: string
  location: Location
  arrivalTime: string
  departureTime: string
  durationMinutes: number
}

export type VisitsData = {
  visits: Visit[]
  dateFrom?: string
  dateTo?: string
}