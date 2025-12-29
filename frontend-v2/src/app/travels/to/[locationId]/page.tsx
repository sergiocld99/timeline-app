"use client"

import { Usable, use } from "react"
import LocationCommonViewer from "../../commonViewer"

type Props = {
  params: Usable<{
    locationId: string,
  }>
}

const LocationViewerPage = ({ params }: Props) => {
  const { locationId } = use(params)

  return (
    <LocationCommonViewer locationId={locationId} action="to" />
  )
}

export default LocationViewerPage