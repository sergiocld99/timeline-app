"use client";

import "leaflet/dist/leaflet.css";

import type { Center } from "@/types/map";
import type { Travel, TravelStats } from "@/types/travel";

import L from "leaflet";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, useMap, Circle } from "react-leaflet";

import useNearbyCenters from "@/hooks/useNearbyCenters";
import { useMapConfig } from "@/hooks/useMapConfig";
import { calculateCenter } from "@/utils/location";

import { getUniqueLocations } from "./analize/travel";
import { defaultMarker } from "./map/icons";
import { renderLocationMarkers } from "./render/map";

type Props = {
  travels: Travel[];
  isFiltered?: boolean;
  stats?: TravelStats;
};

const DEFAULT_ZOOM = 9
const DEFAULT_LAT = -34.6037031
const DEFAULT_LNG = -58.3816211
const COLOR_LIGHT_BLUE = "#3b82f6"
const COLOR_RED = "#FF0000"

const ChangeMapView = ({ center, zoom }: { center: Center, zoom: number }) => {
  const map = useMap(); // Access the map instance

  useEffect(() => {
    map.flyTo(center, zoom); // Use flyTo for smooth animation
  }, [center, map, zoom]); // Re-run when center or zoom changes

  return null;
}

const TravelMap = ({ travels, isFiltered, stats }: Props) => {
  const t = useTranslations("TravelMap");
  const { mapConfig } = useMapConfig(travels);
  const [mapCenter, setMapCenter] = useState<[number, number]>([DEFAULT_LAT, DEFAULT_LNG])
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)

  const { count = 0, averageLatitude, averageLongitude, averageDistance, records } = stats || {}
  const nearbyRadius = averageDistance ? (averageDistance * 2) : undefined

  // Auxiliar variables
  const isStronglyFiltered = isFiltered && count < 5

  const { nearbyCenters } = useNearbyCenters({ latitude: averageLatitude, longitude: averageLongitude, radiusKm: nearbyRadius })

  // Agrupar coordenadas por ubicación para evitar markers duplicados
  const uniqueLocations = useMemo(() => getUniqueLocations(travels, nearbyCenters), [travels, nearbyCenters]);

  // Calcular el centro y zoom para mostrar todos los markers (CSAPP-22)
  const viewpoint = useMemo(() => {
    if (!mapConfig) return null;

    return {
      center: mapConfig.center,
      zoom: isStronglyFiltered ? mapConfig.zoom - 1 : mapConfig.zoom
    };
  }, [mapConfig, isStronglyFiltered]);

  useEffect(() => {
    if (viewpoint) {
      setZoom(viewpoint.zoom);
      setMapCenter(viewpoint.center);
    }
  }, [viewpoint]);

  useEffect(() => {
    // Asegurar que los iconos por defecto estén configurados
    L.Marker.prototype.options.icon = defaultMarker;
  }, []);

  if (uniqueLocations.length === 0) {
    return (
      <div className="w-2/10 h-87 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">{t("noLocations")}</p>
      </div>
    );
  }

  return (
    <div className="w-2/10 h-87 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative z-0">
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
        {averageLatitude && averageLongitude && averageDistance && (
          <Circle
            center={[averageLatitude, averageLongitude]}
            radius={averageDistance * 1000}
            pathOptions={{
              color: COLOR_LIGHT_BLUE,
              fillColor: COLOR_LIGHT_BLUE,
              fillOpacity: 0.15,
              weight: 2,
              dashArray: "5, 5"
            }}
          />
        )}
        {records?.maxDistance && (
          <Circle
          center={calculateCenter(records.maxDistance.origin, records.maxDistance.destination)}
          radius={records.maxDistance.value * 500}
          pathOptions={{
            color: COLOR_RED,
            fill: false,
            weight: 2,
            dashArray: "5, 5"
          }}
        />
        )}
        {renderLocationMarkers(uniqueLocations, t, records?.maxDistance || undefined)}
      </MapContainer>
    </div>
  );
};

export default TravelMap;
