import { getHoursAndMinutes } from "@/utils";
import { renderPointWithCopyBtn } from "./render/coordinates";
import { TableCell, TableFooter, TableRow } from "./ui/table";
import { renderTotalWeightsCell } from "@/utils/weight";
import { Travel, TravelStats } from "@/types/travel";

type Props = {
  travels: Travel[];
  stats?: TravelStats;
}

const recalculateStats = (travels: Travel[]): Partial<TravelStats> => {
  const sumLat1 = travels.reduce((sum, act) => act.origin.latitude + sum, 0)
  const sumLat2 = travels.reduce((sum, act) => act.destination.latitude + sum, 0)

  const sumLng1 = travels.reduce((sum, act) => act.origin.longitude + sum, 0)
  const sumLng2 = travels.reduce((sum, act) => act.destination.longitude + sum, 0)

  const setOfVisits = new Set()

  travels.forEach(t => {
    setOfVisits.add(t.origin.zipcode)
    setOfVisits.add(t.destination.zipcode)
  })

  return {
    count: travels.length,
    averageLatitude: (sumLat1 + sumLat2) / (travels.length * 2),
    averageLongitude: (sumLng1 + sumLng2) / (travels.length * 2),
    totalDistance: travels.reduce((sum, act) => act.distance + sum, 0),
    totalMinutes: travels.reduce((sum ,act) => act.duration + sum, 0),
    placesVisited: { count: setOfVisits.size }
  }
}

const TravelTableFooter = ({ travels, stats }: Props) => {
  const isFiltered = travels.length !== stats?.count;
  const fixedStats = isFiltered ? recalculateStats(travels) : (stats || {});

  const { count, averageLatitude: totalLat, averageLongitude: totalLong, totalDistance = 0, totalMinutes = 0, placesVisited } = fixedStats || {}

  return (
    <TableFooter>
      <TableRow className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <TableCell className="font-medium text-gray-900 dark:text-white">{count} travels</TableCell>
        <TableCell className="text-gray-900 dark:text-white" colSpan={2}>{renderPointWithCopyBtn(totalLat, totalLong)}</TableCell>
        <TableCell className="font-medium text-gray-900 dark:text-white" colSpan={2}>{placesVisited?.count || 0} places</TableCell>
        <TableCell className="font-medium text-gray-900 dark:text-white">{totalDistance?.toFixed(0)} km</TableCell>
        <TableCell className="font-medium text-gray-900 dark:text-white">{getHoursAndMinutes(totalMinutes)}</TableCell>
        <TableCell className="font-medium text-gray-900 dark:text-white">
          {totalMinutes === 0 ? 0 : (totalDistance / (totalMinutes / 60)).toFixed(1)} km/h
        </TableCell>
        <TableCell className="text-gray-900 dark:text-white">{renderTotalWeightsCell(travels)}</TableCell>
        <TableCell></TableCell>
      </TableRow>
    </TableFooter>
  )
}

export default TravelTableFooter;