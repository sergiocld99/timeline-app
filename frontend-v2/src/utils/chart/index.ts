import type { ChartConfig } from "@/components/ui/chart";
import type { ChartSource, HourAndMinutes } from "@/types/chart";

import { extractTime } from "..";
import { abbreviateWords } from "../strings";

export const normalizeHour = (hour: number) => {
  return hour.toString().padStart(2, '0');
}

export const getCellOpacity = (totalMinutes: number, fullOpacityMinutes = 60) => {
  const ratio = Math.min(totalMinutes / fullOpacityMinutes, 1)
  return 0.4 + ratio * 0.6
}

export const getChartHours = () => {
  const chartHours = [];

  for (let i = 0; i < 24; i++) { chartHours.push(normalizeHour(i)) }

  return chartHours
}

export const extractHourAndMinutes = (time: string): HourAndMinutes => {
  const [hour, minutes] = extractTime(time).split(':');
  return { hour: parseInt(hour), minutes: parseInt(minutes) };
}

export const roundChartValue = (value: number) => {
  return Math.round(value);
}

export const useDefaultValues = (topKeys: string[]) => {
  return {
    [topKeys[0]]: 0,
    [topKeys[1]]: 0,
    [topKeys[2]]: 0,
    [topKeys[3]]: 0,
    [topKeys[4]]: 0,
    others: 0
  }
}

export const useChartValue = (key: string, weightByField: ChartSource, topKeys: string[]) => {
  if (!weightByField[key]) {
    return {
      red: 0,
      orange: 0,
      yellow: 0,
      green: 0,
      blue: 0,
      others: 0,
      empty: true
    }
  }

  return {
    red: roundChartValue(weightByField[key][topKeys[0]] || 0),
    orange: roundChartValue(weightByField[key][topKeys[1]] || 0),
    yellow: roundChartValue(weightByField[key][topKeys[2]] || 0),
    green: roundChartValue(weightByField[key][topKeys[3]] || 0),
    blue: roundChartValue(weightByField[key][topKeys[4]] || 0),
    others: roundChartValue(weightByField[key].others || 0),
    empty: false
  }
}

export const cleanUnusedBorders = <T extends { empty: boolean }>(chartData: T[]): T[] => {
  const firstNotEmptyIndex = chartData.findIndex(h => !h.empty)
  const lastNotEmptyIndex = chartData.findLastIndex(h => !h.empty)
  const validRangeSize = lastNotEmptyIndex - firstNotEmptyIndex

  if (firstNotEmptyIndex < 0 && lastNotEmptyIndex < 0) {
    return chartData
  }

  const totalLength = chartData.length

  if (validRangeSize > 9) {
    const p0 = Math.max(firstNotEmptyIndex, 0)
    const p1 = Math.min(lastNotEmptyIndex + 1, totalLength)

    return chartData.slice(p0, p1)
  }

  const emptyRequiredSlots = Math.round((9 - validRangeSize) / 2)
  const p0 = Math.max(firstNotEmptyIndex - emptyRequiredSlots, 0)
  const p1 = Math.min(lastNotEmptyIndex + emptyRequiredSlots + 1, totalLength)

  return chartData.slice(p0, p1)
}

export const buildChartConfig = (
  topKeys: string[],
  otherKeys: string[] = [],
  othersLabel = 'Others',
  labels: Record<string, string> = {}
) => {
  const toLabel = (key: string) => abbreviateWords(labels[key] ?? key)

  const chartConfig = {
    red: {
      label: toLabel(topKeys[0]),
      color: "var(--chart-5)",
    },
    orange: {
      label: toLabel(topKeys[1]),
      color: "var(--chart-3)",
    },
    yellow: {
      label: toLabel(topKeys[2]),
      color: "var(--chart-6)",
    },
    green: {
      label: toLabel(topKeys[3]),
      color: "var(--chart-2)",
    },
    blue: {
      label: toLabel(topKeys[4]),
      color: "var(--chart-4)",
    },
    others: {
      label: otherKeys.length === 1 ? toLabel(otherKeys[0]) : othersLabel,
      color: "var(--chart-1)",
    }
  } satisfies ChartConfig

  return chartConfig
}