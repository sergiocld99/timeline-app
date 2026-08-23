import type { AnimationSegment, AnimationState } from "@/types/animated-timeline"

import { useCallback, useEffect, useRef, useState } from "react"

import { DEFAULT_LAT, DEFAULT_LNG, MAX_FRAME_MS, ZOOM_SETTLE_DELAY_MS } from "./constants"

type Props = {
  segments: AnimationSegment[]
  totalDuration: number
  isAnimating?: boolean
  zoom?: number
}

const interpolatePosition = (
  segments: AnimationSegment[],
  segIdx: number,
  frac: number,
): [number, number] => {
  if (segments.length === 0) return [DEFAULT_LAT, DEFAULT_LNG]
  const clamped = Math.min(segIdx, segments.length - 1)
  const seg = segments[clamped]
  const f = clamped === segIdx ? frac : 1
  return [
    seg.from[0] + (seg.to[0] - seg.from[0]) * f,
    seg.from[1] + (seg.to[1] - seg.from[1]) * f,
  ]
}

export const useTick = ({ segments, totalDuration, isAnimating, zoom }: Props) => {
  const [animPosition, setAnimPosition] = useState<[number, number]>([DEFAULT_LAT, DEFAULT_LNG])
  const [animState, setAnimState] = useState<AnimationState>({
    currentSegmentIndex: 0,
    segmentFraction: 0,
    overallProgress: 0,
  })

  const tickRef = useRef<(ts: number) => void>(() => { })
  const segmentFractionRef = useRef(0)
  const lastTimeRef = useRef<number>(0)
  const segmentIndexRef = useRef(0)
  const rafRef = useRef<number>(0)
  const lastZoomRef = useRef<number | undefined>(undefined)

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

      if (delta > 0 && totalDuration > 0) {
        const seg = segments[segmentIndexRef.current]
        if (!seg) {
          segmentIndexRef.current = 0
          segmentFractionRef.current = 0
          setAnimPosition(interpolatePosition(segments, 0, 0))
          setAnimState({ currentSegmentIndex: 0, segmentFraction: 0, overallProgress: 0 })
          rafRef.current = requestAnimationFrame(tickRef.current)
          return
        }

        const advanceFraction = seg.durationMs > 0 ? delta / seg.durationMs : 1
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
          overallProgress += segments[i].durationMs
        }
        if (segmentIndexRef.current < segments.length) {
          overallProgress += segments[segmentIndexRef.current].durationMs * segmentFractionRef.current
        }
        overallProgress = totalDuration > 0 ? overallProgress / totalDuration : 0

        setAnimState({
          currentSegmentIndex: segmentIndexRef.current,
          segmentFraction: segmentFractionRef.current,
          overallProgress,
        })
      }

      rafRef.current = requestAnimationFrame(tickRef.current)
    },
    [segments, totalDuration],
  )

  useEffect(() => {
    tickRef.current = tick
  }, [tick])

  useEffect(() => {
    if (!isAnimating) return

    const zoomChanged = zoom !== undefined && lastZoomRef.current !== undefined && lastZoomRef.current !== zoom
    lastZoomRef.current = zoom

    const start = () => {
      segmentIndexRef.current = 0
      segmentFractionRef.current = 0
      lastTimeRef.current = 0
      setAnimPosition(interpolatePosition(segments, 0, 0))
      setAnimState({ currentSegmentIndex: 0, segmentFraction: 0, overallProgress: 0 })
      rafRef.current = requestAnimationFrame(tickRef.current)
    }

    if (zoomChanged) {
      const timeoutId = setTimeout(start, ZOOM_SETTLE_DELAY_MS)
      return () => {
        clearTimeout(timeoutId)
        cancelAnimationFrame(rafRef.current)
      }
    }

    start()
    return () => cancelAnimationFrame(rafRef.current)
  }, [isAnimating, segments, zoom])

  return { tick, animPosition, animState }
}