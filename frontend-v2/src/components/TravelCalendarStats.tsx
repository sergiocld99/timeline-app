"use client";

import type { FilteringData } from "@/types/stats";
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
  onFilter?: (data: FilteringData) => void,
  options?: {
    backendHome?: string,
    appliedFilter?: string | null
  }
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
const FULL_OPACITY_MINUTES = 60

const TravelCalendarStats = ({ travels, onFilter, options }: Props) => {
  const t = useTranslations();
  const home = calculateHome(travels, options)
  const relevantTravels = travels.map(travel => enrichWithFarthestPoint(travel, home))

  const { topKeys, otherKeys } = calculateBestLocations(relevantTravels, 5)
  const chartConfig = buildChartConfig(topKeys, otherKeys, t("Charts.modes.others"))
  const cells = buildCalendarChartData(relevantTravels, topKeys)
  const cellByKey = new Map(cells.map(cell => [`${cell.day}-${cell.hour}`, cell]))

  const getCellOpacity = (totalMinutes: number) => {
    const ratio = Math.min(totalMinutes / FULL_OPACITY_MINUTES, 1)
    return 0.4 + ratio * 0.6
  }

  const colorKeys: (keyof typeof chartConfig)[] = ['red', 'orange', 'yellow', 'green', 'blue']
  const presentColorKeys = new Set(cells.map(cell => cell.colorKey).filter((key): key is string => Boolean(key)))
  const legendKeys: (keyof typeof chartConfig)[] = colorKeys
    .filter(key => presentColorKeys.has(key))
    .concat(presentColorKeys.has('others') ? ['others'] : [])

  const handleCellClick = (day: string, hour: string) => onFilter?.({ type: 'dayHour', value: { day, hour } })

  const handleDayClick = (day: string) => onFilter?.({ type: 'day', value: day })
  const handleHourClick = (hour: string) => onFilter?.({ type: 'hour', value: hour })

  const handleLegendClick = (legendKey: string) => {
    const colorIndex = colorKeys.indexOf(legendKey as keyof typeof chartConfig)
    const zipcodes = colorIndex >= 0 ? [topKeys[colorIndex]] : otherKeys

    onFilter?.({ type: 'zipcode', value: zipcodes })
  }

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 animate-in fade-in-0 zoom-in-95 duration-300">
      <CardContent className="h-[300px] flex flex-col items-center justify-center gap-6 py-4 pr-16">
        <div className="w-full flex-1 min-h-0 overflow-x-auto">
          <div
            className="grid gap-1 w-full h-full"
            style={{
              gridTemplateColumns: `2.5rem repeat(${HOURS.length}, minmax(0, 1fr))`,
              gridTemplateRows: `auto repeat(7, 1fr)`
            }}
          >
            <div />
            {HOURS.map(hour => (
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
                      onClick={colorKey ? () => handleCellClick(day, hour) : undefined}
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
            <div
              key={key}
              onClick={() => handleLegendClick(key)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:cursor-pointer hover:text-foreground transition-colors"
            >
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
