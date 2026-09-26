import type { Travel } from "@/types/travel";
import type { ChartConfig } from "../ui/chart";
import type { FilteringData } from "@/types/stats";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useTranslations } from "next-intl";

import { cleanUnusedBorders, getChartHours } from "@/utils/chart";
import { roundDecimals } from "@/utils/numbers";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"

type Props = {
  travels: Travel[]
  onFilter: (data: FilteringData) => void
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

const buildHourlyChartData = (travels: Travel[]) => {
  const travelsByMode = {
    car: travels.filter(t => t.modeOfTransport === 'car'),
    bus: travels.filter(t => t.modeOfTransport === 'bus'),
    taxi: travels.filter(t => t.modeOfTransport === 'taxi'),
    mixed: travels.filter(t => t.modeOfTransport === 'mixed'),
    walking: travels.filter(t => t.modeOfTransport === 'walking'),
    others: travels.filter(t => !['car', 'bus', 'taxi', 'mixed', 'walking'].includes(t.modeOfTransport)),
  }

  const chartData = getChartHours().map(hour => {
    const modesData = {
      car: getHourData(travelsByMode.car, hour),
      bus: getHourData(travelsByMode.bus, hour),
      taxi: getHourData(travelsByMode.taxi, hour),
      mixed: getHourData(travelsByMode.mixed, hour),
      walking: getHourData(travelsByMode.walking, hour),
      others: getHourData(travelsByMode.others, hour),
    }

    return {
      hour,
      ...modesData,
      empty: Object.values(modesData).every(v => v === null)
    }
  });

  return cleanUnusedBorders(chartData);
}

const TravelLineStats = ({ travels, onFilter }: Props) => {
  const t = useTranslations("Charts");
  const chartConfig = {
    car: {
      label: t("modes.car"),
      color: "var(--chart-5)",
    },
    taxi: {
      label: t("modes.taxi"),
      color: "var(--chart-4)",
    },
    bus: {
      label: t("modes.bus"),
      color: "var(--chart-3)",
    },
    mixed: {
      label: t("modes.mixed"),
      color: "var(--chart-6)",
    },
    walking: {
      label: t("modes.walking"),
      color: "var(--chart-2)",
    },
    others: {
      label: t("modes.others"),
      color: "var(--chart-1)"
    }
  } satisfies ChartConfig

  const hourlyChartData = buildHourlyChartData(travels)

  const handleHourClick = (value?: string) => {
    onFilter({ type: 'hour', value })
  }

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle>{t("speedInKmH")}</CardTitle>
      </CardHeader>
      <CardContent className="h-[255px] flex items-center justify-center pt-4">
        <ChartContainer config={chartConfig} className="min-h-[255px] max-h-[255px] w-full">
          <LineChart
            accessibilityLayer
            data={hourlyChartData}
            margin={{
              left: -20,
              right: 40,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              className="hover:cursor-pointer"
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              onClick={(data) => handleHourClick(data?.value)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => (value === 0 ? "" : value)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            {['car', 'bus', 'taxi', 'mixed', 'walking', 'others'].map(key => (
              <Line
                key={key}
                dataKey={key}
                type="natural"
                stroke={`var(--color-${key})`}
                strokeWidth={4}
                dot={{ fill: `var(--color-${key})`, r: 4 }}
                activeDot={{ r: 7 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default TravelLineStats