"use client";

import type { CalendarCell, ColorKey } from "@/types/chart";
import type { ChartConfig } from "../ui/chart";

import { buildCellCountByColorKey, buildLegendKeys } from "../builders/travelCalendar";

type Props = {
  cells: CalendarCell[],
  chartConfig: ChartConfig,
  onLegendClick: (legendKey: ColorKey) => void
}

const CalendarLegend = ({ cells, chartConfig, onLegendClick }: Props) => {
  const cellCountByColorKey = buildCellCountByColorKey(cells)
  const legendKeys = buildLegendKeys(cells)

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 animate-in fade-in-0 duration-500 delay-300" style={{ animationFillMode: "backwards" }}>
      {legendKeys.map(key => (
        <div
          key={key}
          onClick={() => onLegendClick(key)}
          className="flex items-center gap-1.5 text-xs text-foreground hover:cursor-pointer transition-colors"
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartConfig[key].color }} />
          {chartConfig[key].label}
          <span className="text-foreground/70">({cellCountByColorKey[key] || 0})</span>
        </div>
      ))}
    </div>
  )
}

export default CalendarLegend;
