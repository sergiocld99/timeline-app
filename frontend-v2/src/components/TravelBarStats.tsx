import { ChartData, ChartSource, HourPart } from "@/types/chart"
import { Travel, TravelsData } from "@/types/travel"
import { buildChartConfig, extractHourAndMinutes, getChartHours, normalizeHour, useChartValue, useDefaultValues } from "@/utils/chart"
import { Card, CardContent } from "./ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { BarChart } from "recharts";
import { Bar, CartesianGrid, XAxis } from "recharts";
import { convertToArgentineTime } from "@/utils";
import { daysOfWeek } from "@/constants";

type Props = {
  travelsData: TravelsData
}

const calculateBestModes = (travels: Travel[], quantity: number) => {
  const topModes = travels.reduce((acc, t) => {
    const key = t.modeOfTransport
    if (!acc[key]) {
      acc[key] = 0
    }
    acc[key] += t.duration
    return acc
  }, {} as Record<string, number>)

  const sortedModes = Object.entries(topModes).sort((a, b) => a[1] - b[1]).reverse()
  const result = sortedModes.map(loc => loc[0]).slice(0, quantity)

  for (let i = 0; i < quantity; i++) {
    if (!result[i]) result[i] = '';
  }

  return result;
}

const getEachHourOfTravel = ({ startTime: start, endTime: end }: Travel): HourPart[] => {
  const startTime = extractHourAndMinutes(start);
  const endTime = extractHourAndMinutes(end);

  const hours: HourPart[] = [];

  // Same day - short travel in same hour (< 60 min)
  if (endTime.hour === startTime.hour) {
    return [{ hour: normalizeHour(endTime.hour), totalMinutes: (endTime.minutes - startTime.minutes) }]
  }

  // Partial hours (start and end)
  hours.push({ hour: normalizeHour(startTime.hour), totalMinutes: (60 - startTime.minutes) });
  hours.push({ hour: normalizeHour(endTime.hour), totalMinutes: endTime.minutes });

  // Full hours for travels in same day
  if (endTime.hour > startTime.hour) {
    for (let i = startTime.hour + 1; i < endTime.hour; i++) {
      hours.push({ hour: normalizeHour(i), totalMinutes: 60 });
    }

    return hours
  }

  // Full hours for travels between 2 days
  for (let i = startTime.hour + 1; i < 24; i++) {
    hours.push({ hour: normalizeHour(i), totalMinutes: 60 });
  }

  for (let i = 0; i < endTime.hour; i++) {
    hours.push({ hour: normalizeHour(i), totalMinutes: 60 });
  }

  return hours
}
 
const buildHourlyChartData = (travels: Travel[], topModes: string[]): ChartData<"hour"> => {
  const weightByHour = travels.reduce((acc, t) => {
    const chartMode = topModes.includes(t.modeOfTransport) ? t.modeOfTransport : 'other'

    getEachHourOfTravel(t).forEach(hour => {
      if (!acc[hour.hour]) {
        acc[hour.hour] = useDefaultValues(topModes)
      }

      acc[hour.hour][chartMode] += hour.totalMinutes
    })
    return acc;
  }, {} as ChartSource)

  return getChartHours().map(hour => ({
    hour,
    ...useChartValue(hour, weightByHour, topModes)
  }));
}

const buildDailyChartData = (travels: Travel[], topModes: string[]): ChartData<"day"> => {
  const weightByDay = travels.reduce((acc, t) => {
    const chartMode = topModes.includes(t.modeOfTransport) ? t.modeOfTransport : 'others';
    const dayOfWeek = convertToArgentineTime(new Date(t.startTime)).getDay()
    const normalizedDay = daysOfWeek[dayOfWeek]

    if (!acc[normalizedDay]) {
      acc[normalizedDay] = useDefaultValues(topModes)
    }

    acc[normalizedDay][chartMode] += t.duration
    return acc;
  }, {} as ChartSource)

  return daysOfWeek.map(day => ({
    day,
    ...useChartValue(day, weightByDay, topModes)
  }));
}

const TravelBarStats = ({ travelsData }: Props) => {
  const { travels } = travelsData

  const topModes = calculateBestModes(travels, 5)
  const hourlyChartData = buildHourlyChartData(travels, topModes)
  const dailyChartData = buildDailyChartData(travels, topModes)
  const chartConfig = buildChartConfig(topModes)

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="h-[300px] flex items-center justify-center">
        <ChartContainer config={chartConfig} className="min-h-[300px] max-h-[300px] max-w-3/5 min-w-3/5">
          <BarChart accessibilityLayer data={hourlyChartData}>
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
          <BarChart accessibilityLayer data={dailyChartData}>
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

export default TravelBarStats