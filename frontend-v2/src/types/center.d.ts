import type { Location } from "./travel";

export type KnownCenter = Location & {
  distance: number
  distanceKm: number
}