import type { Travel, TravelStats } from "@/types/travel";

import { Loader2 } from "lucide-react";

import { useTravelStats } from "@/hooks/useTravelStats";
import { getHoursAndMinutes } from "@/utils";
import { renderTotalWeightsCell } from "@/utils/weight";

import { renderPointWithCopyBtn } from "./render/coordinates";
import { TableCell, TableFooter, TableRow } from "./ui/table";

type Props = {
  travels: Travel[];
  stats?: TravelStats;
}

const TravelTableFooter = ({ travels, stats: initialStats }: Props) => {
  const { stats, isLoading } = useTravelStats(travels, initialStats);

  const { averageLatitude: totalLat, averageLongitude: totalLong, totalDistance = 0, totalMinutes = 0, placesVisited } = stats || {}

  return (
    <TableFooter>
      <TableRow className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <TableCell className="font-medium text-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            {travels.length} travels
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-500" />}
          </div>
        </TableCell>
        <TableCell className="text-gray-900 dark:text-white" colSpan={2}>
          {isLoading ? "-" : renderPointWithCopyBtn(totalLat, totalLong)}
        </TableCell>
        <TableCell className="font-medium text-gray-900 dark:text-white" colSpan={2}>
          {isLoading ? "-" : `${placesVisited?.count || 0} places`}
        </TableCell>
        <TableCell className="font-medium text-gray-900 dark:text-white">
          {isLoading ? "-" : `${totalDistance?.toFixed(0)} km`}
        </TableCell>
        <TableCell className="font-medium text-gray-900 dark:text-white">
          {isLoading ? "-" : getHoursAndMinutes(totalMinutes)}
        </TableCell>
        <TableCell className="font-medium text-gray-900 dark:text-white">
          {isLoading ? "-" : `${totalMinutes === 0 ? 0 : (totalDistance / (totalMinutes / 60)).toFixed(1)} km/h`}
        </TableCell>
        <TableCell className="text-gray-900 dark:text-white">{renderTotalWeightsCell(travels)}</TableCell>
        <TableCell></TableCell>
      </TableRow>
    </TableFooter>
  )
}

export default TravelTableFooter;