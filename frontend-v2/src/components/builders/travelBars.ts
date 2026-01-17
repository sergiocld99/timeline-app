import type { ChartData, ChartSource } from "@/types/chart"
import type { TravelWithFarthestPoint } from "@/types/travel"

import { daysOfWeek } from "@/constants"
import { convertToArgentineTime } from "@/utils"
import { getChartHours, useChartValue, useDefaultValues } from "@/utils/chart"

import { getEachHourOfEachHalf, getEachHourOfTravel } from "../analize/travel"

const CHART_FIELD = 'zipcode'

/*
const buildModeWeightByHour = (travels: Travel[], topModes: string[]): ChartSource => {
  return travels.reduce((acc, t) => {
    const chartMode = topModes.includes(t.modeOfTransport) ? t.modeOfTransport : 'others'

    getEachHourOfTravel(t).forEach(hour => {
      if (!acc[hour.hour]) {
        acc[hour.hour] = useDefaultValues(topModes)
      }

      acc[hour.hour][chartMode] += hour.totalMinutes
    })
    return acc;
  }, {} as ChartSource)
}

const buildModeWeightByDay = (travels: Travel[], topModes: string[]): ChartSource => {
  return travels.reduce((acc, t) => {
    const chartMode = topModes.includes(t.modeOfTransport) ? t.modeOfTransport : 'others';
    const dayOfWeek = convertToArgentineTime(new Date(t.startTime)).getDay()
    const normalizedDay = daysOfWeek[dayOfWeek]

    if (!acc[normalizedDay]) {
      acc[normalizedDay] = useDefaultValues(topModes)
    }

    acc[normalizedDay][chartMode] += t.duration
    return acc;
  }, {} as ChartSource)
}
*/

const buildPlaceWeightByHour = (travels: TravelWithFarthestPoint[], topLocations: string[]): ChartSource => {
  return travels.reduce((acc, t) => {
    const chartOrigin = topLocations.includes(t.origin[CHART_FIELD]) ? t.origin[CHART_FIELD] : 'others'
    const chartDestination = topLocations.includes(t.destination[CHART_FIELD]) ? t.destination[CHART_FIELD] : 'others'
    const farthestPoint = t.farthestPoint

    if (chartOrigin === farthestPoint?.[CHART_FIELD] || chartDestination === farthestPoint?.[CHART_FIELD]) {
      getEachHourOfTravel(t).forEach(hour => {
        if (!acc[hour.hour]) {
          acc[hour.hour] = useDefaultValues(topLocations)
        }
  
        acc[hour.hour][farthestPoint[CHART_FIELD]] += hour.totalMinutes
      })

      return acc
    }

    const hoursByHalf = getEachHourOfEachHalf(t)

    // FROM ORIGIN
    hoursByHalf[0].forEach(hour => {
      if (!acc[hour.hour]) {
        acc[hour.hour] = useDefaultValues(topLocations)
      }

      acc[hour.hour][chartOrigin] += hour.totalMinutes
    })

    // TO DESTINATION
    hoursByHalf[1].forEach(hour => {
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

  return getChartHours().map(hour => ({
    hour,
    ...useChartValue(hour, weightByHour, topKeys)
  }));
}

export const buildDailyChartData = (travels: TravelWithFarthestPoint[], topKeys: string[]): ChartData<"day"> => {
  const weightByDay = buildPlaceWeightByDay(travels, topKeys)

  return daysOfWeek.map(day => ({
    day,
    ...useChartValue(day, weightByDay, topKeys)
  }));
}
