"use client";

import type { CalendarCellBase, CalendarMode, ColorKey } from "@/types/chart";
import type { FilteringData } from "@/types/stats";
import type { Travel } from "@/types/travel";

import { useTranslations } from "next-intl";
import { Fragment, useState } from "react";

import { daysOfWeek } from "@/constants";
import { buildChartConfig, cleanUnusedBorders, getCellOpacity } from "@/utils/chart";
import { DAY_OF_MONTH_RANGES, getDayRangeLabel, translateDay } from "@/utils/date";

import { buildZipcodeLabels, calculateHome, enrichWithFarthestPoint } from "./analize/travel";
import { buildCalendarChartData, buildMonthlyCalendarChartData, calculateBestLocationsByCellDominance, COLOR_KEYS } from "./builders/travelCalendar";
import CalendarModeBtn from "./buttons/CalendarModeBtn";
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

// Both modes share the hour axis, trimmed the same way, so toggling only changes
// what the rows mean and the eye keeps its horizontal reference.
const getVisibleHours = (cells: { hour: string, colorKey: ColorKey | null }[]) => {
  const hourEntries = HOURS.map(hour => ({
    hour,
    empty: !cells.some(cell => cell.hour === hour && cell.colorKey)
  }))

  return cleanUnusedBorders(hourEntries).map(entry => entry.hour)
}

const TravelCalendarStats = ({ travels, onFilter, options }: Props) => {
  const t = useTranslations();
  const [mode, setMode] = useState<CalendarMode>("weekly");

  const home = calculateHome(travels, options)
  const relevantTravels = travels.map(travel => enrichWithFarthestPoint(travel, home))

  // Both modes share this ranking on purpose — see buildChronoCalendarChartData.
  const { topKeys, otherKeys } = calculateBestLocationsByCellDominance(relevantTravels, 5)
  const zipcodeLabels = buildZipcodeLabels(travels)
  const chartConfig = buildChartConfig(topKeys, otherKeys, t("Charts.modes.others"), zipcodeLabels)

  const handleLegendClick = (legendKey: ColorKey) => {
    const colorIndex = COLOR_KEYS.findIndex(key => key === legendKey)
    const zipcodes = colorIndex >= 0 ? [topKeys[colorIndex]] : otherKeys

    onFilter?.({ type: 'zipcode', value: zipcodes })
  }

  const buildWeeklyGrid = () => {
    const cells = buildCalendarChartData(relevantTravels, topKeys)

    return {
      cells,
      rows: daysOfWeek,
      cols: getVisibleHours(cells),
      cellByKey: new Map<string, CalendarCellBase>(cells.map(cell => [`${cell.day}-${cell.hour}`, cell])),
      rowLabel: (day: string) => translateDay(day, t),
      cellLabel: (day: string, hour: string) => `${translateDay(day, t)} ${hour}hs`,
      rowLabelWidth: "2.5rem",
      onCell: (day: string, hour: string) => onFilter?.({ type: 'dayHour', value: { day, hour } }),
      onRow: (day: string) => onFilter?.({ type: 'day', value: day }),
    }
  }

  const buildMonthlyGrid = () => {
    const cells = buildMonthlyCalendarChartData(relevantTravels, topKeys)

    return {
      cells,
      rows: DAY_OF_MONTH_RANGES,
      cols: getVisibleHours(cells),
      cellByKey: new Map<string, CalendarCellBase>(cells.map(cell => [`${cell.dayRange}-${cell.hour}`, cell])),
      rowLabel: getDayRangeLabel,
      cellLabel: (dayRange: string, hour: string) => `${t("Charts.calendar.days", { range: getDayRangeLabel(dayRange) })} ${hour}hs`,
      rowLabelWidth: "3.25rem",
      onCell: (dayRange: string, hour: string) => onFilter?.({ type: 'dayRangeHour', value: { dayRange, hour } }),
      onRow: (dayRange: string) => onFilter?.({ type: 'dayRange', value: dayRange }),
    }
  }

  const grid = mode === "monthly" ? buildMonthlyGrid() : buildWeeklyGrid()

  const renderCell = (row: string, col: string) => {
    const cell = grid.cellByKey.get(`${row}-${col}`)
    const colorKey = cell?.colorKey
    const label = colorKey
      ? `${grid.cellLabel(row, col)} — ${chartConfig[colorKey].label} (${Math.round(cell.totalMinutes)} min)`
      : grid.cellLabel(row, col)

    return (
      <div
        key={`${row}-${col}`}
        title={label}
        onClick={colorKey ? () => grid.onCell(row, col) : undefined}
        className={`rounded-[3px] bg-gray-100 dark:bg-gray-700 ${colorKey ? "hover:cursor-pointer hover:scale-110 hover:brightness-110 transition-transform" : ""}`}
        style={{
          ...(colorKey ? {
            backgroundColor: chartConfig[colorKey].color,
            opacity: getCellOpacity(cell.totalMinutes)
          } : {})
        }}
      />
    )
  }

  const renderRow = (row: string, rowIndex: number) => (
    <Fragment key={row}>
      <div
        onClick={() => grid.onRow(row)}
        className="text-xs text-muted-foreground pr-1 flex items-center justify-end hover:cursor-pointer animate-in fade-in-0 slide-in-from-left-1 duration-300"
        style={{ animationDelay: `${rowIndex * 40}ms`, animationFillMode: "backwards" }}
      >
        {grid.rowLabel(row)}
      </div>
      {grid.cols.map(col => renderCell(row, col))}
    </Fragment>
  )

  return (
    <Card className="relative w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 animate-in fade-in-0 zoom-in-95 duration-300">
      <div className="absolute top-2 left-2 z-10">
        <CalendarModeBtn
          handleClick={() => setMode(current => current === "weekly" ? "monthly" : "weekly")}
          isActive={mode === "monthly"}
        />
      </div>
      <CardContent className="h-[300px] flex flex-col items-center justify-center gap-6 py-4 pr-16">
        <div className="w-full flex-1 min-h-0 overflow-x-auto">
          <div
            className="grid gap-1 w-full h-full"
            style={{
              gridTemplateColumns: `${grid.rowLabelWidth} repeat(${grid.cols.length}, minmax(0, 1fr))`,
              gridTemplateRows: `auto repeat(${grid.rows.length}, 1fr)`
            }}
          >
            <div />
            {grid.cols.map(hour => (
              <div
                key={hour}
                onClick={() => onFilter?.({ type: 'hour', value: hour })}
                className="text-xs text-muted-foreground text-center hover:cursor-pointer"
              >
                {hour}
              </div>
            ))}
            {grid.rows.map((row, rowIndex) => renderRow(row, rowIndex))}
          </div>
        </div>
        <CalendarLegend
          cells={grid.cells}
          chartConfig={chartConfig}
          onLegendClick={handleLegendClick}
        />
      </CardContent>
    </Card>
  )
}

export default TravelCalendarStats;
