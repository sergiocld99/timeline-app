"use client";

import type { ChartConfig } from "@/components/ui/chart"
import type { StatByModeChartData } from "@/types/stats"
import type { Travel } from "@/types/travel";

import { BadgeQuestionMarkIcon, BusIcon, CarIcon, CarTaxiFrontIcon, PersonStandingIcon, RocketIcon, ShipIcon, TrainIcon } from "lucide-react";
import { Label, Pie, PieChart } from 'recharts';

import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { calculateStatsByMode } from '@/utils/travelStats';


type Props = {
  travels: Travel[]
}

const config = {
  modeOfTransport: {
    label: "Mode of Transport",
  },
  car: {
    label: "Car",
    icon: CarIcon
  },
  taxi: {
    label: "Taxi",
    icon: CarTaxiFrontIcon
  },
  bus: {
    label: "Bus",
    icon: BusIcon
  },
  subway: {
    label: "Subway",
    icon: TrainIcon
  },
  train: {
    label: "Train",
    icon: TrainIcon
  },
  ferry: {
    label: "Ferry",
    icon: ShipIcon
  },
  walking: {
    label: "Walking",
    icon: PersonStandingIcon
  },
  mixed: {
    label: "Mixed",
    icon: RocketIcon
  },
  other: {
    label: "Other",
    icon: BadgeQuestionMarkIcon
  },
} satisfies ChartConfig

const getRecommendedChartIndex = (modeOfTransport: string) => {
  switch (modeOfTransport) {
    case 'ferry':
    case 'subway':
    case 'train':
      return 1
    case 'walking':
      return 2
    case 'bus':
      return 3
    case 'mixed':
      return 6
    case 'car':
      return 5
    default:
      return 4
  }
}

const getLabel = (total: number, label: string) => {
  return (
    <Label
      content={({ viewBox }) => {
        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
          return (
            <text
              x={viewBox.cx}
              y={viewBox.cy}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              <tspan
                x={viewBox.cx}
                y={viewBox.cy}
                className="fill-foreground text-3xl font-bold"
              >
                {total.toLocaleString()}
              </tspan>
              <tspan
                x={viewBox.cx}
                y={(viewBox.cy || 0) + 24}
                className="fill-muted-foreground"
              >
                {label}
              </tspan>
            </text>
          )
        }
      }}
    />
  )
}

const TravelPieStats = ({ travels }: Props) => {
  const stats = calculateStatsByMode(travels);

  const chartData: StatByModeChartData[] = stats.map((stat) => ({
    ...stat,
    averageSpeed: Math.round(60 * stat.totalKm / stat.totalMinutes),
    fill: `var(--chart-${getRecommendedChartIndex(stat.modeOfTransport)})`
  }))

  const totalKm = Math.round(stats.reduce((acc, stat) => acc + stat.totalKm, 0))
  const totalMinutes = stats.reduce((acc, stat) => acc + stat.totalMinutes, 0)
  const totalTravels = stats.reduce((acc, stat) => acc + stat.count, 0)
  const averageSpeed = Math.round(60 * totalKm / totalMinutes)

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="h-[300px] flex items-center justify-center">
        <ChartContainer config={config} className="min-h-[200px] max-h-[300px] max-w-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie data={chartData} dataKey="totalKm" nameKey="modeOfTransport" innerRadius={60} strokeWidth={5}>
              {getLabel(totalKm, "Km")}
            </Pie>
          </PieChart>
        </ChartContainer>
        <ChartContainer config={config} className="min-h-[200px] max-h-[300px] max-w-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie data={chartData} dataKey="totalMinutes" nameKey="modeOfTransport" innerRadius={60} strokeWidth={5}>
              {getLabel(totalMinutes, "Minutes")}
            </Pie>
          </PieChart>
        </ChartContainer>
        <ChartContainer config={config} className="min-h-[200px] max-h-[300px] max-w-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie data={chartData} dataKey="count" nameKey="modeOfTransport" innerRadius={60} strokeWidth={5}>
              {getLabel(totalTravels, "Travels")}
            </Pie>
          </PieChart>
        </ChartContainer>
        <ChartContainer config={config} className="min-h-[200px] max-h-[300px] max-w-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie data={chartData} dataKey="averageSpeed" nameKey="modeOfTransport" innerRadius={60} strokeWidth={5}>
              {getLabel(averageSpeed, "Km/h")}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default TravelPieStats