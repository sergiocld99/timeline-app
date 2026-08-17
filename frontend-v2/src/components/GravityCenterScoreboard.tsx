"use client"

import type { KnownCenter } from "@/types/center"
import type { Travel, TravelsData } from "@/types/travel";
import type { Visit, VisitsData } from "@/types/visit";
import type { TranslationFn } from "@/types/i18n";

import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"
import useNearbyCenters from "@/hooks/useNearbyCenters"
import { shortcutName } from "@/utils/strings"

import { Card, CardContent } from "./ui/card"
import { PointWithCopyBtn } from "./render/coordinates";

type Props = {
  travelsData?: TravelsData
  visitsData?: VisitsData
  isFiltered?: boolean
}

const renderNearbyCenter = (kc: KnownCenter, index: number, travels: Travel[], visits: Visit[], t: TranslationFn) => {
  const rank = index + 1
  const distanceFormatted = kc.distanceKm.toFixed(1)

  // Check if the location is active (present in travel table)
  const isActive = travels.some(
    (travel) => travel.origin._id === kc._id || travel.destination._id === kc._id
  ) || visits.some(v => v.location._id === kc._id)

  let classNames = "mb-4 last:mb-0"

  if (!isActive) {
    classNames += " opacity-50"
  } else if (rank <= 3) {
    classNames += " text-yellow-300"
  }

  return (
    <Link href={'/travels/to/' + kc._id} target="_blank" className={classNames} key={kc.zipcode.concat(index.toString())}>
      <div className="flex items-baseline gap-2">
        <span className="font-bold">#{rank}</span>
        <span className="font-bold">{shortcutName(kc.name, 24)}</span>
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        {kc.zipcode} - {t("away", { distance: distanceFormatted })}
      </div>
    </Link>
  )
}

const GravityCenterScoreboard = ({ travelsData, visitsData, isFiltered }: Props) => {
  const t = useTranslations("Visits")
  const { averageLatitude, averageLongitude } = travelsData?.stats || visitsData?.stats || {}
  const travels = travelsData?.travels || []
  const visits = visitsData?.visits || []
  const nearbyRadius = travels.length < 1 ? undefined : (travelsData!.stats!.averageDistance * 2)

  const { nearbyCenters } = useNearbyCenters({ latitude: averageLatitude, longitude: averageLongitude, radiusKm: nearbyRadius })

  const renderGlobalCenter = (averageLatitude?: number, averageLongitude?: number) => (
    <div className="mb-6 last:mb-0">
      <span className="font-medium text-gray-900 dark:text-white">
        <PointWithCopyBtn latitude={averageLatitude} longitude={averageLongitude} />
      </span>
    </div>
  )

  return (
    <Card className="w-2/10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="h-[300px] flex flex-col items-start justify-center p-6">
        {isFiltered ? undefined : renderGlobalCenter(averageLatitude, averageLongitude)}
        {nearbyCenters.length > 0 && nearbyCenters.slice(0, isFiltered ? 5 : 4).map((nc, index) =>
          renderNearbyCenter(nc, index, travels, visits, t))
        }
      </CardContent>
    </Card>
  )
}

export default GravityCenterScoreboard