import type { KnownCenter } from "@/types/center"
import type { MapLocation } from "@/types/map"
import type { Location, Travel, TravelWithFarthestPoint } from "@/types/travel"

import { extractKeys, sortByDescendingValue } from "@/utils/kv"

import { getLocationKey } from "./location"

export const calculateBestLocations = (travels: TravelWithFarthestPoint[], quantity: number) => {
  const topLocations = travels.reduce((acc, t) => {
    const key1 = t.origin.zipcode
    const key2 = t.destination.zipcode

    if (t.farthestPoint) {
      if (!acc[t.farthestPoint.zipcode]) { acc[t.farthestPoint.zipcode] = 0 }
      acc[t.farthestPoint.zipcode] += t.duration
    } else {
      if (!acc[key1]) { acc[key1] = 0 }
      if (!acc[key2]) { acc[key2] = 0 }
      acc[key1] += t.duration / 2
      acc[key2] += t.duration / 2
    }

    return acc
  }, {} as Record<string, number>)

  const sortedLocations = sortByDescendingValue(topLocations)
  return extractKeys(sortedLocations, quantity, true)
}

export const calculateBestModes = (travels: Travel[], quantity: number) => {
  const topModes = travels.reduce((acc, t) => {
    const key = t.modeOfTransport
    if (!acc[key]) {
      acc[key] = 0
    }
    acc[key] += t.duration
    return acc
  }, {} as Record<string, number>)

  const sortedModes = sortByDescendingValue(topModes)
  return extractKeys(sortedModes, quantity, true)
}

const initializeMapLocation = (location: Location, date: string): MapLocation => {
  return (
    {
      name: location.name,
      lat: location.latitude,
      lng: location.longitude,
      frecuency: 0,
      lastDate: date,
      isFrequent: false,
      type: 'travel'
    }
  )
}

export const getUniqueLocations = (travels: Travel[], nearbyCenters: KnownCenter[]) => {
  const locationMap = new Map<string, MapLocation>();

  travels.forEach((travel) => {
    // Origin
    if (travel.origin?.latitude && travel.origin?.longitude) {
      const key = getLocationKey(travel.origin.latitude, travel.origin.longitude);
      let loc = locationMap.get(key)

      if (!loc) {
        loc = initializeMapLocation(travel.origin, travel.shortDate)
        locationMap.set(key, loc)
      }

      loc.frecuency += 1
    }

    // Destination
    if (travel.destination?.latitude && travel.destination?.longitude) {
      const key = getLocationKey(travel.destination.latitude, travel.destination.longitude)
      let loc = locationMap.get(key)

      if (!loc) {
        loc = initializeMapLocation(travel.destination, travel.shortDate)
        locationMap.set(key, loc)
      }

      loc.frecuency += 1
    }
  });

  nearbyCenters.forEach((nc => {
    const key = getLocationKey(nc.latitude, nc.longitude)
    let loc = locationMap.get(key)

    if (!loc) {
      loc = {
        name: nc.name,
        lat: nc.latitude,
        lng: nc.longitude,
        frecuency: 0,
        distanceAwayFromAvg: nc.distanceKm,
        type: 'nearby'
      }

      locationMap.set(key, loc)
    } else {
      loc.type = 'visited-nearby'
      loc.distanceAwayFromAvg = nc.distanceKm
    }
  }))

  const arr = Array.from(locationMap.values())

  // apply most frequent
  if (arr && arr.length > 0) {
    const mostFrequent = arr.reduce((max, act) => max.frecuency > act.frecuency ? max : act)
    const relevantFrecuency = mostFrequent.frecuency / 2

    arr.map(l => {
      if (l.frecuency > relevantFrecuency) {
        l.isFrequent = true
      }

      return l
    })
  }

  return arr;
}