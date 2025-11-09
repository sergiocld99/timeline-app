"use client";

import { Visit, VisitsData } from "@/types/travel";
import { Card, CardContent } from "./ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { BarChart } from "recharts";
import { Bar, CartesianGrid, XAxis } from "recharts";
import { convertToArgentineTime, extractTime } from "@/utils";
import { ChartSource } from "@/types/chart";

type Props = {
  visitsData: VisitsData;
}

type HourAndMinutes = {
  hour: number;
  minutes: number;
}

type HourPart = {
  hour: string;
  completitude: number;
}

const extractHourAndMinutesFromTime = (time: string): HourAndMinutes => {
  const [hour, minutes] = extractTime(time).split(':');
  return { hour: parseInt(hour), minutes: parseInt(minutes) };
}

const normalizeHour = (hour: number) => {
  return hour.toString().padStart(2, '0');
}

const getEachHourOfVisit = ({ arrivalTime, departureTime }: Visit): HourPart[] => {
  const startTime = extractHourAndMinutesFromTime(arrivalTime);
  const endTime = extractHourAndMinutesFromTime(departureTime);

  const hours: HourPart[] = [];

  if (endTime.hour === startTime.hour) {
    return [{ hour: normalizeHour(endTime.hour), completitude: (endTime.minutes - startTime.minutes) / 60 }]
  }

  hours.push({ hour: normalizeHour(startTime.hour), completitude: (60 - startTime.minutes) / 60 });
  hours.push({ hour: normalizeHour(endTime.hour), completitude: endTime.minutes / 60 });

  for (let i = startTime.hour + 1; i < endTime.hour; i++) {
    hours.push({ hour: normalizeHour(i), completitude: 1 });
  }

  return hours;
}

const roundChartValue = (value: number) => {
  return Math.round(value);
}

const calculateBestLocations = (visits: Visit[]) => {
  const topLocations = visits.reduce((acc, v) => {
    const key = v.location.name
    if (!acc[key]) {
      acc[key] = 0
    }
    acc[key] += v.durationMinutes
    return acc
  }, {} as Record<string, number>)

  const sortedLocations = Object.entries(topLocations).sort((a, b) => a[1] - b[1]).reverse()
  return sortedLocations.map(loc => loc[0]).slice(0, 5)
}

const VisitStats = ({ visitsData }: Props) => {
  const { visits } = visitsData;

  const chartHours = [];
  const chartDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 0; i < 24; i++) { chartHours.push(normalizeHour(i)) }

  const topThreeLocations = calculateBestLocations(visits)
  if (!topThreeLocations[0]) topThreeLocations[0] = ''
  if (!topThreeLocations[1]) topThreeLocations[1] = ''
  if (!topThreeLocations[2]) topThreeLocations[2] = ''
  if (!topThreeLocations[3]) topThreeLocations[3] = ''
  if (!topThreeLocations[4]) topThreeLocations[4] = ''

  const weightByDay = visits.reduce((acc, v) => {
    const dayOfWeek = convertToArgentineTime(new Date(v.arrivalTime)).getDay()
    const normalizedDay = chartDays[dayOfWeek]
    const chartLocation = topThreeLocations.includes(v.location.name) ? v.location.name : 'others';

    if (!acc[normalizedDay]) {
      acc[normalizedDay] = {
        [topThreeLocations[0]]: 0,
        [topThreeLocations[1]]: 0,
        [topThreeLocations[2]]: 0,
        [topThreeLocations[3]]: 0,
        [topThreeLocations[4]]: 0,
        others: 0
      }
    }

    acc[normalizedDay][chartLocation] += v.durationMinutes
    return acc;
  }, {} as ChartSource)

  const weightByHour = visits.reduce((acc, visit) => {
    const hours = getEachHourOfVisit(visit);
    const chartLocation = topThreeLocations.includes(visit.location.name) ? visit.location.name : 'others';

    hours.forEach(hour => {
      if (!acc[hour.hour]) {
        acc[hour.hour] = {
          [topThreeLocations[0]]: 0,
          [topThreeLocations[1]]: 0,
          [topThreeLocations[2]]: 0,
          [topThreeLocations[3]]: 0,
          [topThreeLocations[4]]: 0,
          others: 0
        }
      }

      const correctedWeight = 60 * hour.completitude;
      acc[hour.hour][chartLocation] += correctedWeight
    });
    return acc;
  }, {} as ChartSource);

  const chartData = chartHours.map(hour => !weightByHour[hour] ? ({
    hour,
    red: 0,
    orange: 0,
    yellow: 0,
    green: 0,
    blue: 0,
    others: 0
  }) : ({
    hour,
    red: roundChartValue(weightByHour[hour][topThreeLocations[0]] || 0),
    orange: roundChartValue(weightByHour[hour][topThreeLocations[1]] || 0),
    yellow: roundChartValue(weightByHour[hour][topThreeLocations[2]] || 0),
    green: roundChartValue(weightByHour[hour][topThreeLocations[3]] || 0),
    blue: roundChartValue(weightByHour[hour][topThreeLocations[4]] || 0),
    others: roundChartValue(weightByHour[hour].others || 0)
  }));

  const chartDataByDate = chartDays.map(day => !weightByDay[day] ? ({
    day,
    red: 0,
    orange: 0,
    yellow: 0,
    green: 0,
    blue: 0,
    others: 0
  }) : ({
    day,
    red: roundChartValue(weightByDay[day][topThreeLocations[0]] || 0),
    orange: roundChartValue(weightByDay[day][topThreeLocations[1]] || 0),
    yellow: roundChartValue(weightByDay[day][topThreeLocations[2]] || 0),
    green: roundChartValue(weightByDay[day][topThreeLocations[3]] || 0),
    blue: roundChartValue(weightByDay[day][topThreeLocations[4]] || 0),
    others: roundChartValue(weightByDay[day].others || 0)
  }));

  const chartConfig = {
    red: {
      label: topThreeLocations[0],
      color: "var(--chart-5)",
    },
    orange: {
      label: topThreeLocations[1],
      color: "var(--chart-3)",
    },
    yellow: {
      label: topThreeLocations[2],
      color: "var(--chart-6)",
    },
    green: {
      label: topThreeLocations[3],
      color: "var(--chart-2)",
    },
    blue: {
      label: topThreeLocations[4],
      color: "var(--chart-4)",
    },
    others: {
      label: 'Others',
      color: "var(--chart-1)",
    }
  } satisfies ChartConfig

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="h-[300px] flex items-center justify-center">
        <ChartContainer config={chartConfig} className="min-h-[300px] max-h-[300px] max-w-3/5 min-w-3/5">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickMargin={10}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="red"
              stackId="a"
              fill="var(--color-red)"
            />
            <Bar
              dataKey="orange"
              stackId="a"
              fill="var(--color-orange)"
            />
            <Bar
              dataKey="yellow"
              stackId="a"
              fill="var(--color-yellow)"
            />
            <Bar
              dataKey="green"
              stackId="a"
              fill="var(--color-green)"
            />
            <Bar
              dataKey="blue"
              stackId="a"
              fill="var(--color-blue)"
            />
            <Bar
              dataKey="others"
              stackId="a"
              fill="var(--color-others)"
            />
          </BarChart>
        </ChartContainer>
        <ChartContainer config={chartConfig} className="min-h-[270px] max-h-[270px] mx-auto max-w-1/4 min-w-1/4">
          <BarChart accessibilityLayer data={chartDataByDate}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickMargin={10}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="red"
              stackId="a"
              fill="var(--color-red)"
            />
            <Bar
              dataKey="orange"
              stackId="a"
              fill="var(--color-orange)"
            />
            <Bar
              dataKey="yellow"
              stackId="a"
              fill="var(--color-yellow)"
            />
            <Bar
              dataKey="green"
              stackId="a"
              fill="var(--color-green)"
            />
            <Bar
              dataKey="blue"
              stackId="a"
              fill="var(--color-blue)"
            />
            <Bar
              dataKey="others"
              stackId="a"
              fill="var(--color-others)"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default VisitStats;