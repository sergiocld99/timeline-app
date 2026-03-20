import type { ChartData, ChartSource } from "@/types/chart"
import type { TravelWithFarthestPoint } from "@/types/travel"

import { daysOfWeek } from "@/constants"
import { convertToArgentineTime } from "@/utils"
import { cleanUnusedBorders, getChartHours, useChartValue, useDefaultValues } from "@/utils/chart"

const CHART_FIELD = 'zipcode'

const buildPlaceWeightByHour = (travels: TravelWithFarthestPoint[], topLocations: string[]): ChartSource => {
  return travels.reduce((acc, t) => {
    const chartOrigin = topLocations.includes(t.origin[CHART_FIELD]) ? t.origin[CHART_FIELD] : 'others'
    const chartDestination = topLocations.includes(t.destination[CHART_FIELD]) ? t.destination[CHART_FIELD] : 'others'
    const { farthestPoint, hourParts } = t

    if (chartOrigin === farthestPoint?.[CHART_FIELD] || chartDestination === farthestPoint?.[CHART_FIELD]) {
      hourParts.completeParts.forEach(hour => {
        if (!acc[hour.hour]) {
          acc[hour.hour] = useDefaultValues(topLocations)
        }

        acc[hour.hour][farthestPoint[CHART_FIELD]] += hour.totalMinutes
      })

      return acc
    }

    // FROM ORIGIN
    hourParts.firstHalf.forEach(hour => {
      if (!acc[hour.hour]) {
        acc[hour.hour] = useDefaultValues(topLocations)
      }

      acc[hour.hour][chartOrigin] += hour.totalMinutes
    })

    // TO DESTINATION
    hourParts.secondHalf.forEach(hour => {
      if (!acc[hour.hour]) {
        acc[hour.hour] = useDefaultValues(topLocations)
      }

      acc[hour.hour][chartDestination] += hour.totalMinutes
    })

    return acc;
  }, {} as ChartSource)
}

const buildPlaceWeightByDay = (travels: TravelWithFarthestPoint[], topLocations: string[]): ChartSource => {
  return travels.reduce((acc, t) => {
    const dayOfWeek = convertToArgentineTime(new Date(t.startTime)).getDay()
    const normalizedDay = daysOfWeek[dayOfWeek]

    if (!acc[normalizedDay]) {
      acc[normalizedDay] = useDefaultValues(topLocations)
    }

    const chartOrigin = topLocations.includes(t.origin[CHART_FIELD]) ? t.origin[CHART_FIELD] : 'others';
    const chartDestination = topLocations.includes(t.destination[CHART_FIELD]) ? t.destination[CHART_FIELD] : 'others'
    const farthestPoint = t.farthestPoint

    if (chartOrigin === farthestPoint?.[CHART_FIELD] || chartDestination === farthestPoint?.[CHART_FIELD]) {
      acc[normalizedDay][farthestPoint[CHART_FIELD]] += t.duration
    } else {
      acc[normalizedDay][chartOrigin] += t.duration / 2
      acc[normalizedDay][chartDestination] += t.duration / 2
    }

    return acc;
  }, {} as ChartSource)
}

export const buildHourlyChartData = (travels: TravelWithFarthestPoint[], topKeys: string[]): ChartData<"hour"> => {
  const weightByHour = buildPlaceWeightByHour(travels, topKeys)

  const chartData = getChartHours().map(hour => ({
    hour,
    ...useChartValue(hour, weightByHour, topKeys)
  }));

  return cleanUnusedBorders(chartData)
}

export const buildDailyChartData = (travels: TravelWithFarthestPoint[], topKeys: string[]): ChartData<"day"> => {
  const weightByDay = buildPlaceWeightByDay(travels, topKeys)

  return daysOfWeek.map(day => ({
    day,
    ...useChartValue(day, weightByDay, topKeys)
  }));
}
