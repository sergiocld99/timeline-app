import type { AnimationSegment } from "@/types/animated-timeline"
import type { Travel } from "@/types/travel"

import { useMemo } from "react"

import { calculateDistance } from "@/utils/numbers"

import { COLOR_LIGHT_BLUE, MS_PER_TRAVEL_MINUTE, WEIGHT_COLOR_MAP } from "./constants"
import { useTick } from "./useTick"

type Props = {
  travels: Travel[]
  isAnimating: boolean
  zoom?: number
}

type Point = [number, number]

const getWaypoints = (travel: Travel): Point[] => {
  const start: Point = [travel.origin.latitude, travel.origin.longitude]
  const end: Point = [travel.destination.latitude, travel.destination.longitude]

  if (travel.crosses.length <= 1) {
    const crosses = travel.crosses.map(cross => [cross.latitude, cross.longitude] as Point)
    return [start, ...crosses, end]
  }

  const sortedCrosses = [...travel.crosses]
    .map(cross => {
      const distStart = calculateDistance(cross.latitude, cross.longitude, start[0], start[1])
      const distEnd = calculateDistance(cross.latitude, cross.longitude, end[0], end[1])
      return { cross, routePosition: distStart / (distStart + distEnd) }
    })
    .sort((a, b) => a.routePosition - b.routePosition)
    .map(({ cross }) => [cross.latitude, cross.longitude] as Point)

  return [start, ...sortedCrosses, end]
}

const buildSegments = (travels: Travel[]): AnimationSegment[] => {
  const segments: AnimationSegment[] = []
  let index = 0

  for (const travel of travels.toReversed()) {
    const points = getWaypoints(travel)
    const totalMs = Math.max(200, travel.duration * MS_PER_TRAVEL_MINUTE)
    const color = WEIGHT_COLOR_MAP[travel.weight.color] ?? COLOR_LIGHT_BLUE

    const legs: { from: Point; to: Point; length: number }[] = []
    for (let i = 0; i < points.length - 1; i++) {
      const from = points[i]
      const to = points[i + 1]
      const length = calculateDistance(from[0], from[1], to[0], to[1])
      if (length > 0) legs.push({ from, to, length })
    }
    if (legs.length === 0) {
      legs.push({ from: points[0], to: points[points.length - 1], length: 1 })
    }

    const totalLength = legs.reduce((sum, leg) => sum + leg.length, 0)
    for (const leg of legs) {
      segments.push({
        index,
        from: leg.from,
        to: leg.to,
        travel,
        durationMs: totalMs * (leg.length / totalLength),
        color,
      })
      index += 1
    }
  }

  return segments
}

export const useSegments = ({ travels, isAnimating, zoom }: Props) => {
  const segments = useMemo(() => (isAnimating ? buildSegments(travels) : []), [travels, isAnimating])
  const totalDuration = useMemo(
    () => segments.reduce((sum, s) => sum + s.durationMs, 0),
    [segments],
  )

  const { animPosition, animState, pendingZoom } = useTick({ segments, totalDuration, isAnimating, zoom })

  return { segments, animPosition, animState, pendingZoom }
}