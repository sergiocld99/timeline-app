import type { Travel, TravelStats } from "@/types/travel";

import { useTranslations } from "next-intl";

import { getHoursAndMinutes } from "@/utils";
import { renderTotalWeightsCell } from "@/utils/weight";
import { cn } from "@/lib/utils";

import { PointWithCopyBtn } from "./render/coordinates";
import { TableCell, TableFooter, TableRow } from "./ui/table";

type Props = {
  travels: Travel[];
  stats?: TravelStats;
  isGold?: boolean;
}

const TravelTableFooter = ({ travels, stats, isGold }: Props) => {
  const t = useTranslations("Travels.footer");
  const { averageLatitude: totalLat, averageLongitude: totalLong, totalDistance = 0, totalMinutes = 0, placesVisited, uniqueDays, uniqueRoutes } = stats || {}

  const renderFirstTotalCell = (length: number, routesCount?: number, daysCount?: number) => {
    return (
      <div>
        <p>
          {t("travelsCount", { count: length })}
        </p>
        {routesCount && <p>
          <span className="text-gray-500 dark:text-gray-400"> {t("routesCount", { count: routesCount })}</span>
        </p>}
        {daysCount && <p>
          <span className="text-gray-500 dark:text-gray-400"> {t("daysCount", { count: daysCount })}</span>
        </p>}
      </div>
    )
  }

  const showTooltip = !!(placesVisited && placesVisited.count <= 14 && placesVisited.zipcodes.length);
  const tooltipText = showTooltip ? placesVisited.zipcodes.sort().join(", ") : undefined;

  return (
    <TableFooter>
      <TableRow className={cn(
        "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800",
        isGold && "bg-amber-100/30 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
      )}>
        <TableCell className="font-medium text-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            {renderFirstTotalCell(travels.length, uniqueRoutes, uniqueDays)}
          </div>
        </TableCell>
        <TableCell className="text-gray-900 dark:text-white" colSpan={2}>
          <PointWithCopyBtn latitude={totalLat} longitude={totalLong} />
        </TableCell>
        <TableCell className="font-medium text-gray-900 dark:text-white" colSpan={2} title={tooltipText}>
          <span className={showTooltip ? "cursor-help border-b border-dotted border-gray-400 dark:border-gray-500" : ""}>
            {t("placesCount", { count: placesVisited?.count || 0 })}
          </span>
        </TableCell>
        <TableCell className="font-medium text-gray-900 dark:text-white">
          {`${totalDistance?.toFixed(0)} km`}
        </TableCell>
        <TableCell className="font-medium text-gray-900 dark:text-white">
          {getHoursAndMinutes(totalMinutes)}
        </TableCell>
        <TableCell className="text-gray-900 dark:text-white">{renderTotalWeightsCell(travels)}</TableCell>
        <TableCell></TableCell>
      </TableRow>
    </TableFooter>
  )
}

export default TravelTableFooter;