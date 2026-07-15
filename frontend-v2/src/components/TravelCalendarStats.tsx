"use client";

import type { FilteringData } from "@/types/stats";
import type { Travel } from "@/types/travel";

import { useTranslations } from "next-intl";
import { Fragment } from "react";

import { daysOfWeek } from "@/constants";
import { buildChartConfig, cleanUnusedBorders, getCellOpacity } from "@/utils/chart";
import { translateDay } from "@/utils/date";

import { calculateHome, enrichWithFarthestPoint } from "./analize/travel";
import { buildCalendarChartData, calculateBestLocationsByCellDominance, COLOR_KEYS } from "./builders/travelCalendar";
import CalendarLegend from "./CalendarLegend";
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

  const { topKeys, otherKeys } = calculateBestLocationsByCellDominance(relevantTravels, 5)
  const chartConfig = buildChartConfig(topKeys, otherKeys, t("Charts.modes.others"))
  const cells = buildCalendarChartData(relevantTravels, topKeys)
  const cellByKey = new Map(cells.map(cell => [`${cell.day}-${cell.hour}`, cell]))

  const hourEntries = HOURS.map(hour => ({
    hour,
    empty: !cells.some(cell => cell.hour === hour && cell.colorKey)
  }))
  const visibleHours = cleanUnusedBorders(hourEntries).map(entry => entry.hour)

  const handleCellClick = (day: string, hour: string) => onFilter?.({ type: 'dayHour', value: { day, hour } })
  const handleDayClick = (day: string) => onFilter?.({ type: 'day', value: day })
  const handleHourClick = (hour: string) => onFilter?.({ type: 'hour', value: hour })

  const handleLegendClick = (legendKey: string) => {
    const colorIndex = COLOR_KEYS.indexOf(legendKey as typeof COLOR_KEYS[number])
    const zipcodes = colorIndex >= 0 ? [topKeys[colorIndex]] : otherKeys

    onFilter?.({ type: 'zipcode', value: zipcodes })
  }

  const renderCell = (day: string, hour: string) => {
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
        className={`rounded-[3px] bg-gray-100 dark:bg-gray-700 ${colorKey ? "hover:cursor-pointer hover:scale-110 hover:brightness-110 transition-transform" : ""}`}
        style={{
          ...(colorKey ? {
            backgroundColor: chartConfig[colorKey as keyof typeof chartConfig].color,
            opacity: getCellOpacity(cell.totalMinutes)
          } : {})
        }}
      />
    )
  }

  const renderDayOfWeek = (day: string, dayIndex: number) => (
    <Fragment key={day}>
      <div
        onClick={() => handleDayClick(day)}
        className="text-xs text-muted-foreground pr-1 flex items-center justify-end hover:cursor-pointer animate-in fade-in-0 slide-in-from-left-1 duration-300"
        style={{ animationDelay: `${dayIndex * 40}ms`, animationFillMode: "backwards" }}
      >
        {translateDay(day, t)}
      </div>
      {visibleHours.map(hour => renderCell(day, hour))}
    </Fragment>
  )

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
            {daysOfWeek.map((day, dayIndex) => renderDayOfWeek(day, dayIndex))}
          </div>
        </div>
        <CalendarLegend
          cells={cells}
          chartConfig={chartConfig}
          onLegendClick={handleLegendClick}
        />
      </CardContent>
    </Card>
  )
}

export default TravelCalendarStats;
