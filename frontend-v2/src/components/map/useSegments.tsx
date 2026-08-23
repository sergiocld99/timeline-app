import type { AnimationSegment } from "@/types/animated-timeline"
import type { Travel } from "@/types/travel"

import { useMemo } from "react"

import { COLOR_LIGHT_BLUE, MS_PER_TRAVEL_MINUTE, WEIGHT_COLOR_MAP } from "./constants"
import { useTick } from "./useTick"

type Props = {
  travels: Travel[]
  isAnimating: boolean
}

const buildSegments = (travels: Travel[]): AnimationSegment[] => {
  return travels
    .toReversed()
    .map((travel, index) => {
      const from: [number, number] = [travel.origin.latitude, travel.origin.longitude]
      const to: [number, number] = [travel.destination.latitude, travel.destination.longitude]
      const color = WEIGHT_COLOR_MAP[travel.weight.color] ?? COLOR_LIGHT_BLUE
      const durationMs = Math.max(200, travel.duration * MS_PER_TRAVEL_MINUTE)
      return { index, from, to, travel, durationMs, color }
    })
}

export const useSegments = ({ travels, isAnimating }: Props) => {
  const segments = useMemo(() => (isAnimating ? buildSegments(travels) : []), [travels, isAnimating])
  const totalDuration = useMemo(
    () => segments.reduce((sum, s) => sum + s.durationMs, 0),
    [segments],
  )

  const { animPosition, animState } = useTick({ segments, totalDuration, isAnimating })

  return { segments, animPosition, animState }
}