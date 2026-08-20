import type { Travel } from "./travel"

export type AnimationSegment = {
  index: number
  from: [number, number]
  to: [number, number]
  travel: Travel
  durationMs: number
  color: string
}

export type AnimationState = {
  currentSegmentIndex: number
  segmentFraction: number
  overallProgress: number
}
