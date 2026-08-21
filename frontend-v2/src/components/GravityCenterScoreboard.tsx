"use client"

import type { KnownCenter } from "@/types/center"
import type { VisitsData } from "@/types/visit";
import type { TranslationFn } from "@/types/i18n";

import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"
import useNearbyCenters from "@/hooks/useNearbyCenters"
import { shortcutName } from "@/utils/strings"

import { Card, CardContent } from "./ui/card"
import { PointWithCopyBtn } from "./render/coordinates";

type Props = {
  visitsData?: VisitsData
  isFiltered?: boolean
}

const renderNearbyCenter = (kc: KnownCenter, index: number, t: TranslationFn) => {
  const rank = index + 1
  const distanceFormatted = kc.distanceKm.toFixed(1)

  let classNames = "mb-4 last:mb-0"

  if (!kc.isActive) {
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

const GravityCenterScoreboard = ({ visitsData, isFiltered }: Props) => {
  const t = useTranslations("Visits")
  const { averageLatitude, averageLongitude } = visitsData?.stats || {}
  const visits = visitsData?.visits || []

  const { nearbyCenters } = useNearbyCenters({ latitude: averageLatitude, longitude: averageLongitude, visits })

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
          renderNearbyCenter(nc, index, t))
        }
      </CardContent>
    </Card>
  )
}

export default GravityCenterScoreboard