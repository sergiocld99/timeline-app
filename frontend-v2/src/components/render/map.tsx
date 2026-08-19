import type { TranslationFn } from "@/types/i18n"
import type { MapLocation } from "@/types/map"
import type { TravelRecordItem } from "@/types/travel"

import { Marker, Popup } from "react-leaflet"

import { blackMarker, defaultMarker, greenMarker, orangeMarker, redMarker } from "../map/icons"

const getKey = (lat: number, lng: number, index = 0) => {
  return `${lat.toFixed(4)}-${lng.toFixed(4)}-${index}`
}

const createLocationPopupContent = (location: MapLocation, t: TranslationFn) => {
  const title = (location.frecuency > 0 ? `${location.frecuency}x ` : '').concat(location.name)

  return (
    <div className="text-sm">
      <p className="font-semibold">{title}</p>
      {location.lastDate && <p>{location.lastDate}</p>}
      {location.distanceAwayFromAvg && <p>{t("kmFromCenter", { distance: location.distanceAwayFromAvg.toFixed(1) })}</p>}
    </div>
  )
}

const getMarkerIcon = (location: MapLocation, maxDistance?: TravelRecordItem) => {
  if (location.name === maxDistance?.origin.name || location.name === maxDistance?.destination.name) {
    return redMarker
  }

  if (location.isFrequent) {
    return orangeMarker
  }

  if (location.type === 'visited-nearby') {
    return greenMarker
  }

  if (location.type === 'nearby') {
    return undefined
  }

  return defaultMarker
}

export const renderLocationMarkers = (locations: MapLocation[], t: TranslationFn, maxDistance?: TravelRecordItem) => {
  return locations.map((location, index) => {
    const popupContent = createLocationPopupContent(location, t)
    const icon = getMarkerIcon(location, maxDistance)

    if (!icon) {
      return undefined;
    }

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

export const renderSingleMarker = (x?: number, y?: number, index = 0) => {
  if (!x || !y) return

  return (
    <Marker
      key={getKey(x, y, index)}
      position={[x, y]}
      icon={blackMarker}
    >
      <Popup>
        <div className="text-sm">
          <p>{x.toFixed(4)}, {y.toFixed(4)}</p>
        </div>
      </Popup>
    </Marker>
  )
}