import type { Travel, TravelStats } from "@/types/travel";

import { getHoursAndMinutes } from "@/utils";
import { renderTotalWeightsCell } from "@/utils/weight";

import { renderPointWithCopyBtn } from "./render/coordinates";
import { TableCell, TableFooter, TableRow } from "./ui/table";

type Props = {
  travels: Travel[];
  stats?: TravelStats;
}

const renderFirstTotalCell = (length: number, uniqueRoutes?: number, uniqueDays?: number) => {
  return (
    <div>
      <p>
        {length} {length === 1 ? "travel" : "travels"}
      </p>
      {uniqueRoutes && <p>
        <span className="text-gray-500 dark:text-gray-400"> {uniqueRoutes} {uniqueRoutes === 1 ? "route" : "routes"}</span>
      </p>}
      {uniqueDays && <p>
        <span className="text-gray-500 dark:text-gray-400"> {uniqueDays} {uniqueDays === 1 ? "day" : "days"}</span>
      </p>}
    </div>
  )
}

const TravelTableFooter = ({ travels, stats }: Props) => {
  const { averageLatitude: totalLat, averageLongitude: totalLong, totalDistance = 0, totalMinutes = 0, placesVisited, uniqueDays, uniqueRoutes } = stats || {}

  return (
    <TableFooter>
      <TableRow className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <TableCell className="font-medium text-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            {renderFirstTotalCell(travels.length, uniqueRoutes, uniqueDays)}
          </div>
        </TableCell>
        <TableCell className="text-gray-900 dark:text-white" colSpan={2}>
          {renderPointWithCopyBtn(totalLat, totalLong)}
        </TableCell>
        <TableCell className="font-medium text-gray-900 dark:text-white" colSpan={2}>
          {`${placesVisited?.count || 0} places`}
        </TableCell>
        <TableCell className="font-medium text-gray-900 dark:text-white">
          {`${totalDistance?.toFixed(0)} km`}
        </TableCell>
        <TableCell className="font-medium text-gray-900 dark:text-white">
          {getHoursAndMinutes(totalMinutes)}
        </TableCell>
        <TableCell className="font-medium text-gray-900 dark:text-white">
          {`${totalMinutes === 0 ? 0 : (totalDistance / (totalMinutes / 60)).toFixed(1)} km/h`}
        </TableCell>
        <TableCell className="text-gray-900 dark:text-white">{renderTotalWeightsCell(travels)}</TableCell>
        <TableCell></TableCell>
      </TableRow>
    </TableFooter>
  )
}

export default TravelTableFooter;