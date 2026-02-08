import type { Travel } from "@/types/travel"
import type { ChartConfig } from "./ui/chart";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { getChartHours } from "@/utils/chart";
import { roundDecimals } from "@/utils/numbers";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart"

type Props = {
  travels: Travel[]
}

const getHourData = (travels: Travel[], hour: string) => {
  const eligibleTravels = travels.flatMap(t => {
    const part = t.hourParts.completeParts.find(part => part.hour === hour);
    return part ? [{
      weight: part.totalMinutes / t.duration,
      distance: t.distance,
      duration: t.duration,
    }] : [];
  })

  const sumKm = eligibleTravels.reduce((prev, curr) => prev + curr.distance * curr.weight, 0)
  const sumMinutes = eligibleTravels.reduce((prev, curr) => prev + curr.duration * curr.weight, 0)
  const sumHours = sumMinutes / 60

  return sumHours ? roundDecimals(sumKm / sumHours, 1) : null
}

const buildHourlyChartData = ({ travels }: Props) => {
  const travelsByMode = {
    car: travels.filter(t => t.modeOfTransport === 'car'),
    bus: travels.filter(t => t.modeOfTransport === 'bus'),
    taxi: travels.filter(t => t.modeOfTransport === 'taxi'),
    walking: travels.filter(t => t.modeOfTransport === 'walking'),
    others: travels.filter(t => !['car', 'bus', 'taxi', 'walking'].includes(t.modeOfTransport)),
  }

  console.log(travelsByMode['car'])

  return getChartHours().map(hour => ({
    hour,
    car: getHourData(travelsByMode.car, hour),
    bus: getHourData(travelsByMode.bus, hour),
    taxi: getHourData(travelsByMode.taxi, hour),
    walking: getHourData(travelsByMode.walking, hour),
    others: getHourData(travelsByMode.others, hour),
  }));
}

const TravelLineStats = ({ travels }: Props) => {
  const chartConfig = {
    car: {
      label: "car",
      color: "var(--chart-5)",
    },
    taxi: {
      label: "taxi",
      color: "var(--chart-4)",
    },
    bus: {
      label: "bus",
      color: "var(--chart-3)",
    },
    walking: {
      label: "walking",
      color: "var(--chart-2)",
    },
    others: {
      label: "others",
      color: "var(--chart-1)"
    }
  } satisfies ChartConfig

  const hourlyChartData = buildHourlyChartData({ travels })

  console.log(hourlyChartData)

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle>Speed in km/h</CardTitle>
      </CardHeader>
      <CardContent className="h-[255px] flex items-center justify-center">
        <ChartContainer config={chartConfig} className="min-h-[255px] max-h-[255px] w-9/10">
          <LineChart
            accessibilityLayer
            data={hourlyChartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="car"
              type="natural"
              stroke="var(--color-car)"
              strokeWidth={2}
              dot={{ fill: "var(--color-car)" }}
              activeDot={{ r: 6 }}
            />
            <Line
              dataKey="bus"
              type="natural"
              stroke="var(--color-bus)"
              strokeWidth={2}
              dot={{ fill: "var(--color-bus)" }}
              activeDot={{ r: 6 }}
            />
            <Line
              dataKey="taxi"
              type="natural"
              stroke="var(--color-taxi)"
              strokeWidth={2}
              dot={{ fill: "var(--color-taxi)" }}
              activeDot={{ r: 6 }}
            />
            <Line
              dataKey="walking"
              type="natural"
              stroke="var(--color-walking)"
              strokeWidth={2}
              dot={{ fill: "var(--color-walking)" }}
              activeDot={{ r: 6 }}
            />
            <Line
              dataKey="others"
              type="natural"
              stroke="var(--color-others)"
              strokeWidth={2}
              dot={{ fill: "var(--color-others)" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default TravelLineStats