import type { CalendarCell, ChartSource, ColorKey } from "@/types/chart"
import type { TravelWithFarthestPoint } from "@/types/travel";

import { daysOfWeek } from "@/constants"
import { convertToArgentineTime } from "@/utils"
import { getChartHours, useDefaultValues } from "@/utils/chart"
import { extractKeys, sortByDescendingValue } from "@/utils/kv"

const CHART_FIELD = 'zipcode'
export const COLOR_KEYS = ['red', 'orange', 'yellow', 'green', 'blue'] as const

const buildPlaceWeightByDayHour = (travels: TravelWithFarthestPoint[], topLocations: string[]): ChartSource => {
  return travels.reduce((acc, t) => {
    const day = daysOfWeek[convertToArgentineTime(new Date(t.startTime)).getDay()]
    const chartOrigin = topLocations.includes(t.origin[CHART_FIELD]) ? t.origin[CHART_FIELD] : 'others'
    const chartDestination = topLocations.includes(t.destination[CHART_FIELD]) ? t.destination[CHART_FIELD] : 'others'
    const { farthestPoint, hourParts } = t

    const addHourParts = (parts: typeof hourParts.completeParts, zipcodeKey: string) => {
      parts.forEach(hour => {
        const cellKey = `${day}-${hour.hour}`
        if (!acc[cellKey]) { acc[cellKey] = useDefaultValues(topLocations) }
        acc[cellKey][zipcodeKey] += hour.totalMinutes
      })
    }

    if (chartOrigin === farthestPoint?.[CHART_FIELD] || chartDestination === farthestPoint?.[CHART_FIELD]) {
      addHourParts(hourParts.completeParts, farthestPoint[CHART_FIELD])
      return acc
    }

    addHourParts(hourParts.firstHalf, chartOrigin)
    addHourParts(hourParts.secondHalf, chartDestination)

    return acc
  }, {} as ChartSource)
}

const buildRawWeightByDayHour = (travels: TravelWithFarthestPoint[]): Record<string, Record<string, number>> => {
  return travels.reduce((acc, t) => {
    const day = daysOfWeek[convertToArgentineTime(new Date(t.startTime)).getDay()]
    const { farthestPoint, hourParts } = t

    const addHourParts = (parts: typeof hourParts.completeParts, zipcode: string) => {
      parts.forEach(hour => {
        const cellKey = `${day}-${hour.hour}`
        if (!acc[cellKey]) { acc[cellKey] = {} }
        acc[cellKey][zipcode] = (acc[cellKey][zipcode] || 0) + hour.totalMinutes
      })
    }

    if (farthestPoint) {
      addHourParts(hourParts.completeParts, farthestPoint[CHART_FIELD])
      return acc
    }

    addHourParts(hourParts.firstHalf, t.origin[CHART_FIELD])
    addHourParts(hourParts.secondHalf, t.destination[CHART_FIELD])

    return acc
  }, {} as Record<string, Record<string, number>>)
}

// Ranks zipcodes by how much they actually dominate individual day-hour cells,
// instead of by total accumulated duration. A zipcode with lots of spread-out
// minutes but few (or no) outright cell wins would otherwise occupy a color slot
// that a less-voluminous but more locally-dominant zipcode never gets to use.
export const calculateBestLocationsByCellDominance = (travels: TravelWithFarthestPoint[], quantity: number) => {
  const rawWeightByDayHour = buildRawWeightByDayHour(travels)

  const dominanceScore = Object.values(rawWeightByDayHour).reduce((acc, cellWeights) => {
    const [winningZipcode, winningMinutes] = Object.entries(cellWeights).sort((a, b) => b[1] - a[1])[0]

    acc[winningZipcode] = (acc[winningZipcode] || 0) + winningMinutes

    return acc
  }, {} as Record<string, number>)

  const sortedZipcodes = sortByDescendingValue(dominanceScore)
  return extractKeys(sortedZipcodes, quantity, true)
}

export const buildCalendarChartData = (travels: TravelWithFarthestPoint[], topKeys: string[]): CalendarCell[] => {
  const weightByDayHour = buildPlaceWeightByDayHour(travels, topKeys)

  return daysOfWeek.flatMap(day => getChartHours().map(hour => {
    const weights = weightByDayHour[`${day}-${hour}`]

    if (!weights) {
      return { day, hour, colorKey: null, totalMinutes: 0 }
    }

    // "others" merges many unrelated zipcodes into one bucket, so it can easily
    // out-total any single named top-5 zipcode without representing a real place.
    // Prefer the best named zipcode whenever one has any activity in this cell.
    const namedWinner = topKeys
      .map(key => [key, weights[key] || 0] as const)
      .sort((a, b) => b[1] - a[1])[0]

    const winningEntry = namedWinner && namedWinner[1] > 0 ? namedWinner : ['others', weights.others || 0] as const

    if (winningEntry[1] <= 0) {
      return { day, hour, colorKey: null, totalMinutes: 0 }
    }

    const [winningKey, winningMinutes] = winningEntry
    const colorIndex = topKeys.indexOf(winningKey)
    const colorKey = colorIndex >= 0 ? COLOR_KEYS[colorIndex] : 'others'

    return { day, hour, colorKey, totalMinutes: winningMinutes }
  }))
}

export const buildCellCountByColorKey = (cells: CalendarCell[]): Record<string, number> => {
  return cells.reduce((acc, cell) => {
    if (cell.colorKey) { acc[cell.colorKey] = (acc[cell.colorKey] || 0) + 1 }
    return acc
  }, {} as Record<string, number>)
}

export const buildLegendKeys = (cells: CalendarCell[]): ColorKey[] => {
  const presentColorKeys = new Set(cells.map(cell => cell.colorKey).filter((key): key is ColorKey => Boolean(key)))
  const presentNamedColors: ColorKey[] = COLOR_KEYS.filter(key => presentColorKeys.has(key))

  return presentNamedColors.concat(presentColorKeys.has('others') ? ['others'] : [])
}
