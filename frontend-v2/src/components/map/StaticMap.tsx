import type { Travel, TravelStats } from "@/types/travel"

import { useTranslations } from "next-intl"
import { useMemo } from "react"

import useNearbyCenters from "@/hooks/useNearbyCenters"

import { renderLocationMarkers, renderSingleMarker } from "../render/map"
import { getUniqueLocations } from "../analize/travel"

import AverageCircle from "./AverageCircle"
import RecordCircle from "./RecordCircle"

type Props = {
  travels: Travel[]
  stats?: TravelStats
  isFiltered?: boolean
}

const StaticMap = ({ travels, stats, isFiltered }: Props) => {
  const t = useTranslations("TravelMap");

  const { averageLatitude, averageLongitude, averageDistance, records } = stats || {}
  const nearbyRadius = averageDistance ? (averageDistance * 2) : undefined

  const { nearbyCenters } = useNearbyCenters({ latitude: averageLatitude, longitude: averageLongitude, radiusKm: nearbyRadius })
  const uniqueLocations = useMemo(() => getUniqueLocations(travels, nearbyCenters), [travels, nearbyCenters]);

  return (
    <>
      {!!(averageLatitude && averageLongitude && averageDistance) && (
        <AverageCircle lat={averageLatitude} lng={averageLongitude} avgDistance={averageDistance} />
      )}
      {!isFiltered && renderSingleMarker(averageLatitude, averageLongitude)}
      {records?.maxDistance && <RecordCircle record={records.maxDistance} />}
      {renderLocationMarkers(uniqueLocations, t, records?.maxDistance || undefined)}
    </>
  )
}

export default StaticMap