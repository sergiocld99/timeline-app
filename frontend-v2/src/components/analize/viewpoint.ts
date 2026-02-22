import type { Center, GravityCenter, MapLocation } from "@/types/map";

import { calculateDistanceKm } from "@/utils/units/km";

import { getZoomByDistance } from "../adjust/zoom";

type ViewpointParams = {
  mostFrequentLocation?: MapLocation;
  gravityCenter: GravityCenter
  isStronglyFiltered?: boolean;
};

/**
 * TODO: [CSAPP-22] Mover esta lógica al backend/microservicio de estadísticas.
 * Debería venir pre-calculado dentro del objeto TravelStats como MapConfig.
 */
export const calculateViewpoint = ({
  mostFrequentLocation,
  gravityCenter,
  isStronglyFiltered,
}: ViewpointParams) => {
  if (!mostFrequentLocation || !gravityCenter.lat || !gravityCenter.lng) {
    return null;
  }

  const [lat1, lng1] = [mostFrequentLocation.lat, mostFrequentLocation.lng];
  const [lat2, lng2] = [gravityCenter.lat, gravityCenter.lng];

  const centerLat = (lat1 + lat2) / 2;
  const centerLng = (lng1 + lng2) / 2;
  const distanceKm = calculateDistanceKm(lat1, lat2, lng1, lng2);
  const recommendedZoom = getZoomByDistance(distanceKm);
  const zoom = isStronglyFiltered ? recommendedZoom - 1 : recommendedZoom;

  return {
    center: [centerLat, centerLng] as Center,
    zoom,
  };
};
