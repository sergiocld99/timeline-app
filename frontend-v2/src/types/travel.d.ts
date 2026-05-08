import type { HourPart } from "./chart"
import type { Weighted } from "./commons"
import type { Cross } from "./cross"
import type { Location } from "./location"

export type Travel = Weighted & {
  _id: string
  startTime: string
  endTime: string
  origin: Location
  destination: Location
  modeOfTransport: string
  line?: string
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

export type MonthlyStatItem = {
  km: number;
  minutes: number;
  count: number;
  zipcodes: string[];
}

export type MonthlyStats = Record<string, MonthlyStatItem>;

export type PlacesVisited = {
  count: number,
  zipcodes: string[],
  names?: Record<string, string>
}

export type TravelRecordItem = {
  value: number;
  date: string;
  origin: string;
  destination: string;
}

export type TravelRecords = {
  maxDistance: TravelRecordItem | null;
  maxDuration: TravelRecordItem | null;
  maxSpeed: TravelRecordItem | null;
}

export type TopRoute = {
  route: string;
  count: number;
}

export type TravelStats = {
  count: number
  totalDistance: number
  totalHours: number
  totalMinutes: number
  averageLatitude: number
  averageLongitude: number
  averageSpeed: number
  averageDistance: number
  averageDuration: number
  uniqueDays?: number
  uniqueRoutes?: number
  placesVisited: PlacesVisited
  mapConfig?: {
    center: [number, number],
    zoom: number
  }
  monthlyStats?: MonthlyStats
  topRoutes?: TopRoute[]
  home?: string
  records?: TravelRecords
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
  date: string;
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  modeOfTransport: string;
  line?: string;
}

export type TravelFormData = {
  origin: string;
  destination: string;
  startTime: string;
  endTime: string;
  modeOfTransport: string;
  line: string;
  distance: string;
  price: string;
  crosses: string[];
}

export type TravelChangeFn = (field: keyof TravelEditValues, value: string) => void

export type TravelEditProps = {
  travel: Travel,
  editingId: string | null,
  editValues: TravelEditValues,
  handleChange: TravelChangeFn
}