"use client";

import type { ChartData, ChartSource } from "@/types/chart";
import type { Visit } from "@/types/visit";;
import type { FilteringData } from "@/types/stats";

import { BarChart } from "recharts";
import { Bar, CartesianGrid, XAxis } from "recharts";

import { daysOfWeek } from "@/constants";
import { convertToArgentineTime } from "@/utils";
import { buildChartConfig, cleanUnusedBorders, getChartHours, useChartValue, useDefaultValues } from "@/utils/chart";

import { calculateBestLocations } from "./analize/visit";
import { Card, CardContent } from "./ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "./ui/chart";

type Props = {
  visits: Visit[];
  onFilter: (data: FilteringData) => void
}

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

const VisitStats = ({ visits, onFilter }: Props) => {
  const { topKeys: topLocations, shouldShowOthers } = calculateBestLocations(visits, 5)
  const hourlyChartData = buildHourlyChartData(visits, topLocations)
  const dailyChartData = buildDailyChartData(visits, topLocations)
  const chartConfig = buildChartConfig(topLocations)

  return (
    <Card className="w-8/10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="h-[300px] flex items-center justify-center">
        <ChartContainer config={chartConfig} className="min-h-[300px] max-h-[300px] max-w-3/5 min-w-3/5">
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
            {topLocations.at(0) && <Bar
              dataKey="red"
              stackId="a"
              fill="var(--color-red)"
            />}
            {topLocations.at(1) && <Bar
              dataKey="orange"
              stackId="a"
              fill="var(--color-orange)"
            />}
            {topLocations.at(2) && <Bar
              dataKey="yellow"
              stackId="a"
              fill="var(--color-yellow)"
            />}
            {topLocations.at(3) && <Bar
              dataKey="green"
              stackId="a"
              fill="var(--color-green)"
            />}
            {topLocations.at(4) && <Bar
              dataKey="blue"
              stackId="a"
              fill="var(--color-blue)"
            />}
            {shouldShowOthers && <Bar
              dataKey="others"
              stackId="a"
              fill="var(--color-others)"
            />}
          </BarChart>
        </ChartContainer>
        <ChartContainer config={chartConfig} className="min-h-[270px] max-h-[270px] mx-auto max-w-1/4 min-w-1/4">
          <BarChart accessibilityLayer data={dailyChartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              className="hover:cursor-pointer"
              dataKey="day"
              tickMargin={10}
              tickFormatter={(value) => value.slice(0, 3)}
              onClick={(e) => onFilter({ type: 'day', value: e?.value })}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {topLocations.at(0) && <Bar
              dataKey="red"
              stackId="a"
              fill="var(--color-red)"
            />}
            {topLocations.at(1) && <Bar
              dataKey="orange"
              stackId="a"
              fill="var(--color-orange)"
            />}
            {topLocations.at(2) && <Bar
              dataKey="yellow"
              stackId="a"
              fill="var(--color-yellow)"
            />}
            {topLocations.at(3) && <Bar
              dataKey="green"
              stackId="a"
              fill="var(--color-green)"
            />}
            {topLocations.at(4) && <Bar
              dataKey="blue"
              stackId="a"
              fill="var(--color-blue)"
            />}
            {shouldShowOthers && <Bar
              dataKey="others"
              stackId="a"
              fill="var(--color-others)"
            />}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default VisitStats;