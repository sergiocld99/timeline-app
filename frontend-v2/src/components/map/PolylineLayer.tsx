import type { AnimationSegment } from "@/types/animated-timeline"

import L from "leaflet";
import { useEffect, useRef } from "react"
import { useMap } from "react-leaflet"

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

export default PolylineLayer