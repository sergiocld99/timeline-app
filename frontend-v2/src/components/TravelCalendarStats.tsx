"use client";

import type { Travel } from "@/types/travel";

import { useTranslations } from "next-intl";
import { Fragment } from "react";

import { daysOfWeek } from "@/constants";
import { buildChartConfig } from "@/utils/chart";
import { translateDay } from "@/utils/date";

import { calculateBestLocations, calculateHome, enrichWithFarthestPoint } from "./analize/travel";
import { buildCalendarChartData } from "./builders/travelCalendar";
import { Card, CardContent } from "./ui/card";

type Props = {
  travels: Travel[],
  options?: {
    backendHome?: string,
    appliedFilter?: string | null
  }
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))

const TravelCalendarStats = ({ travels, options }: Props) => {
  const t = useTranslations();
  const home = calculateHome(travels, options)
  const relevantTravels = travels.map(travel => enrichWithFarthestPoint(travel, home))

  const { topKeys, otherKeys, shouldShowOthers } = calculateBestLocations(relevantTravels, 5)
  const chartConfig = buildChartConfig(topKeys, otherKeys, t("Charts.modes.others"))
  const cells = buildCalendarChartData(relevantTravels, topKeys)
  const cellByKey = new Map(cells.map(cell => [`${cell.day}-${cell.hour}`, cell]))

  const colorKeys: (keyof typeof chartConfig)[] = ['red', 'orange', 'yellow', 'green', 'blue']
  const legendKeys: (keyof typeof chartConfig)[] = colorKeys
    .filter((_, index) => topKeys[index])
    .concat(shouldShowOthers ? ['others'] : [])

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="h-[300px] flex flex-col items-center justify-center gap-6 py-4 pr-16">
        <div className="w-full flex-1 min-h-0 overflow-x-auto">
          <div
            className="grid gap-1 w-full h-full"
            style={{
              gridTemplateColumns: `2.5rem repeat(24, minmax(0, 1fr))`,
              gridTemplateRows: `auto repeat(7, 1fr)`
            }}
          >
            <div />
            {HOURS.map(hour => (
              <div key={hour} className="text-xs text-muted-foreground text-center">
                {hour}
              </div>
            ))}
            {daysOfWeek.map(day => (
              <Fragment key={day}>
                <div className="text-xs text-muted-foreground pr-1 flex items-center justify-end">
                  {translateDay(day, t)}
                </div>
                {HOURS.map(hour => {
                  const cell = cellByKey.get(`${day}-${hour}`)
                  const colorKey = cell?.colorKey
                  const label = colorKey
                    ? `${translateDay(day, t)} ${hour}hs — ${chartConfig[colorKey as keyof typeof chartConfig].label} (${Math.round(cell.totalMinutes)} min)`
                    : `${translateDay(day, t)} ${hour}hs`

                  return (
                    <div
                      key={`${day}-${hour}`}
                      title={label}
                      className="rounded-[3px] bg-gray-100 dark:bg-gray-700"
                      style={colorKey ? { backgroundColor: chartConfig[colorKey as keyof typeof chartConfig].color } : undefined}
                    />
                  )
                })}
              </Fragment>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {legendKeys.map(key => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartConfig[key].color }} />
              {chartConfig[key].label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TravelCalendarStats;
