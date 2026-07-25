"use client";

import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"
import ArrivalsAction from "@/components/buttons/ArrivalsAction"
import BackAction from "@/components/buttons/BackAction"
import DeparturesAction from "@/components/buttons/DeparturesAction"
import TravelBarStats from "@/components/TravelBarStats"
import TravelTable from "@/components/TravelTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useLocations from "@/hooks/useLocations"
import useTravelFilter from "@/hooks/useTravelFilter"
import useTravels from "@/hooks/useTravels"

type Props = {
  locationId?: string
  action: 'from' | 'to'
}

const LocationCommonViewer = ({ locationId, action }: Props) => {
  const t = useTranslations("Locations")
  const tCommon = useTranslations("Common")
  const { locations, loading } = useLocations()
  const { travels: travelsData } = useTravels('', action === 'from' ? locationId : '', action === 'to' ? locationId : '')
  const { travels, stats } = travelsData
  const { filteredTravels, appliedFilter, onFilter } = useTravelFilter(travels)

  const targetLocation = locations.find(loc => loc._id === locationId)

  const locationName = loading ? tCommon('loading') : targetLocation?.name || t("viewer.unknownLocation")
  const travelField = action === 'from' ? 'origin' : 'destination'
  const travelsLabel = action === 'from' ? t("viewer.travelsFrom") : t("viewer.travelsTo")

  return (
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="space-y-8">
        <div className="hidden lg:flex gap-8">
          <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                <span>{travelsLabel}</span>
                <br />
                <span>{locationName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Link href={'/locations'} >
                  <BackAction />
                </Link>
                <Link href={`/travels/to/${locationId}`} >
                  <ArrivalsAction size="lg" />
                </Link>
                <Link href={`/travels/from/${locationId}`} >
                  <DeparturesAction size="lg" />
                </Link>
              </div>
            </CardContent>
          </Card>
          <TravelBarStats
            travels={filteredTravels}
            onFilter={onFilter}
            options={{ field: travelField, appliedFilter }}
          />
        </div>
        <div className="lg:hidden">
          <span className="text-lg font-bold">{travelsLabel} {locationName}</span>
        </div>
        <TravelTable
          travels={filteredTravels}
          stats={stats}
          source="locationViewer"
          onRemoveFilter={() => onFilter()}
          appliedFilter={appliedFilter}
        />
      </div>
    </main>
  )
}

export default LocationCommonViewer