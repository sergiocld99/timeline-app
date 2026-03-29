"use client";

import Link from "next/link"

import ArrivalsAction from "@/components/buttons/ArrivalsAction"
import BackAction from "@/components/buttons/BackAction"
import DeparturesAction from "@/components/buttons/DeparturesAction"
import TravelBarStats from "@/components/TravelBarStats"
import TravelTable from "@/components/TravelTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useLocations from "@/hooks/useLocations"
import useTravels from "@/hooks/useTravels"

type Props = {
  locationId?: string
  action: 'from' | 'to'
}

const LocationCommonViewer = ({ locationId, action }: Props) => {
  const { locations, loading } = useLocations()
  const { travels: travelsData } = useTravels('', action === 'from' ? locationId : '', action === 'to' ? locationId : '')
  const { travels, stats } = travelsData

  const targetLocation = locations.find(loc => loc._id === locationId)

  const locationName = loading ? 'Loading...' : targetLocation?.name || `Unknown location`
  const travelField = action === 'from' ? 'origin' : 'destination'

  return (
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="space-y-8">
        <div className="flex gap-8">
          <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                <span>Travels {action}</span>
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
          <TravelBarStats travels={travels} options={{ field: travelField }} onFilter={() => { }} />
        </div>
        <TravelTable travels={travels} stats={stats} />
      </div>
    </main>
  )
}

export default LocationCommonViewer