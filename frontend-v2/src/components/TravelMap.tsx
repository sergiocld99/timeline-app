"use client";

import "leaflet/dist/leaflet.css";

import type { Center } from "@/types/map";
import type { Travel, TravelStats } from "@/types/travel";

import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

import useNearbyCenters from "@/hooks/useNearbyCenters";
import { calculateDistanceKm } from "@/utils/units/km";

import { getZoomByDistance } from "./adjust/zoom";
import { getUniqueLocations } from "./analize/travel";
import { defaultMarker } from "./map/icons";
import { renderLocationMarkers } from "./render/map";
import { useTravelStats } from "@/hooks/useTravelStats";

type Props = {
  travels: Travel[];
  isFiltered?: boolean;
};

const DEFAULT_ZOOM = 9
const DEFAULT_LAT = -34.6037031
const DEFAULT_LNG = -58.3816211

const ChangeMapView = ({ center, zoom }: { center: Center, zoom: number }) => {
  const map = useMap(); // Access the map instance

  useEffect(() => {
    map.flyTo(center, zoom); // Use flyTo for smooth animation
  }, [center, map, zoom]); // Re-run when center or zoom changes

  return null;
}

const TravelMap = ({ travels, isFiltered }: Props) => {
  const { stats } = useTravelStats(travels);
  const [mapCenter, setMapCenter] = useState<[number, number]>([DEFAULT_LAT, DEFAULT_LNG])
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)

  const { count, averageLatitude, averageLongitude } = stats || {}
  const nearbyRadius = stats ? (stats.averageDistance * 2) : undefined

  const { nearbyCenters } = useNearbyCenters({ latitude: averageLatitude, longitude: averageLongitude, radiusKm: nearbyRadius })

  // Agrupar coordenadas por ubicación para evitar markers duplicados
  const uniqueLocations = useMemo(() => getUniqueLocations(travels, nearbyCenters), [travels, nearbyCenters]);
  const mostFrequentLocation = uniqueLocations.length > 0 ? uniqueLocations.reduce((max, act) => max.frecuency > act.frecuency ? max : act) : undefined

  // Calcular el centro y zoom para mostrar todos los markers
  useEffect(() => {
    if (count != travels.length) return; // No calcular si los stats están cargando

    if (mostFrequentLocation && averageLatitude && averageLongitude) {
      const [lat1, lng1] = [mostFrequentLocation.lat, mostFrequentLocation.lng]
      const [lat2, lng2] = [averageLatitude, averageLongitude]

      const centerLat = (lat1 + lat2) / 2
      const centerLng = (lng1 + lng2) / 2
      const distanceKm = calculateDistanceKm(lat1, lat2, lng1, lng2)
      const recommendedZoom = getZoomByDistance(distanceKm)
      const adjustedZoom = (isFiltered && count < 5) ? recommendedZoom - 1 : recommendedZoom

      setZoom(adjustedZoom)
      setMapCenter([centerLat, centerLng])
    }
  }, [mostFrequentLocation, averageLatitude, averageLongitude, count])

  useEffect(() => {
    // Asegurar que los iconos por defecto estén configurados
    L.Marker.prototype.options.icon = defaultMarker;
  }, []);

  if (uniqueLocations.length === 0) {
    return (
      <div className="w-2/10 h-87 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No travel locations to display</p>
      </div>
    );
  }

  return (
    <div className="w-2/10 h-87 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChangeMapView center={mapCenter} zoom={zoom} />
        {renderLocationMarkers(uniqueLocations)}
      </MapContainer>
    </div>
  );
};

export default TravelMap;
