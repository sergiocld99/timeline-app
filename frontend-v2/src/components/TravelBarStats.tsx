import { Location, Travel, TravelsData } from "@/types/travel"
import { buildChartConfig } from "@/utils/chart"
import { Card, CardContent } from "./ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { BarChart } from "recharts";
import { Bar, CartesianGrid, XAxis } from "recharts";
import { calculateBestLocations } from "./analize/travel";
import { buildDailyChartData, buildHourlyChartData } from "./builders/travelBars";

type Props = {
  travelsData: TravelsData
}

const calculateHome = (travels: Travel[]) => {
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

const TravelBarStats = ({ travelsData }: Props) => {
  const { travels } = travelsData
  const home = calculateHome(travels)
  const relevantTravels = travels.map(t => ({
    ...t,
    farthestPoint: home && chooseFarthestPoint(t.origin, t.destination, home)
  }))

  const topKeys = calculateBestLocations(relevantTravels, 5)
  const hourlyChartData = buildHourlyChartData(relevantTravels, topKeys)
  const dailyChartData = buildDailyChartData(relevantTravels, topKeys)
  const chartConfig = buildChartConfig(topKeys)

  return (
    <Card className="w-8/10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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