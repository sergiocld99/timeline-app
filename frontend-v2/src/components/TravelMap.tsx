"use client";

import "leaflet/dist/leaflet.css";

import type { Travel, TravelStats } from "@/types/travel";

import L from "leaflet";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer } from "react-leaflet";

import useNearbyCenters from "@/hooks/useNearbyCenters";

import { renderLocationMarkers, renderSingleMarker } from "./render/map";
import { getUniqueLocations } from "./analize/travel";
import { defaultMarker } from "./map/icons";
import { useViewPoint } from "./map/useViewPoint";
import AnimatedMap from "./map/AnimatedMap";
import AverageCircle from "./map/AverageCircle";
import ChangeMapView from "./map/ChangeMapView";
import RecordCircle from "./map/RecordCircle";

type Props = {
  travels: Travel[];
  isFiltered?: boolean;
  stats?: TravelStats;
  isAnimating?: boolean;
};

const TravelMap = ({ travels, isFiltered, stats, isAnimating }: Props) => {
  const t = useTranslations("TravelMap");

  const { count = 0, averageLatitude, averageLongitude, averageDistance, records } = stats || {}
  const nearbyRadius = averageDistance ? (averageDistance * 2) : undefined

  const { nearbyCenters } = useNearbyCenters({ latitude: averageLatitude, longitude: averageLongitude, radiusKm: nearbyRadius })
  const uniqueLocations = useMemo(() => getUniqueLocations(travels, nearbyCenters), [travels, nearbyCenters]);

  const { zoom, mapCenter } = useViewPoint({ travels, count, isFiltered })

  useEffect(() => {
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
      {isAnimating && <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } }`}</style>}

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

        {isAnimating ? (
          <AnimatedMap travels={travels} isAnimating />
        ) : (
          <>
            <ChangeMapView center={mapCenter} zoom={zoom} />
            {!!(averageLatitude && averageLongitude && averageDistance) && (
              <AverageCircle lat={averageLatitude} lng={averageLongitude} avgDistance={averageDistance} />
            )}
            {!isFiltered && renderSingleMarker(averageLatitude, averageLongitude)}
            {records?.maxDistance &&  <RecordCircle record={records.maxDistance} />}
            {renderLocationMarkers(uniqueLocations, t, records?.maxDistance || undefined)}
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default TravelMap;
