"use client";

import type { FilteringData } from "@/types/stats";
import type { Travel } from "@/types/travel";

import { useTranslations } from "next-intl";
import { Fragment } from "react";

import { daysOfWeek } from "@/constants";
import { buildChartConfig, cleanUnusedBorders } from "@/utils/chart";
import { translateDay } from "@/utils/date";

import { calculateBestLocations, calculateHome, enrichWithFarthestPoint } from "./analize/travel";
import { buildCalendarChartData } from "./builders/travelCalendar";
import { Card, CardContent } from "./ui/card";

type Props = {
  travels: Travel[],
  onFilter?: (data: FilteringData) => void,
  options?: {
    backendHome?: string,
    appliedFilter?: string | null
  }
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))

const TravelCalendarStats = ({ travels, onFilter, options }: Props) => {
  const t = useTranslations();
  const home = calculateHome(travels, options)
  const relevantTravels = travels.map(travel => enrichWithFarthestPoint(travel, home))

  const { topKeys, otherKeys, shouldShowOthers } = calculateBestLocations(relevantTravels, 5)
  const chartConfig = buildChartConfig(topKeys, otherKeys, t("Charts.modes.others"))
  const cells = buildCalendarChartData(relevantTravels, topKeys)
  const cellByKey = new Map(cells.map(cell => [`${cell.day}-${cell.hour}`, cell]))
  const maxCellMinutes = Math.max(0, ...cells.map(cell => cell.totalMinutes))

  const getCellOpacity = (totalMinutes: number) => {
    if (maxCellMinutes <= 0) { return 1 }
    return 0.4 + (totalMinutes / maxCellMinutes) * 0.6
  }

  const hourTotals = cells.reduce((acc, cell) => {
    acc[cell.hour] = (acc[cell.hour] || 0) + cell.totalMinutes
    return acc
  }, {} as Record<string, number>)
  const visibleHours = cleanUnusedBorders(HOURS.map(hour => ({ hour, empty: !hourTotals[hour] }))).map(h => h.hour)

  const colorKeys: (keyof typeof chartConfig)[] = ['red', 'orange', 'yellow', 'green', 'blue']
  const legendKeys: (keyof typeof chartConfig)[] = colorKeys
    .filter((_, index) => topKeys[index])
    .concat(shouldShowOthers ? ['others'] : [])

  const handleCellClick = (colorKey: string) => {
    const colorIndex = colorKeys.indexOf(colorKey as keyof typeof chartConfig)
    const zipcodes = colorIndex >= 0 ? [topKeys[colorIndex]] : otherKeys

    onFilter?.({ type: 'zipcode', value: zipcodes })
  }

  const handleDayClick = (day: string) => onFilter?.({ type: 'day', value: day })
  const handleHourClick = (hour: string) => onFilter?.({ type: 'hour', value: hour })

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 animate-in fade-in-0 zoom-in-95 duration-300">
      <CardContent className="h-[300px] flex flex-col items-center justify-center gap-6 py-4 pr-16">
        <div className="w-full flex-1 min-h-0 overflow-x-auto">
          <div
            className="grid gap-1 w-full h-full"
            style={{
              gridTemplateColumns: `2.5rem repeat(${visibleHours.length}, minmax(0, 1fr))`,
              gridTemplateRows: `auto repeat(7, 1fr)`
            }}
          >
            <div />
            {visibleHours.map(hour => (
              <div
                key={hour}
                onClick={() => handleHourClick(hour)}
                className="text-xs text-muted-foreground text-center hover:cursor-pointer"
              >
                {hour}
              </div>
            ))}
            {daysOfWeek.map((day, dayIndex) => (
              <Fragment key={day}>
                <div
                  onClick={() => handleDayClick(day)}
                  className="text-xs text-muted-foreground pr-1 flex items-center justify-end hover:cursor-pointer animate-in fade-in-0 slide-in-from-left-1 duration-300"
                  style={{ animationDelay: `${dayIndex * 40}ms`, animationFillMode: "backwards" }}
                >
                  {translateDay(day, t)}
                </div>
                {visibleHours.map(hour => {
                  const cell = cellByKey.get(`${day}-${hour}`)
                  const colorKey = cell?.colorKey
                  const label = colorKey
                    ? `${translateDay(day, t)} ${hour}hs — ${chartConfig[colorKey as keyof typeof chartConfig].label} (${Math.round(cell.totalMinutes)} min)`
                    : `${translateDay(day, t)} ${hour}hs`

                  return (
                    <div
                      key={`${day}-${hour}`}
                      title={label}
                      onClick={colorKey ? () => handleCellClick(colorKey) : undefined}
                      className={`rounded-[3px] bg-gray-100 dark:bg-gray-700 transition-[background-color,opacity] duration-300 ease-out animate-in fade-in-0 duration-300 ${colorKey ? "hover:cursor-pointer hover:scale-110 hover:brightness-110 transition-transform" : ""}`}
                      style={{
                        ...(colorKey ? {
                          backgroundColor: chartConfig[colorKey as keyof typeof chartConfig].color,
                          opacity: getCellOpacity(cell.totalMinutes)
                        } : {}),
                        animationDelay: `${dayIndex * 40}ms`,
                        animationFillMode: "backwards"
                      }}
                    />
                  )
                })}
              </Fragment>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 animate-in fade-in-0 duration-500 delay-300" style={{ animationFillMode: "backwards" }}>
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
