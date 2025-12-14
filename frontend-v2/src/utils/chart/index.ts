import { ChartSource, HourAndMinutes } from "@/types/chart";
import { extractTime } from "..";
import { ChartConfig } from "@/components/ui/chart";
import { abbreviateWords } from "../strings";

export const normalizeHour = (hour: number) => {
  return hour.toString().padStart(2, '0');
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
      others: 0
    }
  }

  return {
    red: roundChartValue(weightByField[key][topKeys[0]] || 0),
    orange: roundChartValue(weightByField[key][topKeys[1]] || 0),
    yellow: roundChartValue(weightByField[key][topKeys[2]] || 0),
    green: roundChartValue(weightByField[key][topKeys[3]] || 0),
    blue: roundChartValue(weightByField[key][topKeys[4]] || 0),
    others: roundChartValue(weightByField[key].others || 0)
  }
}

export const buildChartConfig = (topKeys: string[]) => {
  const chartConfig = {
    red: {
      label: abbreviateWords(topKeys[0]),
      color: "var(--chart-5)",
    },
    orange: {
      label: abbreviateWords(topKeys[1]),
      color: "var(--chart-3)",
    },
    yellow: {
      label: abbreviateWords(topKeys[2]),
      color: "var(--chart-6)",
    },
    green: {
      label: abbreviateWords(topKeys[3]),
      color: "var(--chart-2)",
    },
    blue: {
      label: abbreviateWords(topKeys[4]),
      color: "var(--chart-4)",
    },
    others: {
      label: 'Others',
      color: "var(--chart-1)",
    }
  } satisfies ChartConfig

  return chartConfig
}