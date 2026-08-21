import type { Location } from "./location";

export type KnownCenter = Location & {
  distance: number
  distanceKm: number
  isActive?: boolean
}