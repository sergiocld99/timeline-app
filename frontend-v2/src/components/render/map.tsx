import type { MapLocation } from "@/types/map"

import { Marker, Popup } from "react-leaflet"


import { blackMarker, defaultMarker, greenMarker, redMarker } from "../map/icons"

const getKey = (lat: number, lng: number, index = 0) => {
  return `${lat.toFixed(4)}-${lng.toFixed(4)}-${index}`
}

const createLocationPopupContent = (location: MapLocation) => {
  const title = (location.frecuency > 0 ? `${location.frecuency}x ` : '').concat(location.name)

  return (
    <div className="text-sm">
      <p className="font-semibold">{title}</p>
      {location.lastDate && <p>{location.lastDate}</p>}
      {location.distanceAwayFromAvg && <p>{location.distanceAwayFromAvg.toFixed(1)} km from center</p>}
    </div>
  )
}

const getMarkerIcon = (location: MapLocation) => {
  if (location.isFrequent) {
    return redMarker
  }

  if (location.type === 'visited-nearby') {
    return greenMarker
  }

  if (location.type === 'nearby') {
    return blackMarker
  }

  return defaultMarker
}

export const renderLocationMarkers = (locations: MapLocation[]) => {
  return locations.map((location, index) => {
    const popupContent = createLocationPopupContent(location)
    const icon = getMarkerIcon(location)

    return (
      <Marker
        key={getKey(location.lat, location.lng, index)}
        position={[location.lat, location.lng]}
        icon={icon}
      >
        <Popup>{popupContent}</Popup>
      </Marker>
    );
  })
}

