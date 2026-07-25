import type { KnownCenter } from "@/types/center"
import type { MapLocation } from "@/types/map"
import type { Travel, TravelWithFarthestPoint } from "@/types/travel";
import type { Location } from "@/types/location";

import { extractKeys, sortByDescendingValue } from "@/utils/kv"

import { getLocationKey } from "./location"

type HomeOptions = {
  field?: 'origin' | 'destination',
  backendHome?: string,
  appliedFilter?: string | null
}

export const calculateHome = (travels: Travel[], options?: HomeOptions) => {
  if (travels.length > 0 && options?.field) {
    return travels[0][options.field]
  }

  if (options?.appliedFilter) {
    const zipcodeMatch = travels.find(t => t.destination.zipcode === options.appliedFilter)

    if (zipcodeMatch) {
      return zipcodeMatch.destination
    }
  }

  if (!options?.appliedFilter && options?.backendHome) {
    const matches = travels.filter(t => t.destination.name === options.backendHome)

    if (matches.length >= 3) {
      return matches[0].destination
    }
  }

  if (travels.length > 10 && travels[0].destination.name === travels[travels.length - 1].origin.name) {
    return travels[0].destination
  }

  return undefined
}

export const chooseFarthestPoint = (p1: Location, p2: Location, home: Location) => {
  const dist1 = Math.abs(p1.latitude - home.latitude) + Math.abs(p1.longitude - home.longitude)
  const dist2 = Math.abs(p2.latitude - home.latitude) + Math.abs(p2.longitude - home.longitude)

  return dist1 > dist2 ? p1 : p2
}

export const enrichWithFarthestPoint = (t: Travel, home?: Location): TravelWithFarthestPoint => {
  return {
    ...t,
    farthestPoint: home && chooseFarthestPoint(t.origin, t.destination, home)
  }
}

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

export const buildZipcodeLabels = (travels: Travel[]): Record<string, string> => {
  const namesByZipcode = travels.reduce((acc, t) => {
    [t.origin, t.destination].forEach(location => {
      if (!location?.zipcode) { return }
      if (!acc[location.zipcode]) { acc[location.zipcode] = new Set<string>() }

      acc[location.zipcode].add(location.name)
    })

    return acc
  }, {} as Record<string, Set<string>>)

  return Object.fromEntries(
    Object.entries(namesByZipcode)
      .filter(([, names]) => names.size === 1)
      .map(([zipcode, names]) => [zipcode, [...names][0]])
  )
}

export const calculateBestModes =(travels: Travel[], quantity: number) => {
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