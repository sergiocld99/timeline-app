"use client";

import "leaflet/dist/leaflet.css";

import type { Travel, TravelStats } from "@/types/travel";

import L from "leaflet";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";

import { defaultMarker } from "./map/icons";
import { useViewPoint } from "./map/useViewPoint";
import AnimatedMap from "./map/AnimatedMap";
import ChangeMapView from "./map/ChangeMapView";
import StaticMap from "./map/StaticMap";

type Props = {
  travels: Travel[];
  isFiltered?: boolean;
  stats?: TravelStats;
  isAnimating?: boolean;
};

const TravelMap = ({ travels, isFiltered, stats, isAnimating }: Props) => {
  const t = useTranslations("TravelMap");

  const { count = 0 } = stats || {}
  const { zoom, mapCenter } = useViewPoint({ travels, count, isFiltered })

  useEffect(() => {
    L.Marker.prototype.options.icon = defaultMarker;
  }, []);

  if (travels.length === 0) {
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
          <AnimatedMap travels={travels} isAnimating zoom={zoom} />
        ) : (
          <>
            <ChangeMapView center={mapCenter} zoom={zoom} />
            <StaticMap travels={travels} stats={stats} isFiltered={isFiltered} />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default TravelMap;
