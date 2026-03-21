import type { Visit } from "@/types/visit";;

import { extractKeys, sortByDescendingValue } from "@/utils/kv";

export const calculateBestLocations = (visits: Visit[], quantity: number) => {
  const topLocations = visits.reduce((acc, v) => {
    const key = v.location.name
    if (!acc[key]) {
      acc[key] = 0
    }
    acc[key] += v.durationMinutes
    return acc
  }, {} as Record<string, number>)

  const sortedLocations = sortByDescendingValue(topLocations)
  return extractKeys(sortedLocations, quantity, true)
}
