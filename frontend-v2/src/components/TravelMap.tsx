"use client";

import "leaflet/dist/leaflet.css";

import type { AnimationSegment, AnimationState } from "@/types/animated-timeline";
import type { Center } from "@/types/map";
import type { Travel, TravelStats } from "@/types/travel";
import type { WeightColors } from "@/types/commons";

import L from "leaflet";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, Circle, Marker } from "react-leaflet";

import useNearbyCenters from "@/hooks/useNearbyCenters";
import { useMapConfig } from "@/hooks/useMapConfig";
import { calculateCenter } from "@/utils/location";

import { getUniqueLocations } from "./analize/travel";
import { defaultMarker } from "./map/icons";
import { renderLocationMarkers, renderSingleMarker } from "./render/map";

type Props = {
  travels: Travel[];
  isFiltered?: boolean;
  stats?: TravelStats;
  isAnimating?: boolean;
};

const DEFAULT_ZOOM = 9
const DEFAULT_LAT = -34.6037031
const DEFAULT_LNG = -58.3816211
const COLOR_LIGHT_BLUE = "#3b82f6"
const COLOR_RED = "#FF0000"
const ANIMATION_SPEED_KM_PER_MS = 0.015
const MAX_FRAME_MS = 1000 / 30

const WEIGHT_COLOR_MAP: Record<WeightColors, string> = {
  "🟣": "#8b5cf6",
  "🔴": "#ef4444",
  "🟠": "#f97316",
  "🟡": "#eab308",
  "🟢": "#22c55e",
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371
  const dLat = ((b[0] - a[0]) * Math.PI) / 180
  const dLng = ((b[1] - a[1]) * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) *
      Math.cos((b[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function buildSegments(travels: Travel[]): AnimationSegment[] {
  return travels
    .filter(
      (t) =>
        t.origin?.latitude != null &&
        t.origin?.longitude != null &&
        t.destination?.latitude != null &&
        t.destination?.longitude != null,
    )
    .reverse()
    .map((travel, index) => {
      const from: [number, number] = [travel.origin.latitude, travel.origin.longitude]
      const to: [number, number] = [travel.destination.latitude, travel.destination.longitude]
      const color = WEIGHT_COLOR_MAP[travel.weight.color] ?? "#3b82f6"
      return { index, from, to, travel, distanceKm: haversineKm(from, to), color }
    })
}

function interpolatePosition(
  segments: AnimationSegment[],
  segIdx: number,
  frac: number,
): [number, number] {
  if (segments.length === 0) return [DEFAULT_LAT, DEFAULT_LNG]
  const clamped = Math.min(segIdx, segments.length - 1)
  const seg = segments[clamped]
  const f = clamped === segIdx ? frac : 1
  return [
    seg.from[0] + (seg.to[0] - seg.from[0]) * f,
    seg.from[1] + (seg.to[1] - seg.from[1]) * f,
  ]
}

const pulsingIcon = L.divIcon({
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 8px rgba(59,130,246,0.6);animation:pulse 1.5s ease-in-out infinite"></div>',
})

const PolylineLayer = ({
  segments,
  segmentIndex,
  segmentFraction,
}: {
  segments: AnimationSegment[]
  segmentIndex: number
  segmentFraction: number
}) => {
  const map = useMap()
  const completedLayersRef = useRef<L.Polyline[]>([])
  const activeLayerRef = useRef<L.Polyline | null>(null)

  useEffect(() => {
    const completed = completedLayersRef.current
    const toRemove = completed.length - segmentIndex
    if (toRemove > 0) {
      for (let i = completed.length - 1; i >= segmentIndex; i--) {
        map.removeLayer(completed[i])
        completed.pop()
      }
    }

    for (let i = completed.length; i < segmentIndex && i < segments.length; i++) {
      const seg = segments[i]
      const line = L.polyline([seg.from, seg.to], {
        color: seg.color,
        weight: 3,
        opacity: 0.7,
      })
      line.addTo(map)
      completed.push(line)
    }
  }, [map, segments, segmentIndex])

  useEffect(() => {
    if (segmentIndex >= segments.length) return
    const seg = segments[segmentIndex]
    const from = seg.from
    const to: [number, number] = [
      from[0] + (seg.to[0] - from[0]) * segmentFraction,
      from[1] + (seg.to[1] - from[1]) * segmentFraction,
    ]

    if (activeLayerRef.current) {
      activeLayerRef.current.setLatLngs([from, to])
      activeLayerRef.current.setStyle({ color: seg.color })
    } else {
      activeLayerRef.current = L.polyline([from, to], {
        color: seg.color,
        weight: 4,
        opacity: 0.9,
      }).addTo(map)
    }

    return () => {
      if (activeLayerRef.current) {
        map.removeLayer(activeLayerRef.current)
        activeLayerRef.current = null
      }
    }
  }, [map, segments, segmentIndex, segmentFraction])

  useEffect(() => {
    return () => {
      completedLayersRef.current.forEach((layer) => map.removeLayer(layer))
      completedLayersRef.current = []
      if (activeLayerRef.current) {
        map.removeLayer(activeLayerRef.current)
        activeLayerRef.current = null
      }
    }
  }, [map])

  return null
}

const CameraFollow = ({ position }: { position: [number, number] | null }) => {
  const map = useMap()
  const lastPanRef = useRef(0)

  useEffect(() => {
    if (!position) return
    const now = Date.now()
    if (now - lastPanRef.current < 80) return
    lastPanRef.current = now
    map.panTo(position, { animate: true, duration: 0.3 })
  }, [map, position])

  return null
}

const ChangeMapView = ({ center, zoom }: { center: Center, zoom: number }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, map, zoom]);

  return null;
}

const TravelMap = ({ travels, isFiltered, stats, isAnimating }: Props) => {
  const t = useTranslations("TravelMap");
  const { mapConfig } = useMapConfig(travels);
  const [mapCenter, setMapCenter] = useState<[number, number]>([DEFAULT_LAT, DEFAULT_LNG])
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)

  const { count = 0, averageLatitude, averageLongitude, averageDistance, records } = stats || {}
  const nearbyRadius = averageDistance ? (averageDistance * 2) : undefined

  const isStronglyFiltered = isFiltered && count < 5

  const { nearbyCenters } = useNearbyCenters({ latitude: averageLatitude, longitude: averageLongitude, radiusKm: nearbyRadius })

  const uniqueLocations = useMemo(() => getUniqueLocations(travels, nearbyCenters), [travels, nearbyCenters]);

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
    L.Marker.prototype.options.icon = defaultMarker;
  }, []);

  const segments = useMemo(() => (isAnimating ? buildSegments(travels) : []), [travels, isAnimating])
  const totalDistance = useMemo(
    () => segments.reduce((sum, s) => sum + s.distanceKm, 0),
    [segments],
  )

  const [animPosition, setAnimPosition] = useState<[number, number]>([DEFAULT_LAT, DEFAULT_LNG])
  const [animState, setAnimState] = useState<AnimationState>({
    currentSegmentIndex: 0,
    segmentFraction: 0,
    overallProgress: 0,
  })

  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const segmentIndexRef = useRef(0)
  const segmentFractionRef = useRef(0)
  const tickRef = useRef<(ts: number) => void>(() => {})

  const tick = useCallback(
    (timestamp: number) => {
      if (segments.length === 0) return
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp
        rafRef.current = requestAnimationFrame(tickRef.current)
        return
      }

      const delta = Math.min(timestamp - lastTimeRef.current, MAX_FRAME_MS)
      lastTimeRef.current = timestamp

      if (delta > 0 && totalDistance > 0) {
        const seg = segments[segmentIndexRef.current]
        if (!seg) {
          segmentIndexRef.current = 0
          segmentFractionRef.current = 0
          setAnimPosition(interpolatePosition(segments, 0, 0))
          setAnimState({ currentSegmentIndex: 0, segmentFraction: 0, overallProgress: 0 })
          rafRef.current = requestAnimationFrame(tickRef.current)
          return
        }

        const segDuration = seg.distanceKm / ANIMATION_SPEED_KM_PER_MS
        const advanceFraction = segDuration > 0 ? delta / segDuration : 1
        segmentFractionRef.current += advanceFraction

        while (segmentFractionRef.current >= 1 && segmentIndexRef.current < segments.length - 1) {
          segmentFractionRef.current -= 1
          segmentIndexRef.current += 1
        }

        if (segmentIndexRef.current >= segments.length - 1 && segmentFractionRef.current >= 1) {
          segmentIndexRef.current = 0
          segmentFractionRef.current = 0
          setAnimPosition(interpolatePosition(segments, 0, 0))
          setAnimState({ currentSegmentIndex: 0, segmentFraction: 0, overallProgress: 0 })
          rafRef.current = requestAnimationFrame(tickRef.current)
          return
        }

        const pos = interpolatePosition(segments, segmentIndexRef.current, segmentFractionRef.current)
        setAnimPosition(pos)

        let overallProgress = 0
        for (let i = 0; i < segmentIndexRef.current && i < segments.length; i++) {
          overallProgress += segments[i].distanceKm
        }
        if (segmentIndexRef.current < segments.length) {
          overallProgress += segments[segmentIndexRef.current].distanceKm * segmentFractionRef.current
        }
        overallProgress = totalDistance > 0 ? overallProgress / totalDistance : 0

        setAnimState({
          currentSegmentIndex: segmentIndexRef.current,
          segmentFraction: segmentFractionRef.current,
          overallProgress,
        })
      }

      rafRef.current = requestAnimationFrame(tickRef.current)
    },
    [segments, totalDistance],
  )

  useEffect(() => {
    tickRef.current = tick
  }, [tick])

  useEffect(() => {
    if (!isAnimating) return
    segmentIndexRef.current = 0
    segmentFractionRef.current = 0
    lastTimeRef.current = 0
    setAnimPosition(interpolatePosition(segments, 0, 0))
    setAnimState({ currentSegmentIndex: 0, segmentFraction: 0, overallProgress: 0 })
    rafRef.current = requestAnimationFrame(tickRef.current)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isAnimating, segments])

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
          <>
            <CameraFollow position={animPosition} />
            <PolylineLayer
              segments={segments}
              segmentIndex={animState.currentSegmentIndex}
              segmentFraction={animState.segmentFraction}
            />
            <Marker position={animPosition} icon={pulsingIcon} />
          </>
        ) : (
          <>
            <ChangeMapView center={mapCenter} zoom={zoom} />
            {!!(averageLatitude && averageLongitude && averageDistance) && (
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
            {!isFiltered && renderSingleMarker(averageLatitude, averageLongitude)}
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
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default TravelMap;
