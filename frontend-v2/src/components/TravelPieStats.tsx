"use client";

import type { ChartConfig } from "@/components/ui/chart"
import type { StatByModeChartData } from "@/types/stats"
import type { Travel } from "@/types/travel";

import { BadgeQuestionMarkIcon, BusIcon, CarIcon, CarTaxiFrontIcon, PersonStandingIcon, RocketIcon, ShipIcon, TrainIcon } from "lucide-react";
import { Label, Pie, PieChart } from 'recharts';
import { useTranslations } from "next-intl";

import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { calculateStatsByMode } from '@/utils/travelStats';

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

type Props = {
  travels: Travel[]
}

const TravelPieStats = ({ travels }: Props) => {
  const t = useTranslations("Charts");
  const stats = calculateStatsByMode(travels);

  const chartConfig = {
    modeOfTransport: {
      label: t("modeOfTransport"),
    },
    car: {
      label: t("modes.car"),
      icon: CarIcon
    },
    taxi: {
      label: t("modes.taxi"),
      icon: CarTaxiFrontIcon
    },
    bus: {
      label: t("modes.bus"),
      icon: BusIcon
    },
    subway: {
      label: t("modes.subway"),
      icon: TrainIcon
    },
    train: {
      label: t("modes.train"),
      icon: TrainIcon
    },
    ferry: {
      label: t("modes.ferry"),
      icon: ShipIcon
    },
    walking: {
      label: t("modes.walking"),
      icon: PersonStandingIcon
    },
    mixed: {
      label: t("modes.mixed"),
      icon: RocketIcon
    },
    other: {
      label: t("modes.other"),
      icon: BadgeQuestionMarkIcon
    },
  } satisfies ChartConfig

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
        <ChartContainer config={chartConfig} className="min-h-[200px] max-h-[300px] max-w-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie data={chartData} dataKey="totalKm" nameKey="modeOfTransport" innerRadius={60} strokeWidth={5}>
              {getLabel(totalKm, t("km"))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <ChartContainer config={chartConfig} className="min-h-[200px] max-h-[300px] max-w-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie data={chartData} dataKey="totalMinutes" nameKey="modeOfTransport" innerRadius={60} strokeWidth={5}>
              {getLabel(totalMinutes, t("minutes"))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <ChartContainer config={chartConfig} className="min-h-[200px] max-h-[300px] max-w-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie data={chartData} dataKey="count" nameKey="modeOfTransport" innerRadius={60} strokeWidth={5}>
              {getLabel(totalTravels, t("travels"))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <ChartContainer config={chartConfig} className="min-h-[200px] max-h-[300px] max-w-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie data={chartData} dataKey="averageSpeed" nameKey="modeOfTransport" innerRadius={60} strokeWidth={5}>
              {getLabel(averageSpeed, t("kmH"))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default TravelPieStats