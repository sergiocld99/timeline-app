"use client";

import type { ChartData, ChartSource } from "@/types/chart";
import type { Visit } from "@/types/visit";;
import type { FilteringData } from "@/types/stats";
import type { ChartConfig } from "../ui/chart";

import { BarChart } from "recharts";
import { Bar, CartesianGrid, Cell, XAxis } from "recharts";
import { useTranslations } from "next-intl";

import { daysOfWeek } from "@/constants";
import { convertToArgentineTime } from "@/utils";
import { buildChartConfig, cleanUnusedBorders, getChartHours, roundChartValue, useChartValue, useDefaultValues } from "@/utils/chart";
import { translateDay } from "@/utils/date";

import { calculateBestLocations } from "../analysis/visit";
import { Card, CardContent } from "../ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "../ui/chart";

type Props = {
  visits: Visit[];
  onFilter: (data: FilteringData) => void
  groupHourlyByWeekday?: boolean
}

type WeekdayHourChartRow = { hour: string; empty: boolean } & Record<typeof daysOfWeek[number], number>

const buildHourlyChartData = (visits: Visit[], topLocations: string[]): ChartData<"hour"> => {
  const weightByHour = visits.reduce((acc, v) => {
    const chartLocation = topLocations.includes(v.location.name) ? v.location.name : 'others';

    v.hourParts.forEach(hour => {
      if (!acc[hour.hour]) {
        acc[hour.hour] = useDefaultValues(topLocations)
      }

      acc[hour.hour][chartLocation] += hour.totalMinutes
    });
    return acc;
  }, {} as ChartSource);

  const chartData = getChartHours().map(hour => ({
    hour,
    ...useChartValue(hour, weightByHour, topLocations)
  }));

  return cleanUnusedBorders(chartData)
}

const buildDailyChartData = (visits: Visit[], topLocations: string[]): ChartData<"day"> => {
  const weightByDay = visits.reduce((acc, v) => {
    const chartLocation = topLocations.includes(v.location.name) ? v.location.name : 'others';
    const dayOfWeek = convertToArgentineTime(new Date(v.arrivalTime)).getDay()
    const normalizedDay = daysOfWeek[dayOfWeek]

    if (!acc[normalizedDay]) {
      acc[normalizedDay] = useDefaultValues(topLocations)
    }

    acc[normalizedDay][chartLocation] += v.durationMinutes
    return acc;
  }, {} as ChartSource)

  return daysOfWeek.map(day => ({
    day,
    ...useChartValue(day, weightByDay, topLocations)
  }));
}

const buildHourlyByWeekdayChartData = (visits: Visit[]): WeekdayHourChartRow[] => {
  const weightByHour = visits.reduce((acc, v) => {
    const dayOfWeek = convertToArgentineTime(new Date(v.arrivalTime)).getDay()
    const normalizedDay = daysOfWeek[dayOfWeek]

    v.hourParts.forEach(hourPart => {
      if (!acc[hourPart.hour]) {
        acc[hourPart.hour] = Object.fromEntries(daysOfWeek.map(d => [d, 0]))
      }

      acc[hourPart.hour][normalizedDay] += hourPart.totalMinutes
    });
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const chartData = getChartHours().map(hour => {
    const row = weightByHour[hour]

    return {
      hour,
      empty: !row,
      ...Object.fromEntries(daysOfWeek.map(d => [d, roundChartValue(row?.[d] || 0)]))
    } as WeekdayHourChartRow
  });

  return cleanUnusedBorders(chartData)
}

const buildWeekdayChartConfig = (t: ReturnType<typeof useTranslations>): ChartConfig => {
  const colorVars = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5", "--chart-6", "--chart-7"]

  return Object.fromEntries(
    daysOfWeek.map((day, i) => [day, { label: translateDay(day, t), color: `var(${colorVars[i]})` }])
  ) satisfies ChartConfig
}

const buildActiveDaysBars = (visits: Visit[]) => {
  const activeWeekdays = daysOfWeek.filter(day =>
    visits.some(v => daysOfWeek[convertToArgentineTime(new Date(v.arrivalTime)).getDay()] === day)
  )

  return activeWeekdays.map(day => (
    <Bar
      key={day}
      dataKey={day}
      stackId="a"
      fill={`var(--color-${day})`}
    />
  ))
}

const buildLocationBars = (
  topLocations: string[],
  otherKeys: string[],
  shouldShowOthers: boolean,
  onLocationClick: (location: string[]) => void
) => {
  const LOCATION_COLOR_SLOTS = ["red", "orange", "yellow", "green", "blue"]

  return [
    ...topLocations.filter(Boolean).map((location, i) => (
      <Bar
        key={LOCATION_COLOR_SLOTS[i]}
        dataKey={LOCATION_COLOR_SLOTS[i]}
        stackId="a"
        fill={`var(--color-${LOCATION_COLOR_SLOTS[i]})`}
        onClick={() => onLocationClick([location])}
      />
    )),
    shouldShowOthers && <Bar
      key="others"
      dataKey="others"
      stackId="a"
      fill="var(--color-others)"
      onClick={() => onLocationClick(otherKeys)}
    />
  ]
}

const VisitStats = ({ visits, onFilter, groupHourlyByWeekday }: Props) => {
  const t = useTranslations();
  const tCharts = useTranslations("Charts");
  const { topKeys: topLocations, otherKeys, shouldShowOthers } = calculateBestLocations(visits, 5)
  const dailyChartData = buildDailyChartData(visits, topLocations)
  const chartConfig = buildChartConfig(topLocations, otherKeys, tCharts("modes.others"))

  const hourlyChartData = groupHourlyByWeekday
    ? buildHourlyByWeekdayChartData(visits)
    : buildHourlyChartData(visits, topLocations)

  const weekdayChartConfig = buildWeekdayChartConfig(t)
  const hourlyChartConfig = groupHourlyByWeekday ? weekdayChartConfig : chartConfig
  const dailyChartConfig = groupHourlyByWeekday
    ? { ...weekdayChartConfig, red: chartConfig.red }
    : chartConfig

  const handleLocationClick = (location: string[]) => {
    onFilter({ type: 'location', value: location })
  }

  return (
    <Card className="w-8/10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="h-[300px] flex items-center justify-center">
        <ChartContainer config={hourlyChartConfig} className="min-h-[300px] max-h-[300px] max-w-3/5 min-w-3/5">
          <BarChart accessibilityLayer data={hourlyChartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              className="hover:cursor-pointer"
              dataKey="hour"
              tickMargin={10}
              tickFormatter={(value) => value.slice(0, 3)}
              onClick={(e) => onFilter({ type: 'hour', value: e?.value })}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {groupHourlyByWeekday
              ? buildActiveDaysBars(visits)
              : buildLocationBars(topLocations, otherKeys, shouldShowOthers, handleLocationClick)
            }
          </BarChart>
        </ChartContainer>
        <ChartContainer config={dailyChartConfig} className="min-h-[270px] max-h-[270px] mx-auto max-w-1/4 min-w-1/4">
          <BarChart accessibilityLayer data={dailyChartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              className="hover:cursor-pointer"
              dataKey="day"
              tickMargin={10}
              tickFormatter={(value) => translateDay(value, t)}
              onClick={(e) => onFilter({ type: 'day', value: e?.value })}
            />
            <ChartTooltip content={<ChartTooltipContent labelFormatter={(value) => translateDay(value, t)} />} />
            {groupHourlyByWeekday
              ? <Bar dataKey="red" stackId="a">
                {dailyChartData.map(entry => (
                  <Cell key={entry.day} fill={`var(--color-${entry.day})`} />
                ))}
              </Bar>
              : buildLocationBars(topLocations, otherKeys, shouldShowOthers, handleLocationClick)
            }
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default VisitStats;