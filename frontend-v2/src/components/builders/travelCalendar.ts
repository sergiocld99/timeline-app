import type { ChartSource } from "@/types/chart"
import type { TravelWithFarthestPoint } from "@/types/travel";

import { daysOfWeek } from "@/constants"
import { convertToArgentineTime } from "@/utils"
import { getChartHours, useDefaultValues } from "@/utils/chart"

const CHART_FIELD = 'zipcode'
const COLOR_KEYS = ['red', 'orange', 'yellow', 'green', 'blue'] as const

export type CalendarCell = {
  day: string
  hour: string
  colorKey: string | null
  totalMinutes: number
}

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

export const buildCalendarChartData = (travels: TravelWithFarthestPoint[], topKeys: string[]): CalendarCell[] => {
  const weightByDayHour = buildPlaceWeightByDayHour(travels, topKeys)

  return daysOfWeek.flatMap(day => getChartHours().map(hour => {
    const weights = weightByDayHour[`${day}-${hour}`]
    const winningEntry = weights && Object.entries(weights).sort((a, b) => b[1] - a[1])[0]

    if (!winningEntry || winningEntry[1] <= 0) {
      return { day, hour, colorKey: null, totalMinutes: 0 }
    }

    const [winningKey, winningMinutes] = winningEntry
    const colorIndex = topKeys.indexOf(winningKey)
    const colorKey = colorIndex >= 0 ? COLOR_KEYS[colorIndex] : 'others'

    return { day, hour, colorKey, totalMinutes: winningMinutes }
  }))
}
