import { ChartData, ChartSource } from "@/types/chart"
import { TravelWithFarthestPoint } from "@/types/travel"
import { getEachHourOfEachHalf, getEachHourOfTravel } from "../analize/travel"
import { getChartHours, useChartValue, useDefaultValues } from "@/utils/chart"
import { convertToArgentineTime } from "@/utils"
import { daysOfWeek } from "@/constants"

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
    const chartOrigin = topLocations.includes(t.origin.name) ? t.origin.name : 'others'
    const chartDestination = topLocations.includes(t.destination.name) ? t.destination.name : 'others'
    const farthestPoint = t.farthestPoint

    if (chartOrigin === farthestPoint?.name || chartDestination === farthestPoint?.name) {
      getEachHourOfTravel(t).forEach(hour => {
        if (!acc[hour.hour]) {
          acc[hour.hour] = useDefaultValues(topLocations)
        }
  
        acc[hour.hour][farthestPoint.name] += hour.totalMinutes
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

    const chartOrigin = topLocations.includes(t.origin.name) ? t.origin.name : 'others';
    const chartDestination = topLocations.includes(t.destination.name) ? t.destination.name : 'others'
    const farthestPoint = t.farthestPoint

    if (chartOrigin === farthestPoint?.name || chartDestination === farthestPoint?.name) {
      acc[normalizedDay][farthestPoint.name] += t.duration
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
