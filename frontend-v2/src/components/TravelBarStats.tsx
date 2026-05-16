import type { Travel } from "@/types/travel";
import type { Location } from "@/types/location";
import type { FilteringData } from "@/types/stats";

import { useFormatter } from "next-intl";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { buildChartConfig } from "@/utils/chart"
import { translateDay } from "@/utils/date";

import { calculateBestLocations } from "./analize/travel";
import { buildDailyChartData, buildHourlyChartData } from "./builders/travelBars";
import { Card, CardContent } from "./ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "./ui/chart";

type Props = {
  travels: Travel[],
  onFilter: (data: FilteringData) => void,
  options?: {
    field: 'origin' | 'destination'
  },
  cardClassName?: string,
}

const calculateHome = (travels: Travel[], options: Props["options"]) => {
  if (travels.length > 0 && options?.field) {
    return travels[0][options.field]
  }

  if (travels.length > 10 && travels[0].destination.name === travels[travels.length - 1].origin.name) {
    return travels[0].destination
  }

  return undefined
}

const chooseFarthestPoint = (p1: Location, p2: Location, home: Location) => {
  const dist1 = Math.abs(p1.latitude - home.latitude) + Math.abs(p1.longitude - home.longitude)
  const dist2 = Math.abs(p2.latitude - home.latitude) + Math.abs(p2.longitude - home.longitude)

  return dist1 > dist2 ? p1 : p2
}

const enrichWithFarthestPoint = (t: Travel, home?: Location) => {
  return {
    ...t,
    farthestPoint: home && chooseFarthestPoint(t.origin, t.destination, home)
  }
}

const TravelBarStats = ({ travels, onFilter, options, cardClassName = "w-8/10" }: Props) => {
  const format = useFormatter();
  const home = calculateHome(travels, options)
  const relevantTravels = travels.map(t => enrichWithFarthestPoint(t, home))

  const { topKeys, otherKeys, shouldShowOthers } = calculateBestLocations(relevantTravels, 5)
  const hourlyChartData = buildHourlyChartData(relevantTravels, topKeys)
  const dailyChartData = buildDailyChartData(relevantTravels, topKeys)
  const chartConfig = buildChartConfig(topKeys, otherKeys)

  const handleZipcodeClick = (zipcode: string[]) => {
    onFilter({ type: 'zipcode', value: zipcode })
  }

  const handleDayClick = (day?: string) => {
    onFilter({ type: 'day', value: day })
  }

  const handleHourClick = (hour?: string) => {
    onFilter({ type: 'hour', value: hour })
  }

  return (
    <Card className={`${cardClassName} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}>
      <CardContent className="h-[300px] flex items-center justify-center">
        <ChartContainer config={chartConfig} className="min-h-[300px] max-h-[300px] max-w-3/5 min-w-3/5">
          <BarChart accessibilityLayer data={hourlyChartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              className="hover:cursor-pointer"
              dataKey="hour"
              tickMargin={10}
              tickFormatter={(value) => value.slice(0, 3)}
              onClick={(data) => handleHourClick(data?.value)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {topKeys.at(0) && <Bar
              dataKey="red"
              stackId="a"
              fill="var(--color-red)"
              onClick={() => handleZipcodeClick([topKeys[0]])}
            />}
            {topKeys.at(1) && <Bar
              dataKey="orange"
              stackId="a"
              fill="var(--color-orange)"
              onClick={() => handleZipcodeClick([topKeys[1]])}
            />}
            {topKeys.at(2) && <Bar
              dataKey="yellow"
              stackId="a"
              fill="var(--color-yellow)"
              onClick={() => handleZipcodeClick([topKeys[2]])}
            />}
            {topKeys.at(3) && <Bar
              dataKey="green"
              stackId="a"
              fill="var(--color-green)"
              onClick={() => handleZipcodeClick([topKeys[3]])}
            />}
            {topKeys.at(4) && <Bar
              dataKey="blue"
              stackId="a"
              fill="var(--color-blue)"
              onClick={() => handleZipcodeClick([topKeys[4]])}
            />}
            {shouldShowOthers &&
              <Bar
                dataKey="others"
                stackId="a"
                fill="var(--color-others)"
                onClick={() => handleZipcodeClick(otherKeys)}
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
              tickFormatter={(value) => translateDay(value, format)}
              onClick={(data) => handleDayClick(data?.value)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {topKeys.at(0) && <Bar
              dataKey="red"
              stackId="a"
              fill="var(--color-red)"
            />}
            {topKeys.at(1) && <Bar
              dataKey="orange"
              stackId="a"
              fill="var(--color-orange)"
            />}
            {topKeys.at(2) && <Bar
              dataKey="yellow"
              stackId="a"
              fill="var(--color-yellow)"
            />}
            {topKeys.at(3) && <Bar
              dataKey="green"
              stackId="a"
              fill="var(--color-green)"
            />}
            {topKeys.at(4) && <Bar
              dataKey="blue"
              stackId="a"
              fill="var(--color-blue)"
            />}
            {shouldShowOthers &&
              <Bar
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

export default TravelBarStats